import type {
  Character,
  DerivedStats,
  AbilityScores,
  Size,
} from "../types/pathfinder";
import { ABILITY_KEYS } from "../types/pathfinder";
import { RACES_BY_ID } from "../data/races/core";
import { CLASSES_BY_ID } from "../data/classes/core";
import { FEATS_BY_ID } from "../data/feats/core";
import { ITEMS_BY_ID } from "../data/equipment/core";
import { SKILLS } from "../data/skills/skills";
import { EFFECTS_BY_ID, type Effect } from "../data/effects/catalog";

// Resolves active effects on a character (from both catalog IDs and inline
// custom effects) into a single list of Effect definitions.
export function resolveActiveEffects(character: Character): Effect[] {
  const out: Effect[] = [];
  for (const id of character.activeEffectIds ?? []) {
    const fromCatalog = EFFECTS_BY_ID[id];
    if (fromCatalog) out.push(fromCatalog);
    else {
      const custom = (character.customEffects ?? []).find((e) => e.id === id);
      if (custom) out.push(custom);
    }
  }
  return out;
}

// Aggregates modifiers from active effects into one totals object.
interface EffectTotals {
  attack: number;
  meleeAttack: number;
  rangedAttack: number;
  damage: number;
  meleeDamage: number;
  acBonus: number;
  armorBonus: number;
  shieldBonus: number;
  naturalArmor: number;
  deflection: number;
  dodge: number;
  losesDexToAc: boolean;
  saves: { fort: number; ref: number; will: number; vsFear: number };
  skills: number;
  abilityChecks: number;
  abilityScores: AbilityScores;
  initiative: number;
  cmb: number;
  cmd: number;
  speed: number;
  halfSpeed: boolean;
  extraAttack: boolean;
}

function emptyTotals(): EffectTotals {
  return {
    attack: 0, meleeAttack: 0, rangedAttack: 0,
    damage: 0, meleeDamage: 0,
    acBonus: 0, armorBonus: 0, shieldBonus: 0, naturalArmor: 0, deflection: 0, dodge: 0,
    losesDexToAc: false,
    saves: { fort: 0, ref: 0, will: 0, vsFear: 0 },
    skills: 0, abilityChecks: 0,
    abilityScores: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
    initiative: 0, cmb: 0, cmd: 0, speed: 0,
    halfSpeed: false, extraAttack: false,
  };
}

function aggregateEffectTotals(effects: Effect[]): EffectTotals {
  const t = emptyTotals();
  for (const e of effects) {
    t.attack += e.attack ?? 0;
    t.meleeAttack += e.meleeAttack ?? 0;
    t.rangedAttack += e.rangedAttack ?? 0;
    t.damage += e.damage ?? 0;
    t.meleeDamage += e.meleeDamage ?? 0;
    t.acBonus += e.acBonus ?? 0;
    t.armorBonus += e.armorBonus ?? 0;
    t.shieldBonus += e.shieldBonus ?? 0;
    t.naturalArmor += e.naturalArmor ?? 0;
    t.deflection += e.deflection ?? 0;
    t.dodge += e.dodge ?? 0;
    if (e.losesDexToAc) t.losesDexToAc = true;
    if (e.saves) {
      t.saves.fort += (e.saves.fort ?? 0) + (e.saves.all ?? 0);
      t.saves.ref += (e.saves.ref ?? 0) + (e.saves.all ?? 0);
      t.saves.will += (e.saves.will ?? 0) + (e.saves.all ?? 0);
      t.saves.vsFear += e.saves.vsFear ?? 0;
    }
    t.skills += e.skills ?? 0;
    t.abilityChecks += e.abilityChecks ?? 0;
    if (e.abilityScores) {
      for (const k of ABILITY_KEYS) {
        const m = e.abilityScores[k];
        if (typeof m === "number") t.abilityScores[k] += m;
      }
    }
    t.initiative += e.initiative ?? 0;
    t.cmb += e.cmb ?? 0;
    t.cmd += e.cmd ?? 0;
    t.speed += e.speed ?? 0;
    if (e.halfSpeed) t.halfSpeed = true;
    if (e.extraAttack) t.extraAttack = true;
  }
  return t;
}

