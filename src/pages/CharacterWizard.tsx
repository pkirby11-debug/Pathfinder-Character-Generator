import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCharacterStore } from "../store/characters";
import { CORE_RACES, RACES_BY_ID } from "../data/races/core";
import { CORE_CLASSES, CLASSES_BY_ID } from "../data/classes/core";
import { CORE_FEATS, FEATS_BY_ID } from "../data/feats/core";
import { CORE_SPELLS } from "../data/spells/core";
import { CORE_WEAPONS, CORE_ARMOR, CORE_GEAR, ITEMS_BY_ID } from "../data/equipment/core";
import { SKILLS } from "../data/skills/skills";
import { ABILITY_KEYS, ABILITY_NAMES, type Character, type Alignment } from "../types/pathfinder";
import {
  abilityMod,
  abilityModString,
  derive,
  pointBuyTotal,
  skillRanksAtLevel,
} from "../engine";

type Step = "basics" | "abilities" | "race" | "class" | "skills" | "feats" | "spells" | "equipment" | "review";

const STEPS: { id: Step; label: string }[] = [
  { id: "basics", label: "Basics" },
  { id: "abilities", label: "Abilities" },
  { id: "race", label: "Race" },
  { id: "class", label: "Class" },
  { id: "skills", label: "Skills" },
  { id: "feats", label: "Feats" },
  { id: "spells", label: "Spells" },
  { id: "equipment", label: "Equipment" },
  { id: "review", label: "Review" },
];

const ALIGNMENTS: Alignment[] = ["LG", "NG", "CG", "LN", "N", "CN", "LE", "NE", "CE"];
const ALIGNMENT_LABELS: Record<Alignment, string> = {
  LG: "Lawful Good", NG: "Neutral Good", CG: "Chaotic Good",
  LN: "Lawful Neutral", N: "True Neutral", CN: "Chaotic Neutral",
  LE: "Lawful Evil", NE: "Neutral Evil", CE: "Chaotic Evil",
};

export function CharacterWizard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const character = useCharacterStore((s) => s.characters.find((c) => c.id === id));
  const replace = useCharacterStore((s) => s.replace);

  const [step, setStep] = useState<Step>("basics");
  const [draft, setDraft] = useState<Character | null>(null);

  useEffect(() => {
    if (character) setDraft(character);
  }, [character]);

  if (!draft) {
    return (
      <div className="text-center py-12">
        <p>Loading character…</p>
      </div>
    );
  }

  const update = (patch: Partial<Character>) =>
    setDraft({ ...draft, ...patch });

  const handleSave = () => {
    if (!id || !draft) return;
    replace(id, draft);
    navigate(`/character/${id}`);
  };

  const stepIdx = STEPS.findIndex((s) => s.id === step);
  const goNext = () => stepIdx < STEPS.length - 1 && setStep(STEPS[stepIdx + 1].id);
  const goPrev = () => stepIdx > 0 && setStep(STEPS[stepIdx - 1].id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">{draft.name || "New Character"}</h1>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={() => navigate("/")}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>

      {/* Step indicator */}
      <ol className="flex flex-wrap gap-1 text-sm border-b-2 border-ink-700 pb-2">
        {STEPS.map((s, i) => (
          <li key={s.id}>
            <button
              onClick={() => setStep(s.id)}
              className={
                "px-3 py-1 rounded-t-md font-display " +
                (s.id === step
                  ? "bg-rust-600 text-parchment-50"
                  : i < stepIdx
                  ? "bg-parchment-200 text-ink-900"
                  : "text-ink-700 hover:bg-parchment-200")
              }
            >
              {i + 1}. {s.label}
            </button>
          </li>
        ))}
      </ol>

      <div className="bg-parchment-50 border-2 border-ink-700 rounded-md p-6 min-h-[400px]">
        {step === "basics" && <BasicsStep draft={draft} update={update} />}
        {step === "abilities" && <AbilitiesStep draft={draft} update={update} />}
        {step === "race" && <RaceStep draft={draft} update={update} />}
        {step === "class" && <ClassStep draft={draft} update={update} />}
        {step === "skills" && <SkillsStep draft={draft} update={update} />}
        {step === "feats" && <FeatsStep draft={draft} update={update} />}
        {step === "spells" && <SpellsStep draft={draft} update={update} />}
        {step === "equipment" && <EquipmentStep draft={draft} update={update} />}
        {step === "review" && <ReviewStep draft={draft} />}
      </div>

      <div className="flex justify-between">
        <button className="btn-secondary" onClick={goPrev} disabled={stepIdx === 0}>
          ← Previous
        </button>
        {stepIdx < STEPS.length - 1 ? (
          <button className="btn-primary" onClick={goNext}>Next →</button>
        ) : (
          <button className="btn-primary" onClick={handleSave}>Save Character</button>
        )}
      </div>
    </div>
  );
}

