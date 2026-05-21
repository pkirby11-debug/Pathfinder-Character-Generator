import type { Item, Weapon, Armor } from "../../types/pathfinder";

// Representative selection of Pathfinder 1E Core Rulebook equipment (OGL).
// The schema is open-ended; more items can be added at any time.

export const CORE_WEAPONS: Weapon[] = [
  // ---- Simple weapons ----
  { id: "dagger", name: "Dagger", source: "Core Rulebook", category: "weapon", proficiency: "simple", weaponType: "light", cost: 2, weight: 1, damage: { medium: "1d4", small: "1d3" }, critical: "19-20/×2", range: 10, damageType: "piercing or slashing" },
  { id: "club", name: "Club", source: "Core Rulebook", category: "weapon", proficiency: "simple", weaponType: "one_handed", cost: 0, weight: 3, damage: { medium: "1d6", small: "1d4" }, critical: "×2", range: 10, damageType: "bludgeoning" },
  { id: "quarterstaff", name: "Quarterstaff", source: "Core Rulebook", category: "weapon", proficiency: "simple", weaponType: "two_handed", cost: 0, weight: 4, damage: { medium: "1d6/1d6", small: "1d4/1d4" }, critical: "×2", damageType: "bludgeoning", special: ["double"] },
  { id: "light_crossbow", name: "Light Crossbow", source: "Core Rulebook", category: "weapon", proficiency: "simple", weaponType: "ranged", cost: 35, weight: 4, damage: { medium: "1d8", small: "1d6" }, critical: "19-20/×2", range: 80, damageType: "piercing" },
  { id: "heavy_crossbow", name: "Heavy Crossbow", source: "Core Rulebook", category: "weapon", proficiency: "simple", weaponType: "ranged", cost: 50, weight: 8, damage: { medium: "1d10", small: "1d8" }, critical: "19-20/×2", range: 120, damageType: "piercing" },
  { id: "shortspear", name: "Shortspear", source: "Core Rulebook", category: "weapon", proficiency: "simple", weaponType: "one_handed", cost: 1, weight: 3, damage: { medium: "1d6", small: "1d4" }, critical: "×2", range: 20, damageType: "piercing" },

  // ---- Martial ----
  { id: "longsword", name: "Longsword", source: "Core Rulebook", category: "weapon", proficiency: "martial", weaponType: "one_handed", cost: 15, weight: 4, damage: { medium: "1d8", small: "1d6" }, critical: "19-20/×2", damageType: "slashing" },
  { id: "rapier", name: "Rapier", source: "Core Rulebook", category: "weapon", proficiency: "martial", weaponType: "one_handed", cost: 20, weight: 2, damage: { medium: "1d6", small: "1d4" }, critical: "18-20/×2", damageType: "piercing", special: ["finesse"] },
  { id: "battleaxe", name: "Battleaxe", source: "Core Rulebook", category: "weapon", proficiency: "martial", weaponType: "one_handed", cost: 10, weight: 6, damage: { medium: "1d8", small: "1d6" }, critical: "×3", damageType: "slashing" },
  { id: "greataxe", name: "Greataxe", source: "Core Rulebook", category: "weapon", proficiency: "martial", weaponType: "two_handed", cost: 20, weight: 12, damage: { medium: "1d12", small: "1d10" }, critical: "×3", damageType: "slashing" },
  { id: "greatsword", name: "Greatsword", source: "Core Rulebook", category: "weapon", proficiency: "martial", weaponType: "two_handed", cost: 50, weight: 8, damage: { medium: "2d6", small: "1d10" }, critical: "19-20/×2", damageType: "slashing" },
  { id: "warhammer", name: "Warhammer", source: "Core Rulebook", category: "weapon", proficiency: "martial", weaponType: "one_handed", cost: 12, weight: 5, damage: { medium: "1d8", small: "1d6" }, critical: "×3", damageType: "bludgeoning" },
  { id: "shortbow", name: "Shortbow", source: "Core Rulebook", category: "weapon", proficiency: "martial", weaponType: "ranged", cost: 30, weight: 2, damage: { medium: "1d6", small: "1d4" }, critical: "×3", range: 60, damageType: "piercing" },
  { id: "longbow", name: "Longbow", source: "Core Rulebook", category: "weapon", proficiency: "martial", weaponType: "ranged", cost: 75, weight: 3, damage: { medium: "1d8", small: "1d6" }, critical: "×3", range: 100, damageType: "piercing" },
  { id: "scimitar", name: "Scimitar", source: "Core Rulebook", category: "weapon", proficiency: "martial", weaponType: "one_handed", cost: 15, weight: 4, damage: { medium: "1d6", small: "1d4" }, critical: "18-20/×2", damageType: "slashing" },
];

