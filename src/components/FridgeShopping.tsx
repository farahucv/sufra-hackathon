import { Link } from "@tanstack/react-router";
import { Check, ShoppingCart } from "lucide-react";
import { DemoBadge } from "@/components/AppShell";
import { sar, stores, type Recipe } from "@/lib/data";
import { shoppingList } from "@/lib/shopping";
import { hasPantry, useStore } from "@/lib/store";
import { t } from "@/lib/i18n";

/** Recipe page "من ثلاجتك": what you already have vs. only what to buy, priced by retail package. */
export function FridgeShopping({ r, serv, subs }: { r: Recipe; serv: number; subs: Record<string, number> }) {
  const s = useStore();
  const { owned, buy, total, unpriced } = shoppingList(r, serv, subs, (name) => hasPantry(s, name));
  return (
    <section className="rounded-2xl bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between gap-2"><p className="font-semibold">{t("من ثلاجتك")}</p><DemoBadge label={t("أسعار تجريبية")} /></div>

      {owned.length > 0 && <>
        <p className="mt-3 text-xs font-medium text-olive">{t("عندك ({n})", { n: owned.length })}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {owned.map((o) => <span key={o.key} className="inline-flex items-center gap-1 rounded-full bg-accent/60 px-2.5 py-1 text-[11px] text-accent-foreground"><Check className="h-3 w-3" />{t(o.name)} · {o.amount}</span>)}
        </div>
      </>}

      {buy.length === 0 ? (
        <p className="mt-3 rounded-xl bg-accent/50 p-3 text-sm font-medium text-accent-foreground">{t("كل المكونات عندك!")}</p>
      ) : <>
        <p className="mt-4 text-xs font-medium text-terracotta">{t("تحتاج تشتري ({n})", { n: buy.length })}</p>
        <ul className="mt-1.5 divide-y text-sm">
          {buy.map((l) => (
            <li key={l.key} className="py-2">
              <div className="flex items-baseline gap-2">
                <span className="min-w-0 flex-1 font-medium">{t(l.name)} <span className="text-xs font-normal text-muted-foreground">· {l.amount}</span></span>
                <span className="shrink-0 tabular-nums">{l.price === null ? <span className="text-xs text-muted-foreground">{t("السعر غير متوفر")}</span> : sar(l.price)}</span>
              </div>
              {l.swappedFrom && <p className="text-[11px] text-olive">{t("بدل {x}", { x: t(l.swappedFrom) })}</p>}
              {l.packPrice !== null && (
                <p className="text-[11px] text-muted-foreground">
                  {t("سعر العبوة")} ({l.pack}): {sar(l.packPrice)}{l.packs > 1 ? ` × ${l.packs}` : ""} · {t(stores[l.store]!.name)}
                </p>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-baseline justify-between border-t pt-3">
          <span className="text-sm">{t("التكلفة التقديرية للناقص")}</span>
          <span className="font-display text-2xl text-primary">{sar(total)}</span>
        </div>
        {unpriced > 0 && <p className="text-end text-[11px] text-muted-foreground">{t("+{n} بدون سعر", { n: unpriced })}</p>}
        <p className="mt-1 text-[11px] text-muted-foreground">{t("بأقل الأسعار التجريبية لكل مكوّن")}</p>
      </>}

      <Link to="/grocery" search={{ recipe: r.id, servings: serv }} className="press mt-3 flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium">
        <ShoppingCart className="h-4 w-4" />{t("قارن أسعار الناقص")}
      </Link>
    </section>
  );
}
