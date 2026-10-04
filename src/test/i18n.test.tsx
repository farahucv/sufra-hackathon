import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import en from "@/lib/i18n.en.json";
import { setLangValue as setLang } from "@/lib/lang";
import { t, list } from "@/lib/i18n";
import { sar } from "@/lib/data";

const AR = /[\u0600-\u06FF]/;
// Intentional Arabic in English mode: brand wordmark only.
const BRAND = new Set(["سُفرة", "س"]);
const dict = en as Record<string, string>;
const root = join(__dirname, "..");
const files = [
  ...readdirSync(join(root, "routes")).filter((f) => f.endsWith(".tsx")).map((f) => join(root, "routes", f)),
  ...readdirSync(join(root, "components")).filter((f) => f.endsWith(".tsx")).map((f) => join(root, "components", f)),
];

describe("bilingual localization", () => {
  it("every t() key used in screens has an English translation", () => {
    const missing: string[] = [];
    for (const f of files) {
      const src = readFileSync(f, "utf8");
      for (const m of src.matchAll(/\bt\("((?:[^"\\]|\\.)*)"/g)) {
        const k = m[1]!;
        if (AR.test(k) && !BRAND.has(k) && !(k in dict)) missing.push(`${f}: ${k}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("every Arabic demo-data string has an English translation", () => {
    const missing: string[] = [];
    for (const f of ["lib/data.ts", "lib/box.ts"]) {
      const src = readFileSync(join(root, f), "utf8");
      for (const m of src.matchAll(/"([^"\n]*[\u0600-\u06FF][^"\n]*)"/g)) if (!(m[1]! in dict)) missing.push(m[1]!);
    }
    expect(missing).toEqual([]);
  });

  it("English values contain no Arabic (except brand)", () => {
    const bad = Object.entries(dict).filter(([k, v]) => !BRAND.has(k) && AR.test(v));
    expect(bad).toEqual([]);
  });

  it("screens have no hard-coded Arabic JSX text outside t()", () => {
    const bad: string[] = [];
    for (const f of files) {
      const body = readFileSync(f, "utf8").replace(/head:[\s\S]*?\}\),\n/, "");
      for (const m of body.matchAll(/>([^<>{}]*[\u0600-\u06FF][^<>{}]*)</g)) if (!BRAND.has(m[1]!.trim())) bad.push(`${f}: ${m[1]!.trim()}`);
    }
    expect(bad).toEqual([]);
  });

  it("switches language at runtime", () => {
    setLang("en");
    expect(t("صندوق جاهز للطبخ")).toBe("Ready-to-Cook Box");
    expect(list(["دجاج", "أرز"])).not.toMatch(AR);
    expect(sar(10)).toBe("SAR 10.00");
    setLang("ar");
    expect(t("صندوق جاهز للطبخ")).toBe("صندوق جاهز للطبخ");
    expect(sar(10)).toContain("ر.س");
  });
});
