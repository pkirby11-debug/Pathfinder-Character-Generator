import type { Race } from "../../types/pathfinder";

// Pathfinder 1E Core Rulebook races (OGL).
export const CORE_RACES: Race[] = [
  {
    id: "human",
    name: "Human",
    source: "Core Rulebook",
    size: "Medium",
    speed: 30,
    abilityModifiers: {}, // +2 to any one ability score, applied via choice
    type: "humanoid (human)",
    languages: ["Common"],
    bonusLanguages: ["Any (except secret languages, such as Druidic)"],
    traits: [
      {
        name: "Bonus Feat",
        description:
          "Humans select one extra feat at 1st level.",
      },
      {
        name: "Skilled",
        description:
          "Humans gain an additional skill rank at first level and one additional rank whenever they gain a level.",
      },
      {
        name: "+2 to One Ability Score",
        description:
          "Human characters get a +2 bonus to one ability score of their choice at creation to represent their varied nature.",
      },
    ],
    description:
      "Ambitious, sometimes heroic, and often unpredictable, humans are the youngest of the common races, but compensate with their relatively prolific nature and exceptional drive.",
  },
  {
    id: "elf",
    name: "Elf",
    source: "Core Rulebook",
    size: "Medium",
    speed: 30,
    abilityModifiers: { dex: 2, int: 2, con: -2 },
    type: "humanoid (elf)",
    languages: ["Common", "Elven"],
    bonusLanguages: ["Celestial", "Draconic", "Gnoll", "Gnome", "Goblin", "Orc", "Sylvan"],
    traits: [
      { name: "Low-Light Vision", description: "Elves can see twice as far as humans in dim light." },
      {
        name: "Elven Immunities",
        description: "Elves are immune to magic sleep effects and gain a +2 racial saving throw bonus against enchantment spells and effects.",
      },
      {
        name: "Elven Magic",
        description:
          "Elves receive a +2 racial bonus on caster level checks made to overcome spell resistance. They also receive a +2 racial bonus on Spellcraft checks to identify the properties of magic items.",
        mods: { skillBonuses: { spellcraft: 2 } },
      },
      { name: "Keen Senses", description: "Elves receive a +2 racial bonus on Perception checks.",
        mods: { skillBonuses: { perception: 2 } } },
      {
        name: "Weapon Familiarity",
        description: "Elves are proficient with longbows (including composite longbows), longswords, rapiers, and shortbows (including composite shortbows), and treat any weapon with the word 'elven' in its name as a martial weapon.",
      },
    ],
  },
  {
    id: "dwarf",
    name: "Dwarf",
    source: "Core Rulebook",
    size: "Medium",
    speed: 20, // never modified by armor or encumbrance
    abilityModifiers: { con: 2, wis: 2, cha: -2 },
    type: "humanoid (dwarf)",
    languages: ["Common", "Dwarven"],
    bonusLanguages: ["Giant", "Gnome", "Goblin", "Orc", "Terran", "Undercommon"],
    traits: [
      { name: "Darkvision", description: "Dwarves can see in the dark up to 60 feet." },
      { name: "Defensive Training", description: "+4 dodge bonus to AC against monsters of the giant subtype." },
      { name: "Hatred", description: "+1 racial bonus on attack rolls against humanoids of the orc and goblinoid subtypes." },
      { name: "Hardy", description: "+2 racial bonus on saving throws against poison, spells, and spell-like abilities." },
      { name: "Stability", description: "+4 racial bonus to CMD when resisting bull rush or trip attempts while on the ground." },
      { name: "Greed", description: "+2 racial bonus on Appraise checks to determine the price of nonmagical goods that contain precious metals or gemstones." },
      { name: "Stonecunning", description: "+2 bonus on Perception checks to notice unusual stonework. They receive a check to notice such features whenever they pass within 10 feet of them, whether or not they are actively looking." },
      {
        name: "Weapon Familiarity",
        description: "Dwarves are proficient with battleaxes, heavy picks, and warhammers, and treat any weapon with the word 'dwarven' in its name as a martial weapon.",
      },
      { name: "Slow and Steady", description: "Dwarves have a base speed of 20 feet, but their speed is never modified by armor or encumbrance." },
    ],
  },
  {
    id: "halfling",
    name: "Halfling",
    source: "Core Rulebook",
    size: "Small",
    speed: 20,
    abilityModifiers: { dex: 2, cha: 2, str: -2 },
    type: "humanoid (halfling)",
    languages: ["Common", "Halfling"],
    bonusLanguages: ["Dwarven", "Elven", "Gnome", "Goblin"],
    traits: [
      { name: "Fearless", description: "+2 racial bonus on saving throws against fear.",
        mods: { saves: { vsFear: 2 } } },
      { name: "Halfling Luck", description: "+1 racial bonus on all saving throws.",
        mods: { saves: { all: 1 } } },
      { name: "Sure-Footed", description: "+2 racial bonus on Acrobatics and Climb checks.",
        mods: { skillBonuses: { acrobatics: 2, climb: 2 } } },
      { name: "Keen Senses", description: "+2 racial bonus on Perception checks.",
        mods: { skillBonuses: { perception: 2 } } },
      { name: "Weapon Familiarity", description: "Halflings are proficient with slings and treat any weapon with the word 'halfling' in its name as a martial weapon." },
    ],
  },
  {
    id: "gnome",
    name: "Gnome",
    source: "Core Rulebook",
    size: "Small",
    speed: 20,
    abilityModifiers: { con: 2, cha: 2, str: -2 },
    type: "humanoid (gnome)",
    languages: ["Common", "Gnome", "Sylvan"],
    bonusLanguages: ["Draconic", "Dwarven", "Elven", "Giant", "Goblin", "Orc"],
    traits: [
      { name: "Low-Light Vision", description: "Gnomes can see twice as far as humans in dim light." },
      { name: "Defensive Training", description: "+4 dodge bonus to AC against monsters of the giant subtype." },
      { name: "Gnome Magic", description: "+1 to the DC of any illusion spells they cast. Spell-like abilities (1/day): dancing lights, ghost sound, prestidigitation, and speak with animals. Caster level equals the gnome's level." },
      { name: "Hatred", description: "+1 racial bonus on attack rolls against humanoids of the reptilian and goblinoid subtypes." },
      { name: "Illusion Resistance", description: "+2 racial saving throw bonus against illusion spells or effects." },
      { name: "Keen Senses", description: "+2 racial bonus on Perception checks.",
        mods: { skillBonuses: { perception: 2 } } },
      { name: "Obsessive", description: "+2 racial bonus on a Craft or Profession skill of their choice." },
      { name: "Weapon Familiarity", description: "Gnomes treat any weapon with the word 'gnome' in its name as a martial weapon." },
    ],
  },
  {
    id: "half_elf",
    name: "Half-Elf",
    source: "Core Rulebook",
    size: "Medium",
    speed: 30,
    abilityModifiers: {}, // +2 to one ability score of choice
    type: "humanoid (elf, human)",
    languages: ["Common", "Elven"],
    bonusLanguages: ["Any (except secret languages, such as Druidic)"],
    traits: [
      { name: "+2 to One Ability Score", description: "Half-elves receive a +2 bonus to one ability score of their choice at creation." },
      { name: "Low-Light Vision", description: "Half-elves can see twice as far as humans in dim light." },
      { name: "Adaptability", description: "Half-elves receive Skill Focus as a bonus feat at 1st level." },
      { name: "Elf Blood", description: "Half-elves count as both elves and humans for any effect related to race." },
      { name: "Elven Immunities", description: "Half-elves are immune to magic sleep effects and gain a +2 racial saving throw bonus against enchantment spells and effects." },
      { name: "Keen Senses", description: "+2 racial bonus on Perception checks.",
        mods: { skillBonuses: { perception: 2 } } },
      { name: "Multitalented", description: "Half-elves choose two favored classes at first level and gain +1 hit point or +1 skill rank whenever they take a level in either one." },
    ],
  },
  {
    id: "half_orc",
    name: "Half-Orc",
    source: "Core Rulebook",
    size: "Medium",
    speed: 30,
    abilityModifiers: {}, // +2 to one ability score of choice
    type: "humanoid (human, orc)",
    languages: ["Common", "Orc"],
    bonusLanguages: ["Abyssal", "Draconic", "Giant", "Gnoll", "Goblin"],
    traits: [
      { name: "+2 to One Ability Score", description: "Half-orcs receive a +2 bonus to one ability score of their choice at creation." },
      { name: "Darkvision", description: "Half-orcs can see in the dark up to 60 feet." },
      { name: "Intimidating", description: "+2 racial bonus on Intimidate checks.",
        mods: { skillBonuses: { intimidate: 2 } } },
      { name: "Orc Blood", description: "Half-orcs count as both humans and orcs for any effect related to race." },
      { name: "Orc Ferocity", description: "Once per day, when a half-orc is brought below 0 hit points but not killed, he can fight on for 1 more round as if disabled." },
      { name: "Weapon Familiarity", description: "Half-orcs are proficient with greataxes and falchions and treat any weapon with the word 'orc' in its name as a martial weapon." },
    ],
  },
];

export const RACES_BY_ID: Record<string, Race> = Object.fromEntries(
  CORE_RACES.map((r) => [r.id, r]),
);
