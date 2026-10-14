import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { getRecipe } from "@/lib/data";
import { NutritionPanel } from "@/components/Nutrition";

describe("nutrition panel", () => {
  it("applies substitute kcal per serving (sub.kcal is per recipe) and shows the total", () => {
    const kabsa = getRecipe("kabsa")!; // 620 kcal/serving, 4 servings, 38 g protein
    const pumpkin = kabsa.ingredients.find((i) => i.key === "لوز")!.subs![0]!; // -10 kcal for the whole recipe
    render(<NutritionPanel r={kabsa} kcalDelta={pumpkin.kcal * 4} serv={8} />);
    // -40 per recipe / 4 servings = -10 per serving
    expect(screen.getByText("بعد البدائل: 610 سعرة بدل 620")).toBeInTheDocument();
    expect(screen.getByText("المجموع لـ 8 أشخاص: 4880 سعرة")).toBeInTheDocument();
    expect(screen.getByText("عالي البروتين")).toBeInTheDocument();
    expect(screen.getByText("تقديري")).toBeInTheDocument();
  });

  it("no badge under 30 g protein, no after-subs line without substitutes", () => {
    render(<NutritionPanel r={getRecipe("luqaimat")!} />);
    expect(screen.queryByText("عالي البروتين")).toBeNull();
    expect(screen.queryByText(/بعد البدائل/)).toBeNull();
  });
});
