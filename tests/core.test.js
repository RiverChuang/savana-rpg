import test from 'node:test';
import assert from 'node:assert/strict';
import { createGameState } from '../src/engine/GameState.js';
import { EventSystem } from '../src/systems/EventSystem.js';
import { ExperienceSystem } from '../src/systems/ExperienceSystem.js';
import { BattleSystem } from '../src/systems/BattleSystem.js';
import { InventorySystem } from '../src/systems/InventorySystem.js';
import { EquipmentSystem } from '../src/systems/EquipmentSystem.js';
import { QuestSystem } from '../src/systems/QuestSystem.js';
import { CultureSourceSystem } from '../src/systems/CultureSourceSystem.js';

test('experience levels up, heals, grows stats, and caps at ten', () => {
  const s = createGameState('test'); s.player.hp = 1;
  assert.equal(ExperienceSystem.gain(s, 80), 1); assert.equal(s.player.level, 2);
  assert.equal(s.player.hp, s.player.maxHp); assert.ok(s.player.attack > 14);
  ExperienceSystem.gain(s, 99999); assert.equal(s.player.level, 10);
  assert.equal(ExperienceSystem.progress(s.player).ratio, 1);
  assert.throws(() => ExperienceSystem.gain(s, NaN));
});
test('items consume only on actual healing; equipment toggles without stat stacking', () => {
  const s = createGameState('test');
  const items = { tonic: { type: 'consumable', heal: 35 }, walkingStick: { slot: 'weapon', attack: 4 } };
  assert.throws(() => InventorySystem.use(s, 'tonic', items)); assert.equal(s.player.inventory.tonic, 4);
  s.player.hp = 40; assert.equal(InventorySystem.use(s, 'tonic', items), 35); assert.equal(s.player.inventory.tonic, 3);
  EquipmentSystem.equip(s, 'walkingStick', items); assert.equal(s.player.attack, 18);
  EquipmentSystem.equip(s, 'walkingStick', items); assert.equal(s.player.attack, 14);
});
test('quest objectives count once up to target and unlock prerequisites', () => {
  const s = createGameState('test');
  const quests = {
    a: { id: 'a', prerequisites: [], unlockConditions: [], objectives: [{ event: 'clue', target: 'x' }] },
    b: { id: 'b', prerequisites: ['a'], unlockConditions: [], objectives: [{ event: 'talk', target: 'y' }] },
  };
  assert.deepEqual(QuestSystem.unlock(s, quests), ['a']);
  assert.equal(QuestSystem.record(s, quests, { type: 'clue', target: 'x' }).length, 1);
  assert.equal(QuestSystem.record(s, quests, { type: 'clue', target: 'x' }).length, 0);
  assert.deepEqual(QuestSystem.unlock(s, quests), ['b']);
});
test('battle reflection uses discovered evidence and is not an attack; flee works', () => {
  const s = createGameState('test');
  const content = { enemies: { fog: { id: 'fog', name: '霧', fictional: true, hp: 60, attack: 9, defense: 8, weaknessClues: ['x'], insight: '先觀察', intro: '霧來了' } }, skills: {}, items: {} };
  BattleSystem.start(s, 'fog', 'enc', content.enemies);
  BattleSystem.act(s, 'reflect', content); assert.equal(s.battle.exposed, false); assert.equal(s.battle.hp, 60);
  s.clues.push('x'); BattleSystem.act(s, 'reflect', content); assert.equal(s.battle.exposed, true); assert.equal(s.battle.hp, 60);
  assert.equal(BattleSystem.act(s, 'flee', content).status, 'fled'); assert.equal(s.battle, null);
});
test('event listeners unsubscribe and pending culture is never verified', () => {
  const bus = new EventSystem(); let count = 0; const off = bus.on('x', () => count++);
  bus.emit('x'); off(); bus.emit('x'); assert.equal(count, 1);
  assert.equal(CultureSourceSystem.verified([{ confirmed: false, status: 'TODO_CULTURE_REVIEW' }]).length, 0);
});
test('quests for another story never unlock in the active story', () => {
  const s = createGameState('story01');
  const quests = {
    local: { id: 'local', storyId: 'story01', prerequisites: [], unlockConditions: [], objectives: [] },
    other: { id: 'other', storyId: 'story02', prerequisites: [], unlockConditions: [], objectives: [] },
  };
  assert.deepEqual(QuestSystem.unlock(s, quests), ['local']); assert.equal(s.quests.other, undefined);
});
test('changing health equipment repeatedly cannot create free healing', () => {
  const s = createGameState('test'); s.player.hp = 30; s.player.inventory.vest = 1;
  const items = { vest: { slot: 'charm', hp: 12, defense: 2 } };
  EquipmentSystem.equip(s, 'vest', items); EquipmentSystem.equip(s, 'vest', items);
  assert.equal(s.player.hp, 30);
});
