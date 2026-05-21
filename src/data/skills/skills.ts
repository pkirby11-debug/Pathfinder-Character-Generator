import type { Skill } from "../../types/pathfinder";

// Pathfinder 1E Core skill list (Open Game Content / OGL).
export const SKILLS: Skill[] = [
  { id: "acrobatics", name: "Acrobatics", ability: "dex", trainedOnly: false, armorCheckPenalty: true },
  { id: "appraise", name: "Appraise", ability: "int", trainedOnly: false, armorCheckPenalty: false },
  { id: "bluff", name: "Bluff", ability: "cha", trainedOnly: false, armorCheckPenalty: false },
  { id: "climb", name: "Climb", ability: "str", trainedOnly: false, armorCheckPenalty: true },
  { id: "craft", name: "Craft", ability: "int", trainedOnly: false, armorCheckPenalty: false },
  { id: "diplomacy", name: "Diplomacy", ability: "cha", trainedOnly: false, armorCheckPenalty: false },
  { id: "disable_device", name: "Disable Device", ability: "dex", trainedOnly: true, armorCheckPenalty: true },
  { id: "disguise", name: "Disguise", ability: "cha", trainedOnly: false, armorCheckPenalty: false },
  { id: "escape_artist", name: "Escape Artist", ability: "dex", trainedOnly: false, armorCheckPenalty: true },
  { id: "fly", name: "Fly", ability: "dex", trainedOnly: false, armorCheckPenalty: true },
  { id: "handle_animal", name: "Handle Animal", ability: "cha", trainedOnly: true, armorCheckPenalty: false },
  { id: "heal", name: "Heal", ability: "wis", trainedOnly: false, armorCheckPenalty: false },
  { id: "intimidate", name: "Intimidate", ability: "cha", trainedOnly: false, armorCheckPenalty: false },
  { id: "knowledge_arcana", name: "Knowledge (arcana)", ability: "int", trainedOnly: true, armorCheckPenalty: false },
  { id: "knowledge_dungeoneering", name: "Knowledge (dungeoneering)", ability: "int", trainedOnly: true, armorCheckPenalty: false },
  { id: "knowledge_engineering", name: "Knowledge (engineering)", ability: "int", trainedOnly: true, armorCheckPenalty: false },
  { id: "knowledge_geography", name: "Knowledge (geography)", ability: "int", trainedOnly: true, armorCheckPenalty: false },
  { id: "knowledge_history", name: "Knowledge (history)", ability: "int", trainedOnly: true, armorCheckPenalty: false },
  { id: "knowledge_local", name: "Knowledge (local)", ability: "int", trainedOnly: true, armorCheckPenalty: false },
  { id: "knowledge_nature", name: "Knowledge (nature)", ability: "int", trainedOnly: true, armorCheckPenalty: false },
  { id: "knowledge_nobility", name: "Knowledge (nobility)", ability: "int", trainedOnly: true, armorCheckPenalty: false },
  { id: "knowledge_planes", name: "Knowledge (planes)", ability: "int", trainedOnly: true, armorCheckPenalty: false },
  { id: "knowledge_religion", name: "Knowledge (religion)", ability: "int", trainedOnly: true, armorCheckPenalty: false },
  { id: "linguistics", name: "Linguistics", ability: "int", trainedOnly: true, armorCheckPenalty: false },
  { id: "perception", name: "Perception", ability: "wis", trainedOnly: false, armorCheckPenalty: false },
  { id: "perform", name: "Perform", ability: "cha", trainedOnly: false, armorCheckPenalty: false },
  { id: "profession", name: "Profession", ability: "wis", trainedOnly: true, armorCheckPenalty: false },
  { id: "ride", name: "Ride", ability: "dex", trainedOnly: false, armorCheckPenalty: true },
  { id: "sense_motive", name: "Sense Motive", ability: "wis", trainedOnly: false, armorCheckPenalty: false },
  { id: "sleight_of_hand", name: "Sleight of Hand", ability: "dex", trainedOnly: true, armorCheckPenalty: true },
  { id: "spellcraft", name: "Spellcraft", ability: "int", trainedOnly: true, armorCheckPenalty: false },
  { id: "stealth", name: "Stealth", ability: "dex", trainedOnly: false, armorCheckPenalty: true },
  { id: "survival", name: "Survival", ability: "wis", trainedOnly: false, armorCheckPenalty: false },
  { id: "swim", name: "Swim", ability: "str", trainedOnly: false, armorCheckPenalty: true },
  { id: "use_magic_device", name: "Use Magic Device", ability: "cha", trainedOnly: true, armorCheckPenalty: false },
];

export const SKILLS_BY_ID: Record<string, Skill> = Object.fromEntries(
  SKILLS.map((s) => [s.id, s]),
);
