export class MapSystem {
  static travel(state, locationId, story, locations) {
    const index = story.chapters.findIndex(ch => ch.location === locationId);
    if (!locations[locationId] || index < 0 || index > state.chapter) throw new Error('此地區尚未解鎖。');
    if (state.battle || state.dialogue) throw new Error('先結束目前的互動。');
    state.location = locationId;
    state.player.position = { x: 48, y: 73 };
    if (!state.visits.includes(locationId)) state.visits.push(locationId);
  }
  static move(state, dx, dy) {
    if (state.battle || state.dialogue) return;
    state.player.position.x = Math.max(8, Math.min(92, state.player.position.x + dx));
    state.player.position.y = Math.max(48, Math.min(87, state.player.position.y + dy));
  }
  static visibleHotspots(state, location) {
    return location.hotspots.filter(h => h.kind === 'enemy' ? !state.defeated.includes(h.id) : !state.interactions.includes(h.id));
  }
}
