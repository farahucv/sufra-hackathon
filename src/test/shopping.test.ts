import { describe, expect, it } from "vitest";
import { getRecipe, priceOf, cheapest } from "@/lib/data";
import { packsNeeded, shoppingList } from "@/lib/shopping";

const kabsa = getRecipe("kabsa")!;
const nothing = () => false;

describe("fridge → shopping", () => {
  it("counts retail packages across units", () => {
    expect(packsNeeded("أرز", 3, "كوب")).toBe(1);        // 720 g from a 5 kg bag
    expect(packsNeeded("دجاج", 3, "حبة")).toBe(3);       // whole chickens
    expect(packsNeeded("دجاج", 900, "غ")).toBe(1);       // 900 g ≈ one chicken
    expect(packsNeeded("لحم مفروم", 1200, "غ")).toBe(3); // 500 g packs
    expect(packsNeeded("بصل", 12, "حبة")).toBe(2);       // 1.8 kg from 1 kg bags
    expect(packsNeeded("مجهول", 5, "كوب")).toBe(1);      // unknown → one pack
  });

  it("only charges for missing items, and only per extra package", () => {
    const have = (n: string) => ["دجاج", "أرز", "بصل", "طماطم", "بهارات كبسة"].includes(n);
    const four = shoppingList(kabsa, 4, {}, have);
    expect(four.owned.map((o) => o.key)).toEqual(["دجاج", "أرز", "بصل", "طماطم", "بهارات كبسة"]);
    expect(four.buy.map((b) => b.key)).toEqual(["لوز", "زبيب"]);
    const almonds = priceOf("لوز", cheapest("لوز"))!;
    expect(four.buy[0]!.price).toBe(almonds);             // ½ cup fits one 250 g pack
    const eight = shoppingList(kabsa, 8, {}, have);
    expect(eight.buy[0]!.price).toBe(almonds);            // 1 cup = 240 g still one pack
    const twelve = shoppingList(kabsa, 12, {}, have);
    expect(twelve.buy[0]!.price).toBe(almonds * 2);       // 1½ cups = 360 g → two packs
  });

  it("household basics count as owned and unpriced items don't break the total", () => {
    const r = { ...kabsa, ingredients: [
      { key: "ملح", qty: 1, unit: "م.ص" },
      { key: "جوزة الطيب", qty: 0.25, unit: "م.ص" },
      { key: "زبيب", qty: 0.25, unit: "كوب" },
    ] };
    const list = shoppingList(r, 4, {}, nothing);
    expect(list.owned.map((o) => o.key)).toEqual(["ملح"]);
    expect(list.unpriced).toBe(1);
    expect(list.buy.find((b) => b.key === "جوزة الطيب")!.price).toBeNull();
    expect(list.total).toBe(priceOf("زبيب", cheapest("زبيب")));
  });

  it("prices an applied substitute from the original's package plus its cost difference", () => {
    const sub = kabsa.ingredients.find((i) => i.key === "لوز")!.subs![0]!; // pumpkin seeds, cost -2 per recipe
    const list = shoppingList(kabsa, 4, { "لوز": 0 }, nothing);
    const line = list.buy.find((b) => b.key === "لوز")!;
    expect(line.name).toBe(sub.name);
    expect(line.swappedFrom).toBe("لوز");
    expect(line.price).toBeCloseTo(priceOf("لوز", cheapest("لوز"))! + sub.cost);
  });
});

describe("grocery uses applied substitutes", () => {
  it("adds the substitute's cost difference at every store", async () => {
    const { linePriceAt } = await import("@/lib/shopping");
    const line = shoppingList(kabsa, 4, { "لوز": 0 }, nothing).buy.find((b) => b.key === "لوز")!;
    expect(line.extra).toBe(-2);                         // pumpkin seeds: cost -2 per recipe at 4 servings
    expect(linePriceAt(line, 20)).toBe(18);              // one pack at 20 SAR, minus 2
    expect(linePriceAt(line, null)).toBeNull();          // store doesn't stock it
  });
});
