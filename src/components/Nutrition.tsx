import { Dumbbell } from "lucide-react";
import type { Recipe } from "@/lib/data";
import { t } from "@/lib/i18n";

export const HIGH_PROTEIN_G = 30;

/**
 * Per-serving nutrition (estimated), shared by the recipe page and the import result.
 * kcalDelta: sum of applied sub.kcal — those are per recipe at its base servings, so per serving it's kcalDelta / r.servings.
 * serv: when set, also shows the total for that many people.
 */
export function NutritionPanel({ r, kcalDelta = 0, serv, compact }: { r: Recipe; kcalDelta?: number; serv?: number | undefined; compact?: boolean }) {
  const before = r.nutrition.kcal;
  const after = before + Math.round(kcalDelta / r.servings);
  const tiles: [string, string | number][] = [
    [t("سعرات"), after], [t("بروتين"), t("{n}غ", { n: r.nutrition.protein })],
    [t("كارب"), t("{n}غ", { n: r.nutrition.carbs })], [t("دهون"), t("{n}غ", { n: r.nutrition.fat })],
  ];
  return (
    <div className={compact ? "" : "rounded-2xl bg-card p-4 shadow-soft"}>
      <div className="flex flex-wrap items-center gap-2">
        <p className={compact ? "text-sm font-semibold" : "font-semibold"}>{t("القيمة الغذائية")} <span className="text-xs font-normal text-muted-foreground">{t("/ حصة")}</span></p>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{t("تقديري")}</span>
        {r.nutrition.protein >= HIGH_PROTEIN_G && <span className="inline-flex items-center gap-1 rounded-full bg-olive px-2 py-0.5 text-[10px] font-medium text-olive-foreground"><Dumbbell className="h-3 w-3" />{t("عالي البروتين")}</span>}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
        {tiles.map(([l, v]) => <div key={l} className="rounded-xl bg-secondary py-2"><p className="text-sm font-bold tabular-nums">{v}</p><p className="text-[10px] text-muted-foreground">{l}</p></div>)}
      </div>
      {after !== before && <p className="mt-2 text-[11px] text-olive">{t("بعد البدائل: {x} سعرة بدل {y}", { x: after, y: before })}</p>}
      {serv !== undefined && <p className="mt-2 text-xs text-muted-foreground">{t("المجموع لـ {n} أشخاص: {x} سعرة", { n: serv, x: after * serv })}</p>}
    </div>
  );
}
