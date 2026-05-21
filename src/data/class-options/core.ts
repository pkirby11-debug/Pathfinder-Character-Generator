import type { EffectMods } from "../effects/catalog";

// A picker option attached to a class feature. Stored on the character
// as classChoices: { "<classId>.<key>": "<optionId>" | "<optionId>[]" }.
export interface ClassOption {
  id: string;
  name: string;
  description: string;
  // Mechanical modifiers applied while this option is selected. Many
  // class options grant powers (per-day abilities, summonable creatures, etc.)
  // rather than passive stat changes — those are documented in `description`
  // but don't appear in `mods`.
  mods?: EffectMods;
  // Free-form extras displayed on the sheet (granted power, bonus class skill, etc.)
  extras?: string[];
}

export interface ChoiceSpec {
  key: string;            // unique per class — e.g. "school", "domains", "bloodline"
  label: string;          // UI label
  description?: string;
  level: number;          // class level at which the choice becomes available
  multi?: number;         // number of choices required (default 1)
  options: ClassOption[];
}

// ---------- WIZARD: Arcane School ----------
export const WIZARD_SCHOOLS: ClassOption[] = [
  { id: "universalist", name: "Universalist", description: "No focused school; gains Hand of the Apprentice and Metamagic Mastery. No opposition schools, can prepare any spell freely.",
    extras: ["Hand of the Apprentice (1/day per level + Int)", "Metamagic Mastery (apply metamagic without raising slot, limited uses)"] },
  { id: "abjuration", name: "Abjuration", description: "Master of protective magic. Resistance bonuses, energy absorption.",
    extras: ["Resistance 5 to one energy type (chosen, scales)", "Protective Ward (1/day per level + Int)"] },
  { id: "conjuration", name: "Conjuration", description: "Master of summoning and creation. Acid dart, summoned creatures have bonus rounds.",
    extras: ["Acid Dart 1d6+½ CL (Int mod uses/day)", "Summoner's Charm (½ level rounds extra)"] },
  { id: "divination", name: "Divination", description: "Forewarned and Diviner's Fortune. Initiative bonus equal to ½ wizard level (min +1).",
    extras: ["Forewarned: always act in surprise rounds; +½ level (min 1) initiative"],
    // Forewarned: at L1, that's +1 initiative (computed as Math.max(1, Math.floor(level/2)))
    mods: { initiative: 1 } },
  { id: "enchantment", name: "Enchantment", description: "Mind-affecting specialist. Dazing Touch, Enchanting Smile.",
    extras: ["Dazing Touch (Int mod uses/day)", "Enchanting Smile: +2 to Bluff, Diplomacy, Intimidate"],
    mods: { skillBonuses: { bluff: 2, diplomacy: 2, intimidate: 2 } } },
  { id: "evocation", name: "Evocation", description: "Damage specialist. Force Missile, Intense Spells, Elemental Wall.",
    extras: ["Intense Spells: +½ level damage (min 1) to evocation spells", "Force Missile (1d4+½ CL, Int mod uses/day)"] },
  { id: "illusion", name: "Illusion", description: "Master of deception. Blinding Ray, Invisibility Field.",
    extras: ["Blinding Ray (Int mod uses/day)", "Extended Illusions"] },
  { id: "necromancy", name: "Necromancy", description: "Master of life and death. Power Over Undead, Necromancer's Bonus.",
    extras: ["Power Over Undead (channel-like; Int mod + 3 uses/day)", "+1 caster level on necromancy spells"] },
  { id: "transmutation", name: "Transmutation", description: "Physical Enhancement and Telekinetic Fist. +1 to one chosen physical ability score, increasing every 5 levels.",
    extras: ["Physical Enhancement (+1 to chosen Str/Dex/Con; +1 every 5 levels)", "Telekinetic Fist (1d4+½ CL, Int mod uses/day)"],
    // We'll handle the +stat in a class-specific second-level choice (str/dex/con sub-choice)
  },
];

// Sub-choice for transmutation: which physical ability gets the +1
export const TRANSMUTATION_PHYSICAL: ClassOption[] = [
  { id: "str", name: "Strength", description: "+1 Strength (scales every 5 wizard levels).", mods: { abilityScores: { str: 1 } } },
  { id: "dex", name: "Dexterity", description: "+1 Dexterity (scales every 5 wizard levels).", mods: { abilityScores: { dex: 1 } } },
  { id: "con", name: "Constitution", description: "+1 Constitution (scales every 5 wizard levels).", mods: { abilityScores: { con: 1 } } },
];

