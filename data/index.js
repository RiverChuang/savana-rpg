import { story } from './stories/story01.js';
import { mainQuests } from './quests/story01-main.js';
import { sideQuests } from './quests/story01-side.js';
import { npcs } from './npcs/story01.js';
import { locations } from './locations/story01.js';
import { enemies } from './enemies/story01.js';
import { items } from './items/story01.js';
import { skills } from './skills/story01.js';
import { clues } from './dialogue/clues.js';
import { dialogues, decisions } from './dialogue/story01.js';
import { sources } from './culture/sources.js';

export function indexById(entries) {
  const result = {};
  for (const entry of entries) {
    if (Object.hasOwn(result, entry.id)) throw new Error(`Duplicate content id: ${entry.id}`);
    result[entry.id] = entry;
  }
  return result;
}
// Register additional story packs here. Domain systems need no story-specific edits.
export const content = {
  defaultStory: story.id, stories: indexById([story]),
  quests: indexById([...mainQuests, ...sideQuests]), npcs: indexById(npcs),
  locations: indexById(locations), enemies: indexById(enemies), items: indexById(items),
  skills: indexById(skills), clues: indexById(clues), dialogues: indexById(dialogues),
  decisions: indexById(decisions), sources: indexById(sources),
};
