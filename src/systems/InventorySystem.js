export class InventorySystem {
  static add(state, id, count = 1) {
    if (!Number.isInteger(count) || count < 1) throw new Error('物品數量錯誤。');
    state.player.inventory[id] = (state.player.inventory[id] || 0) + count;
  }
  static use(state, id, items) {
    const item = items[id];
    if (!item || item.type !== 'consumable' || !(state.player.inventory[id] > 0)) throw new Error('沒有可使用的道具。');
    if (state.player.hp === state.player.maxHp) throw new Error('目前生命值已滿，先保留道具吧。');
    const restored = Math.min(item.heal, state.player.maxHp - state.player.hp);
    state.player.hp += restored;
    state.player.inventory[id]--;
    return restored;
  }
}
