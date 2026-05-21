// Core Pathfinder 1E type system.
// Schemas are designed to hold the full breadth of Paizo 1E content.

export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

export const ABILITY_KEYS: AbilityKey[] = [
  "str",
  "dex",
  "con",
  "int",
  "wis",
  "cha",
];

export const ABILITY_NAMES: Record<AbilityKey, string> = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

export type AbilityScores = Record<AbilityKey, number>;

export type Size = "Fine" | "Diminutive" | "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gargantuan" | "Colossal";

export type Alignment =
  | "LG" | "NG" | "CG"
  | "LN" | "N"  | "CN"
  | "LE" | "NE" | "CE";

export type SaveKey = "fort" | "ref" | "will";

export type SkillKey = string; // e.g. "acrobatics", "knowledge_arcana"

export interface Race {
  id: string;
  name: string;
  source: string;
  size: Size;
  speed: number; // base land speed in feet
  abilityModifiers: Partial<AbilityScores>; // e.g. { dex: 2, con: 2, cha: -2 }
  type: string; // "humanoid (human)", "humanoid (elf)", etc.
  languages: string[]; // automatic languages
  bonusLanguages?: string[];
  traits: RaceTrait[]; // racial traits
  description?: string;
}

export interface RaceTrait {
  name: string;
  description: string;
}

export interface CharacterClass {
  id: string;
  name: string;
  source: string;
  hitDie: number; // 6, 8, 10, 12
  bab: "full" | "three_quarters" | "half";
  saves: { fort: "good" | "poor"; ref: "good" | "poor"; will: "good" | "poor" };
  skillRanksPerLevel: number; // base, before INT
  classSkills: SkillKey[];
  proficiencies: {
    armor: string[];
    weapons: string[];
  };
  features: ClassFeature[]; // level-keyed features
  spellcasting?: SpellcastingProgression;
  description?: string;
  alignmentRestriction?: Alignment[];
  startingWealthDice?: string; // e.g. "5d6 * 10"
}

export interface ClassFeature {
  name: string;
  level: number;
  description: string;
}

export interface SpellcastingProgression {
  type: "prepared" | "spontaneous";
  ability: AbilityKey; // INT for wizard, WIS for cleric, CHA for sorcerer
  list: string; // spell list id: "wizard", "cleric", "druid", "bard", "sorcerer", "paladin", "ranger"
  // Spells per day by class level (1-20) and spell level (0-9)
  spellsPerDay: number[][]; // spellsPerDay[classLevel - 1][spellLevel] = N, or -1 for "—"
  spellsKnown?: number[][]; // for spontaneous casters
}

export interface Skill {
  id: SkillKey;
  name: string;
  ability: AbilityKey;
  trainedOnly: boolean;
  armorCheckPenalty: boolean;
  description?: string;
}

export type FeatType =
  | "general"
  | "combat"
  | "metamagic"
  | "item_creation"
  | "teamwork"
  | "mythic"
  | "racial"
  | "achievement"
  | "story";

export interface Feat {
  id: string;
  name: string;
  source: string;
  types: FeatType[];
  prerequisites?: string; // freeform text for now
  benefit: string;
  normal?: string;
  special?: string;
}

export type SpellSchool =
  | "abjuration"
  | "conjuration"
  | "divination"
  | "enchantment"
  | "evocation"
  | "illusion"
  | "necromancy"
  | "transmutation"
  | "universal";

export interface Spell {
  id: string;
  name: string;
  source: string;
  school: SpellSchool;
  subschool?: string;
  descriptors?: string[];
  levels: Partial<Record<string, number>>; // { wizard: 1, sorcerer: 1 }
  castingTime: string;
  components: string; // "V, S, M (a pinch of sand)"
  range: string;
  target?: string;
  area?: string;
  effect?: string;
  duration: string;
  savingThrow?: string;
  spellResistance?: string;
  description: string;
}

export type ItemCategory =
  | "weapon"
  | "armor"
  | "shield"
  | "adventuring_gear"
  | "tool"
  | "alchemical"
  | "potion"
  | "scroll"
  | "wondrous"
  | "ring"
  | "rod"
  | "staff"
  | "wand"
  | "ammo";

export interface ItemBase {
  id: string;
  name: string;
  source: string;
  category: ItemCategory;
  cost: number; // in gp (decimal for sp/cp)
  weight: number;
  description?: string;
}

