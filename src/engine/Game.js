import { addLog, createGameState } from './GameState.js';
import { EventSystem } from '../systems/EventSystem.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { QuestSystem } from '../systems/QuestSystem.js';
import { ExperienceSystem } from '../systems/ExperienceSystem.js';
import { InventorySystem } from '../systems/InventorySystem.js';
import { EquipmentSystem } from '../systems/EquipmentSystem.js';
import { SkillSystem } from '../systems/SkillSystem.js';
import { MapSystem } from '../systems/MapSystem.js';
import { DialogueSystem } from '../systems/DialogueSystem.js';
import { BattleSystem } from '../systems/BattleSystem.js';
import { StorySystem } from '../systems/StorySystem.js';
import { AchievementSystem, achievementLabels } from '../systems/AchievementSystem.js';
import { ReflectionSystem } from '../systems/ReflectionSystem.js';
import { PledgeSystem } from '../systems/PledgeSystem.js';

export class Game {
  constructor(content, storage) { this.content = content; this.saves = new SaveSystem(storage, content); this.events = new EventSystem(); this.state = null; this.lastSave = null; }
  get story() { return this.content.stories[this.state.storyId]; }
  get chapter() { return StorySystem.current(this.state, this.story); }
  get location() { return this.content.locations[this.state.location]; }
  newGame(name = '旅人', storyId = this.content.defaultStory) {
    if (!this.content.stories[storyId]) throw new Error('找不到故事。');
    this.state = createGameState(storyId, name);
    this.state.location = this.chapter.location; this.state.visits.push(this.state.location);
    QuestSystem.unlock(this.state, this.content.quests);
    addLog(this.state, '你攤開一本空白的森林筆記。旅程，從願意觀察開始。');
    this.changed(); return this.state;
  }
  changed() {
    SkillSystem.unlock(this.state, this.content.skills);
    for (const id of AchievementSystem.update(this.state, this.content.quests)) addLog(this.state, `成就解鎖：${achievementLabels[id]}`, 'success');
    this.lastSave = this.saves.save(this.state);
    this.events.emit('change', { state: this.state });
  }
  load() {
    const result = this.saves.load();
    if (!result.valid) throw new Error(result.error);
    this.state = result.state; this.lastSave = { valid: true }; this.events.emit('change', { state: this.state });
    return result;
  }
  save() { this.lastSave = this.saves.save(this.state); if (!this.lastSave.valid) throw new Error(this.lastSave.error); return this.lastSave; }
  record(event) {
    const completed = QuestSystem.record(this.state, this.content.quests, event);
    for (const quest of completed) {
      this.reward(quest.rewards); addLog(this.state, `任務完成：${quest.title}`, 'success');
    }
    QuestSystem.unlock(this.state, this.content.quests);
    this.events.emit('game-event', event);
  }
  reward(reward = {}) {
    if (reward.exp) {
      const levels = ExperienceSystem.gain(this.state, reward.exp, this.content.items);
      addLog(this.state, `獲得 ${reward.exp} EXP${levels ? ` · 升至 Lv.${this.state.player.level}，生命值恢復！` : ''}`, 'reward');
    }
    for (const [id, count] of Object.entries(reward.items || {})) InventorySystem.add(this.state, id, count);
    this.state.player.harmony = Math.min(100, this.state.player.harmony + (reward.harmony || 0));
  }
  interact(id) {
    if (this.state.battle || this.state.dialogue || this.state.choice) throw new Error('先完成目前的互動。');
    const h = this.location.hotspots.find(h => h.id === id);
    if (!h) throw new Error('此地點沒有這個互動。');
    if (h.kind === 'enemy') {
      if (this.state.defeated.includes(id)) throw new Error('此處已恢復平靜。');
      BattleSystem.start(this.state, h.ref, id, this.content.enemies);
    } else if (h.kind === 'dialogue') {
      DialogueSystem.begin(this.state, h.ref, this.content.dialogues); this.state.dialogue.hotspot = id;
    } else {
      if (this.state.interactions.includes(id)) throw new Error('這裡已記錄在筆記裡。');
      if (h.kind === 'clue') {
        if (!this.state.clues.includes(h.ref)) this.state.clues.push(h.ref);
        addLog(this.state, `找到線索：${this.content.clues[h.ref].title}`, 'clue');
        this.record({ type: 'clue', target: h.ref });
      } else if (h.kind === 'side') {
        if (!this.state.quests[h.ref]) throw new Error('此任務尚未解鎖。');
        addLog(this.state, h.result, 'success'); this.record({ type: 'action', target: id });
      } else if (h.kind === 'decision') {
        this.state.choice = h.ref; this.changed(); return;
      } else if (h.kind === 'pledge') { this.events.emit('pledge', {}); return; }
      else throw new Error('未知的地圖互動。');
      this.state.interactions.push(id);
    }
    this.state.player.position = { x: h.x, y: Math.min(87, h.y + 9) };
    this.state.turn++; this.changed();
  }
  nextDialogue() {
    const h = this.state.dialogue?.hotspot;
    const ended = DialogueSystem.next(this.state, this.content.dialogues);
    if (ended) {
      if (!this.state.interactions.includes(h)) this.state.interactions.push(h);
      this.record({ type: 'talk', target: ended });
    }
    this.changed();
  }
  choose(choiceId, reason) {
    const id = this.state.choice;
    const h = this.location.hotspots.find(h => h.kind === 'decision' && h.ref === id);
    if (!h || this.state.battle || this.state.dialogue) throw new Error('此處無法記錄這個選擇。');
    const record = ReflectionSystem.choose(this.state, this.content.decisions, choiceId, reason);
    this.state.interactions.push(h.id);
    addLog(this.state, record.result, 'reflection');
    this.record({ type: 'decision', target: id }); this.changed(); return record;
  }
  makePledge(text, action) {
    const h = this.location.hotspots.find(h => h.kind === 'pledge');
    if (!h || this.state.battle || this.state.dialogue || this.state.choice) throw new Error('請先抵達寫下承諾的地方。');
    PledgeSystem.write(this.state, text, action);
    this.state.interactions.push(h.id);
    addLog(this.state, '你寫下了自己的個人環境承諾。', 'success');
    this.record({ type: 'pledge', target: 'personal' }); this.changed();
  }
  battle(command, parameter) {
    const result = BattleSystem.act(this.state, command, this.content, parameter);
    result.messages.forEach(line => addLog(this.state, line, result.status === 'victory' ? 'success' : 'battle'));
    if (result.status === 'victory') {
      if (!result.encounterId.startsWith('training:')) { this.state.defeated.push(result.encounterId); this.record({ type: 'defeat', target: result.encounterId }); }
      this.reward(result.enemy.rewards);
    }
    this.state.turn++; this.changed(); return result;
  }
  train() {
    if (this.state.choice) throw new Error('先完成目前的抉擇。');
    BattleSystem.start(this.state, this.chapter.trainingEnemy, `training:${this.state.turn}`, this.content.enemies); this.changed();
  }
  rest() {
    if (this.state.battle || this.state.dialogue || this.state.choice) throw new Error('先完成目前的互動。');
    this.state.player.hp = this.state.player.maxHp; addLog(this.state, '你在安全的營地休息，生命值已恢復。'); this.changed();
  }
  equip(id) { if (this.state.battle) throw new Error('戰鬥中無法更換裝備。'); EquipmentSystem.equip(this.state, id, this.content.items); this.changed(); }
  use(id) { if (this.state.battle) return this.battle('item', id); const heal = InventorySystem.use(this.state, id, this.content.items); addLog(this.state, `回復 ${heal} HP。`); this.changed(); }
  travel(id) { if (this.state.choice) throw new Error('先完成目前的抉擇。'); MapSystem.travel(this.state, id, this.story, this.content.locations); this.changed(); }
  advance() {
    if (this.state.choice) throw new Error('先完成目前的抉擇。');
    if (this.state.location !== this.chapter.location) throw new Error('請先返回目前主線地點。');
    StorySystem.advance(this.state, this.story); QuestSystem.unlock(this.state, this.content.quests);
    addLog(this.state, this.state.completed ? '你將誓言寫進筆記。這段旅程結束了，照顧森林的行動仍將繼續。' : `抵達${this.location.name} · ${this.chapter.title}`, 'chapter'); this.changed();
  }
  move(dx, dy) { MapSystem.move(this.state, dx, dy); this.events.emit('move', {}); }
}
