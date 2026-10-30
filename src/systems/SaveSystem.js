import { SAVE_VERSION } from '../engine/GameState.js';
import { expForLevel, MAX_LEVEL, recalculateStats } from './LevelSystem.js';
import { PLEDGE_ACTIONS } from './PledgeSystem.js';

export const SAVE_KEY = 'savana-rpg:save:v1';
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const finite = (value, min = 0, max = 1e7) => Number.isFinite(value) && value >= min && value <= max;
const strings = value => Array.isArray(value) && value.every(x => typeof x === 'string');
const known = (table, id) => typeof id === 'string' && Object.hasOwn(table, id);
export function validateSave(state, content) {
  try {
    if (!object(state) || state.version !== SAVE_VERSION) throw new Error('不支援的存檔版本。');
    const story = known(content.stories, state.storyId) && content.stories[state.storyId], p = state.player;
    if (!story || !Number.isInteger(state.chapter) || !story.chapters[state.chapter]) throw new Error('故事或章節資料不正確。');
    if (!object(p) || typeof p.name !== 'string' || p.name.length < 1 || p.name.length > 16) throw new Error('角色資料不正確。');
    if (!Number.isInteger(p.level) || !finite(p.level, 1, MAX_LEVEL)) throw new Error('等級資料不正確。');
    for (const key of ['exp', 'hp', 'maxHp', 'attack', 'defense', 'reflection', 'harmony']) if (!finite(p[key])) throw new Error('能力值包含無效數字。');
    if (p.hp < 1 || p.hp > p.maxHp || p.maxHp < 1 || p.reflection > 100 || p.harmony > 100 || p.exp < expForLevel(p.level) || p.exp > expForLevel(MAX_LEVEL) || (p.level < MAX_LEVEL && p.exp >= expForLevel(p.level + 1))) throw new Error('能力值範圍不正確。');
    if (!object(p.inventory) || !object(p.equipment) || !strings(p.skills) || !p.skills.every(id => known(content.skills, id))) throw new Error('背包或技能資料不正確。');
    for (const [id, count] of Object.entries(p.inventory)) if (!known(content.items, id) || !Number.isInteger(count) || !finite(count, 0, 9999)) throw new Error('背包物品不正確。');
    for (const slot of ['weapon', 'charm']) { const id = p.equipment[slot]; if (id !== null && (!content.items[id] || content.items[id].slot !== slot || !(p.inventory[id] > 0))) throw new Error('裝備資料不正確。'); }
    const expected = { ...p }; recalculateStats(expected, content.items);
    if (expected.maxHp !== p.maxHp || expected.attack !== p.attack || expected.defense !== p.defense) throw new Error('裝備與能力值不一致。');
    if (!object(p.position) || !finite(p.position.x, 0, 100) || !finite(p.position.y, 0, 100)) throw new Error('位置資料不正確。');
    if (!story.chapters.slice(0, state.chapter + 1).some(ch => ch.location === state.location)) throw new Error('地圖資料不正確。');
    if (!object(state.quests)) throw new Error('任務資料不正確。');
    for (const [id, entry] of Object.entries(state.quests)) {
      const quest = content.quests[id];
      if (!known(content.quests, id) || (quest.storyId && quest.storyId !== state.storyId) || !['active', 'completed'].includes(entry.status) || !Array.isArray(entry.progress) || entry.progress.length !== quest.objectives.length || !entry.progress.every((n, i) => Number.isInteger(n) && finite(n, 0, quest.objectives[i].count || 1))) throw new Error('任務進度不正確。');
      if (entry.status === 'completed' && !entry.progress.every((n, i) => n === (quest.objectives[i].count || 1))) throw new Error('任務完成狀態不正確。');
    }
    for (const key of ['clues', 'interactions', 'visits', 'defeated', 'achievements']) if (!strings(state[key]) || new Set(state[key]).size !== state[key].length) throw new Error('探索紀錄不正確。');
    if (!state.clues.every(id => known(content.clues, id)) || !state.visits.every(id => known(content.locations, id))) throw new Error('線索或地點不存在。');
    const hotspots = story.chapters.slice(0, state.chapter + 1).flatMap(ch => content.locations[ch.location].hotspots);
    if (!state.interactions.every(id => hotspots.some(h => h.id === id && h.kind !== 'enemy')) || !state.defeated.every(id => hotspots.some(h => h.id === id && h.kind === 'enemy'))) throw new Error('互動紀錄不存在。');
    if (!Array.isArray(state.decisions) || !state.decisions.every(d => object(d) && known(content.decisions, d.id) && content.decisions[d.id].choices.some(c => c.id === d.choiceId && c.text === d.choice && c.result === d.result) && content.decisions[d.id].reasons.includes(d.reason))) throw new Error('思辨紀錄不正確。');
    if (typeof state.started !== 'boolean' || typeof state.completed !== 'boolean' || !object(state.settings) || typeof state.settings.reducedMotion !== 'boolean') throw new Error('設定資料不正確。');
    if (!Number.isInteger(state.turn) || !finite(state.turn) || !Number.isInteger(state.seed) || !finite(state.seed, 0, 4294967295)) throw new Error('回合資料不正確。');
    if (!Array.isArray(state.log) || state.log.length > 60 || !state.log.every(e => object(e) && typeof e.text === 'string' && typeof e.type === 'string' && finite(e.turn))) throw new Error('旅程紀錄不正確。');
    if (state.battle !== null) {
      const b = state.battle, enemy = content.enemies[b.enemyId];
      if (!enemy || !finite(b.hp, 1, enemy.hp) || !Number.isInteger(b.turn) || b.turn < 1 || !object(b.cooldowns) || !Object.entries(b.cooldowns).every(([id, n]) => content.skills[id] && Number.isInteger(n) && finite(n, 0, 50)) || !strings(b.messages) || typeof b.encounterId !== 'string' || typeof b.exposed !== 'boolean' || typeof b.focused !== 'boolean') throw new Error('戰鬥資料不正確。');
    }
    if (state.dialogue !== null) {
      const d = state.dialogue;
      if (!content.dialogues[d.id] || !Number.isInteger(d.page) || !content.dialogues[d.id].lines[d.page] || typeof d.hotspot !== 'string') throw new Error('對話資料不正確。');
    }
    if (state.choice !== null && !known(content.decisions, state.choice)) throw new Error('抉擇資料不正確。');
    if (state.pledge !== null && (!object(state.pledge) || typeof state.pledge.text !== 'string' || [...state.pledge.text.trim()].length < 8 || [...state.pledge.text].length > 240 || !PLEDGE_ACTIONS.includes(state.pledge.action))) throw new Error('誓言資料不正確。');
    if (state.completed && ((story.requiresPledge && !state.pledge) || state.chapter !== story.chapters.length - 1 || state.quests[story.chapters.at(-1).quest]?.status !== 'completed')) throw new Error('結局缺少誓言或章節紀錄。');
    return { valid: true };
  } catch (error) { return { valid: false, error: error.message }; }
}

