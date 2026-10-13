// Server-only: calls the Gemini API with a YouTube URL and maps the result onto Recipe.
// Load from server functions with `await import("@/lib/gemini.server")` — never import from client code.
import { allergensList, categories } from "./data";
import {
  DIFFICULTIES, IMPORT_UNITS, NO_ALLERGEN, curatedSubKeys, extractionSchema, knownIngredientKeys, toImportedRecipe,
  type ImportedRecipe,
} from "./import";
import { parseYouTubeId, youtubeWatchUrl } from "./youtube";

// flash-lite: ~15s for a 5-min video with good output; 3.5-flash is the fallback when it's overloaded.
// (gemini-2.5-flash is closed to new API keys; 3.8-flash was overloaded/slow when tested on 2026-10-13.)
const DEFAULT_MODEL = "gemini-3.1-flash-lite";
const FALLBACK_MODELS = ["gemini-3.5-flash"];
/** Total budget across model attempts. */
const TIMEOUT_MS = 90_000;

/** Error codes thrown as Error.message so the client can show a translated message. */
export type ImportErrorCode = "BAD_URL" | "NOT_CONFIGURED" | "NOT_A_RECIPE" | "TIMEOUT" | "VIDEO_UNAVAILABLE" | "GEMINI_FAILED";

export const geminiConfigured = () => !!process.env["GEMINI_API_KEY"];

const S = (description?: string) => ({ type: "STRING", ...(description ? { description } : {}) });
const N = (description: string) => ({ type: "NUMBER", description });
const I = (description: string) => ({ type: "INTEGER", description });
const obj = (properties: Record<string, unknown>) => ({ type: "OBJECT", properties, required: Object.keys(properties), propertyOrdering: Object.keys(properties) });

const subSchema = obj({
  name_ar: S(), name_en: S(), reason_ar: S("Why it works, one short sentence"), reason_en: S(),
  impact_ar: S("Effect on taste/health/price, 2 short phrases joined by ' · '"), impact_en: S(),
  kcal: I("Change in total recipe kcal vs the original ingredient (negative = fewer)"),
  cost: N("Change in cost in SAR vs the original ingredient at Saudi supermarket prices (negative = cheaper)"),
});

const responseSchema = obj({
  isRecipe: { type: "BOOLEAN", description: "false if the video does not show how to cook a dish" },
  title_ar: S("Dish name in Arabic"), title_en: S("Dish name in English"),
  time_min: I("Total active + passive cooking time in minutes"),
  servings: I("Number of servings the recipe makes"),
  difficulty: { type: "STRING", enum: [...DIFFICULTIES] },
  cats: { type: "ARRAY", items: { type: "STRING", enum: categories }, description: "1-2 fitting categories" },
  nutrition: obj({ kcal: I("per serving"), protein: I("grams per serving"), carbs: I("grams per serving"), fat: I("grams per serving") }),
  ingredients: {
    type: "ARRAY",
    items: obj({
      key_ar: S("Short Arabic ingredient name; reuse a known key exactly when it matches"),
      name_en: S("English ingredient name"),
      qty: N("Quantity for the stated servings"),
      unit: { type: "STRING", enum: [...IMPORT_UNITS] },
      allergen: { type: "STRING", enum: [...allergensList, NO_ALLERGEN] },
      subs: { type: "ARRAY", items: subSchema, description: "1-2 allergen-free substitutes when allergen is not 'none', else empty" },
    }),
  },
  steps: { type: "ARRAY", items: obj({ text_ar: S("One imperative cooking step in Arabic"), text_en: S("Same step in English"), min: I("Minutes this step takes if timed, else 0") }) },
});

function buildPrompt() {
  return `You are a recipe extraction assistant for a Saudi cooking app. Watch the attached YouTube video (visuals, speech and on-screen text) and extract the recipe it actually shows. Return JSON only, matching the schema.

Rules:
- Arabic text: clear Modern Standard Arabic suited to Saudi home cooks. English text: natural, concise.
- Do not invent dishes or ingredients that are not in the video. If a quantity is not stated, estimate a realistic amount for the stated servings.
- Include every ingredient the video uses, once each (merge duplicates): every spice, aromatic, paste, oil and garnish that any step mentions must appear in ingredients. Skip only water and salt.
- key_ar: if the ingredient is the same thing as one of these KNOWN KEYS, use that exact Arabic string; otherwise write a short Arabic name (1-3 words, no quantities). The list is only for consistent naming — never add a known key the video doesn't use, and never drop an ingredient because it isn't listed. Mixed nuts are "مكسرات مشكلة", not a single nut.
  KNOWN KEYS: ${knownIngredientKeys.join("، ")}
- unit: exactly one of: ${IMPORT_UNITS.join("، ")} (م.ك = tablespoon, م.ص = teaspoon, غ = grams, كغ = kg, مل = ml, حبة = piece, فص = clove, رشة = pinch).
- allergen: exactly one of: ${allergensList.join("، ")} — or "${NO_ALLERGEN}". Nuts = tree nuts and peanuts; dairy (ألبان) = milk, butter, ghee (سمن), cheese, yogurt, cream; gluten (جلوتين) = wheat flour, bread, pasta, bulgur, freekeh, semolina, dough, vermicelli; seafood = fish and shellfish; sesame = seeds and tahini; soy = soy sauce, tofu.
- subs: for an ingredient with an allergen, give 1-2 realistic substitutes free of that allergen. Return an empty array if allergen is "${NO_ALLERGEN}" or the key is one of: ${curatedSubKeys.join("، ")}.
- steps: 3-12 concise steps in order, one main action each, Arabic in the imperative (e.g. "حمّر البصل حتى يذبل"). min = minutes for steps with a cooking/resting time, else 0.
- nutrition: your best estimate per serving.
- If the video is not a cooking recipe, set isRecipe=false and leave the arrays empty.`;
}

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
  error?: { code?: number; message?: string; status?: string };
};

