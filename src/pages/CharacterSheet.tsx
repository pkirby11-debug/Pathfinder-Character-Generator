import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCharacterStore } from "../store/characters";
import { RACES_BY_ID } from "../data/races/core";
import { CLASSES_BY_ID } from "../data/classes/core";
import { FEATS_BY_ID } from "../data/feats/core";
import { ITEMS_BY_ID } from "../data/equipment/core";
import { SPELLS_BY_ID } from "../data/spells/core";
import { SKILLS } from "../data/skills/skills";
import { ABILITY_KEYS, ABILITY_NAMES } from "../types/pathfinder";
import { abilityModString, derive } from "../engine";

// Standard Pathfinder 1E conditions (OGL).
const COMMON_CONDITIONS = [
  "Blinded", "Confused", "Dazed", "Dazzled", "Deafened", "Disabled",
  "Dying", "Entangled", "Exhausted", "Fascinated", "Fatigued",
  "Flat-Footed", "Frightened", "Grappled", "Helpless", "Nauseated",
  "Panicked", "Paralyzed", "Pinned", "Prone", "Shaken", "Sickened",
  "Stable", "Staggered", "Stunned", "Unconscious",
];

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
          {ABILITY_KEYS.map((k) => (
            <div key={k} className="stat-box">
              <div className="font-display text-xs uppercase">{ABILITY_NAMES[k]}</div>
              <div className="text-2xl font-bold">{d.abilityScores[k]}</div>
              <div className="text-sm">{abilityModString(d.abilityMods[k])}</div>
            </div>
          ))}
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

        <ConditionsPanel
          active={character.conditions ?? []}
          custom={customCondition}
          setCustom={setCustomCondition}
          toggle={(c) => {
            const set = new Set(character.conditions ?? []);
            if (set.has(c)) set.delete(c);
            else set.add(c);
            updateCharacter(character.id, { conditions: Array.from(set) });
          }}
          addCustom={() => {
            const v = customCondition.trim();
            if (!v) return;
            const set = new Set(character.conditions ?? []);
            set.add(v);
            updateCharacter(character.id, { conditions: Array.from(set) });
            setCustomCondition("");
          }}
        />

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
              return (
                <div key={classId} className="mb-2">
                  <h4 className="font-display">{klass.name}</h4>
                  <p className="text-xs text-ink-700">
                    Casting ability: {klass.spellcasting.ability.toUpperCase()} ({klass.spellcasting.type})
                  </p>
                  <table className="text-sm w-full max-w-md mt-1">
                    <thead>
                      <tr>
                        <th className="text-left">Lvl</th>
                        <th className="text-right">Per Day</th>
                        <th className="text-right">Bonus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {perDay.map((n, lvl) =>
                        n >= 0 ? (
                          <tr key={lvl} className="border-t border-parchment-300">
                            <td>{lvl}</td>
                            <td className="text-right">{n}</td>
                            <td className="text-right">{bonus[lvl] ? `+${bonus[lvl]}` : "—"}</td>
                          </tr>
                        ) : null,
                      )}
                    </tbody>
                  </table>
                  {knownForClass.length > 0 && (
                    <ul className="text-sm mt-2 list-disc ml-5">
                      {knownForClass.map((k) => {
                        const s = SPELLS_BY_ID[k.spellId];
                        return s ? (
                          <li key={k.spellId}>
                            <strong>{s.name}</strong> (lvl {k.level}) — {s.school}
                          </li>
                        ) : null;
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

interface ConditionsPanelProps {
  active: string[];
  custom: string;
  setCustom: (v: string) => void;
  toggle: (c: string) => void;
  addCustom: () => void;
}

function ConditionsPanel({ active, custom, setCustom, toggle, addCustom }: ConditionsPanelProps) {
  const activeSet = new Set(active);
  const customActive = active.filter((c) => !COMMON_CONDITIONS.includes(c));

  return (
    <section className="mb-4">
      <div className="flex items-baseline justify-between border-b border-ink-700 mb-2">
        <h3 className="font-display">Conditions</h3>
        {active.length > 0 && (
          <span className="text-xs text-ink-700">{active.length} active</span>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {COMMON_CONDITIONS.map((c) => {
          const on = activeSet.has(c);
          return (
            <button
              key={c}
              onClick={() => toggle(c)}
              className={
                "text-xs px-2 py-1 rounded border transition-colors no-print " +
                (on
                  ? "bg-rust-600 text-parchment-50 border-rust-700"
                  : "bg-parchment-50 text-ink-800 border-ink-700 hover:bg-parchment-200")
              }
            >
              {c}
            </button>
          );
        })}
      </div>
      {customActive.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {customActive.map((c) => (
            <button
              key={c}
              onClick={() => toggle(c)}
              className="text-xs px-2 py-1 rounded bg-rust-600 text-parchment-50 border border-rust-700 no-print"
              title="Click to remove"
            >
              {c} ✕
            </button>
          ))}
        </div>
      )}
      <div className="mt-2 flex gap-1 no-print">
        <input
          type="text"
          value={custom}
          placeholder="Add custom condition…"
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addCustom();
          }}
          className="field w-full max-w-xs text-sm"
        />
        <button className="btn-secondary text-xs" onClick={addCustom}>
          Add
        </button>
      </div>
      {/* Print-only summary: active conditions inline */}
      <div className="hidden print:block text-sm">
        {active.length === 0 ? <em>None</em> : active.join(", ")}
      </div>
    </section>
  );
}
