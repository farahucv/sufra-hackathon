import { describe, expect, it } from "vitest";
import { allergensList, recipes, safeSubs, type Recipe } from "@/lib/data";
import { autoSubs } from "@/lib/box";
import { toImportedRecipe, type Extraction } from "@/lib/import";
import { backupList } from "@/lib/import-backups";

const GLUTEN_NUTS = ["جلوتين", "مكسرات"];
const all: Recipe[] = [...recipes, ...backupList().map((b) => b.recipe)];

// A semolina dessert where the model proposes almond flour (nuts) and cornmeal (safe) for the gluten.
const extraction: Extraction = {
  isRecipe: true, title_ar: "بسبوسة", title_en: "Basbousa", time_min: 40, servings: 6, difficulty: "سهل", cats: ["حلويات"],
  nutrition: { kcal: 380, protein: 5, carbs: 50, fat: 15 },
  ingredients: [{
    key_ar: "سميد", name_en: "semolina", qty: 1, unit: "كوب", allergen: "جلوتين",
    subs: [
      { name_ar: "دقيق لوز خشن", name_en: "coarse almond flour", reason_ar: "قوام رملي", reason_en: "Sandy texture", impact_ar: "نكهة مكسرات", impact_en: "Nutty", kcal: 50, cost: 6, allergen: "مكسرات" },
      { name_ar: "دقيق ذرة خشن", name_en: "coarse cornmeal", reason_ar: "خالٍ من الجلوتين", reason_en: "Gluten-free", impact_ar: "سعر أقل", impact_en: "Cheaper", kcal: 10, cost: -1, allergen: "none" },
    ],
  }],
  steps: [{ text_ar: "اخلط السميد مع الحليب.", text_en: "Mix the semolina with milk.", min: 0 }],
};

describe("allergen-safe substitutes", () => {
  it("every substitute in demo data and backups carries a valid allergen tag", () => {
    const bad = all.flatMap((r) => r.ingredients.flatMap((i) => (i.subs ?? [])
      .filter((s) => s.allergen !== null && !allergensList.includes(s.allergen))
      .map((s) => `${r.id}/${i.key}/${s.name}: ${String(s.allergen)}`)));
    expect(bad).toEqual([]);
  });

  it("a gluten+nuts profile is never offered almond flour", () => {
    const { recipe } = toImportedRecipe(extraction, { videoId: "testvideo01", url: "", model: "test" });
    const semolina = recipe.ingredients[0]!;
    expect(semolina.subs?.map((s) => s.allergen)).toEqual(["مكسرات", null]);
    expect(safeSubs(semolina, GLUTEN_NUTS).map(({ sub }) => sub.name)).toEqual(["دقيق ذرة خشن"]);
    // The box picks the safe one too (index 1, not 0).
    expect(autoSubs(recipe, GLUTEN_NUTS)).toEqual({ "سميد": 1 });
    // Without a nut allergy, almond flour is a fine gluten swap; with one, it's hidden.
    expect(safeSubs(semolina, ["جلوتين"]).length).toBe(2);
    expect(safeSubs(semolina, ["مكسرات"]).map(({ sub }) => sub.name)).toEqual(["دقيق ذرة خشن"]);
  });

  it("no offered substitute anywhere contains the profile's allergens", () => {
    for (const r of all) for (const i of r.ingredients) for (const { sub } of safeSubs(i, GLUTEN_NUTS)) {
      expect(GLUTEN_NUTS).not.toContain(sub.allergen);
      expect(sub.name).not.toMatch(/لوز/);
    }
  });

  it("capitalizes English names from the model", () => {
    const { en } = toImportedRecipe(extraction, { videoId: "testvideo01", url: "", model: "test" });
    expect(en["دقيق ذرة خشن"]).toBe("Coarse cornmeal");
  });
});
