export class StorySystem {
  static current(state, story) { return story.chapters[state.chapter]; }
  static canAdvance(state, story) {
    return !state.battle && !state.dialogue && !state.completed && state.quests[this.current(state, story).quest]?.status === 'completed';
  }
  static advance(state, story) {
    if (!this.canAdvance(state, story)) throw new Error('先完成本章目標，再繼續旅程。');
    if (state.chapter >= story.chapters.length - 1) { state.completed = true; return false; }
    state.chapter++;
    state.location = story.chapters[state.chapter].location;
    state.player.position = { x: 48, y: 73 };
    if (!state.visits.includes(state.location)) state.visits.push(state.location);
    state.player.hp = state.player.maxHp;
    return true;
  }
}