// ---------- CLERIC: Domains ----------
// Each domain grants a bonus class skill (folded into skillBonuses via the engine
// treating ranks+class-skill = +3 if any rank), bonus spells, and granted powers.
// We track the choice; powers are descriptive.
export const CLERIC_DOMAINS: ClassOption[] = [
  { id: "air", name: "Air", description: "Lightning Arc (1d6+½ CL, Wis uses/day), Electricity Resistance.", extras: ["Bonus spells: obscuring mist, wind wall, gaseous form…"] },
  { id: "animal", name: "Animal", description: "Speak with Animals 1/day, Animal Companion at level −3.", extras: ["Class skill: Knowledge (nature)"] },
  { id: "artifice", name: "Artifice", description: "Artificer's Touch (1d6+½ CL, Wis uses/day), Dancing Weapons.", extras: ["Bonus spells: animate rope, wood shape…"] },
  { id: "chaos", name: "Chaos", description: "Touch of Chaos, Chaos Blade.", extras: ["Bonus spells: protection from law, shatter…"] },
  { id: "charm", name: "Charm", description: "Dazing Touch, Charming Smile.", extras: ["Bonus spells: charm person, calm emotions…"] },
  { id: "community", name: "Community", description: "Calming Touch, Unity.", extras: ["Class skill: Diplomacy"] },
  { id: "darkness", name: "Darkness", description: "Touch of Darkness, Eyes of Darkness.", extras: ["Class skill: Stealth"] },
  { id: "death", name: "Death", description: "Bleeding Touch, Death's Embrace.", extras: ["Bonus spells: cause fear, death knell…"] },
  { id: "destruction", name: "Destruction", description: "Destructive Smite (+½ CL melee damage, Wis uses/day), Destructive Aura.", extras: ["Bonus spells: true strike, shatter…"] },
  { id: "earth", name: "Earth", description: "Acid Dart, Acid Resistance.", extras: ["Bonus spells: magic stone, soften earth and stone…"] },
  { id: "evil", name: "Evil", description: "Touch of Evil, Scythe of Evil.", extras: ["Bonus spells: protection from good, desecrate…"] },
  { id: "fire", name: "Fire", description: "Fire Bolt (1d6+½ CL, Wis uses/day), Fire Resistance.", extras: ["Bonus spells: burning hands, produce flame…"] },
  { id: "glory", name: "Glory", description: "Touch of Glory, Divine Presence.", extras: ["Channel energy DC +2 vs. undead"] },
  { id: "good", name: "Good", description: "Touch of Good, Holy Lance.", extras: ["Bonus spells: protection from evil, holy smite…"] },
  { id: "healing", name: "Healing", description: "Rebuke Death, Healer's Blessing.", extras: ["Cure spells empowered as if Empower Spell"] },
  { id: "knowledge", name: "Knowledge", description: "Lore Keeper, Remote Viewing.", extras: ["All Knowledge skills are class skills; +½ level"],
    mods: { skillBonuses: { knowledge_arcana: 0, knowledge_dungeoneering: 0, knowledge_engineering: 0, knowledge_geography: 0, knowledge_history: 0, knowledge_local: 0, knowledge_nature: 0, knowledge_nobility: 0, knowledge_planes: 0, knowledge_religion: 0 } } },
  { id: "law", name: "Law", description: "Touch of Law, Staff of Order.", extras: ["Bonus spells: protection from chaos, calm emotions…"] },
  { id: "liberation", name: "Liberation", description: "Liberation (rounds/day = ½ level), Freedom's Call.", extras: ["Bonus spells: remove fear, remove paralysis…"] },
  { id: "luck", name: "Luck", description: "Bit of Luck (Wis uses/day), Good Fortune.", extras: ["Bonus spells: true strike, aid…"] },
  { id: "madness", name: "Madness", description: "Vision of Madness, Aura of Madness.", extras: ["Bonus spells: lesser confusion, touch of idiocy…"] },
  { id: "magic", name: "Magic", description: "Hand of the Acolyte, Dispelling Touch.", extras: ["Bonus spells: identify, magic missile…"] },
  { id: "nobility", name: "Nobility", description: "Inspiring Word, Noble Leadership.", extras: ["Bonus spells: divine favor, enthrall…"] },
  { id: "plant", name: "Plant", description: "Wooden Fist (+1 to ½ CL melee damage), Bramble Armor.", extras: ["Class skill: Knowledge (nature)"] },
  { id: "protection", name: "Protection", description: "Resistant Touch, Aura of Protection.", extras: ["+1 resistance bonus on saves (scales)"] },
  { id: "repose", name: "Repose", description: "Gentle Rest, Ward Against Death.", extras: ["Bonus spells: deathwatch, gentle repose…"] },
  { id: "rune", name: "Rune", description: "Blast Rune, Spell Rune.", extras: ["Bonus spells: erase, secret page…"] },
  { id: "strength", name: "Strength", description: "Strength Surge (Wis uses/day), Might of the Gods.", extras: ["Bonus spells: enlarge person, bull's strength…"] },
  { id: "sun", name: "Sun", description: "Sun's Blessing, Nimbus of Light.", extras: ["+½ CL damage when channeling against undead"] },
  { id: "travel", name: "Travel", description: "Agile Feet, Dimensional Hop.", extras: ["+10 ft. base speed"], mods: { speed: 10 } },
  { id: "trickery", name: "Trickery", description: "Copycat, Master's Illusion.", extras: ["Bluff, Disguise, Stealth class skills"],
    mods: { skillBonuses: {} } },
  { id: "war", name: "War", description: "Battle Rage (+½ CL melee damage, Wis uses/day), Weapon Master.", extras: ["Bonus spells: magic weapon, spiritual weapon…"] },
  { id: "water", name: "Water", description: "Icicle, Cold Resistance.", extras: ["Bonus spells: obscuring mist, fog cloud…"] },
  { id: "weather", name: "Weather", description: "Storm Burst, Lightning Lord.", extras: ["Bonus spells: obscuring mist, fog cloud…"] },
];

