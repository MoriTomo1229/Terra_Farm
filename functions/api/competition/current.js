import {
  badRequest,
  checkRateLimit,
  ensureActiveEvent,
  getPlayerEntry,
  json,
  listTopLeaderboardEntries,
  sanitizePlayerId
} from '../../_lib/competition.js';

export async function onRequestGet(context) {
  const rateLimitResult = checkRateLimit(context.request);
  if (rateLimitResult) return rateLimitResult;

  const db = context.env.DB;
  if (!db) return badRequest('D1 バインディングが見つかりません。', 500);

  const url = new URL(context.request.url);
  const playerId = sanitizePlayerId(url.searchParams.get('playerId'));
  const event = await ensureActiveEvent(db);
  if (!event) return badRequest('有効な大会がありません。', 404);

  const leaderboard = await listTopLeaderboardEntries(db, event.id, 10);
  const playerEntry = playerId ? await getPlayerEntry(db, event.id, playerId) : null;

  return json({
    event,
    leaderboard,
    playerEntry
  });
}