export const CORE_ARMOR: Armor[] = [
  // Light
  { id: "padded", name: "Padded", source: "Core Rulebook", category: "armor", armorType: "light", cost: 5, weight: 10, acBonus: 1, maxDex: 8, armorCheckPenalty: 0, arcaneSpellFailure: 5 },
  { id: "leather", name: "Leather", source: "Core Rulebook", category: "armor", armorType: "light", cost: 10, weight: 15, acBonus: 2, maxDex: 6, armorCheckPenalty: 0, arcaneSpellFailure: 10 },
  { id: "studded_leather", name: "Studded Leather", source: "Core Rulebook", category: "armor", armorType: "light", cost: 25, weight: 20, acBonus: 3, maxDex: 5, armorCheckPenalty: -1, arcaneSpellFailure: 15 },
  { id: "chain_shirt", name: "Chain Shirt", source: "Core Rulebook", category: "armor", armorType: "light", cost: 100, weight: 25, acBonus: 4, maxDex: 4, armorCheckPenalty: -2, arcaneSpellFailure: 20 },
  // Medium
  { id: "hide", name: "Hide", source: "Core Rulebook", category: "armor", armorType: "medium", cost: 15, weight: 25, acBonus: 4, maxDex: 4, armorCheckPenalty: -3, arcaneSpellFailure: 20, speed30: 20, speed20: 15 },
  { id: "scale_mail", name: "Scale Mail", source: "Core Rulebook", category: "armor", armorType: "medium", cost: 50, weight: 30, acBonus: 5, maxDex: 3, armorCheckPenalty: -4, arcaneSpellFailure: 25, speed30: 20, speed20: 15 },
  { id: "chainmail", name: "Chainmail", source: "Core Rulebook", category: "armor", armorType: "medium", cost: 150, weight: 40, acBonus: 6, maxDex: 2, armorCheckPenalty: -5, arcaneSpellFailure: 30, speed30: 20, speed20: 15 },
  { id: "breastplate", name: "Breastplate", source: "Core Rulebook", category: "armor", armorType: "medium", cost: 200, weight: 30, acBonus: 6, maxDex: 3, armorCheckPenalty: -4, arcaneSpellFailure: 25, speed30: 20, speed20: 15 },
  // Heavy
  { id: "splint_mail", name: "Splint Mail", source: "Core Rulebook", category: "armor", armorType: "heavy", cost: 200, weight: 45, acBonus: 7, maxDex: 0, armorCheckPenalty: -7, arcaneSpellFailure: 40, speed30: 20, speed20: 15 },
  { id: "banded_mail", name: "Banded Mail", source: "Core Rulebook", category: "armor", armorType: "heavy", cost: 250, weight: 35, acBonus: 7, maxDex: 1, armorCheckPenalty: -6, arcaneSpellFailure: 35, speed30: 20, speed20: 15 },
  { id: "half_plate", name: "Half-plate", source: "Core Rulebook", category: "armor", armorType: "heavy", cost: 600, weight: 50, acBonus: 8, maxDex: 0, armorCheckPenalty: -7, arcaneSpellFailure: 40, speed30: 20, speed20: 15 },
  { id: "full_plate", name: "Full Plate", source: "Core Rulebook", category: "armor", armorType: "heavy", cost: 1500, weight: 50, acBonus: 9, maxDex: 1, armorCheckPenalty: -6, arcaneSpellFailure: 35, speed30: 20, speed20: 15 },
  // Shields
  { id: "buckler", name: "Buckler", source: "Core Rulebook", category: "shield", armorType: "shield", cost: 5, weight: 5, acBonus: 1, maxDex: null, armorCheckPenalty: -1, arcaneSpellFailure: 5 },
  { id: "shield_light_wooden", name: "Light Wooden Shield", source: "Core Rulebook", category: "shield", armorType: "shield", cost: 3, weight: 5, acBonus: 1, maxDex: null, armorCheckPenalty: -1, arcaneSpellFailure: 5 },
  { id: "shield_heavy_wooden", name: "Heavy Wooden Shield", source: "Core Rulebook", category: "shield", armorType: "shield", cost: 7, weight: 10, acBonus: 2, maxDex: null, armorCheckPenalty: -2, arcaneSpellFailure: 15 },
  { id: "shield_heavy_steel", name: "Heavy Steel Shield", source: "Core Rulebook", category: "shield", armorType: "shield", cost: 20, weight: 15, acBonus: 2, maxDex: null, armorCheckPenalty: -2, arcaneSpellFailure: 15 },
  { id: "tower_shield", name: "Tower Shield", source: "Core Rulebook", category: "shield", armorType: "shield", cost: 30, weight: 45, acBonus: 4, maxDex: 2, armorCheckPenalty: -10, arcaneSpellFailure: 50 },
];

