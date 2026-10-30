import test from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../data/index.js';
import { Game } from '../src/engine/Game.js';
import { PLEDGE_ACTIONS } from '../src/systems/PledgeSystem.js';
import { validateSave, SAVE_KEY } from '../src/systems/SaveSystem.js';
import { EnvironmentGridSystem } from '../src/systems/EnvironmentGridSystem.js';
import { ClueSystem } from '../src/systems/ClueSystem.js';

const storage = () => { const map = new Map(); return { getItem: k => map.get(k) || null, setItem: (k, v) => map.set(k, v), removeItem: k => map.delete(k) }; };
function fight(game, reflect = true) {
  let rounds = 0;
  while (game.state.battle) {
    assert.ok(rounds++ < 100, 'battle must terminate');
    const s = game.state, b = s.battle;
    if (rounds === 1 && reflect) game.battle('reflect');
    else if (s.player.hp < s.player.maxHp * 0.5 && s.player.inventory.tonic) game.battle('item', 'tonic');
    else if (s.player.hp < s.player.maxHp * 0.5 && s.player.skills.includes('breathe') && !b.cooldowns.breathe) game.battle('skill', 'breathe');
    else if (s.player.skills.includes('resolve') && !b.cooldowns.resolve) game.battle('skill', 'resolve');
    else if (!b.cooldowns.clearStrike) game.battle('skill', 'clearStrike');
    else game.battle('attack');
  }
}
function campaign({ sides, reflect = true, choiceIndex = 0, reverse = false }) {
  const store = storage(); let game = new Game(content, store); game.newGame('測試旅人'); game.equip('walkingStick');
  for (let chapter = 0; chapter < 8; chapter++) {
    assert.equal(game.state.chapter, chapter);
    const hotspots = [...game.location.hotspots]; if (reverse) hotspots.reverse();
    for (const h of hotspots) {
      if (h.kind === 'side' && !sides) continue;
      game.interact(h.id);
      if (h.kind === 'dialogue') while (game.state.dialogue) game.nextDialogue();
      else if (h.kind === 'enemy') { assert.equal(game.saves.load().valid, true); fight(game, reflect); assert.ok(game.state.defeated.includes(h.id), `must win ${h.id}`); }
      else if (h.kind === 'decision') {
        assert.equal(game.saves.load().valid, true, 'pending choice should save');
        const d = content.decisions[h.ref]; game.choose(d.choices[choiceIndex].id, d.reasons[choiceIndex]);
      } else if (h.kind === 'pledge') game.makePledge('下次走進森林時，我會自備水壺並把自己的垃圾帶回來。', PLEDGE_ACTIONS[0]);
      if (game.state.player.inventory.forestBlade) game.state.player.equipment.weapon !== 'forestBlade' && game.equip('forestBlade');
      if (game.state.player.inventory.leafCharm) game.state.player.equipment.charm !== 'leafCharm' && game.equip('leafCharm');
      else if (game.state.player.inventory.fieldVest) game.state.player.equipment.charm !== 'fieldVest' && game.equip('fieldVest');
      assert.deepEqual(validateSave(game.state, content), { valid: true });
    }
    assert.equal(game.state.quests[game.chapter.quest].status, 'completed', `chapter ${chapter}`);
    const before = JSON.stringify(game.state); game = new Game(content, store); game.load(); assert.equal(JSON.stringify(game.state), before);
    game.advance();
  }
  return game;
}

