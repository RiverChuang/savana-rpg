# Adding a story without changing battle or quest rules

Create data files, import them in `data/index.js`, and merge their arrays with `indexById`. Every ID must be globally unique. Set `storyId` on every story-owned quest so one story's quests cannot unlock in another story. Shared items, skills and enemies may remain in the shared catalog.

## Story

```js
export const story02 = {
  id: 'story02', title: '新的原創故事', fictional: true, category: 'game-fiction',
  chapters: [
    { title: '第一個發現', label: '序章', location: 's2-camp', quest: 's2-intro', trainingEnemy: 'mist' },
  ],
};
```

Use `newGame(name, 'story02')` to select this story, or change `defaultStory` in the registry. A future story picker can call this existing API. An existing save retains its own story ID.

## Main and side quests

```js
{
  id: 's2-intro', storyId: 'story02', type: 'main',
  title: '第一個發現', description: '和角色交談。',
  requirements: [],
  objectives: [{ event: 'talk', target: 's2-welcome', text: '與記錄員交談', count: 1 }],
  rewards: { exp: 80, items: { tonic: 1 }, harmony: 0 },
  prerequisites: [], unlockConditions: [{ kind: 'chapter', value: 0 }],
  nextQuest: null, fictional: true, category: 'game-fiction',
}
```

Supported objective events: `talk` (dialogue ID), `clue` (clue ID), `action` (side hotspot ID), `defeat` (encounter hotspot ID), `decision` (decision ID), and `pledge` (`personal`). Each is emitted by a completed game command, not by displaying the UI. Completed quests never award a second reward.

Unlock conditions support `{ kind: 'chapter', value }` and `{ kind: 'clue', target }`; prerequisites list completed quest IDs. `requirements` is retained metadata in v0.1.0; put enforced gates in unlockConditions and objectives. For side quests add a zero-based `grid` and `gridLabel`; the first release uses nine.

## Maps, NPCs, dialogues and clues

A location has `id`, `name`, `subtitle`, `biome`, `weather`, and `hotspots`. Supported biomes are `camp`, `forest`, `water`, `storm`, `dawn`. Hotspot `x` and `y` are percentages; keep labels separated on mobile.

```js
{ id: 's2-talk-marker', kind: 'dialogue', ref: 's2-welcome', label: '記錄員', x: 30, y: 57 }
```

Hotspot kinds: `dialogue`, `clue`, `side`, `enemy`, `decision`, `pledge`. `ref` points to the corresponding data record; a side marker also supplies a `result` message. Dialogue completion emits `talk` only after its last page. Previously visited NPC dialogues remain readable.

NPCs have `id`, `name`, `role`, `location`, `dialogue`, `fictional`, `category`. Dialogues have `id`, `speaker`, `role`, `lines`. A clue has `id`, `label` (WHO/WHERE/WHEN/WHAT/WHY/HOW), `question`, `title`, `text`, `location`, and fiction/source metadata.

## Enemies, items and skills

Enemies require positive finite hp/attack, nonnegative defense, an `art` basename under assets/enemies, intro, weaknessClues and rewards. Mark `fictional: true, category: 'game-fiction'`. BattleSystem refuses non-fictional enemies. Training uses the chapter's `trainingEnemy`; main encounters reward quest progress once.

Items require a type. Consumables have `heal`; equipment has a `slot` (`weapon` or `charm`) and `attack`, `defense`, or `hp` modifiers. Skills have `level`, `cooldown` and either `power` or `heal`. SkillSystem unlocks them on level changes; no chapter-specific battle branches are needed.

## Source-based culture

Each future record must document title, author/institution, URL or bibliography, intended use, license, confirmation, reviewer and review date. Only approved source records should be promoted to `status: 'verified', confirmed: true, license: 'approved'`. Pending material remains TODO_CULTURE_REVIEW; unknown licenses are NEEDS_LICENSE_REVIEW and the media/text remains excluded. A URL alone is not adaptation permission.

Do not use story expansion as a reason to invent Tsou words, rituals, mythology or taboos. Maintain the boundary between Game Fiction and actual source-based cultural content in both data and UI.

## Validation

Add integration coverage that starts the new story, completes its quests, saves/reloads and reaches an ending. Run `node --test`, `node scripts/check.mjs`, `node scripts/build.mjs`, and browser QA on desktop/mobile. No BattleSystem or QuestSystem edit is needed for the schemas above.
