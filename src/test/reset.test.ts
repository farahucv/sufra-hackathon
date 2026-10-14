import { describe, expect, it } from "vitest";
import { getState, resetToNewUser, setStore } from "@/lib/store";

describe("start over", () => {
  it("clears allergies, fridge, saved and imported recipes but keeps the language", () => {
    setStore(() => ({ lang: "en", allergies: ["مكسرات"], saved: ["kabsa"], pantry: [{ name: "أرز", loc: "pantry" }], onboarded: true }));
    resetToNewUser();
    const s = getState();
    expect([s.allergies, s.dislikes, s.saved, s.liked, s.pantry, s.imported]).toEqual([[], [], [], [], [], []]);
    expect(s.box).toBeNull();
    expect(s.order).toBeNull();
    expect(s.onboarded).toBe(false);
    expect(s.lang).toBe("en");
    setStore(() => ({ lang: "ar" }));
  });
});
