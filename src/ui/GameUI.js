import { icon, escapeHtml as e } from './icons.js';
import { forestScene } from '../scenes/ForestScene.js';
import { QuestSystem } from '../systems/QuestSystem.js';
import { StorySystem } from '../systems/StorySystem.js';
import { ExperienceSystem } from '../systems/ExperienceSystem.js';
import { achievementLabels } from '../systems/AchievementSystem.js';
import { CultureSourceSystem } from '../systems/CultureSourceSystem.js';
import { ClueSystem } from '../systems/ClueSystem.js';
import { EnvironmentGridSystem } from '../systems/EnvironmentGridSystem.js';
import { PLEDGE_ACTIONS } from '../systems/PledgeSystem.js';

const button = (action, label, param = '', cls = 'button', disabled = false) => `<button class="${cls}" data-action="${action}" data-param="${e(param)}" ${cls.split(' ').includes('tab') ? `aria-pressed="${cls.split(' ').includes('selected')}"` : ''} ${disabled ? 'disabled' : ''}>${label}</button>`;
const progressBar = (value, max, cls = '') => `<span class="bar ${cls}" role="progressbar" aria-label="${cls === 'exp' ? '經驗值' : '生命值'}" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="${max || 1}"><span style="width:${Math.max(0, Math.min(100, value / (max || 1) * 100))}%"></span></span>`;

