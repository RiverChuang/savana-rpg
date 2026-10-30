export const clues = [
  { id: 'who', label: 'WHO', question: '誰留下了這些記錄？', title: '一本未寫完的巡林筆記', text: '封面寫著「禾」。夾頁裡只有一句：先知道自己看見了什麼，再決定要怎麼做。', location: 'camp' },
  { id: 'what', label: 'WHAT', question: '森林裡發生了什麼？', title: '被忽略的步道', text: '小徑上散落著包裝紙，幾個指標也被遮住了。問題或許不是森林變得陌生，而是人們走得太急。', location: 'trail' },
  { id: 'where', label: 'WHERE', question: '哪些地方需要留下空間？', title: '靜水旁的足跡', text: '水邊留下兩串相隔很遠的足跡。你選擇在步道內停留，讓這個偶遇保有距離。', location: 'deerPath' },
  { id: 'why', label: 'WHY', question: '為什麼選擇這條路？', title: '岔路口的舊地圖', text: '近路穿過鬆軟泥地，另一條沿著既有步道。多走一段路，有時能少留下一道新的傷痕。', location: 'crossroads' },
  { id: 'when', label: 'WHEN', question: '變化是從什麼時候開始？', title: '風雨前後的記號', text: '同一塊石頭上，昨天的水線和今天不同。把前後兩次觀察放在一起，變化才變得清楚。', location: 'ravine' },
  { id: 'how', label: 'HOW', question: '要如何一起修復？', title: '葉片上的連結', text: '你把葉脈的形狀畫進筆記，聯想到彼此相連的路。修復計畫也需要有人觀察、有人整理、有人持續回來。這是原創角色的聯想。', location: 'stream' },
].map(clue => ({ ...clue, fictional: true, category: 'game-fiction' }));
