# Terra Farm feature expansion (weather, challenges, tech tree, onboarding, campaign)

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds. Maintain this plan in accordance with `PLANS.md` in the repository root.

## Purpose / Big Picture

Add player-facing depth and clarity by surfacing weather telemetry with short-term forecasts, expanding challenges with visible progress, enriching technology and country skills, guiding first-time players with a tutorial, and introducing a lightweight campaign season flow. After these changes, a user can see current weather values and the next turn’s risks, pick from more varied challenges with on-screen progress meters, unlock deeper tech and skill upgrades, step through an onboarding modal before play, and continue into a second season with carried-over stats instead of stopping after a single turn cap.

## Progress

- [x] (2025-10-05 00:15Z) Drafted initial ExecPlan with goals covering weather UI, challenge progress, tech/skill upgrades, onboarding, and campaign season flow.
- [x] (2025-10-05 01:00Z) Implemented weather dashboard/forecast logic and UI rendering hooks.
- [x] (2025-10-05 01:00Z) Expanded challenges with condition tracking and progress meter UI.
- [x] (2025-10-05 01:00Z) Extended technology unlocks and country skill tier handling with calculations.
- [x] (2025-10-05 01:00Z) Added onboarding/tutorial modal with navigation and start-screen entry point.
- [x] (2025-10-05 01:00Z) Added multi-season campaign loop with summary modal and carry-over bonus.
- [x] (2025-10-05 01:00Z) Updated styles and copy for new UI sections.
- [ ] Validate via manual run and ensure plan updated with discoveries and outcomes.

## Surprises & Discoveries

- None yet.

## Decision Log

- Decision: Use a simple pseudo-random deterministic forecast derived from the next turn’s weather roll to provide “probability” style hints without changing core RNG order. Rationale: Keeps gameplay consistent while offering guidance. Date/Author: pending implementation.

## Outcomes & Retrospective

- Pending implementation.

## Context and Orientation

The project is a browser-based farming strategy game. Key files:
- `index.html` defines the UI layout, including start screen, control panels, map, and overlays.
- `css/style.css` styles panels, chips, and charts.
- `js/ui.js` manages DOM references, rendering of stats/charts/history, logging, and download logic.
- `js/state.js` defines the `state` object storing turn metrics, unlocks, and history.
- `js/config.js` stores constants for countries, crops, challenges, events, and numeric tuning values.
- `js/game-logic.js` handles turn execution, weather calculation, production, events, unlocks, and history updates.
- `js/main.js` controls game lifecycle (start, next turn, end game) and wire-up of listeners.

Currently turns end after `TURN_COUNT` with a single season. Weather values (soilMoisture, precipitation, temperature) are calculated per turn but not visualized beyond numeric labels. Challenges are limited to a few binary outcomes with a chip indicator. Technology unlocks three tiers; country skills are one-time toggles. There is no tutorial modal. The goal is to introduce UI and logic changes across these files while preserving existing flows.

## Plan of Work

1. Weather dashboard and forecast
   - Extend `state` with `forecast` placeholder and optionally rolling risk percentages. In `calculateCurrentAverages` or a new helper, generate next-turn forecast values using the same climate factors (soil moisture, precipitation, temperature) plus event risk estimates (drought/heatwave/rain). Do not affect the actual RNG path for gameplay; use a separate seeded/random call captured before `executeTurn` runs.
   - In `ui.js`, add elements for weather cards and forecast indicators. Render current weather with icons and add textual risk badges for drought/heatwave/rain event likelihood based on forecast. Update `renderUI` to call a new `renderWeatherPanel` that shows current values and next-turn probability bars.
   - Update `index.html` layout to include a “Weather Dashboard” panel near existing telemetry, and ensure `css/style.css` contains styles for forecast bars/chips.

2. Challenge expansion and progress meter
   - In `config.js`, define additional challenges (e.g., balanced sustainability, tech rush, prosperity, survivor) with multi-condition goals (environment thresholds, tech era indices, revenue multipliers). Include difficulty labels and progress hints.
   - Extend `state` to track challenge progress details (counts of satisfied conditions, target requirements) and store per-condition flags.
   - Update `game-logic.js` challenge evaluation to compute partial progress each turn and store it in state, keeping existing success/fail logic where applicable. Add helper to calculate percent completion across conditions.
   - Enhance `ui.js` to display a progress bar/checklist for the active challenge, updating per turn. Keep the badge text but augment with progress detail.

