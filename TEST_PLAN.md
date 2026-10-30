# Test plan

- Unit: stats/EXP cap, battle commands, weaknesses, item consumption, gear, skills, quest prerequisites and idempotent rewards, event bus, culture filtering.
- State: deterministic seed, saves at battle/choices/progression, malformed/version-mismatch saves, reset, storage errors.
- Integration: new game through all eight chapters, all nine side quests, 5W1H clues, three reasoned decisions, boss, pledge and ending, reload continuity.
- Content integrity: unique IDs, all cross references, required quest fields, explicit fiction flags, pending culture excluded from published facts.
- Static: local module graph and asset paths, syntax, prohibited runtime services, production copy allowlist.
- Browser: launch/new/continue, movement/hotspots, dialogue, battle, inventory/equipment, journal tabs, settings/reset, keyboard/focus, no console exceptions, no overflow at 390/768/1440 widths.
- Deployment: Pages workflow success and live HTML/CSS/module/SVG HTTP responses under `/savana-rpg/`.
