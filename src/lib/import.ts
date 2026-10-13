import { z } from "zod";
import { allergensList, categories, prices, recipes, type Ingredient, type Recipe, type Sub } from "./data";
import { hasTranslation } from "./i18n";
import { youtubeThumb } from "./youtube";

// Real recipe import: shape of the Gemini extraction and its mapping onto the app's Recipe type.
// Client-safe (no secrets) — the Gemini call itself lives in gemini.server.ts.

export const IMPORT_UNITS = ["حبة", "كوب", "م.ك", "م.ص", "غ", "كغ", "مل", "لتر", "ربطة", "علبة", "فص", "شريحة", "رشة"] as const;
export const DIFFICULTIES = ["سهل", "متوسط", "متقدم"] as const;
export const NO_ALLERGEN = "none";
export const IMPORT_CHEF_ID = "imported";
export const IMPORT_REGION = "من يوتيوب";
export const IMPORT_LIKES = "جديد";
const MAX_SUBS = 2;

/** Ingredient keys the app already knows (prices, pantry, curated subs) — the model should reuse them verbatim. */
export const knownIngredientKeys = [...new Set([...Object.keys(prices), ...recipes.flatMap((r) => r.ingredients.map((i) => i.key))])];

/** Curated allergen + substitutes per existing ingredient key; these win over model output. */
const curated = new Map<string, { allergen: string; subs: Sub[] }>();
for (const r of recipes) for (const i of r.ingredients) if (i.allergen && i.subs?.length && !curated.has(i.key)) curated.set(i.key, { allergen: i.allergen, subs: i.subs });
export const curatedSubKeys = [...curated.keys()];

const text = z.string().trim().min(1);
const rawSub = z.object({
  name_ar: text, name_en: text, reason_ar: text, reason_en: text, impact_ar: text, impact_en: text,
  kcal: z.number(), cost: z.number(),
});
export const extractionSchema = z.object({
  isRecipe: z.boolean(),
  title_ar: z.string(), title_en: z.string(),
  time_min: z.number(), servings: z.number(),
  difficulty: z.enum(DIFFICULTIES),
  cats: z.array(z.string()),
  nutrition: z.object({ kcal: z.number(), protein: z.number(), carbs: z.number(), fat: z.number() }),
  ingredients: z.array(z.object({
    key_ar: text, name_en: text, qty: z.number(),
    unit: z.enum(IMPORT_UNITS),
    allergen: z.string(),
    subs: z.array(rawSub),
  })),
  steps: z.array(z.object({ text_ar: text, text_en: text, min: z.number() })),
});
export type Extraction = z.infer<typeof extractionSchema>;

export type ImportedRecipe = {
  recipe: Recipe;
  /** Arabic → English for the dynamic strings in `recipe` that the static dictionary doesn't cover. */
  en: Record<string, string>;
  source: { videoId: string; url: string; model: string };
};

const int = (n: number, min = 0) => Math.max(min, Math.round(n));

/** Map a validated extraction onto Recipe. Throws "NOT_A_RECIPE" if the video isn't a usable recipe. */
export function toImportedRecipe(x: Extraction, source: ImportedRecipe["source"]): ImportedRecipe {
  const { videoId } = source;
  if (!x.isRecipe || !x.title_ar.trim() || x.ingredients.length === 0 || x.steps.length === 0) throw new Error("NOT_A_RECIPE");
  const en: Record<string, string> = {};
  const tr = (ar: string, eng: string) => { if (ar && eng && !hasTranslation(ar)) en[ar] = eng.trim(); return ar; };

  const ingredients: Ingredient[] = [];
  for (const i of x.ingredients) {
    const key = tr(i.key_ar.trim(), i.name_en);
    const qty = Math.round(Math.max(0, i.qty) * 100) / 100;
    const dup = ingredients.find((g) => g.key === key);
    if (dup) { if (dup.unit === i.unit) dup.qty = Math.round((dup.qty + qty) * 100) / 100; continue; }
    const known = curated.get(key);
    const allergen = known?.allergen ?? (allergensList.includes(i.allergen) ? i.allergen : undefined);
    const ing: Ingredient = { key, qty, unit: i.unit };
    if (allergen) {
      ing.allergen = allergen;
      const subs = known?.subs ?? i.subs.slice(0, MAX_SUBS).map((s): Sub => ({
        name: tr(s.name_ar, s.name_en), reason: tr(s.reason_ar, s.reason_en), impact: tr(s.impact_ar, s.impact_en),
        kcal: Math.round(s.kcal), cost: Math.round(s.cost * 100) / 100,
      }));
      if (subs.length) ing.subs = subs;
    }
    ingredients.push(ing);
  }

  const steps = x.steps.map((s) => {
    const st: { t: string; min?: number } = { t: tr(s.text_ar, s.text_en) };
    if (s.min >= 1) st.min = Math.round(s.min);
    return st;
  });
  const time = x.time_min >= 1 ? Math.round(x.time_min) : steps.reduce((a, s) => a + (s.min ?? 0), 0) || 30;
  const cats = [...new Set(x.cats.filter((c) => categories.includes(c)))].slice(0, 2);
  const title = tr(x.title_ar.trim(), x.title_en);

  const recipe: Recipe = {
    id: `imp-${videoId}`, title, en: x.title_en.trim() || title, img: youtubeThumb(videoId),
    chefId: IMPORT_CHEF_ID, region: IMPORT_REGION, likes: IMPORT_LIKES,
    time, servings: int(x.servings, 1), difficulty: x.difficulty,
    cats: cats.length ? cats : time <= 30 ? ["سريع"] : [],
    nutrition: { kcal: int(x.nutrition.kcal), protein: int(x.nutrition.protein), carbs: int(x.nutrition.carbs), fat: int(x.nutrition.fat) },
    ingredients, steps,
  };
  return { recipe, en, source };
}
