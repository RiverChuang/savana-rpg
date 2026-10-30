export class ClueSystem {
  static notebook(state, clues) {
    return Object.values(clues).map(clue => ({ ...clue, discovered: state.clues.includes(clue.id) }));
  }
}
