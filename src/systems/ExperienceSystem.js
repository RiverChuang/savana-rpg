import { expForLevel, LevelSystem, MAX_LEVEL } from './LevelSystem.js';
export class ExperienceSystem {
  static gain(state, amount, items = {}) {
    if (!Number.isFinite(amount) || amount < 0) throw new Error('經驗值必須為非負數。');
    state.player.exp = Math.min(expForLevel(MAX_LEVEL), state.player.exp + amount);
    return LevelSystem.update(state, items);
  }
  static progress(player) {
    if (player.level === MAX_LEVEL) return { current: 0, needed: 0, ratio: 1 };
    const floor = expForLevel(player.level), next = expForLevel(player.level + 1);
    return { current: player.exp - floor, needed: next - floor, ratio: (player.exp - floor) / (next - floor) };
  }
}
