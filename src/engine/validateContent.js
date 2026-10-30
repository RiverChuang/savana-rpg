export function validateContent(c) {
  const errors = [];
  const check = (ok, text) => { if (!ok) errors.push(text); };
  for (const [key, collection] of Object.entries(c)) {
    if (!collection || typeof collection !== 'object' || Array.isArray(collection)) continue;
    for (const [id, item] of Object.entries(collection)) check(item.id === id, `${key}: ID mismatch ${id}`);
  }
  for (const story of Object.values(c.stories)) for (const ch of story.chapters) {
    check(c.locations[ch.location], `Missing location ${ch.location}`); check(c.quests[ch.quest], `Missing quest ${ch.quest}`); check(c.enemies[ch.trainingEnemy], `Missing training enemy ${ch.trainingEnemy}`);
  }
  for (const quest of Object.values(c.quests)) {
    for (const key of ['id', 'type', 'title', 'description', 'requirements', 'objectives', 'rewards', 'prerequisites', 'unlockConditions', 'nextQuest']) check(Object.hasOwn(quest, key), `${quest.id}: missing ${key}`);
    check(['main', 'side'].includes(quest.type) && quest.objectives.length > 0, `Invalid quest ${quest.id}`);
    for (const id of quest.prerequisites) check(c.quests[id], `Missing prerequisite ${id}`);
    if (quest.nextQuest) check(c.quests[quest.nextQuest], `Missing nextQuest ${quest.nextQuest}`);
    for (const id of Object.keys(quest.rewards.items || {})) check(c.items[id], `Missing reward item ${id}`);
  }
  const hotspotIds = new Set();
  for (const location of Object.values(c.locations)) for (const h of location.hotspots) {
    check(!hotspotIds.has(h.id), `Duplicate hotspot ${h.id}`); hotspotIds.add(h.id);
    const table = { enemy: c.enemies, dialogue: c.dialogues, clue: c.clues, decision: c.decisions, side: c.quests }[h.kind];
    if (table) check(table[h.ref], `Missing hotspot reference ${h.id}/${h.ref}`);
    check(h.x >= 0 && h.x <= 100 && h.y >= 0 && h.y <= 100, `Invalid hotspot position ${h.id}`);
  }
  for (const enemy of Object.values(c.enemies)) {
    check(enemy.fictional === true && enemy.category === 'game-fiction', `Enemy must be fiction ${enemy.id}`);
    check(enemy.hp > 0 && enemy.attack > 0 && enemy.defense >= 0 && Number.isFinite(enemy.hp + enemy.attack + enemy.defense), `Invalid enemy stats ${enemy.id}`);
    for (const id of enemy.weaknessClues) check(c.clues[id], `Missing weakness clue ${id}`);
  }
  for (const npc of Object.values(c.npcs)) { check(npc.fictional === true, `NPC must be marked fictional ${npc.id}`); check(c.dialogues[npc.dialogue] && c.locations[npc.location], `Invalid NPC ${npc.id}`); }
  check(c.stories[c.defaultStory], 'Default story missing');
  return errors;
}
