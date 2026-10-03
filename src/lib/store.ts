import { useSyncExternalStore } from "react";

type State = { allergies: string[]; dislikes: string[]; saved: string[]; liked: string[]; name: string };
let state: State = { allergies: ["مكسرات"], dislikes: [], saved: ["jareesh"], liked: [], name: "سارة" };
const subs = new Set<() => void>();

export const setStore = (fn: (s: State) => Partial<State>) => {
  state = { ...state, ...fn(state) };
  subs.forEach((l) => l());
};
export const toggleIn = (key: "allergies" | "dislikes" | "saved" | "liked", v: string) =>
  setStore((s) => ({ [key]: s[key].includes(v) ? s[key].filter((x) => x !== v) : [...s[key], v] }));

export function useStore() {
  return useSyncExternalStore(
    (l) => { subs.add(l); return () => subs.delete(l); },
    () => state,
    () => state,
  );
}

/** Map onboarding labels to recipe allergen tags */
export const matchesAllergy = (allergen: string, allergies: string[]) =>
  allergies.some((a) => a.includes(allergen) || allergen.includes(a.split(" ")[0] ?? a));
