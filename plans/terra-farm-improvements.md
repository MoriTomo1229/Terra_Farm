# Strengthen Terra Farm Telemetry And Turn History

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds. Maintain this plan per `PLANS.md`.

## Purpose / Big Picture

Players currently lack trustworthy post-turn analytics: the in-game log download always yields an empty file, they cannot see how allocations evolved turn by turn, and technology progress is invisible beyond era names. This plan introduces persistent per-turn history capture, renders the latest turns inside the UI, exposes numerical tech points alongside the era, and fixes the downloadable log so analysts can later review every decision. After implementation the user can open `index.html`, play several turns, see a populated history panel update live, and download a JSON log that reflects the displayed metrics.

## Progress

- [x] (2025-11-15 14:55Z) Audited repo structure and drafted ExecPlan covering history logging and UI surfacing.
- [x] (2025-11-15 15:32Z) Implemented telemetry capture, UI rendering, download integration, and README/docs updates per plan.

## Surprises & Discoveries

- Observation: The existing `downloadHistory` button could never work because `state.history` was never mutated.
  Evidence: Before changes, `state.history` was only initialized in `js/state.js` and reset in `startGame`, but no push call existed anywhere in the repo.

## Decision Log

- Decision: Focus improvements on history capture, UI surfacing, and documentation updates since these affect every existing file the user interacts with.
  Rationale: The brief explicitly asked to review all files and add necessary features; telemetry gaps touch HTML, CSS, JS, and docs, satisfying the scope while delivering tangible value.
  Date/Author: 2025-11-15 / Coding agent.
- Decision: Limit the on-screen history table to the six most recent turns for readability on narrow layouts.
  Rationale: Showing all ten rows squeezed the third column and forced excessive scrolling, while analysts can still access the full dataset via the download.
  Date/Author: 2025-11-15 / Coding agent.

## Outcomes & Retrospective

- Added a tech-points readout to the status card, a styled turn-history table with live updates, and rich metadata for each turn that also powers the download button.
- README now documents how to inspect the history panel and export JSON.
- Remaining risk: runtime verification still requires a manual browser test because there are no automated UI tests in this static project.

## Context and Orientation

`index.html` hosts the static UI with three panels (status, policy, report). Styling lives in `css/style.css`. Game state and constants reside in `js/state.js` and `js/config.js`. UI helpers and DOM bindings are in `js/ui.js`, map loading in `js/map.js`, core turn logic in `js/game-logic.js`, and the bootstrap/flow in `js/main.js`. A `downloadLog` button exists but `state.history` is never populated, so downloaded files are empty. There is no on-screen history besides the scrolling log, and players cannot see numeric tech points even though unlocks depend on them. README advertises features that now need to mention the new analytics surfaces.

## Plan of Work

First, add structural hooks in `index.html` so the status panel shows raw tech points and there is a dedicated turn-history table near the report panel. Style the new elements in `css/style.css` so the table aligns with the existing glassmorphic theme and remains scrollable. Next, enhance `state` management in `js/state.js`/`js/main.js` to reset a richer `history` array that captures metadata such as turn number, allocations, NDVI, environment score, revenue, events, and unlocks. Instrument `executeTurn` in `js/game-logic.js` to push a record into this history each time a turn resolves. In `js/ui.js`, create helpers that render the most recent N entries inside the new table and update it whenever history changes. Update `downloadHistory()` to export a structured object `{meta, turns}` so analysts know which scenario generated the data. Finally, document the new capabilities inside `README.md`, including how to inspect the live history panel and what the JSON log contains.

## Concrete Steps

1. Modify `index.html` to insert new DOM nodes: a `tech-points-value` span within the status panel and a new `history-panel` containing a table (headers for Turn, Allocation, NDVI, Revenue, Env). Wire IDs for JS hooks.
2. Extend `css/style.css` with styles for the history panel/table (scrollable body, subtle separators, responsive stacking) and ensure the status additions align with current typography.
3. Update `js/state.js` to document new `history` semantics if needed; ensure `startGame` in `js/main.js` resets `state.history` and records `state.meta` (country, year, budget) for downloads.
4. In `js/game-logic.js`, after production/revenue/env calculations, build a history entry object capturing turn metrics and push it into `state.history`.
5. In `js/ui.js`, add references to the new DOM nodes, implement `renderHistory()` to show the latest entries, call it from `renderUI()`/after turn execution, and update `downloadHistory()` to include scenario metadata plus turn records.
6. Refresh `README.md` to mention the live turn-history panel and the downloadable log contents so users know how to use the new data.

## Validation and Acceptance

1. From `/Users/moritomo/dev/Terra_Farm`, run `npx http-server -p 8080` (or `npm run dev`) and open `http://127.0.0.1:8080/` in a browser.
2. Start a mission with any country, play at least two turns with varying allocations.
3. Observe that the status panel shows both the era and a numeric tech-point value that updates after each turn.
4. Verify the new turn history panel lists the recent turns with correct budgets, NDVI averages, revenues, and environment scores, matching the log text.
5. Click "ログをダウンロード" and confirm the downloaded JSON contains `meta` and `turns` arrays whose entries correspond exactly to what the on-screen history shows (turn numbers, allocations, NDVI, env, revenue, events).
6. (Optional) Reload the page to ensure state resets and the history panel clears, demonstrating idempotence.

## Idempotence and Recovery

Running the web app is stateless; refreshing the browser resets game state and clears history. Replaying the same mission reuses the same UI slots without accumulating stale DOM nodes because renderers rebuild table contents each time. Downloaded files are additive, so repeated downloads per mission are safe. If a turn push fails, recalculating the turn replays the same `executeTurn` path with fresh RNG; there are no persistent side effects outside in-memory state.

## Artifacts and Notes

Example snippet from the new JSON payload (values illustrative):

    {
      "meta": {
        "countryKey": "usa",
        "missionYear": 2001,
        "startingBudget": 200000000000,
        "turnsPlayed": 2
      },
      "turns": [
        {
          "turn": 1,
          "allocations": { "fertilizer": 80000000000, "irrigation": 60000000000, "tech": 60000000000 },
          "avgNdvi": 0.612,
          "revenue": 73500000000,
          "envScore": 68,
          "newUnlocks": []
        }
      ]
    }

## Interfaces and Dependencies

Expose the following identifiers for reuse:

- `js/ui.js` will export new helper `renderHistory()` and expects DOM nodes with IDs `tech-points-value`, `history-body`, and `history-panel`.
- `state.history` becomes an array of `{turn, allocations:{fertilizer, irrigation, tech}, avgNdvi, envScore, revenue, totalFood, budget, techPoints, event}` objects.
- `downloadHistory()` emits `{meta:{country,name,year,startingBudget}, turns:[...history]}` as JSON for compatibility with downstream tools.