// ---------- SORCERER: Bloodlines ----------
export const SORCERER_BLOODLINES: ClassOption[] = [
  { id: "aberrant", name: "Aberrant", description: "Long-limbed (reach), DR/—, Acidic Ray. Polymorph effects last 50% longer.", extras: ["Class skill: Knowledge (dungeoneering)"] },
  { id: "abyssal", name: "Abyssal", description: "Claws, demon resistance, immunities. Summon Monster gains DR/good.", extras: ["Class skill: Knowledge (planes)"] },
  { id: "arcane", name: "Arcane", description: "Arcane Bond (familiar or item), metamagic adept, school power. +1 spell level on metamagic.", extras: ["Class skill: Knowledge (any one)"] },
  { id: "celestial", name: "Celestial", description: "Heavenly Fire (ranged touch), celestial resistances. Divine HP-restoring spells +1 CL.", extras: ["Class skill: Heal"], mods: { skillBonuses: { heal: 0 } } },
  { id: "destined", name: "Destined", description: "Touch of Destiny, fated effort, scion of legend.", extras: ["+1 luck save vs. spells", "Class skill: Knowledge (history)"] },
  { id: "draconic", name: "Draconic", description: "Claws, draconic resistance, dragon wings, breath weapon. +1 damage per die with one energy type.", extras: ["Class skill: Perception"], mods: { skillBonuses: { perception: 0 } } },
  { id: "elemental", name: "Elemental", description: "Elemental Ray, elemental resistance, elemental movement. +1 damage per die on bloodline element spells.", extras: ["Class skill: Knowledge (planes)"] },
  { id: "fey", name: "Fey", description: "Laughing Touch, woodland stride, fleeting glance. Compulsion spells +2 DC.", extras: ["Class skill: Knowledge (nature)"] },
  { id: "infernal", name: "Infernal", description: "Corrupting Touch, infernal resistances, hellfire. Charm spells +2 DC.", extras: ["Class skill: Diplomacy"] },
  { id: "undead", name: "Undead", description: "Grave Touch, deathless ally, grasp of the dead. Treats undead as humanoid for charm.", extras: ["Class skill: Knowledge (religion)"] },
];

// ---------- DRUID: Nature Bond ----------
export const DRUID_NATURE_BONDS: ClassOption[] = [
  { id: "animal_companion", name: "Animal Companion", description: "An animal mystically bonded to you (effective level = druid)." },
  { id: "domain", name: "Cleric Domain", description: "Pick one cleric domain from a limited list (Air, Animal, Earth, Fire, Plant, Water, Weather) — grants its powers but not bonus spells." },
];

