const clue = (id, ref, label, x, y) => ({ id, kind: 'clue', ref, label, x, y });
const talk = (id, ref, label, x, y) => ({ id, kind: 'dialogue', ref, label, x, y });
const enemy = (id, ref, label, x, y) => ({ id, kind: 'enemy', ref, label, x, y });
const choice = (id, ref, label, x, y) => ({ id, kind: 'decision', ref, label, x, y });
const side = (id, ref, label, x, y, result) => ({ id, kind: 'side', ref, label, x, y, result });
export const locations = [
  { id: 'camp', name: '霧光營地', subtitle: '一切旅程，都從一次停留開始。', biome: 'camp', weather: '薄霧 · 清晨', hotspots: [
    talk('guideCamp', 'welcome', '巡林員 岑', 27, 57), clue('notebookCamp', 'who', '遺落的筆記', 67, 65),
    side('cleanCamp', 'clearPath', '清理步道', 78, 48, '你把模擬棄物帶回營地。岑送你一件巡林背心，記得到背包裝備。'),
    side('soundCamp', 'listen', '聽見森林', 17, 38, '你記下風聲、水聲，以及自己慢下來的腳步聲。'),
  ] },
  { id: 'trail', name: '苔徑入口', subtitle: '霧裡的警告，藏在被忽略的小事中。', biome: 'forest', weather: '霧深 · 上午', hotspots: [
    clue('tracksTrail', 'what', '調查步道', 29, 56), enemy('fogEncounter', 'mist', '迷途霧靈', 69, 48),
    side('signTrail', 'waymark', '整理路標', 78, 70, '你整理了被遮住的指示，下一位旅人能更清楚地辨認方向。'),
  ] },
  { id: 'deerPath', name: '靜水鹿徑', subtitle: '相遇不必靠近，也能留下深刻的記憶。', biome: 'water', weather: '微光 · 午前', hotspots: [
    clue('printsDeer', 'where', '水邊足跡', 23, 69), talk('stagDeer', 'deer', '靜觀大公鹿', 58, 43), choice('choiceDeer', 'distance', '相遇的界線', 78, 62),
    side('waterDeer', 'waterNotes', '記錄溪流', 34, 42, '你在步道內記下水面的樣子。岑把修補好的晨光手杖交給你。'),
  ] },
  { id: 'crossroads', name: '岔路林間', subtitle: '每一條路，都有它尚未說出口的代價。', biome: 'forest', weather: '雲影 · 午後', hotspots: [
    clue('mapCross', 'why', '岔路舊地圖', 19, 53), choice('choiceCross', 'route', '選擇一條路', 48, 40), enemy('litterEncounter', 'litter', '棄物聚合體', 76, 58),
    side('sortCross', 'sort', '分類整理', 39, 72, '模擬棄物被分開裝袋。你們決定帶回營地確認處理方式。'),
  ] },
  { id: 'ravine', name: '風暴幽谷', subtitle: '看清變化，才知道如何安放下一步。', biome: 'storm', weather: '風起 · 傍晚', hotspots: [
    clue('watermarkRavine', 'when', '風雨的記號', 25, 62), enemy('shadowEncounter', 'shadow', '躁動之影', 67, 46),
    side('rainRavine', 'afterRain', '回報路況', 79, 72, '你從安全的地方記下路況，把修復工作交給巡林員安排。'),
  ] },
  { id: 'stream', name: '葉影溪畔', subtitle: '一片葉子的紋路，也能讓我們想起彼此。', biome: 'water', weather: '雨歇 · 薄暮', hotspots: [
    clue('leafStream', 'how', '葉片的連結', 23, 63), talk('heStreamTalk', 'leaves', '記錄員 禾', 60, 43), choice('choiceStream', 'repair', '修復的起點', 78, 61),
    side('sketchStream', 'connections', '描繪關係', 37, 42, '你畫下一張關係圖，發現同一個問題也有許多可以開始的地方。'),
    side('returnStream', 'return', '約定回訪', 47, 75, '你們在筆記裡約定回訪，並保留今天的觀察作為對照。'),
  ] },
  { id: 'heartwood', name: '受傷的林心', subtitle: '守護，不需要一次就把所有事情做好。', biome: 'storm', weather: '深林 · 夜色', hotspots: [
    talk('guideHeart', 'wounded', '巡林員 岑', 24, 61), enemy('bossEncounter', 'heart', '失衡之核', 65, 43),
    side('careHeart', 'care', '共好清單', 78, 70, '你寫下可持續的守護清單。岑送你一枚原創綠葉徽章。'),
  ] },
  { id: 'summit', name: '晨曦高地', subtitle: '把森林教你的停留，帶回每天的生活。', biome: 'dawn', weather: '天晴 · 日出', hotspots: [
    talk('heSummitTalk', 'farewell', '記錄員 禾', 30, 57), { id: 'pledgeSummit', kind: 'pledge', label: '寫下我的承諾', x: 68, y: 57 },
  ] },
].map(location => ({ ...location, fictional: true, category: 'game-fiction' }));