// ---------- Basics ----------
function BasicsStep({ draft, update }: { draft: Character; update: (p: Partial<Character>) => void }) {
  return (
    <div className="space-y-4 max-w-xl">
      <h2 className="text-2xl">Basics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Name">
          <input
            className="field w-full"
            value={draft.name}
            onChange={(e) => update({ name: e.target.value })}
          />
        </Field>
        <Field label="Player">
          <input
            className="field w-full"
            value={draft.player ?? ""}
            onChange={(e) => update({ player: e.target.value })}
          />
        </Field>
        <Field label="Alignment">
          <select
            className="field w-full"
            value={draft.alignment}
            onChange={(e) => update({ alignment: e.target.value as Alignment })}
          >
            {ALIGNMENTS.map((a) => (
              <option key={a} value={a}>{ALIGNMENT_LABELS[a]}</option>
            ))}
          </select>
        </Field>
        <Field label="Deity">
          <input
            className="field w-full"
            value={draft.deity ?? ""}
            onChange={(e) => update({ deity: e.target.value })}
          />
        </Field>
        <Field label="Gender">
          <input
            className="field w-full"
            value={draft.gender ?? ""}
            onChange={(e) => update({ gender: e.target.value as Character["gender"] })}
          />
        </Field>
        <Field label="Age">
          <input
            className="field w-full"
            type="number"
            value={draft.age ?? ""}
            onChange={(e) => update({ age: e.target.value ? Number(e.target.value) : undefined })}
          />
        </Field>
      </div>
    </div>
  );
}

