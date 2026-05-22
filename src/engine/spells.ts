import type { Spell, DerivedStats, Character } from "../types/pathfinder";
import { CLASSES_BY_ID } from "../data/classes/core";
import { parseFeatId } from ".";

// External link to the canonical OGL reference for a spell on Archives of Nethys.
// Used as a "look up the full description" affordance in the UI.
export function spellReferenceUrl(spell: Spell): string {
  return `https://aonprd.com/SpellDisplay.aspx?ItemName=${encodeURIComponent(spell.name)}`;
}

// Returns the +DC contribution from Spell Focus and Greater Spell Focus
// for a spell of the given school on the given character. Each feat gives
// +1; they stack for +2 in the same school.
function spellFocusBonus(school: string, character: Character | undefined): number {
  if (!character) return 0;
  const ids = [
    ...(character.startingFeats ?? []),
    ...character.classLevels.flatMap((cl) => cl.chosenFeats ?? []),
  ];
  let bonus = 0;
  for (const fid of ids) {
    const { baseId, target } = parseFeatId(fid);
    if ((baseId === "spell_focus" || baseId === "greater_spell_focus") && target === school) {
      bonus += 1;
    }
  }
  return bonus;
}

// Computes the save DC for a spell when cast by this character, using the given class.
// Returns null if the class can't cast it (not on the list, or no spellcasting).
// Passing `character` factors in Spell Focus / Greater Spell Focus.
export function spellDC(
  spell: Spell,
  derived: DerivedStats,
  classId: string,
  character?: Character,
): number | null {
  const klass = CLASSES_BY_ID[classId];
  if (!klass?.spellcasting) return null;
  const lvl = spell.levels[klass.spellcasting.list];
  if (lvl === undefined || lvl === null || lvl < 0) return null;
  const mod = derived.abilityMods[klass.spellcasting.ability];
  return 10 + lvl + mod + spellFocusBonus(spell.school, character);
}

