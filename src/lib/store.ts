import { useEffect, useSyncExternalStore } from "react";
import { ingredientLoc, type Loc } from "./data";
import { loadDemoProfile, saveDemoProfile } from "./profile.functions";
import { setLangValue } from "./lang";

export type PantryItem = { name: string; loc: Loc };
export type State = {
  onboarded: boolean; name: string; diet: string; household: number;
  allergies: string[]; dislikes: string[]; saved: string[]; liked: string[];
  pantry: PantryItem[]; lang: "ar" | "en"; journey: number; synced: boolean;
  box: BoxDraft | null; order: Order | null;
};
export type BoxDraft = { recipeId: string; serv: number; subs: Record<string, number> };
export type Order = BoxDraft & { id: string; address: string; slot: string; pay: string; total: number; stage: number; placedAt: number };

const defaultPantry = ["دجاج", "أرز", "بصل", "طماطم", "بهارات كبسة", "بيض", "حليب", "دقيق", "خميرة", "زيت", "زبيب", "دبس تمر", "سمسم"];
export const defaults: State = {
  onboarded: false, name: "ضيف سُفرة", diet: "all", household: 4,
  allergies: ["مكسرات"], dislikes: [], saved: ["jareesh"], liked: [],
  pantry: defaultPantry.map((name) => ({ name, loc: ingredientLoc[name] ?? "pantry" })),
  lang: "ar", journey: 0, synced: false, box: null, order: null,
};

let state: State = defaults;
const subs = new Set<() => void>();
let hydrated = false;
let saveTimer: ReturnType<typeof setTimeout> | undefined;

const emit = () => { setLangValue(state.lang); subs.forEach((l) => l()); };

const persist = (localOnly = false) => {
  if (!hydrated || typeof window === "undefined") return;
  const { synced: _s, ...data } = state;
  try { localStorage.setItem("sufra-state", JSON.stringify(data)); } catch { /* quota */ }
  if (localOnly) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveDemoProfile({ data: { deviceId: getDeviceId(), data } })
      .then(() => { if (!state.synced) setStore(() => ({ synced: true })); })
      .catch(() => {});
  }, 800);
};

export const getState = () => state;
export const setStore = (fn: (s: State) => Partial<State>) => {
  const patch = fn(state);
  state = { ...state, ...patch };
  emit();
  const keys = Object.keys(patch);
  if (keys.length === 1 && keys[0] === "synced") return;
  // Transient demo-journey steps stay local; never trigger a cloud write.
  persist(keys.every((k) => k === "journey"));
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
    emit();
    loadDemoProfile({ data: { deviceId: getDeviceId() } })
      .then(({ json }) => {
        if (json) { state = { ...state, ...(JSON.parse(json) as Partial<State>), synced: true }; emit(); }
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
