export const items = [
  { id: 'tonic', name: '補給藥包', type: 'consumable', heal: 55, icon: 'potion', description: '營地提供的遊戲補給，回復 55 HP。不是傳統醫藥或採集指引。' },
  { id: 'ration', name: '旅行口糧', type: 'consumable', heal: 30, icon: 'leaf', description: '一份準備好的旅行餐點，回復 30 HP。' },
  { id: 'walkingStick', name: '旅人手杖', type: 'equipment', slot: 'weapon', attack: 4, icon: 'sword', description: '陪你走過第一段森林小徑。攻擊 +4。' },
  { id: 'fieldVest', name: '巡林背心', type: 'equipment', slot: 'charm', defense: 3, hp: 12, icon: 'shield', description: '清理步道的謝禮。防禦 +3、生命上限 +12。' },
  { id: 'forestBlade', name: '晨光手杖', type: 'equipment', slot: 'weapon', attack: 9, icon: 'sword', description: '用修補過的舊工具製成的原創遊戲裝備。攻擊 +9。' },
  { id: 'leafCharm', name: '綠葉徽章', type: 'equipment', slot: 'charm', defense: 6, hp: 28, icon: 'leaf', description: '完成守護行動後獲得的原創徽章。防禦 +6、生命上限 +28。' },
].map(item => ({ ...item, category: 'game-fiction', fictional: true }));
