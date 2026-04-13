# Add Competition Mode With Cloudflare Pages And Local D1

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept current as work proceeds. Maintain this plan in `plans/` per repository conventions.

## Purpose / Big Picture

Terra Farm currently runs as a static single-player game with no shared persistence. This work adds a competition mode that keeps the existing static gameplay loop but introduces a Cloudflare Pages / Pages Functions / D1-backed leaderboard that also works in local development. After implementation, a player should be able to launch the app locally with `npm run dev`, enter a display name, start a fixed-seed competition event, submit a score at mission end, and see the shared leaderboard update from the same local origin.

## Progress

- [x] (2026-04-13 13:24 JST) Reviewed current repo state, confirmed existing uncommitted game-flow fixes, and drafted the competition architecture around Pages Functions + D1.
- [x] (2026-04-13 13:29 JST) Implemented competition UI/state, local anonymous player profile handling, fixed-seed RNG wiring, and automatic score submission from the game-over modal.
- [x] (2026-04-13 13:29 JST) Added Pages Functions routes, shared leaderboard helpers, D1 migration/seed, `.gitignore`, and Wrangler configuration for local/prod parity.
- [x] (2026-04-13 13:31 JST) Validated local startup with `npm run dev`, confirmed `/api/competition/current`, `POST /api/leaderboard`, cache-control headers, and updated README to document the Cloudflare-based workflow.

## Surprises & Discoveries

- Observation: The working tree already contains uncommitted fixes around turn locking and `npm run dev`.
  Evidence: `git diff` shows local edits in `js/state.js`, `js/main.js`, `js/game-logic.js`, `js/ui.js`, `package.json`, and `AGENTS.md`.
- Observation: The repo currently has no project `.gitignore`, so Cloudflare local artifacts would become noisy unless explicitly ignored.
  Evidence: `sed` returned `__NO_GITIGNORE__` for `.gitignore`.

## Decision Log

- Decision: Keep single-player mode and add competition as a selectable start-screen mode instead of replacing the current flow.
  Rationale: This minimizes behavioral regression and allows the static game to remain playable even when the leaderboard is unavailable.
  Date/Author: 2026-04-13 / Coding agent.
- Decision: Use a fixed-seed asynchronous competition event rather than direct real-time multiplayer.
  Rationale: The current architecture is single-client and randomness-heavy; fixed seeds create fairer comparisons with much less infrastructure.
  Date/Author: 2026-04-13 / Coding agent.
- Decision: Make `wrangler pages dev` the standard local entry point and keep a static-only fallback script separately.
  Rationale: The user explicitly wants Cloudflare-native behavior and local parity with future deployment.
  Date/Author: 2026-04-13 / Coding agent.
- Decision: Store display name separately from a locally generated anonymous player ID.
  Rationale: This avoids treating mutable names as identity while keeping the no-login requirement.
  Date/Author: 2026-04-13 / Coding agent.

## Outcomes & Retrospective

- `npm run dev` now migrates local D1 and launches `wrangler pages dev` on port 8080, so the game and `/api/*` routes share one local origin.
- The start screen now supports normal play and competition mode, including display-name capture, current event summary, and a live top-10 leaderboard.
- Competition mode locks its mission inputs to the active event and uses seeded RNG so all players share the same random sequence for score-affecting simulation.
- Pages Functions now expose `GET /api/competition/current`, `GET /api/leaderboard`, and `POST /api/leaderboard`, backed by D1 and protected against stale cache responses with `Cache-Control: no-store`.
- Remaining risk: I verified API behavior, local startup, and HTML delivery, but I did not run a full browser-driven two-turn manual playthrough of the UI in this session.
