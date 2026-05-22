import type { AbilityKey, SkillKey } from "../../types/pathfinder";

// Modifier bundle. Reused by Effects (conditions/buffs), Race traits,
// Feats, and Class choices so that everything flows through the same
// aggregator in the engine.
export interface EffectMods {
  attack?: number;
  meleeAttack?: number;
  rangedAttack?: number;
  damage?: number;
  meleeDamage?: number;
  acBonus?: number;
  armorBonus?: number;
  shieldBonus?: number;
  naturalArmor?: number;
  deflection?: number;
  dodge?: number;
  losesDexToAc?: boolean;
  saves?: { fort?: number; ref?: number; will?: number; all?: number; vsFear?: number };
  skills?: number;
  skillBonuses?: Partial<Record<SkillKey, number>>;
  abilityChecks?: number;
  abilityScores?: Partial<Record<AbilityKey, number>>;
  initiative?: number;
  cmb?: number;
  cmd?: number;
  speed?: number;        // additive feet
  halfSpeed?: boolean;
  extraAttack?: boolean; // Haste-style
  hp?: number;           // flat HP bonus (e.g. Toughness handled separately, but kept for other uses)
}

// An Effect is a structured modifier bundle applied to a character.
// Used for conditions (Shaken, Sickened, etc.), spell buffs/debuffs (Bull's
// Strength, Mage Armor, Bane), and custom user effects.
//
// PF1 bonus-type stacking rules are not enforced yet — like-named buffs
// naively sum. We can layer that on later without changing the schema.
export interface Effect extends EffectMods {
  id: string;
  name: string;
  source: "condition" | "spell" | "ability_buff" | "custom";
  category?: string;
  description?: string;
  // If set, the situational/buffs UI only offers this effect to characters of
  // the listed races. Used for conditional racial bonuses (dwarf vs. orcs,
  // halfling vs. fear, etc.) that don't auto-apply but the player can flip
  // on when the circumstances apply.
  restrictedToRace?: string[];
}

// ----------------- Conditions (PF1 Core, OGL) -----------------
// Effects encoded for the mechanical conditions. Flavor-only conditions
// (Dead, Petrified) carry no modifiers but are still toggleable so the
// player can see them on the sheet.
export const CONDITIONS: Effect[] = [
  { id: "blinded", name: "Blinded", source: "condition",
    description: "−2 AC, loses Dex to AC, −4 most Str- and Dex-based skill checks, 50% miss chance on attacks.",
    acBonus: -2, losesDexToAc: true, skills: 0 /* dex/str skills hit harder, simplified */ },
  { id: "confused", name: "Confused", source: "condition",
    description: "Roll on the confused behavior table each round." },
  { id: "cowering", name: "Cowering", source: "condition",
    description: "Can take no actions, loses Dex to AC, −2 AC.",
    acBonus: -2, losesDexToAc: true },
  { id: "dazed", name: "Dazed", source: "condition",
    description: "Can take no actions for the duration." },
  { id: "dazzled", name: "Dazzled", source: "condition",
    description: "−1 attack rolls and sight-based Perception checks.",
    attack: -1 },
  { id: "deafened", name: "Deafened", source: "condition",
    description: "−4 initiative, 20% spell-failure for spells with verbal components.",
    initiative: -4 },
  { id: "disabled", name: "Disabled", source: "condition",
    description: "At 0 HP. May take one standard or one move action per turn (not both)." },
  { id: "dying", name: "Dying", source: "condition",
    description: "Unconscious and losing HP." },
  { id: "entangled", name: "Entangled", source: "condition",
    description: "−2 attack rolls, −4 Dex, ½ speed; can't run or charge.",
    attack: -2, abilityScores: { dex: -4 }, halfSpeed: true },
  { id: "exhausted", name: "Exhausted", source: "condition",
    description: "−6 Str and Dex, ½ speed, can't run or charge.",
    abilityScores: { str: -6, dex: -6 }, halfSpeed: true },
  { id: "fascinated", name: "Fascinated", source: "condition",
    description: "Stands quietly and observes; −4 to react. +4 attacks against a fascinated creature." },
  { id: "fatigued", name: "Fatigued", source: "condition",
    description: "−2 Str and Dex, can't run or charge.",
    abilityScores: { str: -2, dex: -2 } },
  { id: "flat_footed", name: "Flat-Footed", source: "condition",
    description: "Loses Dex bonus to AC; can't make AoOs.",
    losesDexToAc: true },
  { id: "frightened", name: "Frightened", source: "condition",
    description: "−2 attack rolls, saves, skill and ability checks; must flee.",
    attack: -2, saves: { all: -2 }, skills: -2, abilityChecks: -2 },
  { id: "grappled", name: "Grappled", source: "condition",
    description: "−4 Dex, −2 attack rolls (except light/natural), can't take actions requiring two hands.",
    attack: -2, abilityScores: { dex: -4 } },
  { id: "helpless", name: "Helpless", source: "condition",
    description: "Treated as Dex 0 (−5 modifier). −4 AC vs. melee. Can be coup-de-graced." },
  { id: "nauseated", name: "Nauseated", source: "condition",
    description: "Can only take a single move action per turn; no spells/attacks." },
  { id: "panicked", name: "Panicked", source: "condition",
    description: "−2 attack rolls, saves, skill and ability checks; flees and drops items.",
    attack: -2, saves: { all: -2 }, skills: -2, abilityChecks: -2 },
  { id: "paralyzed", name: "Paralyzed", source: "condition",
    description: "Effective Str 0, Dex 0; helpless.",
    abilityScores: { str: -10, dex: -10 } },
  { id: "pinned", name: "Pinned", source: "condition",
    description: "Tightly grappled — flat-footed, −4 AC, lose Dex.",
    acBonus: -4, losesDexToAc: true, abilityScores: { dex: -4 } },
  { id: "prone", name: "Prone", source: "condition",
    description: "−4 melee attack; +4 AC vs. ranged, −4 AC vs. melee. Standing up provokes.",
    meleeAttack: -4 },
  { id: "shaken", name: "Shaken", source: "condition",
    description: "−2 attack rolls, saves, skill and ability checks.",
    attack: -2, saves: { all: -2 }, skills: -2, abilityChecks: -2 },
  { id: "sickened", name: "Sickened", source: "condition",
    description: "−2 attack rolls, weapon damage, saves, skill and ability checks.",
    attack: -2, damage: -2, saves: { all: -2 }, skills: -2, abilityChecks: -2 },
  { id: "stable", name: "Stable", source: "condition",
    description: "At negative HP but no longer losing more." },
  { id: "staggered", name: "Staggered", source: "condition",
    description: "May take one standard or one move action per turn (not both)." },
  { id: "stunned", name: "Stunned", source: "condition",
    description: "Drops everything held, can't take actions, takes −2 AC, loses Dex to AC.",
    acBonus: -2, losesDexToAc: true },
  { id: "unconscious", name: "Unconscious", source: "condition",
    description: "Helpless and aware of nothing." },
];

