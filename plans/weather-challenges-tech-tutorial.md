# Weather dashboard, challenge expansion, and onboarding ExecPlan

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds. Maintain this plan in accordance with PLANS.md in the repository root.

## Purpose / Big Picture

Players should gain clearer insight into current and upcoming weather, track richer challenge objectives with visible progress, explore expanded technology and skill growth, and have a lightweight onboarding flow. After this change, a new weather dashboard will show current conditions and next-turn forecasts, expanded challenge goals will display live progress, technology unlocks will include tiered upgrades plus country skill improvements, and a start-of-game tutorial modal will guide first-time players. Campaign play will also extend beyond a single 10-turn stint by introducing a basic season counter and between-season summary.

## Progress

- [x] (2025-12-03 14:45Z) Drafted ExecPlan with scope (weather dashboard, challenge expansion, tech/skill tiers, onboarding, simple campaign seasons).
- [x] (2025-12-03 14:49Z) Weather dashboard UIと予報ロジックを追加。
- [x] (2025-12-03 14:49Z) チャレンジ追加と進捗UIを実装。
- [x] (2025-12-03 14:49Z) 技術アンロックの段階化と国家スキル強化を組み込み。
- [x] (2025-12-03 14:49Z) チュートリアルモーダルを追加。
- [x] (2025-12-03 14:49Z) シーズン継続フローを導入。
- [ ] Validation completed and documentation updated if needed.

## Surprises & Discoveries

- http-serverを`npm run dev -- --silent`で起動すると`ERR_INVALID_ARG_VALUE`となった。直接`npx http-server -a 0.0.0.0 -p 8080`なら起動可だった。

## Decision Log

- Decision: Implement a lightweight season mechanic by looping after TURN_COUNT and incrementing a `season` counter instead of building a separate campaign selection screen. Rationale: minimizes UI churn while proving the concept. Date/Author: 2025-12-03 / assistant.

## Outcomes & Retrospective

- Weatherダッシュボード、チャレンジ拡充、技術/スキル強化、チュートリアル、シーズン継続を実装済み。UIは更新され、ログにシーズンまとめが出力される。簡易動作確認と追加テストはこれから。

## Context and Orientation

The browser-based game logic lives in `index.html`, `js/ui.js`, `js/main.js`, `js/game-logic.js`, and `js/config.js`, with styling in `css/style.css`. Current weather variables (`soilMoisture`, `precipitation`, `temperature`) are computed in `calculateCurrentAverages` in `js/game-logic.js` but are only shown as numbers in the stats panel. Challenges are defined in `js/config.js` and evaluated in `updateChallengeProgress` / `finalizeChallengeOutcome` within `js/game-logic.js`, with minimal UI in `js/ui.js`. Technology unlocks are set in `js/config.js` and checked in `checkUnlocks`, while country skills apply single-use effects in `activateSkill`. There is no onboarding modal or campaign concept; `nextTurn` in `js/main.js` simply ends the game after `TURN_COUNT`.

## Plan of Work

Add a weather dashboard card in `index.html` that lists current soil moisture, precipitation, and temperature alongside a simple forecast for the next turn. In `js/game-logic.js`, introduce a forecast generator (randomized from current climate and country) stored on state and refreshed before each turn resolution; render it in `js/ui.js` and hint at risks (drought, rain, heatwave probabilities). Expand `CHALLENGES` in `js/config.js` with additional objectives (technology-focused, revenue marathon, balanced sustainability) and track progress with a bar/label computed in `js/game-logic.js` and rendered in `js/ui.js`. Add tiered technology unlocks by defining multiple levels for existing unlocks plus a new research boost; extend country skills with a modest passive upgrade that triggers after certain tech points. Update `js/game-logic.js` to apply new unlock multipliers. Build an onboarding modal in `index.html` with step text; control visibility via `js/main.js` and `js/ui.js`, storing a `tutorialSeen` flag in state. Implement a basic campaign season counter in state; when `TURN_COUNT` is exceeded, record a season summary (budget, env, tech), reset turn to 1, and continue until a fixed small number of seasons, then end game. Display season info in header.

## Concrete Steps

1. Update `index.html` to add weather dashboard panel (current + forecast), challenge progress meter, season indicator in header, and tutorial modal markup.
2. Extend `css/style.css` with styles for the new panels, progress bars, and modal.
3. In `js/config.js`, add new challenges, tiered unlock thresholds, and config for forecast risk labeling if needed.
4. In `js/main.js`, initialize new state fields (`season`, `maxSeasons`, `forecast`, `tutorialSeen`), update start flow to show tutorial modal, render season info, and modify `nextTurn` to handle season rollover with a brief summary log.
5. In `js/game-logic.js`, add forecast generation function, apply forecast to event chances, expand challenge evaluation to new goals, apply tiered tech and skill upgrades, and record season summaries in history.
6. In `js/ui.js`, render the weather dashboard, forecast summary, challenge progress bar, and tutorial modal controls; ensure header shows season/turn info.
7. Run `npm test` or available checks (if none, rely on manual sanity checks) and capture observations.

## Validation and Acceptance

- Start the app, begin a mission, and confirm the weather dashboard shows current conditions plus a next-turn forecast with risk hints. During play, observe challenge progress bar updating toward the selected goal. Trigger enough tech gain to see new unlock messages and passive country skill upgrade. After `TURN_COUNT`, ensure the game transitions to season 2 with a log entry and continues until max seasons, then shows game over. Opening the tutorial modal from the start screen should display guidance and allow closing to start the game.

## Idempotence and Recovery

Edits are additive and can be reapplied safely. If the season rollover causes issues, reload the page to reset state. UI toggles are controlled by state flags to avoid repeated modal injections.

## Artifacts and Notes

- None yet.

## Interfaces and Dependencies

- State additions: `season`, `maxSeasons`, `forecast`, `tutorialSeen`, `seasonSummaries` (array).
- UI helpers: new `renderForecast` within `js/ui.js` or integrated into `renderUI` to update weather panel. Tutorial modal uses buttons for next/close.
- Tech unlock tiers: extend `GAME_CONFIG.technology.unlocks` to include level 2 thresholds and `researchLab` bonus; country skills gain passive multipliers keyed on `state.countryKey`.
- Forecast risks should hint at drought/heatwave/rain using existing event thresholds so behavior is consistent.
