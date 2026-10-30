const rows = [
  ['prologue', '迷霧中的瑟瓦納', '和巡林員交談，找到第一則線索。', [{ event: 'talk', target: 'welcome', text: '與巡林員岑交談' }, { event: 'clue', target: 'who', text: '發現 WHO 線索' }], 80],
  ['warning', '森林的警告', '看看被忽略的步道，穿過迷途之霧。', [{ event: 'clue', target: 'what', text: '調查步道的變化' }, { event: 'defeat', target: 'fogEncounter', text: '驅散迷途霧靈' }], 120],
  ['greatStag', '大公鹿的出現', '在適當的距離裡觀察，想想相遇的界線。', [{ event: 'clue', target: 'where', text: '發現 WHERE 線索' }, { event: 'talk', target: 'deer', text: '觀察大公鹿（非戰鬥）' }, { event: 'decision', target: 'distance', text: '作出選擇並記錄理由' }], 160],
  ['crossroad', '生命的十字路口', '在岔路前權衡，整理阻路的混亂。', [{ event: 'clue', target: 'why', text: '發現 WHY 線索' }, { event: 'decision', target: 'route', text: '選擇路線並記錄理由' }, { event: 'defeat', target: 'litterEncounter', text: '面對棄物聚合體' }], 200],
  ['retaliation', '森林的反撲', '把變化的前後放在一起，穿過躁動的風。', [{ event: 'clue', target: 'when', text: '發現 WHEN 線索' }, { event: 'defeat', target: 'shadowEncounter', text: '平息躁動之影' }], 260],
  ['leafWisdom', '葛藤葉的智慧', '和記錄員一起觀察連結，提出可持續的修復方案。', [{ event: 'clue', target: 'how', text: '發現 HOW 線索' }, { event: 'talk', target: 'leaves', text: '與記錄員禾交談' }, { event: 'decision', target: 'repair', text: '選擇修復方法並說明理由' }], 300],
  ['woundedForest', '受傷的森林', '帶著觀察與準備，面對失衡之核。', [{ event: 'talk', target: 'wounded', text: '和岑確認行動準備' }, { event: 'defeat', target: 'bossEncounter', text: '驅散失衡之核（Boss）' }], 400],
  ['pledge', '敬畏的誓言', '寫下一個能帶回日常的具體承諾。', [{ event: 'talk', target: 'farewell', text: '與禾回顧旅程' }, { event: 'pledge', target: 'personal', text: '寫下個人環境承諾' }], 900],
];
export const mainQuests = rows.map(([id, title, description, objectives, exp], i) => ({
  id, storyId: 'story01', type: 'main', title, description, requirements: [], objectives,
  rewards: { exp, items: i === 0 ? { tonic: 2 } : {} },
  prerequisites: i ? [rows[i - 1][0]] : [], unlockConditions: [{ kind: 'chapter', value: i }],
  nextQuest: rows[i + 1]?.[0] || null, fictional: true, category: 'game-fiction',
}));
