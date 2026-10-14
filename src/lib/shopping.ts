import { cheapest, priceOf, type Recipe } from "./data";
import { fmtQty, householdBasics, niceQty, scaledAmount } from "./box";
import { t } from "./i18n";

// ⚠ Demo data only — package sizes are illustrative, like the prices they describe.

/** What one price in data.ts `prices` buys: a retail package. */
export const packs: Record<string, { size: number; unit: string }> = {
  "دجاج": { size: 1, unit: "حبة" }, "أرز": { size: 5, unit: "كغ" }, "بصل": { size: 1, unit: "كغ" }, "طماطم": { size: 1, unit: "كغ" },
  "بهارات كبسة": { size: 100, unit: "غ" }, "لوز": { size: 250, unit: "غ" }, "زبيب": { size: 250, unit: "غ" }, "جريش": { size: 1, unit: "كغ" },
  "لبن": { size: 1, unit: "لتر" }, "سمن": { size: 800, unit: "غ" }, "دقيق": { size: 2, unit: "كغ" }, "لحم": { size: 1, unit: "كغ" },
  "كوسا": { size: 1, unit: "كغ" }, "جزر": { size: 1, unit: "كغ" }, "حليب": { size: 1, unit: "لتر" }, "لومي": { size: 100, unit: "غ" },
  "عجينة": { size: 20, unit: "حبة" }, "لحم مفروم": { size: 500, unit: "غ" }, "بيض": { size: 15, unit: "حبة" }, "كراث": { size: 1, unit: "ربطة" },
  "بهارات حنيذ": { size: 100, unit: "غ" }, "خميرة": { size: 100, unit: "غ" }, "دبس تمر": { size: 400, unit: "مل" }, "سمسم": { size: 200, unit: "غ" },
  "زيت": { size: 1.5, unit: "لتر" }, "مكرونة": { size: 500, unit: "غ" }, "فريكة": { size: 500, unit: "غ" }, "حمص": { size: 1, unit: "علبة" },
  "طحينة": { size: 400, unit: "غ" },
};
/** Grams per piece, so "2 حبة بصل" can be compared with a 1 kg bag. */
const pieceGrams: Record<string, number> = { "دجاج": 1000, "بصل": 150, "طماطم": 120, "كوسا": 200, "جزر": 100, "لومي": 5, "بيض": 60 };
/** Mass and volume units in grams/ml (treated as equal — fine for a demo estimate). */
const BASE: Record<string, number> = { "غ": 1, "كغ": 1000, "مل": 1, "لتر": 1000, "كوب": 240, "م.ك": 15, "م.ص": 5, "رشة": 0.5 };

const toBase = (key: string, qty: number, unit: string) =>
  BASE[unit] !== undefined ? qty * BASE[unit]! : unit === "حبة" && pieceGrams[key] ? qty * pieceGrams[key]! : null;

/** How many retail packages cover qty of this ingredient (at least 1; 1 when units can't be compared). */
export function packsNeeded(key: string, qty: number, unit: string) {
  const pack = packs[key];
  if (!pack || qty <= 0) return 1;
  let inPackUnits: number | null = unit === pack.unit ? qty : null;
  if (inPackUnits === null) {
    const amount = toBase(key, qty, unit), per = toBase(key, 1, pack.unit);
    if (amount !== null && per) inPackUnits = amount / per;
  }
  return inPackUnits === null ? 1 : Math.max(1, Math.ceil(inPackUnits / pack.size - 1e-9));
}

export const packLabel = (key: string) => { const p = packs[key]; return p ? `${fmtQty(p.size)} ${t(p.unit)}` : null; };

export type ShopLine = {
  key: string; name: string; amount: string; packs: number; pack: string | null;
  packPrice: number | null; store: number; price: number | null; swappedFrom?: string;
  /** Substitute's cost difference at these servings (0 when none) — add it to any store's package total. */
  extra: number;
};

/** Price of a line at a given store: its packages plus any substitute difference; null if that store lacks it. */
export const linePriceAt = (l: ShopLine, storePrice: number | null) => (storePrice === null ? null : Math.max(0, storePrice * l.packs + l.extra));

/**
 * Split a recipe at a serving count into what the user already has (fridge + household basics)
 * and what to buy, priced by retail package at the cheapest demo store for each item.
 * Amounts scale with servings; a price only changes when another package is needed.
 * subs: chosen substitute index per ingredient key (same shape as the box draft).
 */
export function shoppingList(r: Recipe, serv: number, subs: Record<string, number>, has: (name: string) => boolean, opts: { includeOwned?: boolean } = {}) {
  const owned: { key: string; name: string; amount: string }[] = [];
  const buy: ShopLine[] = [];
  for (const i of r.ingredients) {
    const sub = subs[i.key] !== undefined ? i.subs?.[subs[i.key]!] : undefined;
    const name = sub ? sub.name : i.key;
    const amount = scaledAmount(i.qty, i.unit, serv, r.servings);
    if (!opts.includeOwned && (has(name) || householdBasics.includes(name))) { owned.push({ key: i.key, name, amount }); continue; }
    const n = packsNeeded(i.key, niceQty((i.qty * serv) / r.servings, i.unit), i.unit);
    const store = cheapest(i.key);
    const packPrice = store >= 0 ? priceOf(i.key, store) : null;
    // A substitute is priced from the original's package plus its cost difference (sub.cost is per recipe at base servings).
    const extra = sub ? (sub.cost * serv) / r.servings : 0;
    const line: ShopLine = { key: i.key, name, amount, packs: n, pack: packLabel(i.key), packPrice, store, price: null, extra };
    line.price = linePriceAt(line, packPrice);
    if (sub) line.swappedFrom = i.key;
    buy.push(line);
  }
  const total = buy.reduce((a, l) => a + (l.price ?? 0), 0);
  return { owned, buy, total, unpriced: buy.filter((l) => l.price === null).length };
}