// ----------------- Common spell buffs & debuffs (PF1 Core, OGL) -----------------
export const SPELL_BUFFS: Effect[] = [
  // Stat buffs (4th-hour duration, +4 enhancement to one ability)
  { id: "bulls_strength", name: "Bull's Strength", source: "spell", category: "Stat buff",
    description: "+4 enhancement to Strength.",
    abilityScores: { str: 4 } },
  { id: "cats_grace", name: "Cat's Grace", source: "spell", category: "Stat buff",
    description: "+4 enhancement to Dexterity.",
    abilityScores: { dex: 4 } },
  { id: "bears_endurance", name: "Bear's Endurance", source: "spell", category: "Stat buff",
    description: "+4 enhancement to Constitution.",
    abilityScores: { con: 4 } },
  { id: "foxs_cunning", name: "Fox's Cunning", source: "spell", category: "Stat buff",
    description: "+4 enhancement to Intelligence.",
    abilityScores: { int: 4 } },
  { id: "owls_wisdom", name: "Owl's Wisdom", source: "spell", category: "Stat buff",
    description: "+4 enhancement to Wisdom.",
    abilityScores: { wis: 4 } },
  { id: "eagles_splendor", name: "Eagle's Splendor", source: "spell", category: "Stat buff",
    description: "+4 enhancement to Charisma.",
    abilityScores: { cha: 4 } },

  // Defense
  { id: "mage_armor", name: "Mage Armor", source: "spell", category: "Defense",
    description: "+4 armor bonus to AC.",
    armorBonus: 4 },
  { id: "shield", name: "Shield", source: "spell", category: "Defense",
    description: "+4 shield bonus to AC; blocks magic missile.",
    shieldBonus: 4 },
  { id: "shield_of_faith", name: "Shield of Faith", source: "spell", category: "Defense",
    description: "+2 deflection bonus to AC (+1 per 6 caster levels, max +5).",
    deflection: 2 },
  { id: "barkskin", name: "Barkskin", source: "spell", category: "Defense",
    description: "+2 natural armor bonus (+1 per 3 caster levels above 3rd, max +5).",
    naturalArmor: 2 },
  { id: "protection_from_evil", name: "Protection from Evil", source: "spell", category: "Defense",
    description: "+2 deflection AC and +2 resistance saves vs. evil creatures.",
    deflection: 2, saves: { all: 2 } },

  // Morale / divine buffs
  { id: "bless", name: "Bless", source: "spell", category: "Morale",
    description: "+1 morale on attack rolls and saves vs. fear.",
    attack: 1, saves: { vsFear: 1 } },
  { id: "prayer", name: "Prayer", source: "spell", category: "Morale",
    description: "Allies +1 luck on attacks, weapon damage, saves, skill checks.",
    attack: 1, damage: 1, saves: { all: 1 }, skills: 1 },
  { id: "heroism", name: "Heroism", source: "spell", category: "Morale",
    description: "+2 morale on attack rolls, saves, and skill checks.",
    attack: 2, saves: { all: 2 }, skills: 2 },
  { id: "greater_heroism", name: "Greater Heroism", source: "spell", category: "Morale",
    description: "+4 morale on attack rolls, saves, skill checks; +8 vs. fear; immune to fear.",
    attack: 4, saves: { all: 4, vsFear: 8 }, skills: 4 },
  { id: "divine_favor", name: "Divine Favor", source: "spell", category: "Morale",
    description: "+1 luck to attack and damage per 3 caster levels (max +3).",
    attack: 1, damage: 1 },
  { id: "inspire_courage_1", name: "Inspire Courage +1", source: "spell", category: "Bardic",
    description: "+1 morale on attack rolls, weapon damage, and saves vs. fear and charm.",
    attack: 1, damage: 1, saves: { vsFear: 1 } },
  { id: "inspire_courage_2", name: "Inspire Courage +2", source: "spell", category: "Bardic",
    description: "+2 morale on attack rolls, weapon damage, and saves vs. fear and charm.",
    attack: 2, damage: 2, saves: { vsFear: 2 } },
  { id: "inspire_courage_3", name: "Inspire Courage +3", source: "spell", category: "Bardic",
    description: "+3 morale on attack rolls, weapon damage, and saves vs. fear and charm.",
    attack: 3, damage: 3, saves: { vsFear: 3 } },
  { id: "inspire_courage_4", name: "Inspire Courage +4", source: "spell", category: "Bardic",
    description: "+4 morale on attack rolls, weapon damage, and saves vs. fear and charm.",
    attack: 4, damage: 4, saves: { vsFear: 4 } },

  // Movement & action economy
  { id: "haste", name: "Haste", source: "spell", category: "Movement",
    description: "+1 attack, +1 AC, +1 Reflex, +30 ft. speed, extra attack at highest BAB in a full attack.",
    attack: 1, dodge: 1, saves: { ref: 1 }, speed: 30, extraAttack: true },
  { id: "expeditious_retreat", name: "Expeditious Retreat", source: "spell", category: "Movement",
    description: "Base land speed +30 ft.",
    speed: 30 },

  // Debuffs (apply to a target, but useful to track on yourself too)
  { id: "bane", name: "Bane", source: "spell", category: "Debuff",
    description: "−1 morale on attack rolls and saves vs. fear (against enemies).",
    attack: -1, saves: { vsFear: -1 } },
  { id: "slow", name: "Slow", source: "spell", category: "Debuff",
    description: "−1 attack, −1 AC, −1 Reflex, ½ speed; only one move OR standard action per turn.",
    attack: -1, dodge: -1, saves: { ref: -1 }, halfSpeed: true },

  // Class-style buffs
  { id: "rage_normal", name: "Rage (barbarian)", source: "ability_buff", category: "Class",
    description: "+4 Str, +4 Con, +2 morale Will, −2 AC.",
    abilityScores: { str: 4, con: 4 }, saves: { will: 2 }, acBonus: -2 },
  { id: "rage_greater", name: "Greater Rage", source: "ability_buff", category: "Class",
    description: "+6 Str, +6 Con, +3 morale Will, −2 AC.",
    abilityScores: { str: 6, con: 6 }, saves: { will: 3 }, acBonus: -2 },
  { id: "rage_mighty", name: "Mighty Rage", source: "ability_buff", category: "Class",
    description: "+8 Str, +8 Con, +4 morale Will, −2 AC.",
    abilityScores: { str: 8, con: 8 }, saves: { will: 4 }, acBonus: -2 },
  { id: "smite_evil", name: "Smite Evil", source: "ability_buff", category: "Class",
    description: "+Cha to attack, +paladin level to damage vs. evil target." },
];