3. Technology tree and country skill upgrades
   - In `config.js`, expand technology unlock thresholds and effects (e.g., sustainable fertilizer tier 2, automation, orbital analytics) plus country skill upgrade steps (e.g., AgriBoost tiered bonuses). Describe effects in unlock text.
   - In `state`, add structures to record skill upgrade levels and unlocked tech nodes.
   - In `game-logic.js`, adjust `checkUnlocks` and country skill activation to support multiple tiers and their numerical effects, integrating into production/environment calculations.
   - Update `ui.js` unlock log to show tiered unlock labels; adjust any calculations or UI labels needed to reflect stronger effects.

4. Onboarding/tutorial modal
   - Add a modal container in `index.html` with steps explaining budget input, sliders, country skills, and challenge selection. Provide buttons for next/skip/start.
   - In `state`, track whether tutorial is completed for the session.
   - In `main.js`, show the tutorial before enabling the start button, and allow users to open it from the start screen. Manage simple step navigation in `ui.js` or a new helper.
   - Style the modal in `css/style.css` for readability and overlay appearance.

5. Campaign multi-season flow
   - Introduce season counters in `state` (current season, max seasons, turns per season). Modify `startGame` and `nextTurn` in `main.js` so that when turns exceed the per-season limit, a season summary modal appears and the game resets turn counters while carrying forward budget, envScore, techPoints, unlocks, and map state. After final season, fall back to existing `endGame` logic.
   - Add UI labels in `index.html`/`ui.js` to show season status and per-season max turns. Log season transitions.

6. Style adjustments and validation
   - Update `css/style.css` to cover new panels, progress bars, and modal styling while keeping existing look. Ensure responsive layout remains usable.
   - Test by running `npm test` if available or manually starting the app via `npm start`/`npm run dev` (depending on repository). Validate that new UI sections render and core gameplay still works for at least two seasons with forecast and challenge progress updating.

## Concrete Steps

- Working directory: `/workspace/Terra_Farm`.
- Inspect and modify `index.html`, `css/style.css`, `js/state.js`, `js/config.js`, `js/ui.js`, `js/game-logic.js`, and `js/main.js` according to the Plan of Work above.
- After edits, run `npm test` or `npm run lint` if defined; otherwise open `index.html` in the browser (project defaults) to verify manually. Capture short logs to confirm weather forecast and challenge progress updates.

## Validation and Acceptance

- Start a new game via the start screen. Verify the tutorial modal appears and can be skipped or completed. Acceptance: user can navigate steps and then start button functions as before.
- During play, observe a new Weather Dashboard showing current humidity/precipitation/temperature plus a “next turn forecast” with risk percentages. Acceptance: values update each turn and forecast changes prior to executing the next turn.
- Select a non-free challenge and watch a progress meter or checklist updating each turn. Acceptance: meter reflects partial completion and shows success/failure when conditions are met/not met.
- Trigger technology progression and country skill use; observe tiered unlock log messages and stronger effects (e.g., higher production or mitigated penalties). Acceptance: unlocks appear in the log with tier labels and impact calculations.
- Play through a full season until the turn cap; see a season summary and continue into a second season carrying forward resources. Acceptance: season label increments and game only ends after the final season.

## Idempotence and Recovery

Edits are additive and confined to project files. If a change misbehaves, revert via git. Season transitions reuse existing state to avoid destructive resets. Tutorial completion flag resets on page reload. Forecast calculations are isolated to avoid affecting core randomness; if forecast bugs occur, remove forecast generation calls to restore baseline behavior.

## Artifacts and Notes

- Keep console logs or UI log entries demonstrating forecast output, challenge progress percentages, and season transition messages for verification.

## Interfaces and Dependencies

- No new external dependencies are planned. Use existing project structure and vanilla JavaScript. Ensure new state fields are initialized in `state` and respected in render logic.

