import { random } from '../engine/GameState.js';
import { InventorySystem } from './InventorySystem.js';

export class BattleSystem {
  static start(state, enemyId, encounterId, enemies) {
    const enemy = enemies[enemyId];
    if (!enemy || !enemy.fictional) throw new Error('戰鬥僅開放遊戲原創敵人。');
    if (state.battle || state.dialogue) throw new Error('目前無法開始新的戰鬥。');
    state.battle = {
      enemyId, encounterId, hp: enemy.hp, turn: 1, exposed: false, focused: false,
      cooldowns: {}, messages: [enemy.intro],
    };
  }
  static act(state, command, { enemies, skills, items }, parameter) {
    const b = state.battle;
    if (!b) throw new Error('目前沒有戰鬥。');
    const enemy = enemies[b.enemyId], p = state.player;
    const lines = [];
    let defended = false;
    if (command === 'attack') {
      const damage = Math.max(2, p.attack - (b.exposed ? 0 : enemy.defense) + Math.floor(random(state) * 4));
      b.hp = Math.max(0, b.hp - damage); lines.push(`你沉著出擊，造成 ${damage} 點傷害。`);
    } else if (command === 'defend') {
      defended = true; p.hp = Math.min(p.maxHp, p.hp + 4); lines.push('你穩住腳步，回復 4 HP，並減輕本回合受到的傷害。');
    } else if (command === 'reflect') {
      const discovered = enemy.weaknessClues.some(id => state.clues.includes(id));
      if (discovered) { b.exposed = true; lines.push(`你想起筆記裡的線索：${enemy.insight}。敵人的防禦解除！`); }
      else { b.focused = true; defended = true; lines.push('還沒有對應線索。你先觀察對手的節奏，減輕這回合的傷害。'); }
      p.reflection = Math.min(100, p.reflection + 1);
    } else if (command === 'skill') {
      const skill = skills[parameter];
      if (!skill || !p.skills.includes(parameter)) throw new Error('此技能尚未解鎖。');
      if (b.cooldowns[parameter] > 0) throw new Error('技能還在冷卻中。');
      if (skill.heal) { const heal = Math.min(p.maxHp - p.hp, skill.heal + p.level * 3); p.hp += heal; lines.push(`${skill.name}回復了 ${heal} HP。`); }
      else { const damage = Math.max(3, Math.floor(p.attack * skill.power) - (b.exposed ? 0 : enemy.defense)); b.hp = Math.max(0, b.hp - damage); lines.push(`${skill.name}造成 ${damage} 點傷害。`); }
      b.cooldowns[parameter] = skill.cooldown + 1;
    } else if (command === 'item') {
      const heal = InventorySystem.use(state, parameter, items); lines.push(`使用${items[parameter].name}，回復 ${heal} HP。`);
    } else if (command === 'flee') {
      state.battle = null; return { status: 'fled', messages: ['你退回安全處。準備好後，可以重新挑戰。'] };
    } else throw new Error('未知的戰鬥指令。');

    for (const id of Object.keys(b.cooldowns)) b.cooldowns[id] = Math.max(0, b.cooldowns[id] - 1);
    if (b.hp <= 0) {
      state.battle = null;
      return { status: 'victory', enemy, encounterId: b.encounterId, messages: [...lines, `${enemy.name}散去了。森林重新有了呼吸的空間。`] };
    }
    const strong = b.turn % 3 === 0;
    const damage = Math.max(1, Math.floor((enemy.attack * (strong ? 1.4 : 1) - p.defense + Math.floor(random(state) * 3)) * (defended ? 0.35 : 1)));
    p.hp = Math.max(0, p.hp - damage);
    lines.push(`${enemy.name}${strong ? '蓄力衝擊' : '逼近'}，造成 ${damage} 點傷害。${(b.turn + 1) % 3 === 0 ? ' 下一回合它將發動強擊。' : ''}`);
    b.turn++; b.messages = [...b.messages, ...lines].slice(-8);
    if (p.hp <= 0) {
      p.hp = p.maxHp; state.battle = null;
      return { status: 'defeat', messages: [...lines, '巡林員協助你回到安全處，生命值已恢復。任務與線索都保留了。'] };
    }
    return { status: 'ongoing', messages: lines };
  }
}
