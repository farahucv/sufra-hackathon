import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Trophy, X, Truck, Store, PiggyBank, Info, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { AppShell, DemoBadge, EmptyState, TopBar } from "@/components/AppShell";
import { getRecipe, recipes, stores, priceOf, sar } from "@/lib/data";
import { MAX_SERVINGS, MIN_SERVINGS, clampServings } from "@/lib/box";
import { isImportedId } from "@/lib/import";
import { shoppingList, type ShopLine } from "@/lib/shopping";
import { ImportedRecipeFallback } from "@/components/ImportParts";
import { hasPantry, useStore } from "@/lib/store";
import { isEn, t } from "@/lib/i18n";

export const Route = createFileRoute("/grocery")({
  validateSearch: (s) => z.object({
    recipe: z.string().optional(),
    servings: z.coerce.number().int().min(MIN_SERVINGS).max(MAX_SERVINGS).optional().catch(undefined),
  }).parse(s),
  head: () => ({
    meta: [
      { title: "مقارنة أسعار السوبرماركت — سُفرة" },
      { name: "description", content: "قارن أسعار المكونات الناقصة بين متاجر سعودية (بيانات تجريبية) واختر الأوفر أو الأقل مشاوير." },
      { property: "og:title", content: "مقارنة أسعار السوبرماركت — سُفرة" },
      { property: "og:description", content: "أوفر سلة لوصفتك — مقارنة تجريبية." },
    ],
  }),
  component: Grocery,
});

