import { cheapest, priceOf, type Recipe } from "./data";

// ⚠ Demo data only — box pricing, suppliers and delivery are illustrative.

export const BOX_SERVINGS = [2, 4, 6] as const;
export const boxEligibleIds = ["kabsa", "jareesh", "saleeg", "mutabbaq", "pasta", "freekeh", "haneeth"];
export const isBoxEligible = (r: Recipe) => boxEligibleIds.includes(r.id);

/** Household basics assumed at home — never packed in the box. */
export const householdBasics = ["ملح", "ماء", "زيت طبخ أساسي", "فلفل أسود"];

export const BOX_FEE = 12; // packaging + cold-chain prep (demo)
export const DELIVERY_FEE = 9;

export type BoxLine = { key: string; name: string; qty: string; price: number; swapped?: { from: string; reason: string } ; allergen?: string };

const fmt = (n: number) => (Number.isInteger(n) ? `${n}` : n < 1 ? (Math.abs(n - 0.25) < 0.01 ? "¼" : Math.abs(n - 0.5) < 0.01 ? "½" : n.toFixed(2)) : n.toFixed(1).replace(/\.0$/, ""));

/** Build the box contents for a serving count, with chosen substitutions (ingredient key → sub index). */
export function buildBox(r: Recipe, serv: number, subs: Record<string, number>) {
  const k = serv / r.servings;
  const lines: BoxLine[] = r.ingredients.map((i) => {
    const c = cheapest(i.key);
    const unitPrice = c >= 0 ? (priceOf(i.key, c) as number) : 6;
    const sub = subs[i.key] !== undefined ? i.subs?.[subs[i.key]!] : undefined;
    // portion price scales with servings; packs never go below 40% of a retail unit
    const price = Math.max(unitPrice * 0.4, unitPrice * k * 0.8) + (sub ? sub.cost * k : 0);
    return {
      key: i.key, name: sub ? sub.name : i.key, qty: `${fmt(i.qty * k)} ${i.unit}`, price,
      swapped: sub ? { from: i.key, reason: sub.reason } : undefined,
      allergen: sub ? undefined : i.allergen,
    };
  });
  const ingredients = lines.reduce((a, l) => a + l.price, 0);
  const subtotal = Math.round((ingredients + BOX_FEE) * 4) / 4;
  return { lines, subtotal, perServing: subtotal / serv };
}

/** Pick the first safe substitute for every ingredient that conflicts with the user's allergies. */
export function autoSubs(r: Recipe, allergies: string[]) {
  const out: Record<string, number> = {};
  r.ingredients.forEach((i) => { if (i.allergen && allergies.includes(i.allergen) && i.subs?.length) out[i.key] = 0; });
  return out;
}
export const unsafeLeft = (r: Recipe, allergies: string[], subs: Record<string, number>) =>
  r.ingredients.filter((i) => i.allergen && allergies.includes(i.allergen) && subs[i.key] === undefined);

export const addresses = [
  { id: "home", label: "البيت", line: "حي الياسمين، الرياض" },
  { id: "work", label: "العمل", line: "طريق الملك فهد، الرياض" },
  { id: "family", label: "بيت الأهل", line: "حي النخيل، الرياض" },
];
export const slots = [
  { id: "asap", label: "خلال ٩٠ دقيقة", sub: "أسرع توصيل" },
  { id: "today", label: "اليوم ٦–٨ م", sub: "قبل العشاء" },
  { id: "tomorrow", label: "غداً ١٢–٢ م", sub: "للغداء" },
];
export const payments = [
  { id: "apple", label: "Apple Pay" },
  { id: "card", label: "بطاقة مدى / فيزا" },
  { id: "cash", label: "الدفع عند الاستلام" },
];
export const orderStages = ["تم تأكيد الطلب", "تجهيز المكونات", "خرج للتوصيل", "تم التسليم"];

export const chefTips: Record<string, Record<number, string>> = {
  kabsa: { 0: "لا تستعجل البصل — لونه الذهبي هو سر لون الكبسة.", 2: "اغسل الأرز حتى يصفى الماء لتحصل على حبات منفصلة." },
  jareesh: { 1: "حرّك من القاع كل ١٠ دقائق حتى لا يلتصق.", 3: "البصل المكرمل على نار هادئة ١٥ دقيقة يعطي حلاوة طبيعية." },
};
