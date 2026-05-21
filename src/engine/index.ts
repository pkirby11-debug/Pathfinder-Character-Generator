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
    // The first level always uses the max of the hit die. Subsequent levels use rolled values.
    for (let lvl = 1; lvl <= cl.level; lvl++) {
      const isFirstLevelEver =
        cl === character.classLevels[0] && lvl === 1;
      if (isFirstLevelEver) {
        maxHp += klass.hitDie;
      } else {
        // Use rolled value if present, else average (rounded up).
        const rolledForLevel = cl.hitPointsRolled; // simplification: same roll per cl-level entry
        const avg = Math.floor(klass.hitDie / 2) + 1;
        maxHp += rolledForLevel || avg;
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
  let armorBonus = 0;
  let shieldBonus = 0;
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
  const dexToAc = Math.min(abilityMods.dex, maxDexAllowed);
  const naturalArmor = 0;
  const deflection = 0;
  const misc = 0;
  const acTotal = 10 + armorBonus + shieldBonus + dexToAc + sizeMod + naturalArmor + deflection + misc;
  const acTouch = 10 + dexToAc + sizeMod + deflection + misc;
  const acFlatFooted = 10 + armorBonus + shieldBonus + sizeMod + naturalArmor + deflection + misc;

  // --- Saves total ---
  const ironWillMisc = allFeats.includes("iron_will") ? 2 : 0;
  const greatFortMisc = allFeats.includes("great_fortitude") ? 2 : 0;
  const lightRefMisc = allFeats.includes("lightning_reflexes") ? 2 : 0;

  const saves = {
    fort: {
      base: saveBaseTotals.fort,
      ability: abilityMods.con,
      misc: greatFortMisc,
      total: saveBaseTotals.fort + abilityMods.con + greatFortMisc,
    },
    ref: {
      base: saveBaseTotals.ref,
      ability: abilityMods.dex,
      misc: lightRefMisc,
      total: saveBaseTotals.ref + abilityMods.dex + lightRefMisc,
    },
    will: {
      base: saveBaseTotals.will,
      ability: abilityMods.wis,
      misc: ironWillMisc,
      total: saveBaseTotals.will + abilityMods.wis + ironWillMisc,
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
    skills[skill.id] = {
      ranks,
      classSkillBonus,
      ability: abilityBonus,
      total: ranks + classSkillBonus + abilityBonus,
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

  return {
    totalLevel,
    abilityScores,
    abilityMods,
    bab,
    cmb: bab + abilityMods.str + cmbSizeMod,
    cmd: 10 + bab + abilityMods.str + abilityMods.dex + cmbSizeMod,
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
    hp: { max: maxHp, current: maxHp },
    initiative: abilityMods.dex + initImproved,
    speed,
    size,
    sizeMod,
    skills,
    attacks: {
      melee: bab + abilityMods.str + sizeMod,
      ranged: bab + abilityMods.dex + sizeMod,
      cmb: bab + abilityMods.str + cmbSizeMod,
    },
    carryingCapacity,
    spellsPerDay,
    bonusSpellsByAbility,
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
