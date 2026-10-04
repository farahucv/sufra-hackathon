import { useEffect, useSyncExternalStore } from "react";
import { ingredientLoc, type Loc } from "./data";
import { loadDemoProfile, saveDemoProfile } from "./profile.functions";

export type PantryItem = { name: string; loc: Loc };
export type State = {
  onboarded: boolean; name: string; diet: string; household: number;
  allergies: string[]; dislikes: string[]; saved: string[]; liked: string[];
  pantry: PantryItem[]; lang: "ar" | "en"; journey: number; synced: boolean;
};

const defaultPantry = ["دجاج", "أرز", "بصل", "طماطم", "بهارات كبسة", "بيض", "حليب", "دقيق", "خميرة", "زيت", "زبيب"];
export const defaults: State = {
  onboarded: false, name: "ضيف سُفرة", diet: "all", household: 4,
  allergies: ["مكسرات"], dislikes: [], saved: ["jareesh"], liked: [],
  pantry: defaultPantry.map((name) => ({ name, loc: ingredientLoc[name] ?? "pantry" })),
  lang: "ar", journey: 0, synced: false,
};

let state: State = defaults;
const subs = new Set<() => void>();
let hydrated = false;
let saveTimer: ReturnType<typeof setTimeout> | undefined;

const persist = () => {
  if (!hydrated || typeof window === "undefined") return;
  const { synced: _s, ...data } = state;
  localStorage.setItem("sufra-state", JSON.stringify(data));
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveDemoProfile({ data: { deviceId: getDeviceId(), data } })
      .then(() => { if (!state.synced) setStore(() => ({ synced: true })); })
      .catch(() => {});
  }, 800);
};

export const setStore = (fn: (s: State) => Partial<State>) => {
  const patch = fn(state);
  state = { ...state, ...patch };
  subs.forEach((l) => l());
  if (!("synced" in patch && Object.keys(patch).length === 1)) persist();
};

export const toggleIn = (key: "allergies" | "dislikes" | "saved" | "liked", v: string) =>
  setStore((s) => ({ [key]: s[key].includes(v) ? s[key].filter((x) => x !== v) : [...s[key], v] }));

export const hasPantry = (s: State, name: string) => s.pantry.some((p) => p.name === name);
export const togglePantry = (name: string, loc?: Loc) =>
  setStore((s) => ({
    pantry: hasPantry(s, name) ? s.pantry.filter((p) => p.name !== name) : [...s.pantry, { name, loc: loc ?? ingredientLoc[name] ?? "pantry" }],
  }));

export function useStore() {
  return useSyncExternalStore(
    (l) => { subs.add(l); return () => subs.delete(l); },
    () => state,
    () => defaults,
  );
}

function getDeviceId() {
  let id = localStorage.getItem("sufra-device");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("sufra-device", id); }
  return id;
}

/** Mount once in the root: hydrates from localStorage, then from the backend demo profile. */
export function useStoreSync() {
  useEffect(() => {
    if (hydrated) return;
    try {
      const local = localStorage.getItem("sufra-state");
      if (local) state = { ...state, ...JSON.parse(local) };
    } catch { /* ignore */ }
    hydrated = true;
    subs.forEach((l) => l());
    loadDemoProfile({ data: { deviceId: getDeviceId() } })
      .then(({ data }) => {
        if (data) { state = { ...state, ...(data as Partial<State>), synced: true }; subs.forEach((l) => l()); }
        else persist();
      })
      .catch(() => {});
  }, []);

  const lang = useStore().lang;
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
}

export const matchesAllergy = (allergen: string, allergies: string[]) => allergies.includes(allergen);

/** Translate inline: tr("عربي", "English") */
export function useTr() {
  const lang = useStore().lang;
  return (ar: string, en: string) => (lang === "en" ? en : ar);
}
