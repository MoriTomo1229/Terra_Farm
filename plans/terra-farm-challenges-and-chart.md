# Add Turn Metrics Chart, Challenge Modes, and Investment Presets

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds. Maintain this plan per `PLANS.md` (repository root).

## Purpose / Big Picture

Players currently cannot see trends over time, have no structured short-run goals, and must drag three sliders every turn. This plan adds (1) a compact turn-metrics chart for revenue/NDVI/env/tech points, (2) selectable challenge modes with clear win/lose conditions to diversify play, and (3) one-click investment presets (“環境重視/収益重視/技術重視”) to reduce friction. After implementation, a player can start a mission, pick a challenge, click a preset to set sliders, run turns, and watch a sparkline-like chart update each turn. Reaching or missing the challenge goal will trigger success/failure messaging at mission end.

## Progress

- [x] (2025-11-15 16:00Z) Drafted ExecPlan outlining chart, challenges, and presets.
- [x] (2025-11-15 17:05Z) Implemented UI/state changes: challenge select, presets, chart, challenge evaluation, downloads, and docs.
- [x] (2025-11-15 17:55Z) Enhanced chart UX (line overlay, tooltips via titles), tweaked preset ratios, and added custom preset save/apply.
- [ ] Validate in browser and update retrospective.

## Surprises & Discoveries

- None yet.

## Decision Log

- Decision: Use a lightweight in-DOM chart (SVG/HTML bars) instead of external libs to keep the static bundle dependency-free.
  Rationale: The project is a static HTML/JS app without build tooling; avoiding new deps keeps setup trivial.
  Date/Author: 2025-11-15 / Coding agent.
- Decision: Define three presets (環境重視/収益重視/技術重視) mapping to 40/30/30, 50/25/25, 20/30/50 allocations respectively, scaled to current budget.
  Rationale: Gives meaningful, differentiated defaults without overwhelming the user; ratios still leave headroom for manual tweaks.
  Date/Author: 2025-11-15 / Coding agent.
- Decision: Introduce two challenge modes plus a “フリー” default: “環境キーパー”(10ターンで環境スコア80以上維持) and “成長ドライブ”(総収入を初期予算の1.8倍以上にする) with end-of-game success/failure notices.
  Rationale: Keeps scope small but adds replayability and measurable goals tied to existing metrics.
  Date/Author: 2025-11-15 / Coding agent.
- Decision: Add lightweight line overlays atop mini-bar charts to improve trend readability without external deps.
  Rationale: Keeps static bundle light while satisfying UX request for clearer trajectories.
  Date/Author: 2025-11-15 / Coding agent.
- Decision: Adjust preset ratios to 45/35/20 (環境), 55/25/20 (収益), 20/25/55 (技術) and support user-defined custom presets.
  Rationale: Ratios better express each intent, and a custom slot removes the need to hard-code more variants.
  Date/Author: 2025-11-15 / Coding agent.

## Outcomes & Retrospective

- Pending implementation.

## Context and Orientation

This is a static web game launched via `index.html`. Styling is in `css/style.css`. Game constants live in `js/config.js`, state in `js/state.js`, UI bindings/helpers in `js/ui.js`, map loading in `js/map.js`, core turn logic in `js/game-logic.js`, and flow/bootstrap in `js/main.js`. The report panel already shows text results, a tiny revenue bar stack (`#mini-graph`), and a history table. There is no chart for trends, no challenge selection UI, and presets are absent. Mission end is handled in `endGame()` in `js/main.js`, showing a modal.

## Plan of Work

Describe precise edits so a new contributor can follow:

1) Add UI affordances in `index.html`: a “チャレンジ” select on the start screen (options: フリー, 環境キーパー, 成長ドライブ); preset buttons near the sliders; and a compact chart block in the status/report area showing recent trends (e.g., 10 bars per metric). Ensure IDs for hooks (e.g., `challenge-select`, `preset-env`, `preset-revenue`, `preset-tech`, `trend-chart` with per-series containers).
2) Style the new controls in `css/style.css` to match the glassmorphic aesthetic: inline preset pill buttons, a labeled challenge dropdown, and a chart area with small bars/lines on dark background, responsive down to mobile.
3) Extend `state` (in `js/state.js` and reset in `startGame` within `js/main.js`) to track:
   - `challenge` (key), `challengeStatus` ('pending'|'success'|'failed'), `chartData` array capturing per-turn metrics `{turn, revenue, avgNdvi, envScore, techPoints}` trimmed to last ~12 entries.