export interface Weapon extends ItemBase {
  category: "weapon";
  proficiency: "simple" | "martial" | "exotic";
  weaponType: "light" | "one_handed" | "two_handed" | "ranged";
  damage: { medium: string; small?: string }; // "1d8"
  critical: string; // "19-20/x2"
  range?: number; // range increment in feet
  damageType: string; // "bludgeoning", "piercing", "slashing"
  special?: string[]; // ["reach", "trip", "double"]
}

export interface Armor extends ItemBase {
  category: "armor" | "shield";
  armorType: "light" | "medium" | "heavy" | "shield";
  acBonus: number;
  maxDex: number | null; // null = no limit
  armorCheckPenalty: number; // negative number
  arcaneSpellFailure: number; // 0-100
  speed30?: number;
  speed20?: number;
}

export type Item = Weapon | Armor | (ItemBase & { category: Exclude<ItemCategory, "weapon" | "armor" | "shield"> });

export type Gender = "Male" | "Female" | "Other";

export interface CarriedItem {
  itemId: string;
  quantity: number;
  equipped?: boolean;
  notes?: string;
}

export interface ClassLevel {
  classId: string;
  level: number; // class level (1-20)
  hitPointsRolled: number; // legacy, retained for backward-compat; new code uses hpRolls
  hpRolls?: number[]; // HP gained at each level of this class entry, indexed by level-1
  skillRanks: Record<SkillKey, number>; // ranks placed at THIS level
  chosenFeats?: string[]; // feats picked at this level (1, 3, 5, 7, ...)
  abilityScoreIncrease?: AbilityKey; // every 4 levels
  favoredClassBonus?: "hp" | "skill" | "other";
}

export interface Character {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  player?: string;
  alignment: Alignment;
  deity?: string;
  gender?: Gender;
  age?: number;
  height?: string;
  weight?: string;
  eyes?: string;
  hair?: string;
  skin?: string;
  raceId: string;
  classLevels: ClassLevel[]; // multiclass support
  baseAbilityScores: AbilityScores; // before racial mods, before level-ups
  abilityScoreMethod: "point_buy_15" | "point_buy_20" | "point_buy_25" | "standard" | "manual";
  startingFeats?: string[]; // 1st level feat + human bonus, etc.
  inventory: CarriedItem[];
  money: { pp: number; gp: number; sp: number; cp: number };
  preparedSpells?: { classId: string; spellId: string; level: number; count?: number }[];
  knownSpells?: { classId: string; spellId: string; level: number }[];
  notes?: string;
  conditions?: string[];
  // Live-play tracking (mutable during a session)
  currentHp?: number; // undefined = at full
  tempHp?: number;
  nonlethalDamage?: number;
  // Active effects: IDs from the effects catalog plus any custom effects on this character.
  activeEffectIds?: string[];
  customEffects?: import("../data/effects/catalog").Effect[];
  // Ability damage (temporary) and drain (permanent) per stat.
  abilityDamage?: Partial<AbilityScores>;
  abilityDrain?: Partial<AbilityScores>;
  negativeLevels?: number;
}

// Computed/derived stats produced by the engine
export interface DerivedStats {
  totalLevel: number;
  abilityScores: AbilityScores; // after racial + level-up + effects - damage/drain
  baseAbilityScores?: AbilityScores; // after racial + level-up only (pre-effects/damage)
  abilityMods: AbilityScores;
  bab: number;
  cmb: number;
  cmd: number;
  saves: Record<SaveKey, { total: number; base: number; ability: number; misc: number }>;
  ac: {
    total: number;
    touch: number;
    flatFooted: number;
    armorBonus: number;
    shieldBonus: number;
    dexBonus: number;
    sizeBonus: number;
    naturalArmor: number;
    deflection: number;
    misc: number;
  };
  hp: { max: number; current: number };
  initiative: number;
  speed: number;
  size: Size;
  sizeMod: number;
  skills: Record<SkillKey, { ranks: number; classSkillBonus: number; ability: number; total: number; trained: boolean }>;
  attacks: {
    melee: number;
    ranged: number;
    cmb: number;
  };
  carryingCapacity: { light: number; medium: number; heavy: number };
  spellsPerDay: Record<string, number[]>; // by classId -> [lvl0, lvl1, ...]
  bonusSpellsByAbility: Record<string, number[]>; // by classId
  activeEffects?: import("../data/effects/catalog").Effect[];
  effectTotals?: {
    attack: number;
    damage: number;
    saves: { fort: number; ref: number; will: number };
    ac: number;
    skills: number;
    speed: number;
    negativeLevels: number;
    extraAttack: boolean;
  };
}