// ---------- RANGER: Favored Enemy ----------
export const RANGER_FAVORED_ENEMIES: ClassOption[] = [
  { id: "aberration", name: "Aberration", description: "+2 attack, damage, Bluff/Knowledge/Perception/Sense Motive/Survival vs. type." },
  { id: "animal", name: "Animal", description: "+2 attack, damage, related skills vs. type." },
  { id: "construct", name: "Construct", description: "+2 attack, damage, related skills vs. type." },
  { id: "dragon", name: "Dragon", description: "+2 attack, damage, related skills vs. type." },
  { id: "fey", name: "Fey", description: "+2 attack, damage, related skills vs. type." },
  { id: "giant", name: "Humanoid (Giant)", description: "+2 attack, damage, related skills vs. type." },
  { id: "humanoid_human", name: "Humanoid (Human)", description: "+2 attack, damage, related skills vs. type." },
  { id: "humanoid_orc", name: "Humanoid (Orc/Goblinoid)", description: "+2 attack, damage, related skills vs. type." },
  { id: "humanoid_elf", name: "Humanoid (Elf/Gnome/Halfling)", description: "+2 attack, damage, related skills vs. type." },
  { id: "humanoid_reptilian", name: "Humanoid (Reptilian)", description: "+2 attack, damage, related skills vs. type." },
  { id: "magical_beast", name: "Magical Beast", description: "+2 attack, damage, related skills vs. type." },
  { id: "monstrous_humanoid", name: "Monstrous Humanoid", description: "+2 attack, damage, related skills vs. type." },
  { id: "ooze", name: "Ooze", description: "+2 attack, damage, related skills vs. type." },
  { id: "outsider_evil", name: "Outsider (Evil)", description: "+2 attack, damage, related skills vs. type." },
  { id: "outsider_good", name: "Outsider (Good)", description: "+2 attack, damage, related skills vs. type." },
  { id: "plant", name: "Plant", description: "+2 attack, damage, related skills vs. type." },
  { id: "undead", name: "Undead", description: "+2 attack, damage, related skills vs. type." },
  { id: "vermin", name: "Vermin", description: "+2 attack, damage, related skills vs. type." },
];

// ---------- RANGER: Favored Terrain ----------
export const RANGER_FAVORED_TERRAINS: ClassOption[] = [
  { id: "cold", name: "Cold (ice, glaciers, snow, tundra)", description: "+2 initiative and to Knowledge (geography), Perception, Stealth, Survival in this terrain." },
  { id: "desert", name: "Desert", description: "+2 initiative and to associated skills in this terrain." },
  { id: "forest", name: "Forest", description: "+2 initiative and to associated skills in this terrain." },
  { id: "jungle", name: "Jungle", description: "+2 initiative and to associated skills in this terrain." },
  { id: "mountain", name: "Mountain", description: "+2 initiative and to associated skills in this terrain." },
  { id: "plains", name: "Plains", description: "+2 initiative and to associated skills in this terrain." },
  { id: "planes_outsider", name: "Planes (specific)", description: "+2 initiative and to associated skills in the chosen plane." },
  { id: "swamp", name: "Swamp", description: "+2 initiative and to associated skills in this terrain." },
  { id: "underground", name: "Underground (caves and dungeons)", description: "+2 initiative and to associated skills in this terrain." },
  { id: "urban", name: "Urban", description: "+2 initiative and to associated skills in this terrain." },
  { id: "water", name: "Water (above and below)", description: "+2 initiative and to associated skills in this terrain." },
];

// ---------- RANGER: Combat Style ----------
export const RANGER_COMBAT_STYLES: ClassOption[] = [
  { id: "archery", name: "Archery", description: "Gain ranged combat feats as bonus feats at 2nd, 6th, 10th, 14th, 18th.", extras: ["L2: Far Shot, Point-Blank Shot, Precise Shot, or Rapid Shot"] },
  { id: "crossbow", name: "Crossbow", description: "Crossbow-style bonus feats at 2nd, 6th, 10th, 14th, 18th." },
  { id: "mounted", name: "Mounted Combat", description: "Mounted bonus feats at 2nd, 6th, 10th, 14th, 18th." },
  { id: "natural_weapon", name: "Natural Weapon", description: "Natural weapon bonus feats at 2nd, 6th, 10th, 14th, 18th." },
  { id: "two_handed_weapon", name: "Two-Handed Weapon", description: "Two-handed weapon bonus feats." },
  { id: "two_weapon", name: "Two-Weapon Combat", description: "Two-weapon fighting bonus feats at 2nd, 6th, 10th, 14th, 18th.", extras: ["L2: Double Slice, Improved Shield Bash, Quick Draw, or Two-Weapon Fighting"] },
  { id: "weapon_and_shield", name: "Weapon and Shield", description: "Weapon-and-shield bonus feats." },
];

