export class NPCSystem {
  static atLocation(locationId, npcs) { return Object.values(npcs).filter(n => n.location === locationId); }
  static get(id, npcs) {
    if (!npcs[id]) throw new Error('找不到這位角色。');
    return npcs[id];
  }
}
