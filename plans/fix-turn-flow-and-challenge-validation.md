# Fix Turn Flow And Challenge Validation

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds. Maintain this plan per `PLANS.md`.

## Purpose / Big Picture

The current game loop has three player-visible correctness issues: the execute button can be re-enabled during the same turn and allow duplicate submissions, displayed weather can change between the planning screen and the actual turn resolution, and the environment challenge can become permanently successful before the final turn even if the ending score later drops below the documented threshold. In parallel, this repository expects `npm run dev` as the standard launch command, so the script and repo guidance should consistently support that flow. After this work, a player should be able to start the app with `npm run dev`, see stable conditions for the current turn, execute exactly once per turn, and receive challenge results that match the final-state rules.

## Progress

- [x] (2026-04-13 12:48 JST) Reviewed the existing game loop, confirmed the three reported defects in code, and drafted this ExecPlan.
- [x] (2026-04-13 12:51 JST) Implemented turn-processing locking, split weather generation from NDVI averaging, updated challenge evaluation semantics, and aligned repo guidance with `npm run dev`.
- [x] (2026-04-13 12:52 JST) Validated JS syntax with `node --check` and confirmed `npm run dev` serves `http://127.0.0.1:8080/`.

## Surprises & Discoveries

- Observation: The duplicate-turn bug is caused by UI refresh code, not by the click handler itself.
  Evidence: `executeTurn()` disables the button, but `updateRemainingBudget()` in `js/ui.js` unconditionally re-enables it whenever the remaining budget is non-negative.
- Observation: `calculateCurrentAverages()` currently mixes deterministic map aggregation with random weather generation.
  Evidence: The same function is called from both `nextTurn()` and `executeTurn()`, so the random conditions are regenerated after the player has already seen the numbers.

## Decision Log

- Decision: Introduce an explicit `isTurnProcessing` flag in shared state rather than infer lock state from button attributes alone.
  Rationale: Multiple UI paths update button state, so centralizing the semantic lock in state is less error-prone than trying to preserve disabled state ad hoc.
  Date/Author: 2026-04-13 / Coding agent.
- Decision: Split weather generation from NDVI average calculation into separate functions and call weather generation only at turn boundaries.
  Rationale: This preserves existing averages logic while making the player-facing conditions stable for the whole decision phase.
  Date/Author: 2026-04-13 / Coding agent.
- Decision: Recompute challenge progress for display during play but reserve pass/fail authority for `finalizeChallengeOutcome()`.
  Rationale: The UI still needs a useful live progress signal, but the documented wording for `env_guard` is explicitly final-state based.
  Date/Author: 2026-04-13 / Coding agent.

## Outcomes & Retrospective

- `npm run dev` now works without manually exporting `PORT`, and `AGENTS.md` explicitly allows agents to use it for local verification.
- Turn execution now carries an explicit processing lock so budget recalculation no longer re-enables the execute button mid-turn.
- Weather generation happens only at turn boundaries, so the displayed moisture/precipitation/temperature values are the same inputs used for that turn's simulation.
- Environment challenge status can still show live progress during play, but final pass/fail is recomputed from the ending state instead of being permanently locked early.
- Remaining gap: I validated startup and syntax locally, but did not run a browser-based two-turn manual playthrough in this session.
