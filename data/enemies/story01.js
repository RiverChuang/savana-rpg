export const enemies = [
  { id: 'mist', name: '迷途霧靈', hp: 62, attack: 12, defense: 5, art: 'mist', intro: '霧氣聚成一團，把你引向同一條岔路。', weaknessClues: ['what', 'who'], insight: '停下腳步、辨認已經走過的痕跡', rewards: { exp: 45, items: { tonic: 1 } } },
  { id: 'litter', name: '棄物聚合體', hp: 100, attack: 19, defense: 7, art: 'litter', intro: '散落的廢棄物在遊戲想像中聚成了阻路的形體。', weaknessClues: ['where', 'why'], insight: '找出堆積的源頭，而不只追逐眼前的混亂', rewards: { exp: 80, items: { tonic: 2 } } },
  { id: 'shadow', name: '躁動之影', hp: 135, attack: 23, defense: 8, art: 'shadow', intro: '風聲捲著焦躁，你幾乎忘了為什麼走進森林。', weaknessClues: ['when', 'why'], insight: '辨認變化的時序，就能提前準備', rewards: { exp: 100, items: { tonic: 1 } } },
  { id: 'heart', name: '失衡之核', hp: 260, attack: 32, defense: 10, art: 'heart', boss: true, intro: '急切、忽視與棄物化成一顆虛構的核心。它的光忽明忽暗。', weaknessClues: ['how'], insight: '修復來自持續而具體的行動，不是一次逞強', rewards: { exp: 220, items: { tonic: 2 } } },
].map(enemy => ({ ...enemy, fictional: true, category: 'game-fiction' }));
