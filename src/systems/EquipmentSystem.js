import { recalculateStats } from './LevelSystem.js';
export class EquipmentSystem {
  static equip(state, id, items) {
    const item = items[id];
    if (!item?.slot || !(state.player.inventory[id] > 0)) throw new Error('無法裝備此物品。');
    state.player.equipment[item.slot] = state.player.equipment[item.slot] === id ? null : id;
    recalculateStats(state.player, items);
  }
}