4) Implement challenge evaluation in `executeTurn` (or immediately after each turn in `js/main.js`): update `challengeStatus` based on rules; store failure/success only once; at mission end (`endGame`), show message inside modal reflecting challenge outcome.
5) Implement presets in `js/ui.js`: click handlers set slider values based on ratios against current `state.budget`, then call existing `updateRemainingBudget`/visual update.
6) Build chart rendering in `js/ui.js`: render lightweight bar/line stacks into `trend-chart` using plain DOM/SVG; update from `renderUI()` after each turn; keep rendering performant (limit points).
7) Wire new elements in `js/main.js`: read challenge selection on start; include in log and download metadata; ensure reset logic clears chart/presets state.
8) Update download payload in `downloadHistory()` to include `challenge` and per-turn chart metrics (already overlapping with history). Ensure fields are documented in README.
9) Document in `README.md`: how to select a challenge, how presets work, and where to see the trend chart.

## Concrete Steps

1. Edit `index.html` to add:
   - Start screen: challenge `<select id="challenge-select">` with three options.
   - Policy panel: preset buttons (`preset-env`, `preset-revenue`, `preset-tech`) near sliders.
   - Status/report area: a `#trend-chart` container with sub-elements per metric (`.trend-series` for revenue, NDVI, env, tech).
2. Update `css/style.css` for the new select/buttons and chart visuals (small bars/lines, legends, responsive stacking).
3. In `js/state.js`, add default fields for `challenge`, `challengeStatus`, `chartData`.
4. In `js/main.js`, on start, read challenge select, set defaults, reset chartData; in `endGame`, show challenge result strings.
5. In `js/game-logic.js`, after computing per-turn metrics, push into `state.chartData` (bounded length) and evaluate challenge status (success/fail flags). Reuse existing history where possible.
6. In `js/ui.js`, wire new DOM refs, preset click handlers (ratio-based), `renderTrendChart()` to rebuild chart from `state.chartData`, and include challenge info in download payload.
7. Update README.md to describe challenges, presets, and the chart.

## Validation and Acceptance

Run locally (from repo root):

1. Serve with `npx http-server -p 8080` (or open `index.html` directly).
2. Start a mission selecting each challenge in turn; play through 3–4 turns.
3. Chart updates every turn: four series visible (revenue, NDVI, env score, tech points) with recent values capped to ~10–12 bars/points.
4. Presets set sliders according to their themes without exceeding budget, and remaining budget updates correctly.
5. Challenge outcomes: “環境キーパー” succeeds if final env score ≥80; “成長ドライブ” succeeds if total food value ≥ startingBudget * 1.8; otherwise marked failed; modal shows status.
6. Downloaded JSON includes `challenge` metadata and per-turn metrics; values match on-screen history/chart.

## Idempotence and Recovery

Reloading the page resets all state, chart data, and challenge status. Preset clicks are pure UI changes and can be reapplied each turn. Chart rendering rebuilds from `state.chartData` each call, so rerunning `renderUI` is safe. Challenge evaluation uses monotonic flags (once failed/succeeded, it stays) to avoid flip-flop; resetting occurs only on new mission start.

## Artifacts and Notes

Expected shape of `state.chartData` entries after a few turns (illustrative):

    { "turn": 3, "revenue": 72000000000, "avgNdvi": 0.62, "envScore": 74, "techPoints": 210 }

## Interfaces and Dependencies

- New DOM IDs: `challenge-select`, `preset-env`, `preset-revenue`, `preset-tech`, `trend-chart`, plus series containers inside the chart.
- New state fields: `state.challenge` (string), `state.challengeStatus` ('pending'|'success'|'failed'), `state.chartData` (array of per-turn metrics, truncated).
- Challenge rules implemented in JS only; no external libraries added.
- `downloadHistory()` should include `challenge` metadata; `endGame()` should read `state.challengeStatus` to craft modal messaging.

Revision note (2025-11-15 17:05Z): Marked implementation complete in Progress after adding challenge select, presets, trend chart, challenge evaluation, download metadata, and README updates.
Revision note (2025-11-15 17:55Z): Added line overlays, custom preset save/apply, preset ratio tweaks, and updated README accordingly.
