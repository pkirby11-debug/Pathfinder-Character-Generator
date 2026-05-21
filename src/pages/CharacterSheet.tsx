import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCharacterStore } from "../store/characters";
import { RACES_BY_ID } from "../data/races/core";
import { CLASSES_BY_ID } from "../data/classes/core";
import { FEATS_BY_ID } from "../data/feats/core";
import { ITEMS_BY_ID } from "../data/equipment/core";
import { SPELLS_BY_ID } from "../data/spells/core";
import { SKILLS } from "../data/skills/skills";
import { ABILITY_KEYS, ABILITY_NAMES, type AbilityKey } from "../types/pathfinder";
import { abilityModString, derive } from "../engine";
import { spellDC, spellDamage, spellReferenceUrl, hasSavingThrow } from "../engine/spells";
import { CONDITIONS, SPELL_BUFFS, EFFECTS_BY_ID, type Effect } from "../data/effects/catalog";

export function CharacterSheet() {
  const { id } = useParams();
  const character = useCharacterStore((s) => s.characters.find((c) => c.id === id));
  const updateCharacter = useCharacterStore((s) => s.update);
  const [hpDelta, setHpDelta] = useState<string>("");
  const [customCondition, setCustomCondition] = useState("");

  if (!character) {
    return (
      <div className="text-center py-12">
        <p>Character not found.</p>
        <Link to="/" className="btn-primary mt-4 inline-flex">Back to list</Link>
      </div>
    );
  }

  const d = derive(character);
  const race = RACES_BY_ID[character.raceId];

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(character, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${character.name.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 no-print">
        <Link to="/" className="btn-ghost">← Characters</Link>
        <Link to={`/character/${character.id}/wizard`} className="btn-secondary ml-auto">Edit</Link>
        <button className="btn-secondary" onClick={exportJson}>Export JSON</button>
        <button className="btn-primary" onClick={() => window.print()}>Print</button>
      </div>

      <article className="character-sheet bg-parchment-50 border-2 border-ink-700 rounded-md p-6 shadow-md">
        {/* Header */}
        <header className="border-b-2 border-ink-700 pb-3 mb-4">
          <div className="flex flex-wrap items-baseline gap-4">
            <h1 className="text-4xl">{character.name}</h1>
            <span className="text-sm text-ink-700">
              {race?.name} · {character.classLevels.map((cl) => `${CLASSES_BY_ID[cl.classId]?.name} ${cl.level}`).join(" / ") || "—"} · {character.alignment}
            </span>
          </div>
          {character.player && <p className="text-xs text-ink-700">Player: {character.player}</p>}
        </header>

        {/* Top row: abilities + combat block */}
        <section className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
          {ABILITY_KEYS.map((k) => {
            const current = d.abilityScores[k];
            const base = d.baseAbilityScores?.[k] ?? current;
            const changed = base !== current;
            return (
              <div key={k} className="stat-box">
                <div className="font-display text-xs uppercase">{ABILITY_NAMES[k]}</div>
                <div className={"text-2xl font-bold " + (changed ? (current < base ? "text-rust-600" : "text-emerald-700") : "")}>
                  {current}
                </div>
                <div className="text-sm">{abilityModString(d.abilityMods[k])}</div>
                {changed && (
                  <div className="text-xs text-ink-700">base {base}</div>
                )}
              </div>
            );
          })}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <HpTracker
            current={d.hp.current}
            max={d.hp.max}
            temp={character.tempHp ?? 0}
            nonlethal={character.nonlethalDamage ?? 0}
            hpDelta={hpDelta}
            setHpDelta={setHpDelta}
            applyDamage={(n) =>
              updateCharacter(character.id, {
                currentHp: Math.max(-d.hp.max, d.hp.current - n),
              })
            }
            applyHeal={(n) =>
              updateCharacter(character.id, {
                currentHp: Math.min(d.hp.max, d.hp.current + n),
              })
            }
            healToFull={() => updateCharacter(character.id, { currentHp: d.hp.max })}
            setTemp={(n) => updateCharacter(character.id, { tempHp: Math.max(0, n) })}
            setNonlethal={(n) =>
              updateCharacter(character.id, { nonlethalDamage: Math.max(0, n) })
            }
          />
          <Block title="Armor Class">
            <div className="text-3xl font-bold">{d.ac.total}</div>
            <div className="text-xs text-ink-700">
              touch {d.ac.touch} · flat-footed {d.ac.flatFooted}
            </div>
          </Block>
          <Block title="Initiative">
            <div className="text-3xl font-bold">{abilityModString(d.initiative)}</div>
          </Block>
        </section>

{/* Effects and ability modifiers move below saves */}

        <section className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <Block title="BAB">
            <div className="text-2xl font-bold">+{d.bab}</div>
          </Block>
          <Block title="CMB">
            <div className="text-2xl font-bold">{abilityModString(d.cmb)}</div>
          </Block>
          <Block title="CMD">
            <div className="text-2xl font-bold">{d.cmd}</div>
          </Block>
          <Block title="Speed">
            <div className="text-2xl font-bold">{d.speed} ft.</div>
            <div className="text-xs">{d.size}</div>
          </Block>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {(["fort", "ref", "will"] as const).map((s) => (
            <Block key={s} title={s === "fort" ? "Fortitude" : s === "ref" ? "Reflex" : "Will"}>
              <div className="text-2xl font-bold">{abilityModString(d.saves[s].total)}</div>
              <div className="text-xs text-ink-700">
                base {d.saves[s].base} + ability {abilityModString(d.saves[s].ability)}
                {d.saves[s].misc !== 0 && ` + misc ${abilityModString(d.saves[s].misc)}`}
              </div>
            </Block>
          ))}
        </section>

        <EffectsPanel
          activeIds={character.activeEffectIds ?? []}
          customEffects={character.customEffects ?? []}
          customLabel={customCondition}
          setCustomLabel={setCustomCondition}
          toggleEffect={(eid) => {
            const set = new Set(character.activeEffectIds ?? []);
            if (set.has(eid)) set.delete(eid);
            else set.add(eid);
            updateCharacter(character.id, { activeEffectIds: Array.from(set) });
          }}
          addCustom={() => {
            const v = customCondition.trim();
            if (!v) return;
            const newEffect: Effect = {
              id: `custom_${Date.now()}`,
              name: v,
              source: "custom",
            };
            updateCharacter(character.id, {
              customEffects: [...(character.customEffects ?? []), newEffect],
              activeEffectIds: [...(character.activeEffectIds ?? []), newEffect.id],
            });
            setCustomCondition("");
          }}
          removeCustom={(eid) => {
            updateCharacter(character.id, {
              customEffects: (character.customEffects ?? []).filter((e) => e.id !== eid),
              activeEffectIds: (character.activeEffectIds ?? []).filter((x) => x !== eid),
            });
          }}
        />

        <AbilityModifiersPanel
          abilityDamage={character.abilityDamage ?? {}}
          abilityDrain={character.abilityDrain ?? {}}
          negativeLevels={character.negativeLevels ?? 0}
          baseScores={d.baseAbilityScores ?? d.abilityScores}
          currentScores={d.abilityScores}
          setDamage={(k, n) =>
            updateCharacter(character.id, {
              abilityDamage: { ...character.abilityDamage, [k]: Math.max(0, n) },
            })
          }
          setDrain={(k, n) =>
            updateCharacter(character.id, {
              abilityDrain: { ...character.abilityDrain, [k]: Math.max(0, n) },
            })
          }
          setNegativeLevels={(n) =>
            updateCharacter(character.id, { negativeLevels: Math.max(0, n) })
          }
          clearAll={() =>
            updateCharacter(character.id, {
              abilityDamage: {},
              abilityDrain: {},
              negativeLevels: 0,
            })
          }
        />

        {/* Attacks */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="font-display border-b border-ink-700 mb-1">Attacks</h3>
            <ul className="text-sm">
              <li>Melee: <strong>{abilityModString(d.attacks.melee)}</strong></li>
              <li>Ranged: <strong>{abilityModString(d.attacks.ranged)}</strong></li>
              <li>CMB: <strong>{abilityModString(d.attacks.cmb)}</strong></li>
            </ul>
            <div className="mt-2">
              <h4 className="font-display text-sm">Equipped weapons</h4>
              <ul className="text-sm list-disc ml-5">
                {character.inventory
                  .filter((i) => i.equipped && ITEMS_BY_ID[i.itemId]?.category === "weapon")
                  .map((i) => {
                    const w = ITEMS_BY_ID[i.itemId] as import("../types/pathfinder").Weapon;
                    return (
                      <li key={i.itemId}>
                        {w.name} — {w.damage.medium} {w.damageType} ({w.critical})
                        {w.range ? `, range ${w.range} ft.` : ""}
                      </li>
                    );
                  })}
              </ul>
            </div>
          </div>
          <div>
            <h3 className="font-display border-b border-ink-700 mb-1">Carrying Capacity</h3>
            <ul className="text-sm">
              <li>Light: up to {d.carryingCapacity.light} lb</li>
              <li>Medium: up to {d.carryingCapacity.medium} lb</li>
              <li>Heavy: up to {d.carryingCapacity.heavy} lb</li>
            </ul>
          </div>
        </section>

        {/* Skills */}
        <section className="mb-4">
          <h3 className="font-display border-b border-ink-700 mb-2">Skills</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 text-sm">
            {SKILLS.map((s) => {
              const sk = d.skills[s.id];
              if (!sk) return null;
              return (
                <div key={s.id} className="flex justify-between border-b border-parchment-300 py-0.5">
                  <span>
                    {s.name}
                    {sk.classSkillBonus > 0 && <span className="text-xs ml-1 text-rust-600">★</span>}
                    <span className="text-xs ml-1 text-ink-700">({s.ability})</span>
                  </span>
                  <span className="font-bold">
                    {abilityModString(sk.total)}
                    <span className="text-xs ml-1 text-ink-700">[{sk.ranks}r]</span>
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Feats */}
        <section className="mb-4">
          <h3 className="font-display border-b border-ink-700 mb-2">Feats</h3>
          <ul className="text-sm grid grid-cols-1 md:grid-cols-2 gap-x-6">
            {(character.startingFeats ?? []).map((id) => {
              const f = FEATS_BY_ID[id];
              return f ? (
                <li key={id}>
                  <strong>{f.name}.</strong> <span className="text-ink-700">{f.benefit}</span>
                </li>
              ) : null;
            })}
          </ul>
        </section>

        {/* Racial traits & class features */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="font-display border-b border-ink-700 mb-2">Racial Traits</h3>
            <ul className="text-sm space-y-1">
              {race?.traits.map((t) => (
                <li key={t.name}>
                  <strong>{t.name}.</strong> <span className="text-ink-700">{t.description}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-display border-b border-ink-700 mb-2">Class Features</h3>
            <ul className="text-sm space-y-1">
              {character.classLevels.flatMap((cl) => {
                const klass = CLASSES_BY_ID[cl.classId];
                if (!klass) return [];
                return klass.features
                  .filter((f) => f.level <= cl.level)
                  .map((f) => (
                    <li key={`${cl.classId}-${f.name}-${f.level}`}>
                      <strong>{f.name}</strong> <span className="text-xs text-ink-700">({klass.name} {f.level})</span>{" "}
                      <span className="text-ink-700">{f.description}</span>
                    </li>
                  ));
              })}
            </ul>
          </div>
        </section>

        {/* Spells */}
        {Object.keys(d.spellsPerDay).length > 0 && (
          <section className="mb-4">
            <h3 className="font-display border-b border-ink-700 mb-2">Spells</h3>
            {Object.entries(d.spellsPerDay).map(([classId, perDay]) => {
              const klass = CLASSES_BY_ID[classId];
              if (!klass?.spellcasting) return null;
              const bonus = d.bonusSpellsByAbility[classId] ?? [];
              const knownForClass = (character.knownSpells ?? []).filter((k) => k.classId === classId);
              const cl = character.classLevels.find((c) => c.classId === classId);
              const casterLevel = cl?.level ?? 1;
              return (
                <div key={classId} className="mb-3">
                  <h4 className="font-display">{klass.name}</h4>
                  <p className="text-xs text-ink-700">
                    Casting ability: {klass.spellcasting.ability.toUpperCase()} ·
                    {" "}{klass.spellcasting.type} · CL {casterLevel}
                  </p>
                  <table className="text-sm w-full max-w-md mt-1">
                    <thead>
                      <tr>
                        <th className="text-left">Lvl</th>
                        <th className="text-right">Per Day</th>
                        <th className="text-right">Bonus</th>
                        <th className="text-right">Save DC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {perDay.map((n, lvl) =>
                        n >= 0 ? (
                          <tr key={lvl} className="border-t border-parchment-300">
                            <td>{lvl}</td>
                            <td className="text-right">{n}</td>
                            <td className="text-right">{bonus[lvl] ? `+${bonus[lvl]}` : "—"}</td>
                            <td className="text-right">
                              {10 + lvl + d.abilityMods[klass.spellcasting!.ability]}
                            </td>
                          </tr>
                        ) : null,
                      )}
                    </tbody>
                  </table>
                  {knownForClass.length > 0 && (
                    <ul className="text-sm mt-2 space-y-0.5">
                      {knownForClass
                        .slice()
                        .sort((a, b) => a.level - b.level || a.spellId.localeCompare(b.spellId))
                        .map((k) => {
                          const s = SPELLS_BY_ID[k.spellId];
                          if (!s) return null;
                          const dc = spellDC(s, d, classId);
                          const dmg = spellDamage(s.id, casterLevel);
                          const save = hasSavingThrow(s);
                          return (
                            <li key={k.spellId} className="flex flex-wrap items-baseline gap-x-2">
                              <span className="text-xs text-ink-700">L{k.level}</span>
                              <strong>{s.name}</strong>
                              <span className="text-xs text-ink-700">{s.school}</span>
                              {save && dc !== null && (
                                <span className="text-xs">DC <strong>{dc}</strong></span>
                              )}
                              {dmg && <span className="text-xs">→ <strong>{dmg}</strong></span>}
                              <a
                                href={spellReferenceUrl(s)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-rust-600 hover:underline no-print ml-auto"
                              >
                                Look up ↗
                              </a>
                            </li>
                          );
                        })}
                    </ul>
                  )}
                </div>
              );
            })}
          </section>
        )}

        {/* Inventory */}
        <section>
          <h3 className="font-display border-b border-ink-700 mb-2">Inventory</h3>
          <ul className="text-sm grid grid-cols-1 md:grid-cols-2 gap-x-6">
            {character.inventory.map((i) => {
              const item = ITEMS_BY_ID[i.itemId];
              if (!item) return null;
              return (
                <li key={i.itemId} className="flex justify-between border-b border-parchment-300 py-0.5">
                  <span>
                    {i.quantity > 1 ? `${i.quantity}× ` : ""}
                    {item.name}
                    {i.equipped && <span className="text-xs ml-2 text-rust-600">(equipped)</span>}
                  </span>
                  <span className="text-xs text-ink-700">{item.weight}lb</span>
                </li>
              );
            })}
          </ul>
          <p className="text-sm mt-2">
            Coin: {character.money.pp}pp · {character.money.gp}gp · {character.money.sp}sp · {character.money.cp}cp
          </p>
        </section>
      </article>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-2 border-ink-700 rounded-md p-3 bg-parchment-100 text-center">
      <div className="text-xs font-display uppercase tracking-wider text-ink-700">{title}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

interface HpTrackerProps {
  current: number;
  max: number;
  temp: number;
  nonlethal: number;
  hpDelta: string;
  setHpDelta: (v: string) => void;
  applyDamage: (n: number) => void;
  applyHeal: (n: number) => void;
  healToFull: () => void;
  setTemp: (n: number) => void;
  setNonlethal: (n: number) => void;
}

function HpTracker({
  current,
  max,
  temp,
  nonlethal,
  hpDelta,
  setHpDelta,
  applyDamage,
  applyHeal,
  healToFull,
  setTemp,
  setNonlethal,
}: HpTrackerProps) {
  const parsed = Number(hpDelta) || 0;
  const ratio = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
  const barColor =
    ratio > 0.66 ? "bg-emerald-600" : ratio > 0.33 ? "bg-amber-500" : "bg-rust-600";
  const status =
    current <= -10
      ? "DEAD"
      : current < 0
      ? "DYING"
      : current === 0
      ? "DISABLED"
      : current <= max / 4
      ? "BLOODIED"
      : null;

  return (
    <div className="border-2 border-ink-700 rounded-md p-3 bg-parchment-100">
      <div className="flex items-baseline justify-between">
        <div className="text-xs font-display uppercase tracking-wider text-ink-700">Hit Points</div>
        {status && (
          <span className="text-xs font-bold text-rust-600 no-print">{status}</span>
        )}
      </div>
      <div className="flex items-baseline justify-center gap-2 mt-1">
        <span className="text-4xl font-bold">{current}</span>
        <span className="text-lg text-ink-700">/ {max}</span>
      </div>
      <div className="w-full h-2 bg-parchment-300 border border-ink-700 rounded-full mt-2 overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      {(temp > 0 || nonlethal > 0) && (
        <div className="text-xs mt-1 flex justify-center gap-3">
          {temp > 0 && <span className="text-emerald-700">+{temp} temp</span>}
          {nonlethal > 0 && <span className="text-amber-700">{nonlethal} nonlethal</span>}
        </div>
      )}
      <div className="no-print mt-3 space-y-1">
        <div className="flex gap-1">
          <input
            type="number"
            value={hpDelta}
            placeholder="amount"
            onChange={(e) => setHpDelta(e.target.value)}
            className="field text-center flex-1 min-w-0"
          />
          <button
            className="btn-secondary text-xs"
            onClick={() => {
              if (parsed > 0) {
                applyDamage(parsed);
                setHpDelta("");
              }
            }}
            title="Subtract from current HP"
          >
            − Damage
          </button>
          <button
            className="btn-secondary text-xs"
            onClick={() => {
              if (parsed > 0) {
                applyHeal(parsed);
                setHpDelta("");
              }
            }}
            title="Add to current HP"
          >
            + Heal
          </button>
        </div>
        <div className="flex gap-2 items-center justify-center text-xs">
          <button className="btn-ghost text-xs px-2 py-0.5" onClick={healToFull}>
            Full
          </button>
          <label className="flex items-center gap-1">
            Temp
            <input
              type="number"
              value={temp || ""}
              placeholder="0"
              onChange={(e) => setTemp(Number(e.target.value) || 0)}
              className="field w-14 text-center"
            />
          </label>
          <label className="flex items-center gap-1">
            Nonlethal
            <input
              type="number"
              value={nonlethal || ""}
              placeholder="0"
              onChange={(e) => setNonlethal(Number(e.target.value) || 0)}
              className="field w-14 text-center"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

interface EffectsPanelProps {
  activeIds: string[];
  customEffects: Effect[];
  customLabel: string;
  setCustomLabel: (v: string) => void;
  toggleEffect: (eid: string) => void;
  addCustom: () => void;
  removeCustom: (eid: string) => void;
}

function summarizeEffect(e: Effect): string {
  const parts: string[] = [];
  if (e.attack) parts.push(`${signed(e.attack)} attack`);
  if (e.meleeAttack) parts.push(`${signed(e.meleeAttack)} melee`);
  if (e.rangedAttack) parts.push(`${signed(e.rangedAttack)} ranged`);
  if (e.damage) parts.push(`${signed(e.damage)} dmg`);
  if (e.meleeDamage) parts.push(`${signed(e.meleeDamage)} melee dmg`);
  if (e.acBonus) parts.push(`${signed(e.acBonus)} AC`);
  if (e.armorBonus) parts.push(`${signed(e.armorBonus)} armor`);
  if (e.shieldBonus) parts.push(`${signed(e.shieldBonus)} shield`);
  if (e.naturalArmor) parts.push(`${signed(e.naturalArmor)} natural`);
  if (e.deflection) parts.push(`${signed(e.deflection)} deflection`);
  if (e.dodge) parts.push(`${signed(e.dodge)} dodge`);
  if (e.losesDexToAc) parts.push("no Dex to AC");
  if (e.saves?.all) parts.push(`${signed(e.saves.all)} saves`);
  if (e.saves?.fort) parts.push(`${signed(e.saves.fort)} Fort`);
  if (e.saves?.ref) parts.push(`${signed(e.saves.ref)} Ref`);
  if (e.saves?.will) parts.push(`${signed(e.saves.will)} Will`);
  if (e.saves?.vsFear) parts.push(`${signed(e.saves.vsFear)} vs fear`);
  if (e.skills) parts.push(`${signed(e.skills)} skills`);
  if (e.abilityChecks) parts.push(`${signed(e.abilityChecks)} ability checks`);
  if (e.abilityScores) {
    for (const [k, v] of Object.entries(e.abilityScores)) {
      if (typeof v === "number" && v !== 0) parts.push(`${signed(v)} ${k.toUpperCase()}`);
    }
  }
  if (e.initiative) parts.push(`${signed(e.initiative)} init`);
  if (e.cmb) parts.push(`${signed(e.cmb)} CMB`);
  if (e.cmd) parts.push(`${signed(e.cmd)} CMD`);
  if (e.speed) parts.push(`${signed(e.speed)} ft speed`);
  if (e.halfSpeed) parts.push("½ speed");
  if (e.extraAttack) parts.push("extra attack");
  return parts.join(", ");
}

function signed(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

function EffectsPanel({
  activeIds, customEffects, customLabel, setCustomLabel,
  toggleEffect, addCustom, removeCustom,
}: EffectsPanelProps) {
  const activeSet = new Set(activeIds);
  const activeList = activeIds
    .map((id) => EFFECTS_BY_ID[id] ?? customEffects.find((c) => c.id === id))
    .filter(Boolean) as Effect[];

  const buffsByCategory: Record<string, Effect[]> = {};
  for (const b of SPELL_BUFFS) {
    const cat = b.category ?? "Other";
    (buffsByCategory[cat] ??= []).push(b);
  }

  return (
    <section className="mb-4 space-y-3">
      {/* Active effects summary (also printed) */}
      {activeList.length > 0 && (
        <div className="border-2 border-ink-700 rounded-md p-3 bg-parchment-100">
          <h3 className="font-display border-b border-ink-700 mb-1">
            Active Effects ({activeList.length})
          </h3>
          <ul className="text-sm space-y-0.5">
            {activeList.map((e) => (
              <li key={e.id} className="flex justify-between gap-2">
                <span>
                  <strong>{e.name}.</strong>{" "}
                  <span className="text-ink-700">{summarizeEffect(e) || e.description}</span>
                </span>
                <button
                  className="text-xs btn-ghost no-print shrink-0"
                  onClick={() =>
                    e.source === "custom" ? removeCustom(e.id) : toggleEffect(e.id)
                  }
                  title="Remove"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="no-print">
        <h3 className="font-display border-b border-ink-700 mb-2">Conditions</h3>
        <div className="flex flex-wrap gap-1">
          {CONDITIONS.map((c) => {
            const on = activeSet.has(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleEffect(c.id)}
                title={c.description}
                className={
                  "text-xs px-2 py-1 rounded border transition-colors " +
                  (on
                    ? "bg-rust-600 text-parchment-50 border-rust-700"
                    : "bg-parchment-50 text-ink-800 border-ink-700 hover:bg-parchment-200")
                }
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="no-print">
        <h3 className="font-display border-b border-ink-700 mb-2">Buffs &amp; Debuffs</h3>
        <div className="space-y-2">
          {Object.entries(buffsByCategory).map(([cat, list]) => (
            <div key={cat}>
              <div className="text-xs uppercase tracking-wider text-ink-700">{cat}</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {list.map((b) => {
                  const on = activeSet.has(b.id);
                  return (
                    <button
                      key={b.id}
                      onClick={() => toggleEffect(b.id)}
                      title={b.description}
                      className={
                        "text-xs px-2 py-1 rounded border transition-colors " +
                        (on
                          ? "bg-rust-600 text-parchment-50 border-rust-700"
                          : "bg-parchment-50 text-ink-800 border-ink-700 hover:bg-parchment-200")
                      }
                    >
                      {b.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="no-print">
        <h3 className="font-display border-b border-ink-700 mb-2">Custom Effect</h3>
        <div className="flex gap-1">
          <input
            type="text"
            value={customLabel}
            placeholder="Name a custom effect (no mechanical mods)…"
            onChange={(e) => setCustomLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addCustom();
            }}
            className="field w-full max-w-md text-sm"
          />
          <button className="btn-secondary text-xs" onClick={addCustom}>
            Add
          </button>
        </div>
        <p className="text-xs text-ink-700 mt-1">
          Custom effects appear in the Active Effects list but apply no automatic modifiers.
        </p>
      </div>
    </section>
  );
}

interface AbilityModifiersPanelProps {
  abilityDamage: Partial<Record<AbilityKey, number>>;
  abilityDrain: Partial<Record<AbilityKey, number>>;
  negativeLevels: number;
  baseScores: Record<AbilityKey, number>;
  currentScores: Record<AbilityKey, number>;
  setDamage: (k: AbilityKey, n: number) => void;
  setDrain: (k: AbilityKey, n: number) => void;
  setNegativeLevels: (n: number) => void;
  clearAll: () => void;
}

function AbilityModifiersPanel({
  abilityDamage, abilityDrain, negativeLevels,
  baseScores, currentScores,
  setDamage, setDrain, setNegativeLevels, clearAll,
}: AbilityModifiersPanelProps) {
  const hasAny =
    negativeLevels > 0 ||
    ABILITY_KEYS.some((k) => (abilityDamage[k] ?? 0) > 0 || (abilityDrain[k] ?? 0) > 0);

  return (
    <section className="mb-4 border-2 border-ink-700 rounded-md p-3 bg-parchment-100">
      <div className="flex items-baseline justify-between border-b border-ink-700 mb-2">
        <h3 className="font-display">Ability Damage, Drain &amp; Negative Levels</h3>
        {hasAny && (
          <button className="btn-ghost text-xs no-print" onClick={clearAll}>
            Clear all
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="text-sm w-full">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-ink-700">
              <th className="text-left">Ability</th>
              <th className="text-right">Base</th>
              <th className="text-right">Damage</th>
              <th className="text-right">Drain</th>
              <th className="text-right">Current</th>
            </tr>
          </thead>
          <tbody>
            {ABILITY_KEYS.map((k) => {
              const dmg = abilityDamage[k] ?? 0;
              const drn = abilityDrain[k] ?? 0;
              return (
                <tr key={k} className="border-t border-parchment-300">
                  <td>{ABILITY_NAMES[k]}</td>
                  <td className="text-right">{baseScores[k]}</td>
                  <td className="text-right">
                    <input
                      type="number"
                      min={0}
                      value={dmg || ""}
                      placeholder="0"
                      onChange={(e) => setDamage(k, Number(e.target.value) || 0)}
                      className="field w-14 text-center text-right no-print"
                    />
                    <span className="hidden print:inline">{dmg}</span>
                  </td>
                  <td className="text-right">
                    <input
                      type="number"
                      min={0}
                      value={drn || ""}
                      placeholder="0"
                      onChange={(e) => setDrain(k, Number(e.target.value) || 0)}
                      className="field w-14 text-center text-right no-print"
                    />
                    <span className="hidden print:inline">{drn}</span>
                  </td>
                  <td className={"text-right font-bold " + (currentScores[k] < baseScores[k] ? "text-rust-600" : "")}>
                    {currentScores[k]}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-display">Negative Levels:</span>
          <input
            type="number"
            min={0}
            value={negativeLevels || ""}
            placeholder="0"
            onChange={(e) => setNegativeLevels(Number(e.target.value) || 0)}
            className="field w-16 text-center no-print"
          />
          <span className="hidden print:inline font-bold">{negativeLevels}</span>
        </label>
        {negativeLevels > 0 && (
          <span className="text-xs text-rust-600">
            −{negativeLevels} on attacks, saves, skill &amp; ability checks
          </span>
        )}
      </div>
    </section>
  );
}
