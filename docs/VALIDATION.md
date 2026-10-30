# MVP validation — 0.1.0

Date: 2026-10-30 (Asia/Taipei).

## Automated checks

- PASS: `node --test` — 16 tests covering two full campaign routes, nine side quests, six clues, three choices, final pledge and ending, level cap, battle commands/recovery, inventory/gear, persistence, malformed saves and a second data-only story.
- PASS: complete route without side quests and without battle reflection; alternate choices and reversed objective order still reach the ending.
- PASS: `node scripts/check.mjs` — syntax/module and content-reference checks.
- PASS: `node scripts/build.mjs` — static runtime allowlist copied to dist.

## Browser playthrough

Verified through the actual UI at a local HTTP URL with the `/savana-rpg/` prefix, not by directly editing game state:

- PASS: create player 晨行者, new game, NPC dialogue, clue discoveries, chapter advancement, all eight chapters.
- PASS: all nine side quests; grid shows 9/9 completed; notebook shows 6/6 clues, three choice/reason/result records and all five achievements.
- PASS: equip hand staff, vest, upgraded staff, and leaf badge; stat displays update.
- PASS: attack, defend, reflect, skill, potion, flee; boss can be fled and retried successfully.
- PASS: reload in the middle of battle and continue at the same turn/HP with exposed weakness preserved.
- PASS: final pledge's action dropdown, written text, confirmation checkbox, final quest and ending summary (8 chapters, 6/6 clues, 9/9 actions, 3 decisions).
- FIXED during browser QA: pledge dropdown had missing opening option tags; now uses the shared PLEDGE_ACTIONS catalog and was retested to completion.
- PASS: no error/warning console entries during the complete run and menu checks.
- PASS: 390px and 768px viewport checks showed no horizontal overflow and no failed images; desktop checked at 1440px. Scrollbar reduces clientWidth by 15px.
- PASS: notebook tabs, all five achievements, source-review list, completed action grid, revisit map, keyboard movement, reduced motion and manual save.
- PASS: reset persistence unit test removes only the game's key; browser reset confirmation was inspected and canceled to retain the QA playthrough.
- FIXED: closing a modal could move focus to the header instead of its trigger; focus restoration corrected and retested.
- PASS: local HTTP verification checked all 47 HTML/CSS/JS/SVG runtime resources and their content types.

Screenshots: [Home](screenshots/home.png), [Mobile exploration](screenshots/mobile-exploration.png), [Boss battle](screenshots/boss-battle.png), [Ending](screenshots/ending.png), [Live game](screenshots/live-game.png).

## Culture and media

- PASS: every enemy is marked fictional. The great stag is a non-combat scene.
- PASS: culture-source journal shows 0 verified sources and four pending categories. No invented cultural facts or third-party media are included.
- TODO_CULTURE_REVIEW remains an editorial requirement, not a claimed cultural approval. See CULTURE_REVIEW.md.

## Deployment

- PASS: public repository created at https://github.com/RiverChuang/savana-rpg and main pushed with six phase commits.
- PASS: official GitHub Actions build/test/deploy workflow [41062141712](https://github.com/RiverChuang/savana-rpg/actions/runs/41062141712), source commit `7df0347ce3dabc5361e8291f80ee4204557eaf8c`. Both build and deploy jobs succeeded.
- PASS: Pages API confirms `build_type: workflow` and `https_enforced: true`.
- PASS: https://riverchuang.github.io/savana-rpg/ opens successfully in the browser.
- PASS: `node scripts/verify-http.mjs https://riverchuang.github.io/savana-rpg/` verified all **47** live HTML/CSS/JS/SVG runtime resources with successful HTTP status and expected content types.
- PASS: on the actual live origin, start a new game, complete NPC dialogue and first clue, then advance to Chapter 1. No browser error/warning entries were captured.
- The full eight-chapter browser playthrough was performed locally with the same runtime source; live smoke verification covers startup and Chapter 1. Domain tests exercise the entire campaign in both local and GitHub Actions environments.

No known blocking gameplay or JavaScript errors remain. Editorial limitation: source-based Tsou cultural content is pending review and is not represented as verified in this release. Saves remain browser-local and do not synchronize across origins or devices.