export class GameUI {
  constructor(game) {
    this.game = game; this.menu = null; this.questTab = 'main'; this.journalTab = 'clues';
    this.app = document.querySelector('#app'); this.overlay = document.querySelector('#overlay');
    this.game.events.on('change', () => this.render());
    this.game.events.on('pledge', () => { this.menu = 'pledge'; this.render(); });
    this.game.events.on('move', () => { const node = document.querySelector('#traveler'); if (node) { node.style.left = `${game.state.player.position.x}%`; node.style.top = `${game.state.player.position.y}%`; } });
    document.addEventListener('click', event => {
      const target = event.target.closest('[data-action]'); if (!target || target.disabled) return;
      this.dispatch(target.dataset.action, target.dataset.param);
    });
    document.addEventListener('submit', event => { if (!event.target.dataset.form) return; event.preventDefault(); this.submit(event.target); });
    document.addEventListener('keydown', event => this.keydown(event));
    this.overlay.addEventListener('cancel', event => {
      if (this.game.state.battle || this.game.state.dialogue) { event.preventDefault(); return; }
      event.preventDefault(); this.dispatch('close');
    });
  }
  get s() { return this.game.state; }
  get c() { return this.game.content; }
  notice(text) {
    const node = document.querySelector('#announcement'); node.textContent = text; node.hidden = false;
    clearTimeout(this.toastTimer); this.toastTimer = setTimeout(() => { node.hidden = true; }, 5000);
  }
  dispatch(action, param) {
    try {
      const game = this.game;
      if (action === 'menu') { this.menu = param; this.render(); }
      else if (action === 'close') { this.menu = null; if (this.s.choice) { this.s.choice = null; game.changed(); } else this.render(); }
      else if (action === 'new') { this.menu = 'new'; this.render(); }
      else if (action === 'continue') { this.menu = null; game.load(); this.notice('已讀取上次的森林旅程。'); }
      else if (action === 'save') { game.save(); this.notice('旅程已儲存在這個瀏覽器。'); this.render(); }
      else if (action === 'interact') {
        const h = game.location.hotspots.find(h => h.id === param); this.menu = null; game.interact(param);
        if (h?.kind === 'clue') { this.menu = 'clue'; this.clueId = h.ref; this.render(); }
        if (h?.kind === 'side') this.notice(h.result);
      }
      else if (action === 'dialogue') game.nextDialogue();
      else if (action === 'battle') { const [command, id] = param.split(':'); const result = game.battle(command, id); if (result.status !== 'ongoing') this.notice(result.messages.at(-1)); }
      else if (action === 'rest') { game.rest(); this.notice('營地休息完畢，生命值已恢復。'); }
      else if (action === 'train') { this.menu = null; game.train(); }
      else if (action === 'equip') { game.equip(param); this.notice('裝備已更新。'); }
      else if (action === 'use') game.use(param);
      else if (action === 'advance') { if (this.s.chapter === game.story.chapters.length - 1) this.menu = 'ending'; game.advance(); this.notice(this.s.completed ? '主線完成，謝謝你走過這段森林旅程。' : `${game.chapter.label} · ${game.chapter.title}`); }
      else if (action === 'travel') { this.menu = null; game.travel(param); }
      else if (action === 'quest-tab') { this.questTab = param; this.render(); }
      else if (action === 'journal-tab') { this.journalTab = param; this.render(); }
      else if (action === 'motion') { this.s.settings.reducedMotion = !this.s.settings.reducedMotion; if (this.s.started) game.changed(); else this.render(); }
      else if (action === 'reset') { this.menu = 'reset'; this.render(); }
      else if (action === 'confirm-reset') {
        const result = game.saves.reset(); if (!result.valid) throw new Error(result.error);
        this.menu = null; game.newGame(); this.notice('舊存檔已清除，新的旅程已開始。');
      }
    } catch (error) { this.notice(error.message); }
  }
  submit(form) {
    try {
      const values = new FormData(form);
      if (form.dataset.form === 'new') { this.menu = null; this.game.newGame(values.get('name')); }
      else if (form.dataset.form === 'choice') { const record = this.game.choose(values.get('choice'), values.get('reason')); this.notice(record.result); }
      else if (form.dataset.form === 'pledge') { this.game.makePledge(values.get('text'), values.get('action')); this.menu = null; this.render(); this.notice('你的個人承諾已寫入筆記。完成本章後，就能看見結局。'); }
    } catch (error) { this.notice(error.message); }
  }
  keydown(event) {
    if (!this.s.started || this.overlay.open || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.ctrlKey || event.altKey || event.metaKey) return;
    const moves = { ArrowUp: [0, -3], w: [0, -3], ArrowDown: [0, 3], s: [0, 3], ArrowLeft: [-3, 0], a: [-3, 0], ArrowRight: [3, 0], d: [3, 0] };
    if (moves[event.key]) { event.preventDefault(); this.game.move(...moves[event.key]); }
    if (event.key.toLowerCase() === 'e') {
      const p = this.s.player.position;
      const h = this.game.location.hotspots.filter(h => h.kind === 'dialogue' || (!this.s.interactions.includes(h.id) && !this.s.defeated.includes(h.id))).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
      if (h) this.dispatch('interact', h.id);
    }
  }
  render() {
    const s = this.s, p = s.player, game = this.game, active = document.activeElement, wasModalOpen = this.overlay.open;
    const focus = active?.dataset?.action ? { action: active.dataset.action, param: active.dataset.param } : null;
    document.documentElement.classList.toggle('reduced-motion', s.settings.reducedMotion);
    this.app.innerHTML = `<header class="site-header">
      <a class="brand" href="./" aria-label="瑟瓦納首頁">${icon('leaf')}<span>瑟瓦納<small>森林的抉擇</small></span></a>
      <nav class="top-nav" aria-label="遊戲導覽">
        ${button('close', `${icon('compass')} 森林探索`, '', 'nav-button active')}
        ${button('menu', `${icon('book')} 旅人筆記`, 'journal', 'nav-button', !s.started)}
        ${button('menu', `${icon('grid')} 共好行動`, 'grid', 'nav-button', !s.started)}
      </nav>
      <div class="header-tools"><span class="save-status"><i class="${game.lastSave?.valid === false ? 'warning' : ''}"></i>${s.started ? game.lastSave?.valid === false ? '存檔失敗' : '本機已存檔' : '無帳號 · 本機存檔'}</span>
        ${button('save', icon('save') + '<span class="sr-only">儲存進度</span>', '', 'icon-button', !s.started)}
        ${button('menu', icon('settings') + '<span class="sr-only">設定與說明</span>', 'settings', 'icon-button')}
      </div>
    </header>
    <main class="game-shell" id="exploration" tabindex="-1">
      <div class="chapter-heading"><div><span class="eyebrow">FOREST CHRONICLES <span class="dot">/</span> ${e(game.chapter.label)}</span><h1>${s.completed ? '讓旅程，成為日常的一部分' : e(game.chapter.title)}</h1></div><span class="chapter-counter">${String(s.chapter + 1).padStart(2, '0')}<span> / ${String(game.story.chapters.length).padStart(2, '0')}</span></span></div>
      <div class="game-layout"><section class="exploration-column" aria-label="森林探索地圖">
        <div class="map-frame">${forestScene(s, game.location, s.started)}
        ${!s.started ? `<div class="welcome-card"><span class="eyebrow">A JOURNEY OF CHOICES</span><h2>森林有它的聲音。<br>而你，有你的選擇。</h2><p>走進迷霧、拾起線索，<br>在每一次停留裡，找到繼續前進的理由。</p><div class="welcome-actions">${button(game.saves.exists() ? 'continue' : 'new', `${game.saves.exists() ? '繼續冒險' : '開始旅程'} ${icon('arrow')}`, '', 'button primary')}${game.saves.exists() ? button('new', '重新開始', '', 'text-button') : ''}</div><small>約 15–30 分鐘 · 回合制 RPG · 無需帳號</small></div>` : ''}
        <div class="map-legend"><span><i class="legend-dot gold"></i>故事與線索</span><span><i class="legend-dot green"></i>共好行動</span><span><i class="legend-dot red"></i>原創敵人</span><span class="keyboard-hint"><kbd>WASD</kbd> 移動 <kbd>E</kbd> 互動 · 也可直接點標記</span></div></div>
        <div class="player-panel"><div class="portrait"><img src="./assets/characters/traveler.svg" alt="旅人頭像"></div><div class="player-identity"><small>FOREST TRAVELER</small><strong>${e(p.name)}<span class="level-badge">Lv.${p.level}</span></strong><span>森林中的觀察者</span></div><div class="player-vitals"><div><span>${icon('heart')} 生命</span><strong>${p.hp}<small> / ${p.maxHp}</small></strong></div>${progressBar(p.hp, p.maxHp)}<div class="experience"><span>EXP</span>${progressBar(ExperienceSystem.progress(p).current || (p.level === 10 ? 1 : 0), ExperienceSystem.progress(p).needed || 1, 'exp')}<small>${p.level === 10 ? 'MAX' : `${ExperienceSystem.progress(p).current} / ${ExperienceSystem.progress(p).needed}`}</small></div></div><div class="player-attributes"><span>${icon('sword')}<strong>${p.attack}</strong><small>攻擊</small></span><span>${icon('shield')}<strong>${p.defense}</strong><small>防禦</small></span><span>${icon('sparkle')}<strong>${p.reflection}</strong><small>思辨</small></span><span>${icon('leaf')}<strong>${p.harmony}</strong><small>共好</small></span></div></div>
        <div class="command-bar"><div>${button('rest', `${icon('camp')}<span>營地休息</span>`, '', 'command-button', !s.started)}${button('train', `${icon('sword')}<span>遭遇練習</span>`, '', 'command-button', !s.started)}${button('menu', `${icon('bag')}<span>背包裝備</span>`, 'inventory', 'command-button', !s.started)}${button('menu', `${icon('book')}<span>六何筆記</span>`, 'journal', 'command-button', !s.started)}</div>${button('advance', `${s.completed ? '主線已完成' : s.chapter === 7 ? '完成這段旅程' : '繼續旅程'} ${icon('arrow')}`, '', 'button primary next-chapter', !s.started || !StorySystem.canAdvance(s, game.story) || s.location !== game.chapter.location)}</div>
      </section><aside class="journal-sidebar" aria-label="任務與旅程筆記">${this.sidebar()}</aside></div>
      <footer class="game-footer"><span>${icon('leaf')} 慢一點，才能看見更多。</span><div>${button('menu', '原創故事與文化來源', 'sources', 'text-button')}<span>v0.1.0</span></div></footer>
    </main>`;
    this.renderModal(focus);
    if (focus && !(wasModalOpen && !this.overlay.open)) {
      const scope = this.overlay.open ? this.overlay : this.app;
      const match = [...scope.querySelectorAll('[data-action]')].find(n => n.dataset.action === focus.action && n.dataset.param === focus.param && !n.disabled);
      if (match) match.focus({ preventScroll: true });
    }
  }
  sidebar() {
    const q = this.c.quests[this.game.chapter.quest], s = this.s;
    const sideQuests = Object.values(this.c.quests).filter(q => q.type === 'side' && s.quests[q.id]);
    const done = sideQuests.filter(q => s.quests[q.id].status === 'completed').length;
    return `<section class="quest-card"><div class="panel-heading"><span class="eyebrow">TRAVELER'S JOURNAL</span>${icon('book')}</div><div class="journal-title"><h2>旅程筆記</h2><span>${s.completed ? '已完成' : '進行中'}</span></div><div class="quest-tabs" role="group" aria-label="任務類型">${button('quest-tab', '主線任務', 'main', `tab ${this.questTab === 'main' ? 'selected' : ''}`)}${button('quest-tab', `支線任務 <small>${done}/9</small>`, 'side', `tab ${this.questTab === 'side' ? 'selected' : ''}`)}</div>
      ${this.questTab === 'main' ? `<div class="quest-label">${icon('flag')} ${e(this.game.chapter.label)} · 主線</div><h3>${e(q.title)}</h3><p class="quest-description">${e(q.description)}</p><ul class="objectives">${QuestSystem.progress(s, q).map(o => `<li class="${o.done ? 'done' : ''}"><span>${o.done ? icon('check') : ''}</span>${e(o.text)}</li>`).join('')}</ul><div class="quest-reward"><span>任務獎勵</span><strong>${icon('sparkle')} ${q.rewards.exp} EXP</strong></div>${s.quests[q.id]?.status === 'completed' ? `<div class="quest-complete">${icon('check')} ${s.completed ? '這段旅程已完成' : '目標完成，可以繼續旅程'}</div>` : ''}` : `<div class="side-list">${sideQuests.map(q => `<div class="side-entry ${s.quests[q.id].status === 'completed' ? 'done' : ''}">${icon(s.quests[q.id].status === 'completed' ? 'check' : 'leaf')}<div><strong>${e(q.title)}</strong><small>${s.quests[q.id].status === 'completed' ? '已完成 · +70 EXP' : e(q.description)}</small></div></div>`).join('')}</div>`}
    </section><section class="field-note"><span class="eyebrow">A MOMENT TO NOTICE</span><div>${icon('leaf')}<h3>森林不只是背景</h3></div><p>${s.started ? '點擊地圖上的標記，與角色交談、觀察環境。線索會收進六何筆記，支線則會點亮共好九宮格。' : '在這裡，觀察也是一種力量。你找到的線索，會讓下一次選擇有更多可能。'}</p>${button('menu', `探索指南 ${icon('arrow')}`, 'help', 'text-button')}</section><section class="recent-notes"><div class="panel-heading"><span>沿途拾記</span><small>${s.clues.length} / 6 線索</small></div>${(s.log.length ? s.log.slice(-3).reverse() : [{ text: '空白的筆記，正在等待你的第一個故事。', type: 'info' }]).map(l => `<p class="note-${l.type}"><span></span>${e(l.text)}</p>`).join('')}</section><div class="fiction-note">本作場景與角色為遊戲原創。<br>具體文化內容待來源確認與文化審閱。</div>`;
  }
  renderModal(focus) {
    const s = this.s;
    let kind = this.menu, title = '', body = '', locked = false;
    if (s.battle) { kind = 'battle'; title = '森林遭遇'; body = this.battleView(); locked = true; }
    else if (s.dialogue) { kind = 'dialogue'; title = this.c.dialogues[s.dialogue.id].speaker; body = this.dialogueView(); locked = true; }
    else if (s.choice) { kind = 'choice'; title = this.c.decisions[s.choice].title; body = this.choiceView(); }
    else if (kind === 'inventory') { title = '旅人的背包'; body = this.inventoryView(); }
    else if (kind === 'journal') { title = '每一步，都值得記下'; body = this.journalView(); }
    else if (kind === 'clue') { const clue = this.c.clues[this.clueId]; title = '發現新的線索'; body = `<div class="discovery"><span class="discovery-symbol">${icon('sparkle')}</span><span class="eyebrow">${clue.label} · ${e(clue.question)}</span><h3>${e(clue.title)}</h3><p>${e(clue.text)}</p><small>已收進六何筆記 · 遊戲原創線索</small></div>${button('close', '收進筆記，繼續探索', '', 'button primary wide')}`; }
    else if (kind === 'grid') { title = '九個小行動，一起成為改變'; body = this.gridView(); }
    else if (kind === 'sources') { title = '故事創作與文化來源'; body = this.sourcesView(); }
    else if (kind === 'map') { title = '走過的路，都是旅程'; body = this.mapView(); }
    else if (kind === 'new') { title = '你的故事，從這裡開始'; body = `<form data-form="new" class="stack"><p>你將帶著一本空白筆記，走進一座原創的森林。</p><label for="player-name">旅人稱呼</label><input id="player-name" name="name" value="旅人" maxlength="16" required autocomplete="off">${this.game.saves.exists() ? '<p class="warning-text">開始新旅程會覆寫這個瀏覽器裡的舊存檔。</p>' : ''}<button class="button primary wide" type="submit">走進森林 ${icon('arrow')}</button><p class="fine-print">進度只儲存在此瀏覽器。原創劇情不代表真實鄒族文化敘事。</p></form>`; }
    else if (kind === 'settings') { title = '旅行設定'; body = `<div class="stack"><div class="setting-row"><div><strong>減少動態效果</strong><p>關閉飄霧、螢光與角色浮動</p></div>${button('motion', s.settings.reducedMotion ? '已開啟' : '未開啟', '', 'button secondary')}</div><p class="muted">存檔保存在目前瀏覽器與網址來源；清除網站資料或換裝置不會自動同步。私人瀏覽可能無法保留進度。</p><div class="button-row">${button('save', `${icon('save')} 手動存檔`, '', 'button secondary', !s.started)}${button('continue', '讀取存檔', '', 'button secondary', !this.game.saves.exists())}</div>${button('menu', '探索指南', 'help', 'button secondary')}${button('menu', '文化與素材來源', 'sources', 'button secondary')}${button('reset', '清除存檔並重新開始', '', 'text-button danger')}</div>`; }
    else if (kind === 'reset') { title = '重新開始這段旅程？'; body = `<p>這會清除目前遊戲存檔，並從序章開始。此操作只影響這個瀏覽器的瑟瓦納存檔。</p><div class="button-row">${button('confirm-reset', '確認清除並重新開始', '', 'button danger-button')}${button('close', '保留目前旅程', '', 'button secondary')}</div>`; }
    else if (kind === 'help') { title = '帶著好奇心，慢慢前進'; body = `<div class="guide-list"><p><strong>01 · 點擊發光標記</strong>對話氣泡是角色；金色微光是線索；綠葉是支線；紅色刀劍是原創敵人。</p><p><strong>02 · 看看旅程筆記</strong>完成本章所有目標後，點「繼續旅程」。探索足跡可返回已解鎖地區，補做支線。</p><p><strong>03 · 做好戰鬥準備</strong>背包裡有手杖可裝備。技能有回合冷卻；每三回合敵人會強擊，可使用防禦。</p><p><strong>04 · 思考不是答題</strong>已找到的線索能解除相應敵人的防禦。沒有線索也能攻擊、用技能或逃跑。</p><p><strong>05 · 隨時休息</strong>地圖下方的營地休息可免費恢復生命。戰敗保留進度並回復生命。遭遇練習可累積經驗。</p><p><strong>06 · 鍵盤與觸控</strong>點擊標記就能互動；也可用 WASD／方向鍵移動、E 互動。Tab 切換按鈕，Enter 啟動。</p><p><strong>07 · 留下你的理由</strong>抉擇需要選擇與理由，沒有單一標準答案。最後寫下至少 8 字的個人承諾。</p></div>`; }
    else if (kind === 'pledge') { title = '把承諾，帶回日常'; body = this.pledgeView(); }
    else if (kind === 'ending') { title = '森林的下一頁，由你寫下'; body = this.endingView(); }
    if (!kind) {
      if (this.overlay.open) {
        this.overlay.close();
        const key = this.returnFocusKey;
        const target = key && [...this.app.querySelectorAll('[data-action]')].find(n => n.dataset.action === key.action && n.dataset.param === key.param && !n.disabled);
        (target || this.app.querySelector('#exploration'))?.focus({ preventScroll: true });
      }
      return;
    }
    const previousKind = this.overlay.dataset.kind;
    this.overlay.className = `modal modal-${kind}`; this.overlay.dataset.kind = kind;
    this.overlay.innerHTML = `<div class="modal-heading"><div><span class="eyebrow">SAVANA · FOREST CHRONICLES</span><h2 id="dialog-title">${e(title)}</h2></div>${!locked ? button('close', `${icon('close')}<span class="sr-only">關閉視窗</span>`, '', 'icon-button') : ''}</div><div class="modal-body">${body}</div>`;
    if (!this.overlay.open) { this.returnFocusKey = focus; this.overlay.showModal(); }
    if (previousKind !== kind) this.overlay.querySelector('input,textarea,select,button')?.focus();
  }
  battleView() {
    const s = this.s, b = s.battle, enemy = this.c.enemies[b.enemyId];
    return `<div class="battle-arena"><span class="battle-turn">TURN ${String(b.turn).padStart(2, '0')} ${b.turn % 3 === 0 ? '· 強擊將至' : ''}</span><div class="enemy-info"><span class="eyebrow">${enemy.boss ? 'BOSS ENCOUNTER' : 'ORIGINAL CREATURE'}</span><h3>${e(enemy.name)}</h3>${progressBar(b.hp, enemy.hp, 'enemy')}<span>${b.hp} / ${enemy.hp} HP ${b.exposed ? '· 弱點已看清' : ''}</span></div><img class="enemy-art" src="./assets/enemies/${enemy.art}.svg" alt="遊戲原創敵人：${e(enemy.name)}"><small class="battle-fiction">遊戲虛構敵人 · 非鄒族傳說角色</small><div class="battle-player-hp"><span>${e(s.player.name)} · HP ${s.player.hp} / ${s.player.maxHp}</span>${progressBar(s.player.hp, s.player.maxHp)}</div></div><div class="battle-log" aria-live="polite">${b.messages.slice(-3).map(m => `<p>${e(m)}</p>`).join('')}</div><div class="battle-commands">${button('battle', `${icon('sword')} 攻擊`, 'attack', 'button secondary')}${button('battle', `${icon('shield')} 防禦`, 'defend', 'button secondary')}${button('battle', `${icon('sparkle')} 思考`, 'reflect', 'button secondary')}${button('battle', `${icon('potion')} 藥包 (${s.player.inventory.tonic || 0})`, 'item:tonic', 'button secondary', !(s.player.inventory.tonic > 0) || s.player.hp === s.player.maxHp)}${s.player.skills.map(id => { const skill = this.c.skills[id], cd = b.cooldowns[id] || 0; return button('battle', `${icon('leaf')} ${e(skill.name)}${cd ? ` (${cd})` : ''}`, `skill:${id}`, 'button secondary', cd > 0); }).join('')}${button('battle', '逃跑', 'flee', 'text-button')}</div><p class="fine-print">防禦能減傷並回復少量生命；敵人每三回合強擊。技能括號是剩餘冷卻回合。</p>`;
  }
  dialogueView() {
    const d = this.c.dialogues[this.s.dialogue.id], page = this.s.dialogue.page;
    return `<div class="dialogue-scene"><img src="./assets/characters/traveler.svg" alt="原創角色插畫"><div><span class="eyebrow">${e(d.role)}</span><p class="dialogue-text">${e(d.lines[page])}</p></div></div><div class="dialogue-footer"><span>${page + 1} / ${d.lines.length} · GAME FICTION</span>${button('dialogue', `${page === d.lines.length - 1 ? '記下這段對話' : '繼續聆聽'} ${icon('arrow')}`, '', 'button primary')}</div>`;
  }
  inventoryView() {
    return `<p class="muted">生命 ${this.s.player.hp} / ${this.s.player.maxHp} · 攻擊 ${this.s.player.attack} · 防禦 ${this.s.player.defense}</p><div class="item-grid">${Object.entries(this.s.player.inventory).filter(([, n]) => n > 0).map(([id, count]) => { const item = this.c.items[id], equipped = this.s.player.equipment[item.slot] === id; return `<article class="item-card ${equipped ? 'equipped' : ''}"><span class="item-icon">${icon(item.icon)}</span><div><h3>${e(item.name)} <small>×${count}</small></h3><p>${e(item.description)}</p>${button(item.type === 'consumable' ? 'use' : 'equip', item.type === 'consumable' ? '使用' : equipped ? '已裝備 · 卸下' : '裝備', id, 'button secondary small', item.type === 'consumable' && this.s.player.hp === this.s.player.maxHp)}</div></article>`; }).join('')}</div><h3 class="section-label">已解鎖技能</h3><div class="skill-list">${this.s.player.skills.map(id => `<p>${icon('sparkle')}<strong>${e(this.c.skills[id].name)}</strong><span>${e(this.c.skills[id].description)}</span></p>`).join('')}</div>`;
  }
  journalView() {
    const tabs = [['clues', '六何線索'], ['choices', '選擇與理由'], ['achievements', '旅人成就'], ['sources', '文化來源']];
    let body = '';
    if (this.journalTab === 'clues') body = `<p class="muted">已發現 ${this.s.clues.length} / 6。從地圖探索找到線索；部分線索能在戰鬥中幫助「思考」。</p><div class="clue-grid">${ClueSystem.notebook(this.s, this.c.clues).map(clue => { const found = clue.discovered; return `<article class="clue-card ${found ? 'found' : ''}"><span class="eyebrow">${clue.label}</span>${icon(found ? 'check' : 'lock')}<h3>${e(clue.question)}</h3><p>${found ? e(clue.text) : `尚未發現 · ${e(this.c.locations[clue.location].name)}`}</p></article>`; }).join('')}</div>`;
    else if (this.journalTab === 'choices') body = `<p class="muted">把「選擇 → 理由 → 結果」放在一起，重新看見自己的思考。</p>${this.s.decisions.length ? this.s.decisions.map(d => `<article class="reflection-record"><h3>${e(this.c.decisions[d.id].title)}</h3><dl><dt>我的選擇</dt><dd>${e(d.choice)}</dd><dt>我的理由</dt><dd>${e(d.reason)}</dd><dt>看見的結果</dt><dd>${e(d.result)}</dd></dl></article>`).join('') : '<div class="empty-state">新的岔路還在前方。繼續探索，就會遇見需要想一想的時刻。</div>'}`;
    else if (this.journalTab === 'achievements') body = `<div class="achievement-grid">${Object.entries(achievementLabels).map(([id, label]) => `<div class="achievement ${this.s.achievements.includes(id) ? 'earned' : ''}">${icon(this.s.achievements.includes(id) ? 'sparkle' : 'lock')}<strong>${e(label)}</strong><small>${this.s.achievements.includes(id) ? '已解鎖' : '等待旅程點亮'}</small></div>`).join('')}</div>`;
    else body = this.sourcesView();
    return `<div class="journal-modal-tabs">${tabs.map(([id, name]) => button('journal-tab', name, id, `tab ${this.journalTab === id ? 'selected' : ''}`)).join('')}</div>${body}`;
  }
  gridView() {
    const quests = EnvironmentGridSystem.cells(this.s, this.c.quests).map(cell => cell.quest);
    return `<p class="muted">共好並非一個人的壯舉。完成環境支線，逐格點亮你在這段旅程留下的行動。</p><div class="environment-grid">${quests.map(q => { const status = this.s.quests[q.id]?.status; return `<article class="grid-cell ${status === 'completed' ? 'completed' : ''}"><span>${String(q.grid + 1).padStart(2, '0')}</span>${icon(status === 'completed' ? 'check' : status ? 'leaf' : 'lock')}<h3>${e(q.gridLabel)}</h3><p>${status === 'completed' ? '行動已完成' : status ? e(q.description) : '繼續主線以解鎖'}</p></article>`; }).join('')}</div><p class="fine-print">本九宮格是遊戲原創的環境行動設計。實地行動應遵守當地管理規範，依自身能力與安全條件進行。</p>`;
  }
  sourcesView() {
    const sources = Object.values(this.c.sources);
    return `<div class="source-notice">${icon('info')}<div><h3>清楚知道：哪些是創作，哪些仍待確認</h3><p>場景、角色、怪物、裝備、技能與對話均為 Game Fiction。遊戲沒有自行創造鄒族語、祭儀、神話或禁忌，也不以個人角色代表族群性格。</p></div></div><p class="muted">已確認的文化來源：${CultureSourceSystem.verified(sources).length}。尚未提供原教案與文化來源，因此第一版沒有把相關敘述當成文化事實。</p>${CultureSourceSystem.pending(sources).map(source => `<article class="source-entry"><span class="review-tag">TODO_CULTURE_REVIEW</span><h3>${e(source.title)}</h3><p>${e(source.note)}</p><small>來源：待提供 · 審閱：未確認 · 授權：尚無資料</small></article>`).join('')}<p class="fine-print">全部插畫以原創 SVG／CSS 製作，使用系統字型，未使用第三方影片、音樂、字幕或截圖。未加入來源或授權不明的素材。</p>`;
  }
  mapView() {
    return `<div class="location-list">${this.game.story.chapters.map((ch, index) => `<div class="location-row ${index === this.s.chapter ? 'current' : ''}"><span class="location-number">${String(index + 1).padStart(2, '0')}</span><div><small>${e(ch.label)} · ${e(ch.title)}</small><strong>${e(this.c.locations[ch.location].name)}</strong></div>${button('travel', index > this.s.chapter ? icon('lock') + '<span class="sr-only">尚未解鎖</span>' : ch.location === this.s.location ? '目前位置' : '前往', ch.location, 'button secondary small', index > this.s.chapter || ch.location === this.s.location)}</div>`).join('')}</div><p class="fine-print">已解鎖地區可隨時回訪。返回目前主線地點後，才能繼續下一章。</p>`;
  }
  choiceView() {
    const d = this.c.decisions[this.s.choice];
    return `<form data-form="choice" class="stack"><p>${e(d.prompt)}</p><fieldset><legend>我的選擇</legend>${d.choices.map((choice, i) => `<label class="radio-card"><input type="radio" name="choice" value="${choice.id}" ${i === 0 ? 'checked' : ''} required><span>${e(choice.text)}</span></label>`).join('')}</fieldset><label for="choice-reason">我這樣選擇，是因為……</label><select id="choice-reason" name="reason" required><option value="">選擇一個最接近你想法的理由</option>${d.reasons.map(reason => `<option value="${e(reason)}">${e(reason)}</option>`).join('')}</select><p class="fine-print">沒有唯一標準答案。每一個選擇都能繼續故事；理由與結果會留在筆記裡。</p><button class="button primary wide" type="submit">記下選擇，看看它帶來什麼 ${icon('arrow')}</button></form>`;
  }
  pledgeView() {
    return `<form data-form="pledge" class="stack"><p>想一件你能做到的小事，寫下「何時、在哪裡、要做什麼」。這是你的個人環境承諾。</p><label for="pledge-action">我願意從哪裡開始？</label><select id="pledge-action" name="action" required><option value="">選擇一個行動方向</option>${PLEDGE_ACTIONS.map(action => `<option value="${e(action)}">${e(action)}</option>`).join('')}</select><label for="pledge-text">我的承諾（8–240 字）</label><textarea id="pledge-text" name="text" minlength="8" maxlength="240" rows="4" placeholder="例如：下次走進森林時，我會自備水壺，把自己的垃圾帶回來。" required>${e(this.s.pledge?.text || '')}</textarea><label class="checkbox-label"><input type="checkbox" required>這是我願意帶回日常的個人承諾。</label><button class="button primary wide" type="submit">將承諾寫入森林筆記 ${icon('leaf')}</button><p class="fine-print">內容只保存在此瀏覽器，不會上傳。這不是傳統誓詞或祭儀。</p></form>`;
  }
  endingView() {
    const sides = Object.values(this.c.quests).filter(q => q.type === 'side' && this.s.quests[q.id]?.status === 'completed').length;
    return `<div class="ending"><span class="ending-emblem">${icon('leaf')}</span><span class="eyebrow">THE JOURNEY CONTINUES</span><h3>敬畏，從願意停下來開始。</h3><p>${this.s.player.harmony >= 30 ? '你把許多小行動連在一起。沿途的改變，來自一次次願意觀察、討論與回來。' : '你走過了森林，也看見每個選擇都能留下不同的痕跡。還有一些行動，等待你在日常裡開始。'}</p><blockquote>${e(this.s.pledge?.text)}</blockquote><div class="ending-stats"><span><strong>${this.game.story.chapters.length}</strong>故事章節</span><span><strong>${this.s.clues.length}/6</strong>探索線索</span><span><strong>${sides}/9</strong>共好行動</span><span><strong>${this.s.decisions.length}</strong>深思抉擇</span></div>${button('close', '帶著承諾，繼續走走', '', 'button primary wide')}<p class="fine-print">主線已完成並存檔。你仍可回訪地圖、完成支線，或查看旅人筆記。文化相關內容仍待來源提供與審閱。</p></div>`;
  }
}