// Computes the damage dice/expression for a spell at a given caster level, where the
// spell scales with level. Returns null for spells with no scaling damage.
//
// This is hand-coded per spell rather than driven by a formula schema, because PF1
// scaling patterns vary enough that the table would be larger than the explicit cases.
export function spellDamage(spellId: string, casterLevel: number): string | null {
  const cl = Math.max(1, casterLevel);
  switch (spellId) {
    // ---- Cantrips ----
    case "acid_splash":
      return "1d3 acid";
    case "ray_of_frost":
      return "1d3 cold";
    case "disrupt_undead":
      return "1d6 vs undead";
    case "touch_of_fatigue":
      return "fatigued (Fort negates)";
    case "bleed":
      return "1 bleed/round (Fort negates)";
    case "daze":
      return "lose next action (Will negates, 4 HD max)";

    // ---- 1st-level damage ----
    case "magic_missile": {
      const n = Math.min(5, Math.floor((cl + 1) / 2));
      return `${n} missile${n > 1 ? "s" : ""}, each 1d4+1 force`;
    }
    case "burning_hands":
      return `${Math.min(cl, 5)}d4 fire`;
    case "shocking_grasp":
      return `${Math.min(cl, 5)}d6 electricity (+3 attack vs. metal-armored)`;
    case "magic_missile_extra":
      return `${cl}d4 force`;
    case "ray_of_enfeeblement":
      return `target takes 1d6+${Math.min(Math.floor(cl / 2), 5)} Str (Fort partial)`;
    case "chill_touch":
      return `1d6 negative + 1 Str (Fort partial); undead flee (Will)`;
    case "ear_piercing_scream":
      return `${Math.min(Math.ceil(cl / 4), 4)}d6 sonic + dazed (Fort partial)`;
    case "cure_light_wounds":
    case "inflict_light_wounds":
      return `1d8 + ${Math.min(cl, 5)}`;

    // ---- 2nd-level damage ----
    case "scorching_ray": {
      const rays = cl >= 11 ? 3 : cl >= 7 ? 2 : 1;
      return `${rays} ray${rays > 1 ? "s" : ""}, each 4d6 fire (ranged touch)`;
    }
    case "acid_arrow":
      return `2d4 acid now + 2d4/round for ${1 + Math.floor(cl / 3)} round${1 + Math.floor(cl / 3) > 1 ? "s" : ""}`;
    case "flaming_sphere":
      return `3d6 fire (Reflex negates)`;
    case "cure_moderate_wounds":
    case "inflict_moderate_wounds":
      return `2d8 + ${Math.min(cl, 10)}`;
    case "sound_burst":
      return `1d8 sonic + stun (Fort partial)`;
    case "shatter":
      return `1d6/level sonic (max 5d6) to one object`;
    case "flame_blade":
      return `1d8+${Math.min(Math.floor(cl / 2), 10)} fire (touch)`;

    // ---- 3rd-level damage ----
    case "fireball":
      return `${Math.min(cl, 10)}d6 fire (Reflex half)`;
    case "lightning_bolt":
      return `${Math.min(cl, 10)}d6 electricity (Reflex half)`;
    case "vampiric_touch":
      return `${Math.min(Math.floor(cl / 2), 10)}d6 negative (gain HP equal to damage as temp HP)`;
    case "searing_light":
      return `${Math.min(Math.floor(cl / 2), 5)}d8 vs. undead (or 1d6/2 levels normal, ranged touch)`;
    case "call_lightning":
      return `3d6 electricity per bolt (Reflex half); 1 bolt/level`;
    case "cure_serious_wounds":
    case "inflict_serious_wounds":
      return `3d8 + ${Math.min(cl, 15)}`;
    case "stinking_cloud":
      return `nauseated (Fort negates) for ${cl} round${cl > 1 ? "s" : ""}`;

    // ---- 4th-level damage ----
    case "ice_storm":
      return "3d6 bludgeoning + 2d6 cold (Reflex half, 20-ft radius)";
    case "wall_of_fire":
      return `2d4 fire passing through; 2d6 within 10 ft, 1d6 within 20 ft`;
    case "enervation":
      return `1d4 negative levels (ranged touch)`;
    case "phantasmal_killer":
      return "death on failed Will; 3d6 damage on failed Fort";
    case "cure_critical_wounds":
    case "inflict_critical_wounds":
      return `4d8 + ${Math.min(cl, 20)}`;
    case "shout":
      return "5d6 sonic + deafened (Fort partial)";

    // ---- 5th-level damage ----
    case "cone_of_cold":
      return `${Math.min(cl, 15)}d6 cold (Reflex half)`;
    case "cloudkill":
      return "1d4 Con/round (Fort partial); kills HD ≤3 outright";
    case "flame_strike":
      return `${Math.min(cl, 15)}d6 (half fire, half divine; Reflex half)`;
    case "wall_of_force":
      return "impassable wall";
    case "mass_cure_light_wounds":
      return `1d8 + ${Math.min(cl, 25)} to each ally`;

    // ---- 6th-level damage ----
    case "chain_lightning": {
      const secondary = Math.min(cl - 1, 20);
      return `${Math.min(cl, 20)}d6 primary + ${Math.floor(secondary / 2)} half-damage secondary targets (Reflex half)`;
    }
    case "circle_of_death":
      return `${Math.min(cl, 20)}d4 HD killed (Fort negates each)`;
    case "freezing_sphere":
      return `${Math.min(cl, 15)}d6 cold (Reflex half)`;
    case "disintegrate":
      return `${Math.min(2 * cl, 40)}d6 (5d6 on save) — Fort partial`;
    case "harm":
      return `10 HP/level damage, max 150 (Will half)`;
    case "heal":
      return `10 HP/level healed, max 150`;

    // ---- 7th-level damage ----
    case "delayed_blast_fireball":
      return `${Math.min(cl, 20)}d6 fire (Reflex half)`;
    case "finger_of_death":
      return `dies (Fort negates); 3d6+CL damage on save`;
    case "prismatic_spray":
      return "multiple random effects (8 colors)";

    // ---- 8th-level damage ----
    case "fire_storm":
      return `${Math.min(cl, 20)}d6 fire (Reflex half)`;
    case "horrid_wilting":
      return `${Math.min(cl, 20)}d6 (Fort half)`;
    case "polar_ray":
      return `${Math.min(cl, 25)}d6 cold + 1d4 Dex (ranged touch)`;
    case "sunburst":
      return `6d6 to all in burst; blinded permanently (Reflex partial)`;

    // ---- 9th-level damage ----
    case "meteor_swarm": {
      return `4 × 2d6 bludgeoning + 6d6 fire per meteor (Reflex half)`;
    }
    case "wail_of_the_banshee":
      return `dies (Fort negates); up to ${cl} creatures`;
    case "energy_drain":
      return `2d4 negative levels (ranged touch)`;
    case "implosion":
      return `${Math.min(Math.floor(cl / 2), 10)}d6 per round to one target (Fort negates)`;

    default:
      return null;
  }
}

// Returns true if this spell allows a saving throw.
export function hasSavingThrow(spell: Spell): boolean {
  return !!spell.savingThrow && !/^(no|none|—)$/i.test(spell.savingThrow);
}
