export const MAX_LEVEL = 10;
export const expForLevel = level => level <= 1 ? 0 : 40 * (level - 1) * level;
export function recalculateStats(player, items = {}, heal = false) {
  const weapon = items[player.equipment.weapon];
  const charm = items[player.equipment.charm];
  const oldMax = player.maxHp;
  player.maxHp = 90 + (player.level - 1) * 16 + (charm?.hp || 0);
  player.attack = 14 + (player.level - 1) * 3 + (weapon?.attack || 0);
  player.defense = 5 + (player.level - 1) * 2 + (charm?.defense || 0);
  player.hp = heal ? player.maxHp : Math.min(player.maxHp, player.hp + Math.max(0, player.maxHp - oldMax));
}
export class LevelSystem {
  static update(state, items) {
    const before = state.player.level;
    while (state.player.level < MAX_LEVEL && state.player.exp >= expForLevel(state.player.level + 1)) state.player.level++;
    if (state.player.level > before) recalculateStats(state.player, items, true);
    return state.player.level - before;
  }
}
