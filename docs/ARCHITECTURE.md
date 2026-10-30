# Architecture

The client is a static ES-module application. `Game` is the command facade: it coordinates `GameState`, `EventSystem`, `SaveSystem`, and independent domain systems. It consumes a story registry from `data/index.js`.

`src/engine/` owns state lifecycle, content validation and command orchestration. `src/systems/` owns combat, leveling, inventory, equipment, skills, quests, dialogue, map, NPCs, stories, achievements, cultural-source filtering, and learning mechanics. `src/scenes/` draws original map scenery. `src/ui/` renders escaped state and dispatches commands.

Quests match generic events against data objectives. Rewards are awarded once; chapter advancement requires the current quest's objectives and rewards. BattleSystem knows enemy stats, skills, items and evidence but no story IDs. QuestSystem knows objective schemas, not narrative text.

The save envelope contains a schema version and the full serializable state, including an in-progress battle, discovery list, quest progress, decisions, pledge, and settings. Validation checks finite numbers, types, references, story identity and legal progress before loading. Invalid saves stay intact for diagnosis; the UI offers a deliberate new game.

`scripts/build.mjs` copies only public runtime files into `dist/`. Dev tooling and culture-review working documents are not runtime prerequisites. No network requests are needed after the static files load.