export class SaveSystem {
  constructor(storage, content) { this.storage = storage; this.content = content; }
  exists() { try { return Boolean(this.storage?.getItem(SAVE_KEY)); } catch { return false; } }
  save(state) {
    try {
      const result = validateSave(state, this.content); if (!result.valid) return result;
      this.storage.setItem(SAVE_KEY, JSON.stringify({ savedAt: new Date().toISOString(), state }));
      return { valid: true };
    } catch { return { valid: false, error: '瀏覽器無法寫入存檔；請允許此網站使用本機儲存空間。' }; }
  }
  load() {
    try {
      const raw = this.storage?.getItem(SAVE_KEY); if (!raw) return { valid: false, error: '尚未找到存檔。' };
      if (raw.length > 1500000) return { valid: false, error: '存檔過大。' };
      const envelope = JSON.parse(raw), result = validateSave(envelope.state, this.content);
      return result.valid ? { valid: true, state: envelope.state, savedAt: envelope.savedAt } : result;
    } catch { return { valid: false, error: '無法讀取存檔。舊檔未被覆寫，可選擇重新開始。' }; }
  }
  reset() {
    try { this.storage.removeItem(SAVE_KEY); return { valid: true }; }
    catch { return { valid: false, error: '無法清除存檔，請檢查瀏覽器儲存權限。' }; }
  }
}
