export class ReflectionSystem {
  static choose(state, decisions, choiceId, reason) {
    const decision = decisions[state.choice];
    if (!decision) throw new Error('目前沒有等待回應的抉擇。');
    if (state.decisions.some(d => d.id === decision.id)) throw new Error('這次抉擇已記錄。');
    const choice = decision.choices.find(c => c.id === choiceId);
    if (!choice || !decision.reasons.includes(reason)) throw new Error('請選擇行動，並記下你的理由。');
    const record = { id: decision.id, choice: choice.text, choiceId, reason, result: choice.result };
    state.decisions.push(record); state.choice = null;
    state.player.reflection = Math.min(100, state.player.reflection + 5);
    state.player.harmony = Math.min(100, state.player.harmony + choice.harmony);
    return record;
  }
}
