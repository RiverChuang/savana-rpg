export const story = {
  id: 'story01', title: '瑟瓦納：森林的抉擇', fictional: true, category: 'game-fiction',
  description: '一本未完成的筆記，一段學會觀察與選擇的森林旅程。', requiresPledge: true,
  chapters: [
    { title: '迷霧中的瑟瓦納', label: '序章', location: 'camp', quest: 'prologue', trainingEnemy: 'mist' },
    { title: '森林的警告', label: '第一章', location: 'trail', quest: 'warning', trainingEnemy: 'mist' },
    { title: '大公鹿的出現', label: '第二章', location: 'deerPath', quest: 'greatStag', trainingEnemy: 'mist' },
    { title: '生命的十字路口', label: '第三章', location: 'crossroads', quest: 'crossroad', trainingEnemy: 'litter' },
    { title: '森林的反撲', label: '第四章', location: 'ravine', quest: 'retaliation', trainingEnemy: 'shadow' },
    { title: '葛藤葉的智慧', label: '第五章', location: 'stream', quest: 'leafWisdom', trainingEnemy: 'shadow' },
    { title: '受傷的森林', label: '第六章', location: 'heartwood', quest: 'woundedForest', trainingEnemy: 'shadow' },
    { title: '敬畏的誓言', label: '終章', location: 'summit', quest: 'pledge', trainingEnemy: 'shadow' },
  ],
};
