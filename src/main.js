import { content } from '../data/index.js';
import { Game } from './engine/Game.js';
import { createGameState } from './engine/GameState.js';
import { QuestSystem } from './systems/QuestSystem.js';
import { GameUI } from './ui/GameUI.js';

let storage;
try { storage = globalThis.localStorage; } catch { storage = { getItem: () => null, setItem: () => { throw new Error('Storage unavailable'); }, removeItem: () => { throw new Error('Storage unavailable'); } }; }
const game = new Game(content, storage);
game.state = createGameState(content.defaultStory);
game.state.started = false;
game.state.location = game.chapter.location;
QuestSystem.unlock(game.state, content.quests);
const ui = new GameUI(game);
ui.render();
