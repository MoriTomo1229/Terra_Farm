# Terra Farm feature expansion (weather dashboard, challenges, tech tree, onboarding, mini-campaign)

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds. Maintain this document in accordance with PLANS.md at the repository root.

## Purpose / Big Picture

Players should gain clearer short- and mid-term guidance when making allocation decisions. After this change, they can view a weather dashboard with next-turn forecasts, track richer challenge progress in real time, interact with an expanded technology and country-skill upgrade system, and receive onboarding guidance via a tutorial modal. A lightweight campaign extension allows play to continue across multiple short seasons instead of stopping abruptly at turn 10. These behaviors should be visible directly in the browser UI without relying on logs alone.

## Progress

- [x] (2025-02-20 00:00Z) Drafted ExecPlan describing weather dashboard, challenge tracking, tech/country upgrades, onboarding, and campaign loop adjustments.
- [x] (2025-02-20 00:40Z) Implemented weather dashboard UI and forecast calculation hook.
- [x] (2025-02-20 00:55Z) Added expanded challenges/achievements with progress meter logic.
- [x] (2025-02-20 01:10Z) Extended technology tree and country skill upgrade tiers with UI and effects.
- [x] (2025-02-20 01:20Z) Added onboarding tutorial modal/guide and hint controls.
- [x] (2025-02-20 01:25Z) Introduced minimal campaign season loop beyond 10 turns with carry-over and summary UI.
- [ ] Validate manually (browser) and record outcomes.

## Surprises & Discoveries

- Observation: (populate during implementation)
  Evidence: 

## Decision Log

- Decision: Scope campaign as a two-season loop with reset of budget inputs but retention of tech/env trends to keep changes feasible within existing code structure.
  Rationale: Minimizes disruption to turn flow while honoring request for multi-mission continuity.
  Date/Author: 2025-02-20 / assistant

## Outcomes & Retrospective

(To be updated after implementation.)

## Context and Orientation

The web app is a single-page experience wired by `index.html`, `css/style.css`, and JS modules under `js/`. Game state resides in `js/state.js`, while configuration constants (countries, challenges, eras, thresholds) live in `js/config.js`. Turn flow, initialization, and event handling are in `js/main.js`. Core calculations (production, events) live in `js/game-logic.js`, and UI rendering plus DOM references are in `js/ui.js`. Charts and map rendering use in-page logic; no build system is required. The current flow ends at 10 turns via `TURN_COUNT` with a simple end modal; challenges are basic and weather metrics are only internal.

## Plan of Work

1. Weather dashboard and forecast: add state fields for next-turn weather estimates, compute simple forecast in `js/game-logic.js` using current moisture/precipitation/temperature trends and event probabilities, and render a new dashboard section in `js/ui.js` plus `index.html` markup and CSS styling. Show risk badges for drought/heatwave/rain.
2. Challenge/achievement expansion: extend `CHALLENGES` in `js/config.js` with additional goals (environment, tech, revenue mix). Track progress in `state` and update `updateChallengeProgressUI` in `js/ui.js` to display a progress bar with sub-goal checklist. Adjust `finalizeChallengeOutcome` in `js/main.js` or logic module to consider new composite conditions.
3. Technology tree and country skill upgrades: define additional tech unlock tiers and per-country skill levels in `js/config.js`. Track unlocked tech nodes and skill level in `state`. Update production/environment effects in `js/game-logic.js` to apply bonuses, and expose a simple tech/skill panel in `js/ui.js` with buttons to spend tech points when thresholds are met.
4. Onboarding tutorial and hints: add a modal in `index.html` with step content describing controls, wire start-screen “ガイドを見る” button plus in-game “?” hint icons for allocation sliders. Manage dismissal flags in `state` and render in `js/ui.js`.
5. Mini-campaign loop: introduce `state.season` and `CAMPAIGN_CONFIG` in `js/config.js`. Modify `nextTurn`/`endGame` in `js/main.js` to allow advancing to a second season after TURN_COUNT, carrying over env/tech and partial budget bonus, showing a season summary modal, and concluding after max seasons.
6. Styling and assets: update `css/style.css` for new panels/modals, ensure responsive layout, and adjust `index.html` structure for dashboard and panels without breaking existing layout.
7. Validation: run `npm test` if available or manual browser smoke test by serving `index.html` (e.g., `npm run start` or `npx http-server`) and verifying new UI elements appear and respond.

## Concrete Steps

1. Update `js/state.js` to include forecast placeholders, challenge progress tracking fields, tech unlock/skill level tracking, onboarding flags, and season counters.
2. Extend `js/config.js` with new challenges, tech unlock tiers, skill upgrade definitions, and campaign constants. Add default forecast tuning values if needed.
3. Implement forecast calculation and challenge evaluation in `js/game-logic.js`, updating history logging as necessary.
4. Modify `js/main.js` to incorporate campaign flow, trigger tutorial modal display on first load, and pass forecast/challenge data to UI updates. Ensure `endGame` differentiates between season end and final completion.
5. Expand `js/ui.js` to render weather dashboard, challenge progress bar/checklist, tech/skill upgrade UI, tutorial controls, and season summary. Wire event handlers for tutorial buttons and upgrade actions.
6. Update `index.html` with markup for the new sections/modals and add corresponding styles in `css/style.css`.
7. Perform manual validation: start the app, verify tutorial modal, adjust sliders to see hints, observe weather dashboard values and forecast risk labels, complete turns to see challenge progress updating, unlock tech/skills when thresholds hit, and complete 10 turns to transition into a new season then finish campaign.

## Validation and Acceptance

Acceptance is met when a user can load the page, see a tutorial prompt, view current weather stats plus next-turn forecast risk labels, track expanded challenge progress in real time, unlock additional tech/skill upgrades that alter production or environment outcomes, and play through at least two seasons with a summary modal before final score. Manual browser testing should demonstrate UI updates at each turn and successful completion of the new challenges. No automated tests are presently defined; manual checks suffice.

## Idempotence and Recovery

Changes are additive and front-end only. Reloading the page resets state. If styles or scripts fail, reverting to the previous commit restores behavior. Campaign flow simply reloads on replay.

## Artifacts and Notes

(Record key logs or screenshots after validation.)

## Interfaces and Dependencies

No external libraries are introduced beyond existing browser APIs. Keep tech/skill unlock structures in `js/config.js` keyed by IDs, and expose UI handlers in `js/ui.js` that mutate `state.unlockedTech` and `state.skillLevel`. Ensure `game-logic.js` reads these flags to adjust production multipliers and environment effects.