test('complete campaign, nine side quests, all clues/choices/equipment, final pledge and ending persist', () => {
  const game = campaign({ sides: true });
  assert.equal(game.state.completed, true);
  assert.equal(EnvironmentGridSystem.cells(game.state, content.quests).filter(c => c.completed).length, 9);
  assert.equal(ClueSystem.notebook(game.state, content.clues).filter(c => c.discovered).length, 6);
  assert.equal(game.state.decisions.length, 3); assert.equal(game.state.player.equipment.charm, 'leafCharm');
  assert.ok(game.state.achievements.includes('promise')); assert.ok(game.state.achievements.includes('guardian'));
  assert.equal(game.saves.load().state.completed, true);
  assert.throws(() => game.advance());
});
test('all alternate choices, no side quests, no battle reflection, reverse objective order still reaches ending', () => {
  const game = campaign({ sides: false, reflect: false, choiceIndex: 1, reverse: true });
  assert.equal(game.state.completed, true); assert.equal(game.state.decisions.length, 3);
});
test('battle can flee, recover from defeat, reload midturn and train to level 10', () => {
  const store = storage(), game = new Game(content, store); game.newGame(); game.train();
  assert.equal(game.battle('flee').status, 'fled'); assert.equal(game.state.quests.prologue.status, 'active');
  game.train(); const b = JSON.stringify(game.state.battle); const copy = new Game(content, store); copy.load(); assert.equal(JSON.stringify(copy.state.battle), b);
  game.state.player.hp = 1; const result = game.battle('attack'); assert.equal(result.status, 'defeat'); assert.equal(game.state.player.hp, game.state.player.maxHp);
  for (let i = 0; i < 85 && game.state.player.level < 10; i++) { game.rest(); game.train(); fight(game); }
  assert.equal(game.state.player.level, 10); assert.equal(game.saves.load().valid, true);
});
test('invalid choices/pledges do not grant rewards or skip story gates', () => {
  const game = new Game(content, storage()); game.newGame();
  assert.throws(() => game.choose('bad', 'bad')); assert.throws(() => game.makePledge('long enough pledge', PLEDGE_ACTIONS[0]));
  assert.throws(() => game.advance()); assert.throws(() => game.travel('summit'));
  assert.equal(game.state.player.exp, 0); assert.equal(game.state.completed, false);
});
test('a second data-only story plays through without changing battle or quest core', () => {
  const chapter = { title: '新故事', label: '序章', location: 'secondCamp', quest: 'secondQuest', trainingEnemy: 'mist' };
  const extra = {
    ...content, defaultStory: 'story02',
    stories: { ...content.stories, story02: { id: 'story02', chapters: [chapter] } },
    locations: { ...content.locations, secondCamp: { id: 'secondCamp', hotspots: [{ id: 'secondGuide', kind: 'dialogue', ref: 'welcome', x: 30, y: 55 }] } },
    quests: { ...content.quests, secondQuest: { id: 'secondQuest', storyId: 'story02', type: 'main', prerequisites: [], unlockConditions: [], objectives: [{ event: 'talk', target: 'welcome' }], rewards: { exp: 80 } } },
  };
  const game = new Game(extra, storage()); game.newGame();
  assert.deepEqual(Object.keys(game.state.quests), ['secondQuest']);
  game.interact('secondGuide'); while (game.state.dialogue) game.nextDialogue(); game.advance();
  assert.equal(game.state.completed, true); assert.equal(game.saves.load().valid, true);
});
test('save corruption, missing nested fields, future schema, storage quota and unknown references are rejected', () => {
  const store = storage(), game = new Game(content, store); game.newGame();
  const original = JSON.parse(JSON.stringify(game.state));
  const mutations = [s => { s.version = 999; }, s => { delete s.player.equipment; }, s => { s.player.attack = null; }, s => { s.clues.push('unknown'); }, s => { s.quests.prologue.progress = []; }, s => { s.chapter = 100; }, s => { s.player.skills.push('missing'); }, s => { s.player.exp = -1; }, s => { s.completed = true; }, s => { s.decisions.push({ id: 'missing', choice: 'x', reason: 'x', result: 'x' }); }, s => { s.player.skills.push('toString'); }, s => { s.interactions.push('unknown'); }, s => { s.player.attack += 99; }];
  for (const mutate of mutations) { const s = structuredClone(original); mutate(s); store.setItem(SAVE_KEY, JSON.stringify({ state: s })); assert.equal(game.saves.load().valid, false); }
  const quota = new Game(content, { getItem: () => null, setItem: () => { throw new Error('QuotaExceededError'); } }); quota.newGame(); assert.equal(quota.lastSave.valid, false);
});
