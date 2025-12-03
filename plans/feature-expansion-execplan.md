# Terra Farm feature expansion (weather dashboard, challenges, tech tree, onboarding)

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries, Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds. This document must be maintained in accordance with PLANS.md (see ./PLANS.md).

## Purpose / Big Picture

Players should gain clearer tactical guidance and long-term goals. After this change they can (1) view in-game weather metrics plus a simple next-turn forecast, (2) pursue a richer set of challenges with visible progress, (3) explore an expanded technology tree including tiered country skills, and (4) learn the basics through an onboarding modal. These behaviors must be visible in the running web app without external tools.

## Progress

- [x] (2025-12-03 14:45Z) Drafted initial ExecPlan with scope and desired user outcomes.
- [x] (2025-12-03 15:25Z) Added state fields for forecast/season tracking and richer history snapshots.
- [x] (2025-12-03 15:35Z) Expanded config for campaign settings, challenges, forecast tuning, tech tree, and skill tiers.
- [x] (2025-12-03 15:55Z) Implemented UI panels for forecast, challenge meter, tech tree, and onboarding modal with handlers.
- [x] (2025-12-03 16:05Z) Integrated tech tree unlock handling, country skill tier bonuses, and challenge evaluation into logic and UI.
- [ ] Validate in browser (manual run) and update retrospective.

## Surprises & Discoveries

- Observation: None yet.
  Evidence: N/A.

## Decision Log

- Decision: Bundle multiple user-requested features into a single incremental pass with minimal but demonstrable functionality to fit time constraints.
  Rationale: The request spans several feature areas; a minimal but coherent implementation provides value without rewriting the whole game flow.
  Date/Author: 2025-12-03 / assistant

## Outcomes & Retrospective

Pending implementation.

## Context and Orientation

The game is a browser-based simulation. Core files live under js/: config.js holds constants (countries, challenges, balances), state.js defines global state, game-logic.js performs per-turn calculations and unlock checks, main.js drives flow and initialization, ui.js renders panels, and index.html plus css/style.css define layout. Currently challenges are limited, weather is internal only, and onboarding is minimal.

## Plan of Work

Add new state properties for forecast, seasons, and challenge progress tracking in js/state.js and ensure they are initialized in startGame. Extend configuration in js/config.js with additional challenges, weather forecast parameters, and a small tech tree structure including country skill tiers. Update game-logic.js to generate forecast data, expose it to history, and apply country skill tier effects plus basic tech tree multipliers when calculating production/environment. Enhance ui.js to render a weather dashboard (current metrics and forecast summary), a challenge progress section with meters and condition text, and a simple tech tree/skill panel showing unlock status. Add onboarding modal markup and trigger buttons in index.html, with styling in css/style.css and behavior in js/ui.js/main.js. Adjust main.js to support campaign season counters (e.g., two seasons) and to update UI each turn. Ensure history download includes new fields. Keep changes minimal and additive.

## Concrete Steps

1. Update js/state.js to include forecast data structure (current, nextTurn prediction), season counter, and detailed challenge progress fields; default values must be set in startGame.
2. Expand js/config.js with new challenge definitions, forecast tuning constants, and a simple tech tree description (nodes, required tech points, effects, and optional country-specific tiers). Add a CAMPAIGN config for season length to trigger year rollover.
3. Modify js/game-logic.js to generate forecast at start of each turn, store it in state.history, and apply tech tree and skill tier effects during production/environment calculations. Incorporate season counters in nextTurn/endGame logic.
4. Enhance js/ui.js to render weather dashboard and forecast panel, challenge progress meter, and tech tree/skill status. Add onboarding modal logic and hook into buttons.
5. Adjust index.html to include new UI sections (weather dashboard, challenge meter, tech tree/skill panel, onboarding modal trigger and content) and align with existing layout. Style additions in css/style.css.
6. Update main.js to initialize new state fields, wire onboarding controls, and ensure challenge progress UI refreshes each turn. If campaign seasons are added, show season/turn counters in the header.

## Validation and Acceptance

- Start the app (open index.html). After choosing a country and budget, the header should show current season/turn, weather dashboard with current humidity/precipitation/temperature and a simple forecast for next turn, and challenge progress meter updating as turns advance.
- Trigger skill activation and tech point gains; the tech/skill panel should reflect new tiers and their effects when thresholds are met.
- Open the onboarding modal from the start screen and in-game help button; modal explains controls and can be closed.
- Downloaded play log should contain forecast and challenge progress fields for each turn.

## Idempotence and Recovery

All steps are additive and repeatable. Reloading the page resets state. If a change misbehaves, restore previous files via git checkout <file> and rerun steps.

## Artifacts and Notes

Pending implementation outputs.

## Interfaces and Dependencies

No new external dependencies expected. Rely on existing DOM structure and vanilla JS. New configuration constants should be scoped in js/config.js and referenced by name in logic and UI.