// ---------- PALADIN: Mercies ----------
export const PALADIN_MERCIES: ClassOption[] = [
  { id: "fatigued", name: "Fatigued (L3)", description: "Lay on hands also removes the fatigued condition." },
  { id: "shaken", name: "Shaken (L3)", description: "Lay on hands also removes the shaken condition." },
  { id: "sickened", name: "Sickened (L3)", description: "Lay on hands also removes the sickened condition." },
  { id: "dazed", name: "Dazed (L6)", description: "Lay on hands also removes the dazed condition." },
  { id: "diseased", name: "Diseased (L6)", description: "Lay on hands cures diseases (as remove disease at CL = paladin level)." },
  { id: "staggered", name: "Staggered (L6)", description: "Lay on hands also removes the staggered condition." },
  { id: "cursed", name: "Cursed (L9)", description: "Lay on hands acts as remove curse." },
  { id: "exhausted", name: "Exhausted (L9)", description: "Lay on hands also removes the exhausted condition (must already have Fatigued mercy)." },
  { id: "frightened", name: "Frightened (L9)", description: "Lay on hands also removes the frightened condition (must already have Shaken mercy)." },
  { id: "nauseated", name: "Nauseated (L9)", description: "Lay on hands also removes the nauseated condition (must already have Sickened mercy)." },
  { id: "poisoned", name: "Poisoned (L9)", description: "Lay on hands neutralizes poison (CL = paladin level)." },
  { id: "blinded", name: "Blinded (L12)", description: "Lay on hands also removes the blinded condition." },
  { id: "deafened", name: "Deafened (L12)", description: "Lay on hands also removes the deafened condition." },
  { id: "paralyzed", name: "Paralyzed (L12)", description: "Lay on hands also removes the paralyzed condition." },
  { id: "stunned", name: "Stunned (L12)", description: "Lay on hands also removes the stunned condition." },
];

// ---------- PALADIN: Divine Bond ----------
export const PALADIN_DIVINE_BONDS: ClassOption[] = [
  { id: "mount", name: "Mount", description: "Bonded with an intelligent, divine mount (effective level = paladin)." },
  { id: "weapon", name: "Weapon", description: "Weapon gains a divine enhancement bonus (+1 per 3 levels, max +6 effective)." },
];

// ---------- Per-class declaration of which choices apply ----------
export interface ClassChoiceMap {
  [classId: string]: ChoiceSpec[];
}

export const CLASS_CHOICES: ClassChoiceMap = {
  wizard: [
    { key: "school", label: "Arcane School", level: 1, options: WIZARD_SCHOOLS,
      description: "Choose your specialty school. Non-Universalists also pick two opposition schools (free-form)." },
    { key: "transmutation_physical", label: "Transmutation: Physical Enhancement", level: 1,
      options: TRANSMUTATION_PHYSICAL,
      description: "Pick one physical ability score to receive the +1 enhancement (only if Transmutation school)." },
  ],
  cleric: [
    { key: "domains", label: "Domains", level: 1, multi: 2, options: CLERIC_DOMAINS,
      description: "Choose two of your deity's allowed domains." },
  ],
  sorcerer: [
    { key: "bloodline", label: "Bloodline", level: 1, options: SORCERER_BLOODLINES,
      description: "Your innate magical heritage. Determines bonus spells, feats, class skill, and powers." },
  ],
  druid: [
    { key: "nature_bond", label: "Nature Bond", level: 1, options: DRUID_NATURE_BONDS },
  ],
  ranger: [
    { key: "favored_enemy", label: "Favored Enemy", level: 1, options: RANGER_FAVORED_ENEMIES,
      description: "Additional favored enemies at L5, L10, L15, L20." },
    { key: "combat_style", label: "Combat Style", level: 2, options: RANGER_COMBAT_STYLES },
    { key: "favored_terrain", label: "Favored Terrain", level: 3, options: RANGER_FAVORED_TERRAINS,
      description: "Additional favored terrains at L8, L13, L18." },
  ],
  paladin: [
    { key: "mercies", label: "Mercies", level: 3, multi: 1, options: PALADIN_MERCIES,
      description: "Gain one mercy at 3rd, 6th, 9th, 12th, 15th, and 18th level." },
    { key: "divine_bond", label: "Divine Bond", level: 5, options: PALADIN_DIVINE_BONDS },
  ],
};

// Helper: lookup the option object for a given choice
export function findClassOption(
  classId: string,
  choiceKey: string,
  optionId: string,
): ClassOption | undefined {
  const specs = CLASS_CHOICES[classId];
  if (!specs) return undefined;
  const spec = specs.find((s) => s.key === choiceKey);
  if (!spec) return undefined;
  return spec.options.find((o) => o.id === optionId);
}
