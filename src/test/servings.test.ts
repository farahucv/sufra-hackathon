import { describe, expect, it } from "vitest";
import { clampServings, fmtQty, niceQty, scaledAmount } from "@/lib/box";

describe("servings scaling", () => {
  it("rounds counts and cups to ¼ / ½ / whole", () => {
    expect(fmtQty(niceQty(0.5 * 6 / 4, "كوب"))).toBe("¾");    // ½ cup for 4 → 6
    expect(fmtQty(niceQty(2.5 * 3 / 4, "كوب"))).toBe("2");    // 1.875 → 2
    expect(fmtQty(niceQty(3 * 5 / 3, "حبة"))).toBe("5");
    expect(fmtQty(niceQty(1 * 7 / 4, "حبة"))).toBe("1¾");
    expect(fmtQty(niceQty(4 * 12 / 4, "كوب"))).toBe("12");
    expect(fmtQty(niceQty(0.05, "م.ص"))).toBe("¼");           // never rounds to nothing
  });

  it("rounds grams and ml to sensible steps", () => {
    expect(niceQty(900 * 6 / 4, "غ")).toBe(1350);
    expect(niceQty(500 * 1 / 4, "غ")).toBe(130);
    expect(niceQty(33, "مل")).toBe(35);
  });

  it("formats with the unit and clamps servings to 1–12", () => {
    expect(scaledAmount(0.25, "كوب", 8, 4)).toBe("½ كوب");
    expect(clampServings(0)).toBe(1);
    expect(clampServings(20)).toBe(12);
  });
});