// ---------- Abilities ----------
function AbilitiesStep({ draft, update }: { draft: Character; update: (p: Partial<Character>) => void }) {
  const cost = pointBuyTotal(draft.baseAbilityScores);
  const budgets = { point_buy_15: 15, point_buy_20: 20, point_buy_25: 25 };
  const method = draft.abilityScoreMethod;
  const budget = budgets[method as keyof typeof budgets] ?? 0;
  const race = RACES_BY_ID[draft.raceId];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl">Ability Scores</h2>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="font-display">Method:</span>
        {(["point_buy_15", "point_buy_20", "point_buy_25", "manual"] as const).map((m) => (
          <button
            key={m}
            className={
              "px-3 py-1 rounded-md border text-sm " +
              (method === m
                ? "bg-rust-600 text-parchment-50 border-rust-600"
                : "bg-parchment-100 border-ink-700 hover:bg-parchment-200")
            }
            onClick={() => update({ abilityScoreMethod: m })}
          >
            {m === "manual" ? "Manual" : `Point buy ${m.split("_").pop()}`}
          </button>
        ))}
      </div>

      {method !== "manual" && (
        <div className="text-sm">
          <span className="font-display">Points spent:</span>{" "}
          <span className={cost > budget ? "text-rust-600 font-bold" : ""}>{cost}</span> / {budget}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {ABILITY_KEYS.map((k) => {
          const base = draft.baseAbilityScores[k];
          const racial = race?.abilityModifiers[k] ?? 0;
          const total = base + racial;
          const mod = abilityMod(total);
          return (
            <div key={k} className="stat-box">
              <div className="font-display text-sm">{ABILITY_NAMES[k]}</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <button
                  className="px-1 hover:text-rust-600"
                  onClick={() =>
                    update({
                      baseAbilityScores: { ...draft.baseAbilityScores, [k]: Math.max(7, base - 1) },
                    })
                  }
                >
                  −
                </button>
                <input
                  className="w-12 text-center bg-transparent border-b border-ink-700 outline-none"
                  type="number"
                  value={base}
                  onChange={(e) =>
                    update({
                      baseAbilityScores: { ...draft.baseAbilityScores, [k]: Number(e.target.value) || 0 },
                    })
                  }
                />
                <button
                  className="px-1 hover:text-rust-600"
                  onClick={() =>
                    update({
                      baseAbilityScores: { ...draft.baseAbilityScores, [k]: Math.min(18, base + 1) },
                    })
                  }
                >
                  +
                </button>
              </div>
              <div className="text-xs text-ink-700 mt-1">
                {racial !== 0 && (
                  <span>
                    {racial > 0 ? "+" : ""}
                    {racial} racial
                  </span>
                )}
              </div>
              <div className="font-bold mt-1">
                {total} ({abilityModString(mod)})
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-sm text-ink-700 font-flavor">
        Point buy ranges: 7 to 18 (before racial modifiers). Pathfinder standard is 20 points.
      </p>
    </div>
  );
}

// ---------- Race ----------
function RaceStep({ draft, update }: { draft: Character; update: (p: Partial<Character>) => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl">Race</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CORE_RACES.map((r) => (
          <button
            key={r.id}
            onClick={() => update({ raceId: r.id })}
            className={
              "text-left p-4 rounded-md border-2 transition " +
              (draft.raceId === r.id
                ? "border-rust-600 bg-parchment-100"
                : "border-ink-700 bg-parchment-50 hover:border-rust-600")
            }
          >
            <div className="flex justify-between items-start">
              <h3 className="text-xl">{r.name}</h3>
              <span className="text-xs text-ink-700">{r.size}</span>
            </div>
            <p className="text-sm text-ink-700 mt-1">
              {Object.entries(r.abilityModifiers)
                .map(([k, v]) => `${(v as number) > 0 ? "+" : ""}${v} ${k.toUpperCase()}`)
                .join(", ") || "+2 to one ability score"}
            </p>
            <p className="text-xs text-ink-700 mt-2 font-flavor line-clamp-3">{r.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Class ----------
function ClassStep({ draft, update }: { draft: Character; update: (p: Partial<Character>) => void }) {
  const addClass = (classId: string) => {
    const existing = draft.classLevels.find((cl) => cl.classId === classId);
    if (existing) {
      update({
        classLevels: draft.classLevels.map((cl) =>
          cl.classId === classId ? { ...cl, level: cl.level + 1 } : cl,
        ),
      });
    } else {
      update({
        classLevels: [
          ...draft.classLevels,
          { classId, level: 1, hitPointsRolled: 0, skillRanks: {} },
        ],
      });
    }
  };

  const removeLevel = (classId: string) => {
    const existing = draft.classLevels.find((cl) => cl.classId === classId);
    if (!existing) return;
    if (existing.level <= 1) {
      update({ classLevels: draft.classLevels.filter((cl) => cl.classId !== classId) });
    } else {
      update({
        classLevels: draft.classLevels.map((cl) =>
          cl.classId === classId
            ? { ...cl, level: cl.level - 1, hpRolls: cl.hpRolls?.slice(0, cl.level - 1) }
            : cl,
        ),
      });
    }
  };

  const setHpRoll = (classId: string, levelIdx: number, value: number) => {
    update({
      classLevels: draft.classLevels.map((cl) => {
        if (cl.classId !== classId) return cl;
        const next = [...(cl.hpRolls ?? [])];
        next[levelIdx] = value;
        return { ...cl, hpRolls: next };
      }),
    });
  };

  const fillHpRolls = (classId: string, mode: "average" | "max") => {
    update({
      classLevels: draft.classLevels.map((cl) => {
        if (cl.classId !== classId) return cl;
        const klass = CLASSES_BY_ID[cl.classId];
        if (!klass) return cl;
        const avg = Math.floor(klass.hitDie / 2) + 1;
        const value = mode === "max" ? klass.hitDie : avg;
        const rolls = Array.from({ length: cl.level }, () => value);
        return { ...cl, hpRolls: rolls };
      }),
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl">Classes & Levels</h2>

      {draft.classLevels.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg">Current build</h3>
          {draft.classLevels.map((cl, classIdx) => {
            const klass = CLASSES_BY_ID[cl.classId];
            if (!klass) return null;
            const avg = Math.floor(klass.hitDie / 2) + 1;
            return (
              <div key={cl.classId} className="bg-parchment-100 border border-ink-700 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-display">{klass.name}</span>{" "}
                    <span className="text-sm">level {cl.level}</span>{" "}
                    <span className="text-xs text-ink-700">(d{klass.hitDie}, avg {avg})</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-ghost text-xs" onClick={() => removeLevel(cl.classId)}>−1 level</button>
                    <button className="btn-secondary text-xs" onClick={() => addClass(cl.classId)}>+1 level</button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="uppercase tracking-wider text-ink-700">HP per level:</span>
                  {Array.from({ length: cl.level }).map((_, i) => {
                    const lvl = i + 1;
                    const isFirstChar = classIdx === 0 && lvl === 1;
                    if (isFirstChar) {
                      return (
                        <div key={i} className="flex items-center gap-1">
                          <span>L{lvl}</span>
                          <span className="px-2 py-0.5 bg-parchment-200 border border-ink-700 rounded">
                            {klass.hitDie} max
                          </span>
                        </div>
                      );
                    }
                    const value = cl.hpRolls?.[i] ?? avg;
                    return (
                      <div key={i} className="flex items-center gap-1">
                        <span>L{lvl}</span>
                        <input
                          type="number"
                          min={1}
                          max={klass.hitDie}
                          value={value}
                          className="w-12 field text-center"
                          onChange={(e) => setHpRoll(cl.classId, i, Number(e.target.value) || avg)}
                        />
                      </div>
                    );
                  })}
                  <button className="btn-ghost text-xs" onClick={() => fillHpRolls(cl.classId, "average")}>Avg all</button>
                  <button className="btn-ghost text-xs" onClick={() => fillHpRolls(cl.classId, "max")}>Max all</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div>
        <h3 className="text-lg mb-2">Add a class</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CORE_CLASSES.map((c) => (
            <button
              key={c.id}
              onClick={() => addClass(c.id)}
              className="text-left p-3 rounded-md border-2 border-ink-700 bg-parchment-50 hover:border-rust-600"
            >
              <div className="flex justify-between">
                <span className="font-display text-lg">{c.name}</span>
                <span className="text-xs text-ink-700">d{c.hitDie}</span>
              </div>
              <div className="text-xs text-ink-700 mt-1">
                BAB: {c.bab.replace("_", "/")} · Skills: {c.skillRanksPerLevel}/lvl
              </div>
              {c.description && <p className="text-xs mt-1 font-flavor line-clamp-2">{c.description}</p>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Skills ----------
function SkillsStep({ draft, update }: { draft: Character; update: (p: Partial<Character>) => void }) {
  if (draft.classLevels.length === 0) {
    return <p className="font-flavor">Pick a class first to allocate skill ranks.</p>;
  }

  const setRank = (classId: string, skillId: string, ranks: number) => {
    update({
      classLevels: draft.classLevels.map((cl) =>
        cl.classId === classId
          ? { ...cl, skillRanks: { ...cl.skillRanks, [skillId]: Math.max(0, ranks) } }
          : cl,
      ),
    });
  };

  // For now, treat all per-level allocations as bundled per class entry (simplification).
  const derived = derive(draft);
  const totalLevel = derived.totalLevel;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl">Skills</h2>
      <p className="text-sm text-ink-700 font-flavor">
        Maximum ranks per skill = your character level. Class skills get a +3 bonus if you have at least one rank.
      </p>

      {draft.classLevels.map((cl) => {
        const klass = CLASSES_BY_ID[cl.classId];
        if (!klass) return null;
        const available = skillRanksAtLevel(draft, cl.classId, cl.level) * cl.level;
        const used = Object.values(cl.skillRanks).reduce((s, n) => s + n, 0);

        return (
          <div key={cl.classId} className="border border-ink-700 rounded-md p-3 bg-parchment-100">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg">{klass.name}</h3>
              <span className={"text-sm " + (used > available ? "text-rust-600 font-bold" : "")}>
                {used} / {available} ranks
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
              {SKILLS.map((sk) => {
                const ranks = cl.skillRanks[sk.id] ?? 0;
                const isClassSkill = klass.classSkills.includes(sk.id);
                const total = derived.skills[sk.id]?.total ?? 0;
                return (
                  <div
                    key={sk.id}
                    className={
                      "flex items-center gap-3 px-2 py-1.5 rounded " +
                      (isClassSkill ? "bg-parchment-200" : "")
                    }
                  >
                    <input
                      type="number"
                      value={ranks}
                      min={0}
                      max={totalLevel}
                      className="w-14 field text-center shrink-0"
                      onChange={(e) =>
                        setRank(cl.classId, sk.id, Number(e.target.value) || 0)
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium leading-tight">
                        {sk.name}
                        {isClassSkill && <span className="text-xs ml-1 font-normal text-ink-700">(class)</span>}
                        {sk.trainedOnly && <span className="text-xs ml-1 text-rust-600" title="Trained only">*</span>}
                      </div>
                      <div className="text-xs text-ink-700 leading-tight">
                        {sk.ability.toUpperCase()} · total {abilityModString(total)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Feats ----------
function FeatsStep({ draft, update }: { draft: Character; update: (p: Partial<Character>) => void }) {
  const totalLevel = draft.classLevels.reduce((s, cl) => s + cl.level, 0);
  // Feat slots: 1 at 1st, then every odd level (1, 3, 5, 7, ...). Human bonus: +1 at 1st. Fighter bonus: every even.
  const baseFeats = Math.ceil(totalLevel / 2);
  const humanBonus = draft.raceId === "human" ? 1 : 0;
  const fighterLevels = draft.classLevels.find((cl) => cl.classId === "fighter")?.level ?? 0;
  const fighterBonus = Math.floor(fighterLevels / 2) + (fighterLevels > 0 ? 1 : 0); // fighter gets bonus at 1 and every even
  const wizardLevels = draft.classLevels.find((cl) => cl.classId === "wizard")?.level ?? 0;
  const wizardBonus = Math.floor(wizardLevels / 5); // wizard bonus item-creation/metamagic feat at 5, 10, 15, 20
  const halfElfBonus = draft.raceId === "half_elf" ? 1 : 0; // Skill Focus, but counts as a feat
  const totalSlots = baseFeats + humanBonus + fighterBonus + wizardBonus + halfElfBonus;
  const chosen = draft.startingFeats ?? [];

  const toggleFeat = (featId: string) => {
    if (chosen.includes(featId)) {
      update({ startingFeats: chosen.filter((f) => f !== featId) });
    } else if (chosen.length < totalSlots) {
      update({ startingFeats: [...chosen, featId] });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl">Feats</h2>
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="font-display">Slots:</span>
        <span className={chosen.length > totalSlots ? "text-rust-600 font-bold" : ""}>
          {chosen.length} / {totalSlots}
        </span>
        <span className="text-ink-700">
          (base: {baseFeats}
          {humanBonus > 0 && `, human: +${humanBonus}`}
          {fighterBonus > 0 && `, fighter: +${fighterBonus}`}
          {wizardBonus > 0 && `, wizard: +${wizardBonus}`}
          {halfElfBonus > 0 && `, half-elf: +${halfElfBonus}`})
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {CORE_FEATS.map((f) => {
          const picked = chosen.includes(f.id);
          return (
            <button
              key={f.id}
              onClick={() => toggleFeat(f.id)}
              className={
                "text-left p-3 rounded-md border-2 " +
                (picked
                  ? "border-rust-600 bg-parchment-100"
                  : "border-ink-700 bg-parchment-50 hover:border-rust-600")
              }
            >
              <div className="flex justify-between">
                <span className="font-display">{f.name}</span>
                <span className="text-xs text-ink-700">{f.types.join(", ")}</span>
              </div>
              {f.prerequisites && (
                <p className="text-xs text-rust-600 italic">Prereq: {f.prerequisites}</p>
              )}
              <p className="text-xs mt-1">{f.benefit}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Spells ----------
function SpellsStep({ draft, update }: { draft: Character; update: (p: Partial<Character>) => void }) {
  const casters = draft.classLevels
    .map((cl) => ({ cl, klass: CLASSES_BY_ID[cl.classId] }))
    .filter((x) => x.klass?.spellcasting);

  if (casters.length === 0) {
    return <p className="font-flavor">No spellcasting classes in this build.</p>;
  }

  const known = draft.knownSpells ?? [];
  const toggle = (classId: string, spellId: string, spellLevel: number) => {
    const exists = known.find((k) => k.classId === classId && k.spellId === spellId);
    if (exists) {
      update({ knownSpells: known.filter((k) => !(k.classId === classId && k.spellId === spellId)) });
    } else {
      update({ knownSpells: [...known, { classId, spellId, level: spellLevel }] });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl">Spells Known / Prepared</h2>
      <p className="text-sm text-ink-700 font-flavor">
        Pick spells your character knows. Prepared casters can choose freely each day; spontaneous casters are limited to their spells known list.
      </p>

      {casters.map(({ cl, klass }) => {
        if (!klass?.spellcasting) return null;
        const spellsForList = CORE_SPELLS.filter((s) => s.levels[klass.spellcasting!.list] !== undefined);
        return (
          <div key={cl.classId} className="border border-ink-700 rounded-md p-3 bg-parchment-100">
            <h3 className="text-lg">{klass.name} ({klass.spellcasting.type})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {spellsForList.map((s) => {
                const lvl = s.levels[klass.spellcasting!.list]!;
                const picked = known.some((k) => k.classId === cl.classId && k.spellId === s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggle(cl.classId, s.id, lvl)}
                    className={
                      "text-left p-2 rounded border-2 text-sm " +
                      (picked
                        ? "border-rust-600 bg-parchment-50"
                        : "border-ink-700 bg-parchment-50 hover:border-rust-600")
                    }
                  >
                    <div className="flex justify-between">
                      <span className="font-display">{s.name}</span>
                      <span className="text-xs">L{lvl} · {s.school}</span>
                    </div>
                    <p className="text-xs mt-1 line-clamp-2">{s.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Equipment ----------
function EquipmentStep({ draft, update }: { draft: Character; update: (p: Partial<Character>) => void }) {
  const all = [...CORE_WEAPONS, ...CORE_ARMOR, ...CORE_GEAR];
  const [filter, setFilter] = useState("");

  const items = useMemo(
    () =>
      filter
        ? all.filter((i) => i.name.toLowerCase().includes(filter.toLowerCase()))
        : all,
    [filter, all],
  );

  const carry = (itemId: string) => {
    const existing = draft.inventory.find((i) => i.itemId === itemId);
    if (existing) {
      update({
        inventory: draft.inventory.map((i) =>
          i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      });
    } else {
      update({ inventory: [...draft.inventory, { itemId, quantity: 1 }] });
    }
  };

  const setQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) {
      update({ inventory: draft.inventory.filter((i) => i.itemId !== itemId) });
    } else {
      update({
        inventory: draft.inventory.map((i) =>
          i.itemId === itemId ? { ...i, quantity: qty } : i,
        ),
      });
    }
  };

  const toggleEquipped = (itemId: string) => {
    update({
      inventory: draft.inventory.map((i) =>
        i.itemId === itemId ? { ...i, equipped: !i.equipped } : i,
      ),
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl">Equipment</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg mb-2">Carried</h3>
          {draft.inventory.length === 0 ? (
            <p className="font-flavor text-sm text-ink-700">Nothing in pack.</p>
          ) : (
            <div className="space-y-1">
              {draft.inventory.map((carried) => {
                const item = ITEMS_BY_ID[carried.itemId];
                if (!item) return null;
                return (
                  <div key={carried.itemId} className="flex items-center gap-2 text-sm bg-parchment-100 border border-ink-700 rounded px-2 py-1">
                    <input
                      type="number"
                      value={carried.quantity}
                      onChange={(e) => setQuantity(carried.itemId, Number(e.target.value))}
                      className="w-14 text-center field"
                    />
                    <span className="flex-1">{item.name}</span>
                    {(item.category === "armor" || item.category === "shield" || item.category === "weapon") && (
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={!!carried.equipped}
                          onChange={() => toggleEquipped(carried.itemId)}
                        />
                        Equipped
                      </label>
                    )}
                    <span className="text-xs text-ink-700">{item.weight} lb</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4">
            <h3 className="text-lg mb-2">Coin Purse</h3>
            <div className="grid grid-cols-4 gap-2">
              {(["pp", "gp", "sp", "cp"] as const).map((k) => (
                <Field key={k} label={k.toUpperCase()}>
                  <input
                    type="number"
                    className="field w-full"
                    value={draft.money[k]}
                    onChange={(e) =>
                      update({ money: { ...draft.money, [k]: Number(e.target.value) || 0 } })
                    }
                  />
                </Field>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg mb-2">Add Item</h3>
          <input
            placeholder="Search items…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="field w-full mb-2"
          />
          <div className="max-h-[400px] overflow-y-auto space-y-1 pr-1">
            {items.map((i) => (
              <button
                key={i.id}
                onClick={() => carry(i.id)}
                className="w-full text-left p-2 rounded border border-ink-700 bg-parchment-50 hover:bg-parchment-200 flex items-center gap-2"
              >
                <span className="flex-1 text-sm">{i.name}</span>
                <span className="text-xs text-ink-700">{i.cost} gp</span>
                <span className="text-xs text-ink-700">{i.weight} lb</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Review ----------
function ReviewStep({ draft }: { draft: Character }) {
  const derived = derive(draft);
  const race = RACES_BY_ID[draft.raceId];
  return (
    <div className="space-y-4">
      <h2 className="text-2xl">Review</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg">Identity</h3>
          <p className="text-sm">{draft.name} · {ALIGNMENT_LABELS[draft.alignment]} · {race?.name}</p>
          <p className="text-sm">
            {draft.classLevels.map((cl) => `${CLASSES_BY_ID[cl.classId]?.name} ${cl.level}`).join(" / ") || "—"}
          </p>
        </div>
        <div>
          <h3 className="text-lg">Vitals</h3>
          <ul className="text-sm">
            <li>HP: <strong>{derived.hp.max}</strong></li>
            <li>AC: <strong>{derived.ac.total}</strong> (touch {derived.ac.touch}, FF {derived.ac.flatFooted})</li>
            <li>Initiative: <strong>{abilityModString(derived.initiative)}</strong></li>
            <li>BAB: <strong>+{derived.bab}</strong></li>
            <li>Saves: F{abilityModString(derived.saves.fort.total)} / R{abilityModString(derived.saves.ref.total)} / W{abilityModString(derived.saves.will.total)}</li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg">Abilities</h3>
          <ul className="text-sm">
            {ABILITY_KEYS.map((k) => (
              <li key={k}>
                {ABILITY_NAMES[k]}: <strong>{derived.abilityScores[k]}</strong> ({abilityModString(derived.abilityMods[k])})
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg">Feats ({(draft.startingFeats ?? []).length})</h3>
          <ul className="text-sm list-disc ml-5">
            {(draft.startingFeats ?? []).map((id) => (
              <li key={id}>{FEATS_BY_ID[id]?.name ?? id}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="text-sm font-flavor text-ink-700 mt-4">
        Save the character to view a printable sheet.
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-display uppercase tracking-wider text-ink-700 mb-1">{label}</span>
      {children}
    </label>
  );
}
