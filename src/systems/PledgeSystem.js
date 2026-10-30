export const PLEDGE_ACTIONS = [
  '自備用品，減少一次性棄物',
  '遵守步道規範，尊重觀察距離',
  '記錄環境變化，和他人分享觀察',
  '邀請同行者，一起持續守護',
];
export class PledgeSystem {
  static write(state, text, action) {
    if (state.pledge) throw new Error('承諾已經寫進筆記了。');
    const trimmed = typeof text === 'string' ? text.trim() : '';
    if ([...trimmed].length < 8 || [...trimmed].length > 240 || !PLEDGE_ACTIONS.includes(action)) throw new Error('請選擇行動方向，並寫下 8–240 字的具體承諾。');
    state.pledge = { text: trimmed, action };
    return state.pledge;
  }
}
