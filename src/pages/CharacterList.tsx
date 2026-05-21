import { Link, useNavigate } from "react-router-dom";
import { useCharacterStore, blankCharacter } from "../store/characters";
import { CLASSES_BY_ID } from "../data/classes/core";
import { RACES_BY_ID } from "../data/races/core";
import { derive } from "../engine";
import { useRef } from "react";

export function CharacterList() {
  const navigate = useNavigate();
  const characters = useCharacterStore((s) => s.characters);
  const add = useCharacterStore((s) => s.add);
  const remove = useCharacterStore((s) => s.remove);
  const importCharacter = useCharacterStore((s) => s.importCharacter);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleNew = () => {
    const ch = blankCharacter();
    add(ch);
    navigate(`/character/${ch.id}/wizard`);
  };

  const handleImport: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      importCharacter(data);
    } catch (err) {
      console.error(err);
      alert("Could not parse character file.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Your Characters</h1>
          <p className="text-ink-700 font-flavor">
            Forge a hero for the world of Golarion (or anywhere else).
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => fileRef.current?.click()}>
            Import
          </button>
          <input
            type="file"
            ref={fileRef}
            accept="application/json"
            className="hidden"
            onChange={handleImport}
          />
          <button className="btn-primary" onClick={handleNew}>
            + New Character
          </button>
        </div>
      </div>

      {characters.length === 0 ? (
        <div className="bg-parchment-50 border-2 border-dashed border-ink-700 rounded-lg p-12 text-center">
          <p className="font-flavor text-lg text-ink-700">
            No characters yet. Click "New Character" to start.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((c) => {
            const race = RACES_BY_ID[c.raceId];
            const derived = safeDerive(c);
            const classBlurb = c.classLevels
              .map((cl) => {
                const klass = CLASSES_BY_ID[cl.classId];
                return klass ? `${klass.name} ${cl.level}` : null;
              })
              .filter(Boolean)
              .join(" / ") || "Unleveled";

            return (
              <div
                key={c.id}
                className="bg-parchment-50 border-2 border-ink-700 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
              >
                <Link to={`/character/${c.id}`} className="block">
                  <h2 className="text-xl">{c.name}</h2>
                  <p className="text-sm text-ink-700">
                    {race?.name ?? "—"} · {classBlurb}
                  </p>
                  {derived && (
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="stat-box">
                        <div className="font-bold">HP</div>
                        <div>{derived.hp.max}</div>
                      </div>
                      <div className="stat-box">
                        <div className="font-bold">AC</div>
                        <div>{derived.ac.total}</div>
                      </div>
                      <div className="stat-box">
                        <div className="font-bold">Lvl</div>
                        <div>{derived.totalLevel}</div>
                      </div>
                    </div>
                  )}
                </Link>
                <div className="flex gap-2 mt-4">
                  <Link to={`/character/${c.id}/wizard`} className="btn-secondary text-xs flex-1 justify-center">
                    Edit
                  </Link>
                  <button
                    className="btn-ghost text-xs"
                    onClick={() => {
                      if (confirm(`Delete ${c.name}?`)) remove(c.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function safeDerive(c: Parameters<typeof derive>[0]) {
  try {
    return derive(c);
  } catch {
    return null;
  }
}
