import {
  COMPETITION_SIMULATION_VERSION,
  badRequest,
  checkRateLimit,
  computeFinalScore,
  ensureActiveEvent,
  getEventById,
  getLeaderboardRank,
  getPlayerEntry,
  json,
  listTopLeaderboardEntries,
  sanitizeDisplayName,
  sanitizePlayerId
} from '../_lib/competition.js';

function parseJsonBody(request) {
  return request.json().catch(() => null);
}

function validateSubmissionShape(body) {
  if (!body || typeof body !== 'object') return '無効な投稿データです。';
  if (!body.eventId) return 'eventId が必要です。';
  if (!sanitizePlayerId(body.anonymousPlayerId)) return 'anonymousPlayerId が必要です。';
  if (!sanitizeDisplayName(body.displayName)) return 'displayName が必要です。';
  if (!body.mission || !body.result) return 'mission と result が必要です。';
  return null;
}

export async function onRequestGet(context) {
  const rateLimitResult = checkRateLimit(context.request);
  if (rateLimitResult) return rateLimitResult;

  const db = context.env.DB;
  if (!db) return badRequest('D1 バインディングが見つかりません。', 500);

  const url = new URL(context.request.url);
  const eventId = url.searchParams.get('eventId');
  const playerId = sanitizePlayerId(url.searchParams.get('playerId'));
  const event = eventId ? await getEventById(db, eventId) : await ensureActiveEvent(db);
  if (!event) return badRequest('大会が見つかりません。', 404);

  const leaderboard = await listTopLeaderboardEntries(db, event.id, 10);
  const playerEntry = playerId ? await getPlayerEntry(db, event.id, playerId) : null;

  return json({
    event,
    leaderboard,
    playerEntry
  });
}

export async function onRequestPost(context) {
  const rateLimitResult = checkRateLimit(context.request);
  if (rateLimitResult) return rateLimitResult;

  const db = context.env.DB;
  if (!db) return badRequest('D1 バインディングが見つかりません。', 500);

  const body = await parseJsonBody(context.request);
  const shapeError = validateSubmissionShape(body);
  if (shapeError) return badRequest(shapeError);

  const event = await getEventById(db, body.eventId);
  if (!event) return badRequest('大会が見つかりません。', 404);

  const anonymousPlayerId = sanitizePlayerId(body.anonymousPlayerId);
  const displayName = sanitizeDisplayName(body.displayName);
  const mission = body.mission || {};
  const result = body.result || {};

  if (mission.simulationVersion !== event.rulesetVersion || mission.simulationVersion !== COMPETITION_SIMULATION_VERSION) {
    return badRequest('大会ルールのバージョンが一致しません。');
  }

  if (
    mission.countryKey !== event.countryKey ||
    mission.missionYear !== event.missionYear ||
    mission.challengeKey !== event.challengeKey ||
    Number(mission.startingBudget) !== Number(event.startingBudget) ||
    Number(mission.turnLimit) !== Number(event.turnCount) ||
    mission.seed !== event.seed
  ) {
    return badRequest('大会条件が一致しません。');
  }

  if (!Array.isArray(result.history) || !Array.isArray(result.chartData)) {
    return badRequest('履歴データの形式が不正です。');
  }
  if (Number(result.turnsPlayed) !== event.turnCount || result.history.length !== event.turnCount) {
    return badRequest('競争モードでは全ターン完了時のみ投稿できます。');
  }

  const finalScore = computeFinalScore({
    remainingBudget: result.remainingBudget,
    envScore: result.envScore,
    eraIndex: result.eraIndex
  });

  const historyJson = JSON.stringify(result.history);
  const chartDataJson = JSON.stringify(result.chartData);
  if (historyJson.length > 120000 || chartDataJson.length > 30000) {
    return badRequest('投稿データが大きすぎます。');
  }

  const existing = await getPlayerEntry(db, event.id, anonymousPlayerId);
  const improved = !existing || finalScore > existing.finalScore;

  if (!existing) {
    await db.prepare(`
      INSERT INTO leaderboard_entries (
        event_id,
        anonymous_player_id,
        display_name,
        final_score,
        remaining_budget,
        total_food_value,
        env_score,
        era_index,
        challenge_status,
        turns_played,
        history_json,
        chart_data_json,
        simulation_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      event.id,
      anonymousPlayerId,
      displayName,
      finalScore,
      Number(result.remainingBudget),
      Number(result.totalFoodValue),
      Number(result.envScore),
      Number(result.eraIndex),
      String(result.challengeStatus || 'pending'),
      Number(result.turnsPlayed),
      historyJson,
      chartDataJson,
      mission.simulationVersion
    ).run();
  } else if (improved) {
    await db.prepare(`
      UPDATE leaderboard_entries
      SET
        display_name = ?,
        final_score = ?,
        remaining_budget = ?,
        total_food_value = ?,
        env_score = ?,
        era_index = ?,
        challenge_status = ?,
        turns_played = ?,
        history_json = ?,
        chart_data_json = ?,
        simulation_version = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE event_id = ? AND anonymous_player_id = ?
    `).bind(
      displayName,
      finalScore,
      Number(result.remainingBudget),
      Number(result.totalFoodValue),
      Number(result.envScore),
      Number(result.eraIndex),
      String(result.challengeStatus || 'pending'),
      Number(result.turnsPlayed),
      historyJson,
      chartDataJson,
      mission.simulationVersion,
      event.id,
      anonymousPlayerId
    ).run();
  } else {
    await db.prepare(`
      UPDATE leaderboard_entries
      SET display_name = ?
      WHERE event_id = ? AND anonymous_player_id = ?
    `).bind(displayName, event.id, anonymousPlayerId).run();
  }

  const rank = await getLeaderboardRank(db, event.id, improved ? finalScore : existing.finalScore);
  const leaderboard = await listTopLeaderboardEntries(db, event.id, 10);
  const playerEntry = await getPlayerEntry(db, event.id, anonymousPlayerId);

  return json({
    accepted: true,
    improved,
    rank,
    event,
    leaderboard,
    playerEntry
  });
}
