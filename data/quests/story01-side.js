const rows = [
  ['clearPath', '讓步道重新呼吸', '把步道旁安全可拾取的遊戲棄物放入回收袋。', 'cleanCamp', 0, { fieldVest: 1 }, '清理步道'],
  ['listen', '把耳朵借給森林', '安靜停留，記下你聽到的環境聲景。', 'soundCamp', 0, {}, '記錄聲景'],
  ['waymark', '替下一位旅人留一盞燈', '整理被遮住的路標，不另闢新路。', 'signTrail', 1, { tonic: 2 }, '整理路標'],
  ['waterNotes', '水邊的觀察者', '在步道內記錄水邊的樣子，保持觀察距離。', 'waterDeer', 2, { forestBlade: 1 }, '觀察溪流'],
  ['sort', '每件棄物的去處', '把遊戲裡的模擬棄物分開整理，帶回營地處理。', 'sortCross', 3, { tonic: 2 }, '分類整理'],
  ['afterRain', '風雨之後', '從安全的觀察點記錄路況，將受損處交由巡林員處理。', 'rainRavine', 4, {}, '回報路況'],
  ['connections', '畫下彼此的連結', '將「人、步道、水、棄物」的關係畫進筆記。', 'sketchStream', 5, {}, '描繪關係'],
  ['return', '下次還會再來', '與同行者約定回訪，追蹤同一觀察點的變化。', 'returnStream', 5, { tonic: 2 }, '約定回訪'],
  ['care', '從今天的一小步開始', '整理一份能持續執行的森林守護清單。', 'careHeart', 6, { leafCharm: 1 }, '共好清單'],
];
export const sideQuests = rows.map(([id, title, description, target, chapter, items, gridLabel], grid) => ({
  id, type: 'side', title, description, grid, gridLabel, requirements: [],
  objectives: [{ event: 'action', target, text: description }], rewards: { exp: 70, harmony: 3, items },
  prerequisites: [], unlockConditions: [{ kind: 'chapter', value: chapter }], nextQuest: null,
  fictional: true, category: 'game-fiction',
}));
