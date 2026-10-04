import en from "./i18n.en.json";
import { getLang } from "./lang";

/**
 * Centralized localization. Arabic is the source language and the lookup key;
 * English lives in i18n.en.json. Every user-facing string — UI copy and demo
 * data (ingredients, steps, stories…) — goes through t().
 * Use {name} placeholders for interpolation: t("{n} حصص", { n: 4 }).
 */
const dict = en as Record<string, string>;
const missing = new Set<string>();

export function t(ar: string, vars?: Record<string, string | number>): string {
  let s = ar;
  if (getLang() === "en") {
    const e = dict[ar];
    if (e === undefined) {
      if (!missing.has(ar)) { missing.add(ar); console.warn("[i18n] missing English for:", ar); }
    } else s = e;
  }
  if (vars) for (const k in vars) s = s.split(`{${k}}`).join(String(vars[k]));
  return s;
}

/** Join a list with the language's separator. */
export const list = (xs: string[]) => xs.map((x) => t(x)).join(getLang() === "en" ? ", " : "، ");
export const isEn = () => getLang() === "en";
export const hasTranslation = (ar: string) => ar in dict;
