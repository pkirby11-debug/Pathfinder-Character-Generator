import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Character } from "../types/pathfinder";

interface CharacterStore {
  characters: Character[];
  selectedId: string | null;
  add: (character: Character) => void;
  update: (id: string, patch: Partial<Character>) => void;
  replace: (id: string, character: Character) => void;
  remove: (id: string) => void;
  select: (id: string | null) => void;
  importCharacter: (data: Character) => void;
}

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set) => ({
      characters: [],
      selectedId: null,
      add: (character) =>
        set((state) => ({ characters: [...state.characters, character] })),
      update: (id, patch) =>
        set((state) => ({
          characters: state.characters.map((c) =>
            c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c,
          ),
        })),
      replace: (id, character) =>
        set((state) => ({
          characters: state.characters.map((c) =>
            c.id === id ? { ...character, updatedAt: new Date().toISOString() } : c,
          ),
        })),
      remove: (id) =>
        set((state) => ({
          characters: state.characters.filter((c) => c.id !== id),
          selectedId: state.selectedId === id ? null : state.selectedId,
        })),
      select: (id) => set({ selectedId: id }),
      importCharacter: (data) =>
        set((state) => ({
          characters: [
            ...state.characters.filter((c) => c.id !== data.id),
            { ...data, updatedAt: new Date().toISOString() },
          ],
        })),
    }),
    {
      name: "pf1e-characters",
      version: 1,
    },
  ),
);

export function blankCharacter(): Character {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    name: "New Character",
    alignment: "N",
    raceId: "human",
    classLevels: [],
    baseAbilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    abilityScoreMethod: "point_buy_20",
    startingFeats: [],
    inventory: [],
    money: { pp: 0, gp: 0, sp: 0, cp: 0 },
  };
}
