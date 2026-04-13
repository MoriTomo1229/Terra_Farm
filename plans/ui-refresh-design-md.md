# Refresh Terra Farm UI With DESIGN.md Direction

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds. Maintain this plan per `PLANS.md`.

## Purpose / Big Picture

The current Terra Farm UI communicates a dark sci-fi mood with saturated gradients, while the newly added `DESIGN.md` defines a quieter editorial direction built on warm light surfaces, restrained accents, and stronger information hierarchy. This task will realign the game's UI shell with that direction without changing game rules or the existing global JavaScript initialization order. After the change, players should still use the same flow, but the start screen, header, cards, tables, and controls should feel calmer, more legible, and more consistent across desktop and narrow layouts.

## Progress

- [x] (2026-04-13 13:09 JST) Audited `DESIGN.md`, current HTML/CSS, and repo-specific UI constraints; created working branch `codex/ui-refresh-design-md`.
- [x] (2026-04-13 14:03 JST) Refreshed `index.html` structure and `css/style.css` tokens/layout to match the quiet editorial direction while preserving existing DOM IDs and script loading order.
- [x] (2026-04-13 14:08 JST) Verified `npm run dev` serves the updated app and recorded the remaining manual browser checks.
- [x] (2026-04-13 14:18 JST) Added theme settings with dark mode as the default, synchronized controls on start/header, and persisted the user choice via `localStorage`.

## Surprises & Discoveries

- Observation: `DESIGN.md` reads like a portfolio design system rather than a game-specific spec, so the implementation must adapt the tone system instead of copying section patterns literally.
  Evidence: The document mentions portfolio-specific elements such as Hero, Project Card, and Case Study widths, while this repo is a turn-based game with fixed interactive panels.

## Decision Log

- Decision: Keep the change focused on presentation and information hierarchy, not on game mechanics or large DOM rewrites.
  Rationale: `index.html` relies on ordered global script loading and `js/ui.js` binds many fixed IDs, so preserving those hooks reduces regression risk.
  Date/Author: 2026-04-13 / Coding agent.
- Decision: Approximate the typography direction with local/system font stacks rather than adding new webfont dependencies.
  Rationale: Repo guidance prefers avoiding new external dependencies unless clearly necessary, and the visual intent can still be expressed with existing serif/sans stacks.
  Date/Author: 2026-04-13 / Coding agent.
- Decision: Implement theme switching through CSS custom properties on `body[data-theme]` and expose the setting in both the start screen and in-game header.
  Rationale: This keeps the theme diff localized, avoids JS-heavy restyling, and lets the user change appearance before or during a run while preserving their choice across reloads.
  Date/Author: 2026-04-13 / Coding agent.

## Outcomes & Retrospective

- The start screen, header, and three primary game panels now use a light editorial presentation with warm surfaces, restrained green accents, calmer buttons, and clearer section hierarchy.
- The app now defaults to dark mode and provides synchronized theme settings on both the start screen and the game header; the selected theme is saved to `localStorage`.
- Existing game mechanics and JavaScript bindings were left intact; the change is limited to HTML structure around the same IDs, CSS variables, and a small amount of UI bootstrapping code.
- Remaining gap: I confirmed server delivery and script syntax locally, but did not complete the repo-standard browser playthrough of starting a mission, switching themes interactively, and advancing two turns on desktop/mobile widths in this session.
