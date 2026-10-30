export class AchievementSystem {
  static update(state, quests) {
    const earned = [];
    const conditions = {
      firstStep: state.clues.length >= 1,
      investigator: state.clues.length >= 6,
      thoughtful: state.decisions.length >= 3,
      guardian: Object.values(quests).filter(q => q.type === 'side' && state.quests[q.id]?.status === 'completed').length >= 9,
      promise: state.completed,
    };
    for (const [id, met] of Object.entries(conditions)) {
      if (met && !state.achievements.includes(id)) { state.achievements.push(id); earned.push(id); }
    }
    return earned;
  }
}
export const achievementLabels = { firstStep: '第一道微光', investigator: '森林觀察家', thoughtful: '深思的足跡', guardian: '九個共好行動', promise: '把承諾帶回日常' };
