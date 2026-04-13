CREATE TABLE IF NOT EXISTS competition_events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  country_key TEXT NOT NULL,
  mission_year TEXT NOT NULL,
  challenge_key TEXT NOT NULL,
  starting_budget INTEGER NOT NULL,
  turn_count INTEGER NOT NULL,
  seed TEXT NOT NULL,
  ruleset_version TEXT NOT NULL,
  starts_at TEXT,
  ends_at TEXT,
  is_active INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL,
  anonymous_player_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  final_score INTEGER NOT NULL,
  remaining_budget INTEGER NOT NULL,
  total_food_value INTEGER NOT NULL,
  env_score INTEGER NOT NULL,
  era_index INTEGER NOT NULL,
  challenge_status TEXT NOT NULL,
  turns_played INTEGER NOT NULL,
  history_json TEXT NOT NULL,
  chart_data_json TEXT NOT NULL,
  simulation_version TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, anonymous_player_id),
  FOREIGN KEY (event_id) REFERENCES competition_events(id)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_event_score
  ON leaderboard_entries(event_id, final_score DESC, updated_at ASC);

INSERT OR IGNORE INTO competition_events (
  id,
  name,
  description,
  country_key,
  mission_year,
  challenge_key,
  starting_budget,
  turn_count,
  seed,
  ruleset_version,
  starts_at,
  ends_at,
  is_active
) VALUES (
  'spring-opening-2026',
  'Spring Opening Cup',
  'Cloudflare Pages 移行準備用の固定シード大会。全員が同じ条件で環境キーパーに挑戦します。',
  'usa',
  '05',
  'env_guard',
  200000000000,
  10,
  'spring-opening-seed-2026',
  '2026-04-competition-v1',
  '2026-04-13T00:00:00Z',
  NULL,
  1
);