export const CORE_GEAR: Item[] = [
  { id: "backpack", name: "Backpack", source: "Core Rulebook", category: "adventuring_gear", cost: 2, weight: 2 },
  { id: "bedroll", name: "Bedroll", source: "Core Rulebook", category: "adventuring_gear", cost: 0.1, weight: 5 },
  { id: "blanket", name: "Blanket", source: "Core Rulebook", category: "adventuring_gear", cost: 0.5, weight: 3 },
  { id: "candle", name: "Candle", source: "Core Rulebook", category: "adventuring_gear", cost: 0.01, weight: 0 },
  { id: "chalk", name: "Chalk (1 piece)", source: "Core Rulebook", category: "adventuring_gear", cost: 0.01, weight: 0 },
  { id: "crowbar", name: "Crowbar", source: "Core Rulebook", category: "adventuring_gear", cost: 2, weight: 5 },
  { id: "flint_steel", name: "Flint and Steel", source: "Core Rulebook", category: "adventuring_gear", cost: 1, weight: 0 },
  { id: "grappling_hook", name: "Grappling Hook", source: "Core Rulebook", category: "adventuring_gear", cost: 1, weight: 4 },
  { id: "lantern_hooded", name: "Lantern, Hooded", source: "Core Rulebook", category: "adventuring_gear", cost: 7, weight: 2 },
  { id: "oil", name: "Oil (1 pint flask)", source: "Core Rulebook", category: "adventuring_gear", cost: 0.1, weight: 1 },
  { id: "rations_trail_per_day", name: "Rations, Trail (per day)", source: "Core Rulebook", category: "adventuring_gear", cost: 0.5, weight: 1 },
  { id: "rope_hemp_50ft", name: "Rope, Hemp (50 ft.)", source: "Core Rulebook", category: "adventuring_gear", cost: 1, weight: 10 },
  { id: "rope_silk_50ft", name: "Rope, Silk (50 ft.)", source: "Core Rulebook", category: "adventuring_gear", cost: 10, weight: 5 },
  { id: "torch", name: "Torch", source: "Core Rulebook", category: "adventuring_gear", cost: 0.01, weight: 1 },
  { id: "waterskin", name: "Waterskin", source: "Core Rulebook", category: "adventuring_gear", cost: 1, weight: 4 },
  { id: "thieves_tools", name: "Thieves' Tools", source: "Core Rulebook", category: "tool", cost: 30, weight: 1 },
  { id: "thieves_tools_masterwork", name: "Thieves' Tools, Masterwork", source: "Core Rulebook", category: "tool", cost: 100, weight: 2, description: "+2 circumstance bonus on Disable Device checks." },
  { id: "holy_symbol_wooden", name: "Holy Symbol, Wooden", source: "Core Rulebook", category: "adventuring_gear", cost: 1, weight: 0 },
  { id: "holy_symbol_silver", name: "Holy Symbol, Silver", source: "Core Rulebook", category: "adventuring_gear", cost: 25, weight: 1 },
  { id: "spell_component_pouch", name: "Spell Component Pouch", source: "Core Rulebook", category: "adventuring_gear", cost: 5, weight: 2 },
  { id: "spellbook_wizard", name: "Spellbook, Wizard's (blank)", source: "Core Rulebook", category: "adventuring_gear", cost: 15, weight: 3 },
];

export const ALL_ITEMS: Item[] = [...CORE_WEAPONS, ...CORE_ARMOR, ...CORE_GEAR];

export const ITEMS_BY_ID: Record<string, Item> = Object.fromEntries(
  ALL_ITEMS.map((i) => [i.id, i]),
);
