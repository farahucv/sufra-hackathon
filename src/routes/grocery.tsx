import { createFileRoute } from "@tanstack/react-router";
import { Trophy, X, Truck } from "lucide-react";
import { AppShell, DemoBadge, TopBar } from "@/components/AppShell";
import { basket, stores, sar } from "@/lib/data";

export const Route = createFileRoute("/grocery")({
  head: () => ({
    meta: [
      { title: "قارن أسعار السوبرماركت — سُفرة" },
      { name: "description", content: "قارن أسعار المكونات الناقصة بين بنده والتميمي والدانوب ولولو." },
      { property: "og:title", content: "قارن أسعار السوبرماركت — سُفرة" },
      { property: "og:description", content: "أرخص سلة لوصفتك من السوبرماركت السعودي." },
    ],
  }),
  component: Grocery,
});

function Grocery() {
  const totals = stores.map((_, i) => ({
    total: basket.reduce((a, b) => a + (b.prices[i] ?? 0), 0),
    missing: basket.filter((b) => b.prices[i] === null).length,
  }));
  const full = totals.map((t, i) => ({ ...t, i })).filter((t) => t.missing === 0);
  const best = (full.length ? full : totals.map((t, i) => ({ ...t, i }))).sort((a, b) => a.total - b.total)[0]!;
  const worst = Math.max(...totals.map((t) => t.total));

  return (
    <AppShell>
      <TopBar title="مقارنة الأسعار" sub="المكونات الناقصة لـ كبسة دجاج · الرياض" action={<DemoBadge />} />
      <div className="space-y-5 px-5">
        <div className="pattern rounded-3xl bg-olive p-5 text-olive-foreground">
          <div className="flex items-center gap-2 text-sm opacity-90"><Trophy className="h-4 w-4" /> أفضل متجر لسلّتك</div>
          <p className="mt-2 font-display text-3xl">{stores[best.i]!.name} <span className="text-base opacity-75">{stores[best.i]!.en}</span></p>
          <div className="mt-3 flex items-end justify-between">
            <div><p className="text-xs opacity-80">الإجمالي</p><p className="text-2xl font-bold">{sar(best.total)}</p></div>
            <p className="rounded-full bg-card/20 px-3 py-1 text-xs">توفير {sar(worst - best.total)}</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl bg-card shadow-soft">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="p-3 text-right font-medium">المنتج</th>
                {stores.map((s, i) => <th key={s.en} className={`p-3 font-medium ${i === best.i ? "text-olive" : ""}`}>{s.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {basket.map((b) => {
                const min = Math.min(...b.prices.filter((p): p is number => p !== null));
                return (
                  <tr key={b.item} className="border-b last:border-0">
                    <td className="p-3 font-medium">{b.item}</td>
                    {b.prices.map((p, i) => (
                      <td key={i} className="p-2 text-center">
                        {p === null ? <X className="mx-auto h-4 w-4 text-destructive" aria-label="غير متوفر" />
                          : <span className={p === min ? "rounded-lg bg-accent px-1.5 py-0.5 font-semibold text-accent-foreground" : ""}>{p.toFixed(2)}</span>}
                      </td>
                    ))}
                  </tr>
                );
              })}
              <tr className="bg-secondary font-semibold">
                <td className="p-3">الإجمالي</td>
                {totals.map((t, i) => <td key={i} className="p-2 text-center">{t.total.toFixed(0)}{t.missing > 0 && <span className="block text-[10px] font-normal text-destructive">ينقص {t.missing}</span>}</td>)}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stores.map((s, i) => (
            <div key={s.en} className={`rounded-2xl border p-4 ${i === best.i ? "border-olive bg-accent/50" : "bg-card"}`}>
              <p className="font-semibold">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.en} · {totals[i]!.missing ? `${basket.length - totals[i]!.missing}/${basket.length} متوفر` : "كل المنتجات متوفرة"}</p>
              <p className="mt-2 text-lg font-bold">{sar(totals[i]!.total)}</p>
            </div>
          ))}
        </div>

        <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-semibold text-primary-foreground">
          <Truck className="h-5 w-5" /> اطلب من {stores[best.i]!.name} (قريباً)
        </button>
        <p className="text-center text-[11px] text-muted-foreground">الأسعار تجريبية للعرض فقط ولا تمثل أسعاراً حقيقية.</p>
      </div>
    </AppShell>
  );
}