/** Thrown for errors worth retrying on the next model (overloaded, rate-limited, model retired). */
class RetryableError extends Error {}

async function callModel(model: string, key: string, watchUrl: string, deadline: number): Promise<GeminiResponse> {
  let res: Response;
  try {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ file_data: { file_uri: watchUrl } }, { text: buildPrompt() }] }],
        generationConfig: { responseMimeType: "application/json", responseSchema, temperature: 0.2, mediaResolution: "MEDIA_RESOLUTION_LOW" },
      }),
      signal: AbortSignal.timeout(Math.max(1, deadline - Date.now())),
    });
  } catch (e) {
    const timeout = e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError");
    console.error(`[import] ${model} request failed:`, e instanceof Error ? e.message : e);
    throw new Error((timeout ? "TIMEOUT" : "GEMINI_FAILED") satisfies ImportErrorCode);
  }
  const body = (await res.json().catch(() => ({}))) as GeminiResponse;
  if (res.ok) return body;
  const msg = body.error?.message ?? `HTTP ${res.status}`;
  console.error(`[import] ${model} ${res.status} ${body.error?.status ?? ""}: ${msg}`);
  if (res.status === 404 || res.status === 429 || res.status >= 500) throw new RetryableError(msg);
  // Private / removed / region-locked videos come back as 400/403 mentioning the video or file.
  if ((res.status === 400 || res.status === 403) && /video|file_uri|youtube|unavailable|private/i.test(msg)) throw new Error("VIDEO_UNAVAILABLE" satisfies ImportErrorCode);
  throw new Error("GEMINI_FAILED" satisfies ImportErrorCode);
}

/** Full pipeline: YouTube URL → Gemini → validated extraction → Recipe (+ English map). Throws Error(ImportErrorCode). */
export async function extractImportedRecipe(url: string, opts: { model?: string } = {}): Promise<ImportedRecipe> {
  const videoId = parseYouTubeId(url);
  if (!videoId) throw new Error("BAD_URL" satisfies ImportErrorCode);
  const key = process.env["GEMINI_API_KEY"];
  if (!key) throw new Error("NOT_CONFIGURED" satisfies ImportErrorCode);
  const models = [...new Set([opts.model ?? process.env["GEMINI_MODEL"] ?? DEFAULT_MODEL, ...FALLBACK_MODELS])];
  const watchUrl = youtubeWatchUrl(videoId);
  const deadline = Date.now() + TIMEOUT_MS;

  let body: GeminiResponse | undefined;
  let used = "";
  for (const model of models) {
    try { body = await callModel(model, key, watchUrl, deadline); used = model; break; } catch (e) {
      if (!(e instanceof RetryableError)) throw e;
    }
  }
  if (!body) throw new Error("GEMINI_FAILED" satisfies ImportErrorCode);

  const cand = body.candidates?.[0];
  const text = cand?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!text) {
    console.error("[import] Gemini returned no text:", body.promptFeedback?.blockReason ?? cand?.finishReason ?? "unknown");
    throw new Error("GEMINI_FAILED" satisfies ImportErrorCode);
  }
  let json: unknown;
  try { json = JSON.parse(text); } catch {
    console.error("[import] Gemini returned invalid JSON (finishReason:", cand?.finishReason, ")");
    throw new Error("GEMINI_FAILED" satisfies ImportErrorCode);
  }
  const parsed = extractionSchema.safeParse(json);
  if (!parsed.success) {
    console.error("[import] Extraction failed validation:", parsed.error.issues.slice(0, 5));
    throw new Error("GEMINI_FAILED" satisfies ImportErrorCode);
  }
  return toImportedRecipe(parsed.data, { videoId, url: watchUrl, model: used });
}
