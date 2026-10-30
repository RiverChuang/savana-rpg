export class SkillSystem {
  static unlock(state, skills) {
    for (const skill of Object.values(skills)) {
      if (state.player.level >= skill.level && !state.player.skills.includes(skill.id)) state.player.skills.push(skill.id);
    }
  }
  static available(state, skills) {
    return state.player.skills.map(id => skills[id]).filter(Boolean);
  }
}
