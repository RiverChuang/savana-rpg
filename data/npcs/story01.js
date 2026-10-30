export const npcs = [
  { id: 'cenCamp', name: '岑', role: '巡林員', location: 'camp', dialogue: 'welcome' },
  { id: 'heStream', name: '禾', role: '記錄員', location: 'stream', dialogue: 'leaves' },
  { id: 'cenHeart', name: '岑', role: '巡林員', location: 'heartwood', dialogue: 'wounded' },
  { id: 'heSummit', name: '禾', role: '記錄員', location: 'summit', dialogue: 'farewell' },
].map(npc => ({ ...npc, fictional: true, category: 'game-fiction' }));
