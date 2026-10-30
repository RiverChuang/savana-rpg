export const skills = [
  { id: 'clearStrike', name: '破霧一擊', level: 1, power: 1.7, cooldown: 2, description: '集中精神出擊，造成 170% 攻擊傷害；冷卻 2 回合。' },
  { id: 'breathe', name: '沉靜呼吸', level: 3, heal: 32, cooldown: 3, description: '調整步伐，回復 32 + 等級 × 3 HP；冷卻 3 回合。' },
  { id: 'resolve', name: '守護之志', level: 5, power: 2.4, cooldown: 3, description: '以堅定的意志驅散混亂，造成 240% 攻擊傷害；冷卻 3 回合。' },
].map(skill => ({ ...skill, fictional: true, category: 'game-fiction' }));
