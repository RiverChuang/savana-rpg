export class EnvironmentGridSystem {
  static cells(state, quests) {
    return Object.values(quests).filter(q => q.type === 'side').sort((a, b) => a.grid - b.grid)
      .map(quest => ({ quest, completed: state.quests[quest.id]?.status === 'completed', unlocked: Boolean(state.quests[quest.id]) }));
  }
}