export const SIZE_MODIFIER: Record<Size, number> = {
  Fine: 8,
  Diminutive: 4,
  Tiny: 2,
  Small: 1,
  Medium: 0,
  Large: -1,
  Huge: -2,
  Gargantuan: -4,
  Colossal: -8,
};

const CARRYING_MULT_BY_SIZE: Record<Size, number> = {
  Fine: 1 / 8,
  Diminutive: 1 / 4,
  Tiny: 1 / 2,
  Small: 3 / 4,
  Medium: 1,
  Large: 2,
  Huge: 4,
  Gargantuan: 8,
  Colossal: 16,
};

export function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function babForClass(
  type: "full" | "three_quarters" | "half",
  level: number,
): number {
  if (level <= 0) return 0;
  if (type === "full") return level;
  if (type === "three_quarters") return Math.floor((level * 3) / 4);
  return Math.floor(level / 2);
}

export function saveBase(type: "good" | "poor", level: number): number {
  if (level <= 0) return 0;
  if (type === "good") return Math.floor(level / 2) + 2;
  return Math.floor(level / 3);
}

// Carrying capacity table (Core Rulebook, Table 7-4): max heavy for Medium creature.
// Light = 1/3 of heavy, Medium = 2/3 of heavy.
function heavyLoadForStr(str: number): number {
  // Table from CRB. For str > 29, doubles every 10.
  const table: Record<number, number> = {
    0: 0, 1: 10, 2: 20, 3: 30, 4: 40, 5: 50, 6: 60, 7: 70, 8: 80, 9: 90,
    10: 100, 11: 115, 12: 130, 13: 150, 14: 175, 15: 200, 16: 230, 17: 260,
    18: 300, 19: 350, 20: 400, 21: 460, 22: 520, 23: 600, 24: 700, 25: 800,
    26: 920, 27: 1040, 28: 1200, 29: 1400,
  };
  if (str <= 0) return 0;
  if (str <= 29) return table[str];
  // Each +10 strength doubles the load.
  const exponent = Math.floor((str - 20) / 10);
  const base = table[20 + ((str - 20) % 10)] ?? 400;
  return base * Math.pow(4, exponent);
}

// Bonus spells per day from a high ability score (Core Rulebook Table 1-3).
// Indexed by spell level 0-9. Spell level 0 always gets 0 bonus.
export function bonusSpellsForAbilityScore(score: number): number[] {
  const result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const mod = abilityMod(score);
  if (mod < 1) return result;
  for (let spellLevel = 1; spellLevel <= 9; spellLevel++) {
    if (score >= 10 + spellLevel) {
      // floor((score - 10 - spellLevel) / 8) + 1
      const bonus = Math.floor((score - 10 - spellLevel) / 8) + 1;
      result[spellLevel] = Math.max(0, bonus);
    }
  }
  return result;
}