// ----------------- Situational racial bonuses (PF1 Core, OGL) -----------------
// Conditional bonuses that only apply in specific circumstances. The player
// toggles them on when the situation arises (fighting a dwarf's hated foe,
// resisting fear as a halfling, etc.) and back off when it ends. Filtered
// in the UI by `restrictedToRace`.
export const SITUATIONAL_EFFECTS: Effect[] = [
  // Dwarf
  { id: "sit_dwarf_hatred", name: "Hatred (vs. orcs / goblinoids)", source: "ability_buff", category: "Dwarf",
    description: "+1 racial attack vs. humanoids of the orc or goblinoid subtypes.",
    attack: 1, restrictedToRace: ["dwarf"] },
  { id: "sit_dwarf_defensive_training", name: "Defensive Training (vs. giants)", source: "ability_buff", category: "Dwarf",
    description: "+4 dodge AC against monsters of the giant subtype.",
    dodge: 4, restrictedToRace: ["dwarf"] },
  { id: "sit_dwarf_hardy", name: "Hardy (vs. poison / spells / SLAs)", source: "ability_buff", category: "Dwarf",
    description: "+2 racial saves against poison, spells, and spell-like abilities.",
    saves: { all: 2 }, restrictedToRace: ["dwarf"] },
  { id: "sit_dwarf_stability", name: "Stability (vs. bull rush / trip)", source: "ability_buff", category: "Dwarf",
    description: "+4 racial CMD against bull rush and trip while on the ground.",
    cmd: 4, restrictedToRace: ["dwarf"] },
  { id: "sit_dwarf_stonecunning", name: "Stonecunning (noticing stonework)", source: "ability_buff", category: "Dwarf",
    description: "+2 Perception when noticing unusual stonework.",
    skillBonuses: { perception: 2 }, restrictedToRace: ["dwarf"] },

  // Elf / Half-Elf
  { id: "sit_elf_immunities", name: "Elven Immunities (vs. enchantment)", source: "ability_buff", category: "Elf",
    description: "+2 racial saves vs. enchantment spells and effects (immune to magic sleep).",
    saves: { will: 2 }, restrictedToRace: ["elf", "half_elf"] },
  { id: "sit_elf_magic_sr", name: "Elven Magic (vs. SR)", source: "ability_buff", category: "Elf",
    description: "+2 racial bonus on caster level checks to overcome spell resistance.",
    restrictedToRace: ["elf"] },

  // Halfling
  { id: "sit_halfling_fearless", name: "Fearless (vs. fear)", source: "ability_buff", category: "Halfling",
    description: "+2 racial saves vs. fear (stacks with Halfling Luck for +3 total).",
    saves: { vsFear: 2 }, restrictedToRace: ["halfling"] },
  { id: "sit_halfling_thrown", name: "Slings & thrown (size bonus)", source: "ability_buff", category: "Halfling",
    description: "+1 racial attack with slings and thrown weapons (already in size mod).",
    restrictedToRace: ["halfling"] },

  // Gnome
  { id: "sit_gnome_defensive_training", name: "Defensive Training (vs. giants)", source: "ability_buff", category: "Gnome",
    description: "+4 dodge AC against monsters of the giant subtype.",
    dodge: 4, restrictedToRace: ["gnome"] },
  { id: "sit_gnome_hatred", name: "Hatred (vs. reptilian / goblinoids)", source: "ability_buff", category: "Gnome",
    description: "+1 racial attack vs. humanoids of the reptilian or goblinoid subtypes.",
    attack: 1, restrictedToRace: ["gnome"] },
  { id: "sit_gnome_illusion_resistance", name: "Illusion Resistance (vs. illusions)", source: "ability_buff", category: "Gnome",
    description: "+2 racial saves vs. illusion spells or effects.",
    saves: { will: 2 }, restrictedToRace: ["gnome"] },
  { id: "sit_gnome_obsessive", name: "Obsessive (one Craft/Profession)", source: "ability_buff", category: "Gnome",
    description: "+2 racial bonus on one chosen Craft or Profession.",
    restrictedToRace: ["gnome"] },

  // Half-Orc
  { id: "sit_halforc_ferocity", name: "Orc Ferocity (1/day, below 0 HP)", source: "ability_buff", category: "Half-Orc",
    description: "When brought below 0 HP but not killed, fight on for 1 more round as if disabled.",
    restrictedToRace: ["half_orc"] },
];

export const ALL_EFFECTS: Effect[] = [...CONDITIONS, ...SPELL_BUFFS, ...SITUATIONAL_EFFECTS];
export const EFFECTS_BY_ID: Record<string, Effect> = Object.fromEntries(
  ALL_EFFECTS.map((e) => [e.id, e]),
);
