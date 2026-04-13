export const COMPETITION_SIMULATION_VERSION = '2026-04-competition-v1';

const DEFAULT_EVENT = {
  id: 'spring-opening-2026',
  name: 'Spring Opening Cup',
  description: 'Cloudflare Pages 移行準備用の固定シード大会。全員が同じ条件で環境キーパーに挑戦します。',
  countryKey: 'usa',
  missionYear: '05',
  challengeKey: 'env_guard',
  startingBudget: 200000000000,
  turnCount: 10,
  seed: 'spring-opening-seed-2026',
  rulesetVersion: COMPETITION_SIMULATION_VERSION,
  startsAt: '2026-04-13T00:00:00Z',
  endsAt: null,
  isActive: 1
};

const SCORE_CONFIG = {
  budgetDivisor: 1e6,
  envScoreMultiplier: 100,
  eraMultiplier: 1000
};

export function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json; charset=utf-8');
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(data), {
    ...init,
    headers
  });
}

export function badRequest(message, status = 400) {
  return json({ error: message }, { status });
}

export function sanitizeDisplayName(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 20);
}

export function sanitizePlayerId(value) {
  return String(value || '').trim().slice(0, 80);
}

export function computeFinalScore({ remainingBudget, envScore, eraIndex }) {
  return Math.round(
    (Number(remainingBudget) / SCORE_CONFIG.budgetDivisor) +
    (Number(envScore) * SCORE_CONFIG.envScoreMultiplier) +
    (Number(eraIndex) * SCORE_CONFIG.eraMultiplier)
  );
}

export function normalizeEventRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    countryKey: row.country_key,
    missionYear: row.mission_year,
    challengeKey: row.challenge_key,
    startingBudget: row.starting_budget,
    turnCount: row.turn_count,
    seed: row.seed,
    rulesetVersion: row.ruleset_version,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    isActive: Boolean(row.is_active)
  };
}

export function normalizeLeaderboardRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    eventId: row.event_id,
    anonymousPlayerId: row.anonymous_player_id,
    displayName: row.display_name,
    finalScore: row.final_score,
    remainingBudget: row.remaining_budget,
    totalFoodValue: row.total_food_value,
    envScore: row.env_score,
    eraIndex: row.era_index,
    challengeStatus: row.challenge_status,
    turnsPlayed: row.turns_played,
    simulationVersion: row.simulation_version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    missionYear: row.mission_year
  };
}

export async function ensureActiveEvent(db) {
  let row = await db.prepare(`
    SELECT *
    FROM competition_events
    WHERE is_active = 1
    ORDER BY starts_at DESC, created_at DESC
    LIMIT 1
  `).first();

  if (!row) {
    await db.prepare(`
      INSERT OR IGNORE INTO competition_events (
        id, name, description, country_key, mission_year, challenge_key,
        starting_budget, turn_count, seed, ruleset_version, starts_at, ends_at, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      DEFAULT_EVENT.id,
      DEFAULT_EVENT.name,
      DEFAULT_EVENT.description,
      DEFAULT_EVENT.countryKey,
      DEFAULT_EVENT.missionYear,
      DEFAULT_EVENT.challengeKey,
      DEFAULT_EVENT.startingBudget,
      DEFAULT_EVENT.turnCount,
      DEFAULT_EVENT.seed,
      DEFAULT_EVENT.rulesetVersion,
      DEFAULT_EVENT.startsAt,
      DEFAULT_EVENT.endsAt,
      DEFAULT_EVENT.isActive
    ).run();

    row = await db.prepare(`
      SELECT *
      FROM competition_events
      WHERE id = ?
      LIMIT 1
    `).bind(DEFAULT_EVENT.id).first();
  }

  return normalizeEventRow(row);
}

export async function getEventById(db, eventId) {
  const row = await db.prepare(`
    SELECT *
    FROM competition_events
    WHERE id = ?
    LIMIT 1
  `).bind(eventId).first();
  return normalizeEventRow(row);
}

export async function listTopLeaderboardEntries(db, eventId, limit = 10) {
  const result = await db.prepare(`
    SELECT le.*, ce.mission_year
    FROM leaderboard_entries le
    JOIN competition_events ce ON ce.id = le.event_id
    WHERE le.event_id = ?
    ORDER BY le.final_score DESC, le.updated_at ASC
    LIMIT ?
  `).bind(eventId, limit).all();

  return (result.results || []).map((row, index) => ({
    ...normalizeLeaderboardRow(row),
    rank: index + 1
  }));
}

export async function getPlayerEntry(db, eventId, playerId) {
  const row = await db.prepare(`
    SELECT le.*, ce.mission_year
    FROM leaderboard_entries le
    JOIN competition_events ce ON ce.id = le.event_id
    WHERE le.event_id = ? AND le.anonymous_player_id = ?
    LIMIT 1
  `).bind(eventId, playerId).first();

  if (!row) return null;
  const normalized = normalizeLeaderboardRow(row);
  const rank = await getLeaderboardRank(db, eventId, normalized.finalScore);
  return {
    ...normalized,
    rank
  };
}

export async function getLeaderboardRank(db, eventId, score) {
  const row = await db.prepare(`
    SELECT COUNT(*) + 1 AS rank
    FROM leaderboard_entries
    WHERE event_id = ? AND final_score > ?
  `).bind(eventId, score).first();

  return row?.rank || 1;
}