export function derive(character: Character): DerivedStats {
  const race = RACES_BY_ID[character.raceId];

  // --- Ability scores: base + racial + ability score increases ---
  const abilityScores: AbilityScores = { ...character.baseAbilityScores };
  if (race) {
    for (const k of ABILITY_KEYS) {
      const m = race.abilityModifiers[k];
      if (typeof m === "number") abilityScores[k] += m;
    }
  }
  // Apply ability score increases every 4 levels
  const totalLevel = character.classLevels.reduce((sum, cl) => sum + cl.level, 0);
  for (const cl of character.classLevels) {
    if (cl.abilityScoreIncrease) {
      abilityScores[cl.abilityScoreIncrease] += 1;
    }
  }

  // --- Active effects, ability damage/drain, negative levels ---
  const activeEffects = resolveActiveEffects(character);
  const effectTotals = aggregateEffectTotals(activeEffects);
  const negativeLevels = character.negativeLevels ?? 0;

  // Ability scores: base + effects + drain/damage
  const baseAbilityScores: AbilityScores = { ...abilityScores };
  for (const k of ABILITY_KEYS) {
    abilityScores[k] += effectTotals.abilityScores[k];
    abilityScores[k] -= character.abilityDamage?.[k] ?? 0;
    abilityScores[k] -= character.abilityDrain?.[k] ?? 0;
    // Ability scores can drop to 0 (treated as helpless for Str/Dex); don't go negative.
    if (abilityScores[k] < 0) abilityScores[k] = 0;
  }

  const abilityMods: AbilityScores = ABILITY_KEYS.reduce(
    (acc, k) => ({ ...acc, [k]: abilityMod(abilityScores[k]) }),
    {} as AbilityScores,
  );

  // --- BAB and saves (sum across multiclass) ---
  let bab = 0;
  const saveBaseTotals = { fort: 0, ref: 0, will: 0 };
  let firstClassFort: "good" | "poor" | null = null;
  let firstClassRef: "good" | "poor" | null = null;
  let firstClassWill: "good" | "poor" | null = null;

  for (const cl of character.classLevels) {
    const klass = CLASSES_BY_ID[cl.classId];
    if (!klass) continue;
    bab += babForClass(klass.bab, cl.level);
    saveBaseTotals.fort += saveBase(klass.saves.fort, cl.level);
    saveBaseTotals.ref += saveBase(klass.saves.ref, cl.level);
    saveBaseTotals.will += saveBase(klass.saves.will, cl.level);
    if (firstClassFort === null) firstClassFort = klass.saves.fort;
    if (firstClassRef === null) firstClassRef = klass.saves.ref;
    if (firstClassWill === null) firstClassWill = klass.saves.will;
  }

  // --- HP ---
  let maxHp = 0;
  for (const cl of character.classLevels) {
    const klass = CLASSES_BY_ID[cl.classId];
    if (!klass) continue;
    // The first level of the first class always uses the max of the hit die.
    // All other levels use the per-level roll, or fall back to average.
    for (let lvl = 1; lvl <= cl.level; lvl++) {
      const isFirstLevelEver = cl === character.classLevels[0] && lvl === 1;
      if (isFirstLevelEver) {
        maxHp += klass.hitDie;
      } else {
        const roll = cl.hpRolls?.[lvl - 1];
        const avg = Math.floor(klass.hitDie / 2) + 1;
        maxHp += roll ?? avg;
      }
    }
  }
  // Add Con modifier per level
  maxHp += abilityMods.con * totalLevel;

  // Toughness feat
  const allFeats = collectAllFeats(character);
  if (allFeats.includes("toughness")) {
    maxHp += Math.max(3, totalLevel);
  }

  // Favored class HP bonus
  for (const cl of character.classLevels) {
    if (cl.favoredClassBonus === "hp") {
      maxHp += cl.level;
    }
  }

  // --- Size & speed ---
  const size: Size = race?.size ?? "Medium";
  const sizeMod = SIZE_MODIFIER[size];
  const speed = race?.speed ?? 30;

  // --- AC ---
  let armorBonus = effectTotals.armorBonus;
  let shieldBonus = effectTotals.shieldBonus;
  let maxDexAllowed = Infinity;

  for (const carried of character.inventory) {
    if (!carried.equipped) continue;
    const item = ITEMS_BY_ID[carried.itemId];
    if (!item) continue;
    if (item.category === "armor") {
      const a = item as import("../types/pathfinder").Armor;
      armorBonus += a.acBonus;
      if (a.maxDex !== null) maxDexAllowed = Math.min(maxDexAllowed, a.maxDex);
    } else if (item.category === "shield") {
      const a = item as import("../types/pathfinder").Armor;
      shieldBonus += a.acBonus;
      if (a.maxDex !== null) maxDexAllowed = Math.min(maxDexAllowed, a.maxDex);
    }
  }
  const rawDexToAc = Math.min(abilityMods.dex, maxDexAllowed);
  const dexToAc = effectTotals.losesDexToAc ? 0 : rawDexToAc;
  const naturalArmor = effectTotals.naturalArmor;
  const deflection = effectTotals.deflection;
  const misc = effectTotals.acBonus + effectTotals.dodge;
  const acTotal = 10 + armorBonus + shieldBonus + dexToAc + sizeMod + naturalArmor + deflection + misc;
  const acTouch = 10 + dexToAc + sizeMod + deflection + effectTotals.acBonus + effectTotals.dodge;
  const acFlatFooted = 10 + armorBonus + shieldBonus + sizeMod + naturalArmor + deflection + effectTotals.acBonus;

  // --- Saves total ---
  const ironWillMisc = allFeats.includes("iron_will") ? 2 : 0;
  const greatFortMisc = allFeats.includes("great_fortitude") ? 2 : 0;
  const lightRefMisc = allFeats.includes("lightning_reflexes") ? 2 : 0;

  const saves = {
    fort: {
      base: saveBaseTotals.fort,
      ability: abilityMods.con,
      misc: greatFortMisc + effectTotals.saves.fort - negativeLevels,
      total: saveBaseTotals.fort + abilityMods.con + greatFortMisc + effectTotals.saves.fort - negativeLevels,
    },
    ref: {
      base: saveBaseTotals.ref,
      ability: abilityMods.dex,
      misc: lightRefMisc + effectTotals.saves.ref - negativeLevels,
      total: saveBaseTotals.ref + abilityMods.dex + lightRefMisc + effectTotals.saves.ref - negativeLevels,
    },
    will: {
      base: saveBaseTotals.will,
      ability: abilityMods.wis,
      misc: ironWillMisc + effectTotals.saves.will - negativeLevels,
      total: saveBaseTotals.will + abilityMods.wis + ironWillMisc + effectTotals.saves.will - negativeLevels,
    },
  };

  // --- Attacks ---
  // CMB = BAB + Str mod + size special modifier (different from AC)
  const cmbSizeMod = sizeSpecialMod(size);
  const initImproved = allFeats.includes("improved_initiative") ? 4 : 0;

  // --- Skills ---
  const skills: DerivedStats["skills"] = {};
  for (const skill of SKILLS) {
    const ranks = character.classLevels.reduce(
      (sum, cl) => sum + (cl.skillRanks[skill.id] ?? 0),
      0,
    );
    const isClassSkill = isSkillAClassSkill(skill.id, character);
    const classSkillBonus = ranks > 0 && isClassSkill ? 3 : 0;
    const abilityBonus = abilityMods[skill.ability];
    const skillEffectBonus = effectTotals.skills - negativeLevels;
    skills[skill.id] = {
      ranks,
      classSkillBonus,
      ability: abilityBonus,
      total: ranks + classSkillBonus + abilityBonus + skillEffectBonus,
      trained: ranks > 0,
    };
  }

  // --- Spells per day ---
  const spellsPerDay: Record<string, number[]> = {};
  const bonusSpellsByAbility: Record<string, number[]> = {};
  for (const cl of character.classLevels) {
    const klass = CLASSES_BY_ID[cl.classId];
    if (!klass?.spellcasting) continue;
    const tableRow = klass.spellcasting.spellsPerDay[cl.level - 1];
    if (!tableRow) continue;
    spellsPerDay[cl.classId] = [...tableRow];
    bonusSpellsByAbility[cl.classId] = bonusSpellsForAbilityScore(
      abilityScores[klass.spellcasting.ability],
    );
  }

  // --- Carrying capacity ---
  const heavyLoad = heavyLoadForStr(abilityScores.str) * CARRYING_MULT_BY_SIZE[size];
  const carryingCapacity = {
    light: Math.floor(heavyLoad / 3),
    medium: Math.floor((heavyLoad * 2) / 3),
    heavy: Math.floor(heavyLoad),
  };

  // Common attack-roll adjustment from effects + negative levels.
  const attackEffectMod = effectTotals.attack - negativeLevels;
  const finalSpeed = effectTotals.halfSpeed
    ? Math.floor((speed + effectTotals.speed) / 2 / 5) * 5
    : speed + effectTotals.speed;

  return {
    totalLevel,
    abilityScores,
    baseAbilityScores,
    abilityMods,
    bab,
    cmb: bab + abilityMods.str + cmbSizeMod + effectTotals.cmb - negativeLevels,
    cmd: 10 + bab + abilityMods.str + abilityMods.dex + cmbSizeMod + effectTotals.cmd - negativeLevels,
    saves,
    ac: {
      total: acTotal,
      touch: acTouch,
      flatFooted: acFlatFooted,
      armorBonus,
      shieldBonus,
      dexBonus: dexToAc,
      sizeBonus: sizeMod,
      naturalArmor,
      deflection,
      misc,
    },
    hp: { max: maxHp, current: character.currentHp ?? maxHp },
    initiative: abilityMods.dex + initImproved + effectTotals.initiative,
    speed: finalSpeed,
    size,
    sizeMod,
    skills,
    attacks: {
      melee: bab + abilityMods.str + sizeMod + attackEffectMod + effectTotals.meleeAttack,
      ranged: bab + abilityMods.dex + sizeMod + attackEffectMod + effectTotals.rangedAttack,
      cmb: bab + abilityMods.str + cmbSizeMod + effectTotals.cmb - negativeLevels,
    },
    carryingCapacity,
    spellsPerDay,
    bonusSpellsByAbility,
    activeEffects,
    effectTotals: {
      attack: attackEffectMod + effectTotals.meleeAttack, // approximate display
      damage: effectTotals.damage + effectTotals.meleeDamage,
      saves: { fort: effectTotals.saves.fort, ref: effectTotals.saves.ref, will: effectTotals.saves.will },
      ac: effectTotals.acBonus + effectTotals.dodge + effectTotals.armorBonus + effectTotals.shieldBonus + effectTotals.naturalArmor + effectTotals.deflection,
      skills: effectTotals.skills - negativeLevels,
      speed: effectTotals.halfSpeed ? -Math.floor(speed / 2) : effectTotals.speed,
      negativeLevels,
      extraAttack: effectTotals.extraAttack,
    },
  };
}

