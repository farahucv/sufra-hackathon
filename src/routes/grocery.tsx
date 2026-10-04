import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Trophy, X, Truck, Store, PiggyBank, Info, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { AppShell, DemoBadge, EmptyState, TopBar } from "@/components/AppShell";
import { JourneyCallout } from "@/components/Journey";
import { getRecipe, recipes, stores, priceOf, cheapest, sar } from "@/lib/data";
import { hasPantry, useStore } from "@/lib/store";

export const Route = createFileRoute("/grocery")({
  validateSearch: (s) => z.object({ recipe: z.string().optional() }).parse(s),
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
  const { recipe: rid } = Route.useSearch();
  const r = getRecipe(rid ?? "kabsa") ?? recipes[0]!;
  const s = useStore();
  const [showAll, setShowAll] = useState(false);
  const [mode, setMode] = useState<"cheap" | "single">("cheap");
  const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(true); const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, [r.id]);

  const missing = r.ingredients.filter((i) => !hasPantry(s, i.key)).map((i) => i.key);
  const items = showAll ? r.ingredients.map((i) => i.key) : missing;

  const totals = stores.map((_, si) => ({
    total: items.reduce((a, k) => a + (priceOf(k, si) ?? 0), 0),
    missing: items.filter((k) => priceOf(k, si) === null).length,
  }));
  const singleIdx = totals.map((t, i) => ({ ...t, i })).sort((a, b) => a.missing - b.missing || a.total - b.total)[0]?.i ?? 0;
  const split = items.map((k) => ({ k, si: cheapest(k) }));
  const splitTotal = split.reduce((a, x) => a + (x.si >= 0 ? (priceOf(x.k, x.si) as number) : 0), 0);
  const splitStores = [...new Set(split.map((x) => x.si).filter((x) => x >= 0))];
  const worst = Math.max(...totals.map((t) => t.total));

  const lines = mode === "cheap"
    ? split.map((x) => ({ k: x.k, store: x.si, price: x.si >= 0 ? (priceOf(x.k, x.si) as number) : 0 }))
    : items.map((k) => ({ k, store: priceOf(k, singleIdx) === null ? cheapest(k) : singleIdx, price: priceOf(k, singleIdx) ?? priceOf(k, cheapest(k)) ?? 0 }));
  const usedStores = [...new Set(lines.map((l) => l.store).filter((x) => x >= 0))];
  const subtotal = lines.reduce((a, l) => a + l.price, 0);
  const delivery = usedStores.reduce((a, si) => a + stores[si]!.delivery, 0);

  return (
    <AppShell wide>
      <TopBar title="مقارنة الأسعار" sub={`${showAll ? "كل مكونات" : "الناقص من"} ${r.title} · الرياض`} action={<DemoBadge label="أسعار تجريبية" />} />
      <JourneyCallout step={4} />

      <div className="px-5 lg:px-8">
        <div className="flex items-start gap-2 rounded-2xl bg-gold/15 p-3 text-xs leading-relaxed">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>مقارنة توضيحية بأسعار <b>تجريبية</b> لمتاجر نموذجية، وليست أسعاراً حية أو موثّقة. الربط المباشر مع المتاجر ضمن المرحلة القادمة.</p>
        </div>
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
          {recipes.slice(0, 6).map((x) => (
            <Link key={x.id} to="/grocery" search={{ recipe: x.id }} className={`press shrink-0 rounded-full border px-3 py-1.5 text-xs ${x.id === r.id ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>{x.title}</Link>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-5 space-y-3 px-5 lg:px-8"><div className="skeleton h-36" /><div className="skeleton h-64" /><p className="text-center text-xs text-muted-foreground">نقارن الأسعار بين ٤ متاجر…</p></div>
      ) : items.length === 0 ? (
        <div className="mt-6 px-5 lg:px-8">
          <EmptyState icon={<PartyPopper className="h-6 w-6" />} title="كل المكونات عندك!" body={`مخزنك يغطي ${r.title} بالكامل — ما تحتاج تتسوّق.`}
            action={<div className="flex gap-2"><Link to="/recipe/$id" params={{ id: r.id }} className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">ابدأ الطبخ</Link><button onClick={() => setShowAll(true)} className="rounded-full border px-4 py-2 text-sm">قارن كل المكونات</button></div>} />
        </div>
      ) : (
        <div className="mt-5 space-y-5 px-5 lg:grid lg:grid-cols-[1fr_360px] lg:gap-8 lg:space-y-0 lg:px-8">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <StrategyCard active={mode === "cheap"} onClick={() => setMode("cheap")} icon={<PiggyBank className="h-5 w-5" />} label="أقل سعر إجمالي" value={sar(splitTotal)} note={`من ${splitStores.length} متاجر · توفير ${sar(Math.max(0, worst - splitTotal))}`} />
              <StrategyCard active={mode === "single"} onClick={() => setMode("single")} icon={<Store className="h-5 w-5" />} label="أقل عدد متاجر" value={sar(totals[singleIdx]!.total)} note={`كله من ${stores[singleIdx]!.name}${totals[singleIdx]!.missing ? ` (+${totals[singleIdx]!.missing} من غيره)` : ""}`} />
            </div>

            <label className="flex items-center justify-between rounded-2xl bg-card p-3 text-sm">
              <span>عرض كل مكونات الوصفة (وليس الناقص فقط)</span>
              <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="h-5 w-5 accent-[var(--olive)]" />
            </label>

            <div className="overflow-x-auto rounded-2xl bg-card shadow-soft">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="p-3 text-start font-medium">المنتج</th>
                    {stores.map((st, i) => <th key={st.id} className={`p-3 font-medium ${i === singleIdx ? "text-olive" : ""}`}>{st.name}<span className="block text-[10px] font-normal opacity-70">{st.en}</span></th>)}
                  </tr>
                </thead>
                <tbody>
                  {items.map((k) => {
                    const min = cheapest(k);
                    return (
                      <tr key={k} className="border-b last:border-0">
                        <td className="p-3 font-medium">{k}</td>
                        {stores.map((_, i) => {
                          const p = priceOf(k, i);
                          return (
                            <td key={i} className="p-2 text-center tabular-nums">
                              {p === null ? <span className="inline-flex items-center gap-0.5 text-[11px] text-terracotta"><X className="h-3.5 w-3.5" />غير متوفر</span>
                                : <span className={i === min ? "rounded-lg bg-accent px-1.5 py-0.5 font-semibold text-accent-foreground" : ""}>{p.toFixed(2)}</span>}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  <tr className="bg-secondary font-semibold">
                    <td className="p-3">الإجمالي</td>
                    {totals.map((t, i) => <td key={i} className="p-2 text-center tabular-nums">{t.total.toFixed(2)}{t.missing > 0 && <span className="block text-[10px] font-normal text-terracotta">ينقص {t.missing}</span>}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Receipt */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-t-2xl bg-card p-5 font-sans shadow-soft">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 font-display text-lg"><Trophy className="h-5 w-5 text-gold" /> سلّتك المقترحة</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{mode === "cheap" ? "أقل سعر إجمالي" : "أقل عدد متاجر"} · {r.title}</p>
              <div className="my-4 border-t border-dashed" />
              <ul className="space-y-2 text-sm">
                {lines.map((l) => (
                  <li key={l.k} className="flex items-baseline gap-2">
                    <span>{l.k}</span>
                    <span className="flex-1 border-b border-dotted border-muted-foreground/30" />
                    <span className="text-[10px] text-muted-foreground">{l.store >= 0 ? stores[l.store]!.name : "—"}</span>
                    <span className="tabular-nums">{l.price.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="my-4 border-t border-dashed" />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">المجموع</span><span className="tabular-nums">{sar(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">توصيل ({usedStores.length} متجر)</span><span className="tabular-nums">{delivery ? sar(delivery) : "مجاني"}</span></div>
                <div className="flex justify-between pt-2 text-lg font-bold"><span>الإجمالي</span><span className="tabular-nums text-primary">{sar(subtotal + delivery)}</span></div>
                <p className="text-xs text-olive">توفّر {sar(Math.max(0, worst - subtotal))} مقارنة بأغلى متجر</p>
              </div>
              <button onClick={() => toast("الطلب المباشر قادم قريباً", { description: "نعمل على الربط مع تطبيقات التوصيل في المرحلة القادمة." })}
                className="press mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 font-semibold text-primary-foreground">
                <Truck className="h-5 w-5" /> اطلب السلة
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
