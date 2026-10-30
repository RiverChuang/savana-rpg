import test from 'node:test';
import assert from 'node:assert/strict';
import { content, indexById } from '../data/index.js';
import { validateContent } from '../src/engine/validateContent.js';
import { Game } from '../src/engine/Game.js';
import { SaveSystem, SAVE_KEY } from '../src/systems/SaveSystem.js';

export const memoryStorage = () => { const data = new Map(); return { getItem: k => data.get(k) || null, setItem: (k, v) => data.set(k, v), removeItem: k => data.delete(k) }; };
test('all content references resolve, nine optional quests, eight main chapters', () => {
  assert.deepEqual(validateContent(content), []);
  assert.equal(Object.values(content.quests).filter(q => q.type === 'side').length, 9);
  assert.equal(content.stories.story01.chapters.length, 8);
  assert.throws(() => indexById([{ id: 'x' }, { id: 'x' }]));
});
test('new game, dialogue, clue, quest reward, reload and chapter advancement', () => {
  const storage = memoryStorage(), game = new Game(content, storage); game.newGame();
  game.interact('guideCamp'); while (game.state.dialogue) game.nextDialogue();
  game.interact('notebookCamp'); assert.equal(game.state.quests.prologue.status, 'completed');
  const exp = game.state.player.exp; game.interact('guideCamp'); while (game.state.dialogue) game.nextDialogue(); assert.equal(game.state.player.exp, exp);
  const copy = new Game(content, storage); copy.load(); assert.deepEqual(copy.state, game.state);
  copy.advance(); assert.equal(copy.state.chapter, 1); assert.equal(copy.state.quests.warning.status, 'active');
  copy.travel('camp'); copy.interact('cleanCamp'); assert.equal(copy.state.player.inventory.fieldVest, 1);
});
test('save rejects malformed data without overwriting original; reset removes only game key', () => {
  const storage = memoryStorage(); const saves = new SaveSystem(storage, content);
  storage.setItem(SAVE_KEY, 'bad'); assert.equal(saves.load().valid, false); assert.equal(storage.getItem(SAVE_KEY), 'bad');
  storage.setItem('other-app', 'keep'); saves.reset(); assert.equal(storage.getItem('other-app'), 'keep');
  const game = new Game(content, storage); game.newGame(); game.state.player.hp = NaN;
  assert.equal(saves.save(game.state).valid, false);
});
