export class DialogueSystem {
  static begin(state, id, dialogues) {
    if (!dialogues[id]) throw new Error('對話不存在。');
    state.dialogue = { id, page: 0 };
  }
  static next(state, dialogues) {
    if (!state.dialogue) throw new Error('目前沒有對話。');
    const dialogue = dialogues[state.dialogue.id];
    if (state.dialogue.page + 1 < dialogue.lines.length) { state.dialogue.page++; return null; }
    const ended = state.dialogue.id;
    state.dialogue = null;
    return ended;
  }
}
