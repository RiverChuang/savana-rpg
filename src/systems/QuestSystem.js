function conditionMet(state, condition) {
  if (condition.kind === 'chapter') return state.chapter >= condition.value;
  if (condition.kind === 'clue') return state.clues.includes(condition.target);
  return false;
}
export class QuestSystem {
  static unlock(state, quests) {
    const unlocked = [];
    for (const quest of Object.values(quests)) {
      if (state.quests[quest.id]) continue;
      if (quest.prerequisites.some(id => state.quests[id]?.status !== 'completed')) continue;
      if (!quest.unlockConditions.every(c => conditionMet(state, c))) continue;
      state.quests[quest.id] = { status: 'active', progress: quest.objectives.map(() => 0) };
      unlocked.push(quest.id);
    }
    return unlocked;
  }
  static record(state, quests, event) {
    const completed = [];
    for (const [id, entry] of Object.entries(state.quests)) {
      if (entry.status !== 'active') continue;
      const quest = quests[id];
      quest.objectives.forEach((objective, index) => {
        if (objective.event === event.type && (!objective.target || objective.target === event.target)) {
          entry.progress[index] = Math.min(objective.count || 1, entry.progress[index] + 1);
        }
      });
      if (quest.objectives.every((o, index) => entry.progress[index] >= (o.count || 1))) {
        entry.status = 'completed';
        completed.push(quest);
      }
    }
    return completed;
  }
  static progress(state, quest) {
    const entry = state.quests[quest.id];
    return quest.objectives.map((o, i) => ({ ...o, current: entry?.progress[i] || 0, done: (entry?.progress[i] || 0) >= (o.count || 1) }));
  }
}
