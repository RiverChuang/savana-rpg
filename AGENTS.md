# Savana RPG — agent instructions

Read this file before every task in this repository.

## Architecture
- Buildless HTML5, CSS3, JavaScript ES modules. No runtime dependencies or backend.
- Engine rules live in `src/engine/` and `src/systems/`; narrative lives in `data/`.
- New stories are data packs registered in `data/index.js`. Do not hardcode chapter IDs in BattleSystem or QuestSystem.
- All URLs must work under a GitHub Pages repository subpath. Use relative asset/import paths.
- All player state is local. Validate saves before adopting them. No accounts or telemetry.

## Culture and media
- Never invent Tsou language, pronunciations, rituals, mythology, taboos, or historical claims.
- Separate `category: 'game-fiction', fictional: true` from source-based cultural records.
- Unverified cultural content must be `TODO_CULTURE_REVIEW` and recorded in `docs/CULTURE_REVIEW.md`.
- Never turn the great stag, ancestors, cultural figures, or cultural symbols into farmable enemies.
- Cultural sources need bibliographic information, purpose, confirmation, and license status. Use `NEEDS_LICENSE_REVIEW` when unknown; do not ship that material.
- No paid APIs, OpenAI API, SaaS, external backend, analytics, ads, YouTube assets, or unlicensed media.
- Use original SVG/CSS art. Do not imply original characters represent any ethnic group's personality or beliefs.

## Code and validation
- Use descriptive names, ES modules, pure functions for domain rules, and explicit event objects.
- Do not interpolate player input into HTML; escape all rendered content.
- Interactive controls must have accessible names, visible focus, keyboard support, and responsive layouts.
- Run `node --test`, `node scripts/check.mjs`, and `node scripts/build.mjs` before committing changes to behavior.
- Test outcomes and edge cases, including a full new-game-to-ending run, reload, death recovery, and corrupted saves.
- Check the browser on desktop/mobile, console errors, all menu controls, and the deployed repository subpath.

## Git and Definition of Done
- Commit each tested phase with Conventional Commits. Do not commit secrets, tools, dist, or local saves.
- Preserve others' work; never force push or delete a repository to repair a deployment.
- Done means all MVP criteria in GOALS.md pass, tests and browser QA pass, main is pushed, Pages Actions succeeds, and live HTML/CSS/JS/SVG return successful HTTP responses.
- Report incomplete checks honestly. GitHub authorization and missing cultural sources must never be fabricated.