function sizeSpecialMod(size: Size): number {
  // The "special" size modifier used for CMB/CMD and grapple — Fine -8 to Colossal +8.
  const map: Record<Size, number> = {
    Fine: -8,
    Diminutive: -4,
    Tiny: -2,
    Small: -1,
    Medium: 0,
    Large: 1,
    Huge: 2,
    Gargantuan: 4,
    Colossal: 8,
  };
  return map[size];
}

function isSkillAClassSkill(skillId: string, character: Character): boolean {
  for (const cl of character.classLevels) {
    const klass = CLASSES_BY_ID[cl.classId];
    if (klass?.classSkills.includes(skillId)) return true;
  }
  return false;
}

function collectAllFeats(character: Character): string[] {
  const out: string[] = [];
  if (character.startingFeats) out.push(...character.startingFeats);
  for (const cl of character.classLevels) {
    if (cl.chosenFeats) out.push(...cl.chosenFeats);
  }
  return out;
}

// --- Helpers used by UI ---
export function getCharacterFeats(character: Character): string[] {
  return collectAllFeats(character);
}

export function pointBuyCost(score: number): number {
  // Pathfinder point buy table.
  const table: Record<number, number> = {
    7: -4, 8: -2, 9: -1, 10: 0, 11: 1, 12: 2, 13: 3, 14: 5, 15: 7, 16: 10, 17: 13, 18: 17,
  };
  return table[score] ?? 0;
}

export function pointBuyTotal(scores: AbilityScores): number {
  return ABILITY_KEYS.reduce((sum, k) => sum + pointBuyCost(scores[k]), 0);
}

export function skillRanksAtLevel(
  character: Character,
  classId: string,
  _classLevel: number,
): number {
  const klass = CLASSES_BY_ID[classId];
  if (!klass) return 0;
  const intMod = abilityMod(
    character.baseAbilityScores.int +
      (RACES_BY_ID[character.raceId]?.abilityModifiers.int ?? 0),
  );
  let base = klass.skillRanksPerLevel + intMod;
  base = Math.max(1, base);
  if (character.raceId === "human" || character.raceId === "half_elf") base += 1;
  // Favored class skill choice could add +1 — handled when the user picks it.
  return base;
}

export function totalCharacterLevel(character: Character): number {
  return character.classLevels.reduce((sum, cl) => sum + cl.level, 0);
}

export function feasibleFeats(allFeats: typeof FEATS_BY_ID, _character: Character) {
  return Object.values(allFeats);
}

export function abilityModString(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}
