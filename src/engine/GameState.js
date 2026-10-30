export const SAVE_VERSION = 1;
export const GAME_VERSION = '0.1.0';

export function createGameState(storyId, name = '旅人') {
  return {
    version: SAVE_VERSION, gameVersion: GAME_VERSION, storyId,
    started: true, completed: false, chapter: 0, location: null,
    player: {
      name: String(name).trim().slice(0, 16) || '旅人', level: 1, exp: 0,
      hp: 90, maxHp: 90, attack: 14, defense: 5, reflection: 0, harmony: 0,
      inventory: { tonic: 4, ration: 2, walkingStick: 1 },
      equipment: { weapon: null, charm: null }, skills: ['clearStrike'],
      position: { x: 48, y: 73 },
    },
    quests: {}, clues: [], interactions: [], visits: [], decisions: [],
    defeated: [], achievements: [], battle: null, dialogue: null, choice: null, pledge: null,
    log: [], settings: { reducedMotion: false }, turn: 0, seed: 173,
  };
}

export function addLog(state, text, type = 'info') {
  state.log.push({ text, type, turn: state.turn });
  state.log = state.log.slice(-60);
}

export function random(state) {
  state.seed = (state.seed * 1664525 + 1013904223) >>> 0;
  return state.seed / 4294967296;
}