function Grocery() {
  const { recipe: rid, servings } = Route.useSearch();
  const s = useStore();
  const [showAll, setShowAll] = useState(false);
  const [mode, setMode] = useState<"cheap" | "single">("cheap");
  const loading = false;
  const found = getRecipe(rid ?? "kabsa");
  // Imported recipes resolve after hydration — wait rather than silently showing another recipe.
  if (!found && rid && isImportedId(rid)) return <ImportedRecipeFallback />;
  const r = found ?? recipes[0]!;
  const serv = clampServings(servings ?? r.servings);
  const chips = [...recipes.slice(0, 6), ...s.imported.map((x) => x.recipe)];
  if (!chips.some((x) => x.id === r.id)) chips.push(r);

  // Missing items (or all, when toggled) at the chosen servings, priced per retail package.
  const items = shoppingList(r, serv, {}, (name) => hasPantry(s, name), { includeOwned: showAll }).buy;
  const priced = items.filter((l) => l.store >= 0); // items with no price data are shown but never break totals
  const unpriced = items.length - priced.length;
  const at = (l: ShopLine, si: number) => { const p = priceOf(l.key, si); return p === null ? null : p * l.packs; };

  const totals = stores.map((_, si) => ({
    total: priced.reduce((a, l) => a + (at(l, si) ?? 0), 0),
    missing: priced.filter((l) => at(l, si) === null).length,
  }));
  const singleIdx = totals.map((t, i) => ({ ...t, i })).sort((a, b) => a.missing - b.missing || a.total - b.total)[0]?.i ?? 0;
  const splitTotal = priced.reduce((a, l) => a + (at(l, l.store) ?? 0), 0);
  const splitStores = [...new Set(priced.map((l) => l.store))];
  const worst = Math.max(...totals.map((t) => t.total));

  const lines = items.map((l) => {
    if (l.store < 0) return { l, store: -1, price: null as number | null };
    const single = mode === "single" ? at(l, singleIdx) : null;
    return single !== null ? { l, store: singleIdx, price: single } : { l, store: l.store, price: at(l, l.store) };
  });
  const usedStores = [...new Set(lines.map((x) => x.store).filter((x) => x >= 0))];
  const subtotal = lines.reduce((a, x) => a + (x.price ?? 0), 0);
  const delivery = usedStores.reduce((a, si) => a + stores[si]!.delivery, 0);

  return (
    <AppShell wide>
      <TopBar title={t("مقارنة الأسعار")} sub={(showAll ? t("كل مكونات {x} · الرياض", { x: t(r.title) }) : t("الناقص من {x} · الرياض", { x: t(r.title) })) + " · " + t("لـ {n} أشخاص", { n: serv })} action={<DemoBadge label={t("أسعار تجريبية")} />} />

      <div className="px-5 lg:px-8">
        <div className="flex items-start gap-2 rounded-2xl bg-gold/15 p-3 text-xs leading-relaxed">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>{t("مقارنة توضيحية بأسعار")} <b>{t("تجريبية")}</b> {t("لمتاجر نموذجية، وليست أسعاراً حية أو موثّقة. الربط المباشر مع المتاجر ضمن المرحلة القادمة.")}</p>
        </div>
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
          {chips.map((x) => (
            <Link key={x.id} to="/grocery" search={{ recipe: x.id }} className={`press shrink-0 rounded-full border px-3 py-1.5 text-xs ${x.id === r.id ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>{t(x.title)}</Link>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-5 space-y-3 px-5 lg:px-8"><div className="skeleton h-36" /><div className="skeleton h-64" /><p className="text-center text-xs text-muted-foreground">{t("نقارن الأسعار بين ٤ متاجر…")}</p></div>
      ) : items.length === 0 ? (
        <div className="mt-6 px-5 lg:px-8">
          <EmptyState icon={<PartyPopper className="h-6 w-6" />} title={t("كل المكونات عندك!")} body={t("ثلاجتك تغطي {x} بالكامل — ما تحتاج تتسوّق.", { x: t(r.title) })}
            action={<div className="flex gap-2"><Link to="/recipe/$id" params={{ id: r.id }} className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">{t("ابدأ الطبخ")}</Link><button onClick={() => setShowAll(true)} className="rounded-full border px-4 py-2 text-sm">{t("قارن كل المكونات")}</button></div>} />
        </div>
      ) : (
        <div className="mt-5 space-y-5 px-5 lg:grid lg:grid-cols-[1fr_360px] lg:gap-8 lg:space-y-0 lg:px-8">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <StrategyCard active={mode === "cheap"} onClick={() => setMode("cheap")} icon={<PiggyBank className="h-5 w-5" />} label={t("أقل سعر إجمالي")} value={sar(splitTotal)} note={t("من {n} متاجر · توفير {x}", { n: splitStores.length, x: sar(Math.max(0, worst - splitTotal)) })} />
              <StrategyCard active={mode === "single"} onClick={() => setMode("single")} icon={<Store className="h-5 w-5" />} label={t("أقل عدد متاجر")} value={sar(totals[singleIdx]!.total)} note={t("كله من {x}", { x: t(stores[singleIdx]!.name) }) + (totals[singleIdx]!.missing ? t(" (+{n} من غيره)", { n: totals[singleIdx]!.missing }) : "")} />
            </div>

            <label className="flex items-center justify-between rounded-2xl bg-card p-3 text-sm">
              <span>{t("عرض كل مكونات الوصفة (وليس الناقص فقط)")}</span>
              <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="h-5 w-5 accent-[var(--olive)]" />
            </label>

            <div className="overflow-x-auto rounded-2xl bg-card shadow-soft">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="p-3 text-start font-medium">{t("المنتج")}</th>
                    {stores.map((st, i) => <th key={st.id} className={`p-3 font-medium ${i === singleIdx ? "text-olive" : ""}`}>{t(st.name)}{!isEn() && <span className="block text-[10px] font-normal opacity-70">{st.en}</span>}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {items.map((l) => {
                    const min = l.store;
                    return (
                      <tr key={l.key} className="border-b last:border-0">
                        <td className="p-3 font-medium">{t(l.name)}<span className="block text-[10px] font-normal text-muted-foreground">{l.amount}{l.pack ? ` · ${l.packs} × ${l.pack}` : ""}</span></td>
                        {min < 0 ? <td colSpan={stores.length} className="p-2 text-center text-[11px] text-muted-foreground">{t("السعر غير متوفر")}</td> : stores.map((_, i) => {
                          const p = at(l, i);
                          return (
                            <td key={i} className="p-2 text-center tabular-nums">
                              {p === null ? <span className="inline-flex items-center gap-0.5 text-[11px] text-terracotta"><X className="h-3.5 w-3.5" />{t("غير متوفر")}</span>
                                : <span className={i === min ? "rounded-lg bg-accent px-1.5 py-0.5 font-semibold text-accent-foreground" : ""}>{p.toFixed(2)}</span>}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  <tr className="bg-secondary font-semibold">
                    <td className="p-3">{t("الإجمالي")}</td>
                    {totals.map((tot, i) => <td key={i} className="p-2 text-center tabular-nums">{tot.total.toFixed(2)}{tot.missing > 0 && <span className="block text-[10px] font-normal text-terracotta">{t("ينقص")} {tot.missing}</span>}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
            {unpriced > 0 && <p className="text-xs text-muted-foreground">{t("{n} مكوّن بدون سعر — غير محسوب في الإجمالي", { n: unpriced })}</p>}
            <p className="text-xs text-muted-foreground">{t("الأسعار لكل عبوة؛ يزيد السعر فقط إذا احتجت عبوة إضافية.")}</p>
          </div>

          {/* Receipt */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-t-2xl bg-card p-5 font-sans shadow-soft">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 font-display text-lg"><Trophy className="h-5 w-5 text-gold" /> {t("سلّتك المقترحة")}</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{mode === "cheap" ? t("أقل سعر إجمالي") : t("أقل عدد متاجر")} · {t(r.title)}</p>
              <div className="my-4 border-t border-dashed" />
              <ul className="space-y-2 text-sm">
                {lines.map((x) => (
                  <li key={x.l.key} className="flex items-baseline gap-2">
                    <span>{t(x.l.name)}</span>
                    <span className="flex-1 border-b border-dotted border-muted-foreground/30" />
                    <span className="text-[10px] text-muted-foreground">{x.store >= 0 ? t(stores[x.store]!.name) : "—"}</span>
                    <span className="tabular-nums">{x.price === null ? <span className="text-[10px] text-muted-foreground">{t("السعر غير متوفر")}</span> : x.price.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="my-4 border-t border-dashed" />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">{t("المجموع")}</span><span className="tabular-nums">{sar(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t("توصيل ({n} متجر)", { n: usedStores.length })}</span><span className="tabular-nums">{delivery ? sar(delivery) : t("مجاني")}</span></div>
                <div className="flex justify-between pt-2 text-lg font-bold"><span>{t("الإجمالي")}</span><span className="tabular-nums text-primary">{sar(subtotal + delivery)}</span></div>
                <p className="text-xs text-olive">{t("توفّر")} {sar(Math.max(0, worst - subtotal))} {t("مقارنة بأغلى متجر")}</p>
              </div>
              <button onClick={() => toast(t("الطلب المباشر قادم قريباً"), { description: t("نعمل على الربط مع تطبيقات التوصيل في المرحلة القادمة.") })}
                className="press mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 font-semibold text-primary-foreground">
                <Truck className="h-5 w-5" /> {t("اطلب السلة")}
              </button>
            </div>
            <div className="receipt-edge rotate-180" aria-hidden />
          </aside>
        </div>
      )}
    </AppShell>
  );
}

function StrategyCard({ active, onClick, icon, label, value, note }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; value: string; note: string }) {
  return (
    <button onClick={onClick} aria-pressed={active}
      className={`press rounded-2xl p-4 text-start transition ${active ? "pattern bg-olive text-olive-foreground shadow-soft" : "border bg-card"}`}>
      <div className="flex items-center gap-2 text-xs opacity-90">{icon}{label}</div>
      <p className="mt-2 text-xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-[11px] opacity-80">{note}</p>
    </button>
  );
}
