import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChefHat, Truck, PackageOpen, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";
import { AppShell, DemoBadge, EmptyState, TopBar } from "@/components/AppShell";
import { BoxArt } from "@/components/BoxArt";
import { JourneyCallout } from "@/components/Journey";
import { getRecipe, sar } from "@/lib/data";
import { addresses, orderStages, slots } from "@/lib/box";
import { setStore, useStore } from "@/lib/store";

export const Route = createFileRoute("/order")({
  head: () => ({
    meta: [
      { title: "تتبّع صندوقك — سُفرة" },
      { name: "description", content: "تتبّع صندوق الوصفة من التأكيد إلى التسليم، ثم ابدأ الطبخ خطوة بخطوة (عرض تجريبي)." },
      { property: "og:title", content: "تتبّع صندوقك — سُفرة" },
      { property: "og:description", content: "صندوقك في الطريق — تتبّع تجريبي." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const s = useStore();
  const o = s.order;
  const r = o ? getRecipe(o.recipeId) : undefined;
  if (!o || !r) {
    return (
      <AppShell><TopBar title="طلباتي" />
        <div className="px-5"><EmptyState icon={<PackageOpen className="h-6 w-6" />} title="لا توجد طلبات بعد" body="اطلب صندوق وصفة ويصلك جاهزاً للطبخ." action={<Link to="/box/$id" params={{ id: "kabsa" }} className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground">جرّب صندوق الكبسة</Link>} /></div>
      </AppShell>
    );
  }
  const delivered = o.stage >= 3;
  const advance = () => setStore((st) => ({ order: st.order && { ...st.order, stage: Math.min(3, st.order.stage + 1) } }));
  const simulate = () => {
    setStore((st) => ({ order: st.order && { ...st.order, stage: 3 }, journey: st.journey === 4 ? 5 : st.journey }));
    toast.success("تم تسليم صندوقك", { description: "محاكاة تسليم للعرض." });
  };
  const eta = new Date(o.placedAt + 90 * 60000).toLocaleTimeString("ar-SA", { hour: "numeric", minute: "2-digit" });

  return (
    <AppShell wide>
      <TopBar title={delivered ? "وصل صندوقك" : "صندوقك في الطريق"} sub={`طلب ${o.id}`} action={<DemoBadge label="تتبّع تجريبي" />} />
      <JourneyCallout step={4} hideNext />
      <JourneyCallout step={5} hideNext />

      <div className="space-y-6 px-5 pb-10 lg:grid lg:grid-cols-[1fr_320px] lg:gap-8 lg:space-y-0 lg:px-8">
        <div className="space-y-6">
          <div className="animate-float-up"><BoxArt img={r.img} title={r.title} serv={o.serv} size="lg" /></div>

          <section className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-olive" />{delivered ? "تم التسليم" : `الوصول المتوقع ${eta}`}</span>
              <span className="text-xs text-muted-foreground">{slots.find((x) => x.id === o.slot)?.label}</span>
            </div>
            <ol className="mt-5 space-y-0">
              {orderStages.map((st, i) => {
                const done = i <= o.stage;
                return (
                  <li key={st} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${done ? "bg-olive text-olive-foreground" : "border bg-background text-muted-foreground"}`}>
                        {done ? <Check className="h-4 w-4" /> : <span className="text-xs">{i + 1}</span>}
                      </span>
                      {i < 3 && <span className={`h-8 w-0.5 ${i < o.stage ? "bg-olive" : "bg-border"}`} />}
                    </div>
                    <p className={`pt-1 text-sm ${i === o.stage ? "font-semibold" : done ? "" : "text-muted-foreground"}`}>{st}</p>
                  </li>
                );
              })}
            </ol>
            {!delivered && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={advance} className="press rounded-xl border py-2.5 text-sm">المرحلة التالية</button>
                <button onClick={simulate} className="press flex items-center justify-center gap-1.5 rounded-xl bg-secondary py-2.5 text-sm font-semibold"><Truck className="h-4 w-4" />محاكاة التسليم</button>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <Link to="/cook/$id" params={{ id: r.id }} disabled={!delivered}
            onClick={() => { if (s.journey === 4) setStore(() => ({ journey: 5 })); }}
            className={`press flex w-full items-center justify-center gap-2 rounded-xl py-4 font-semibold ${delivered ? "bg-primary text-primary-foreground" : "pointer-events-none bg-muted text-muted-foreground"}`}>
            <ChefHat className="h-5 w-5" /> ابدأ الطبخ
          </Link>
          {!delivered && <p className="text-center text-xs text-muted-foreground">يتاح وضع الطبخ عند تسليم الصندوق</p>}
          <div className="space-y-2 rounded-2xl bg-secondary/60 p-4 text-sm">
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-olive" />{addresses.find((a) => a.id === o.address)?.line}</p>
            <p className="flex justify-between"><span>الإجمالي</span><b className="tabular-nums">{sar(o.total)}</b></p>
            <p className="text-[11px] text-muted-foreground">طلب تجريبي — لم يتم أي دفع أو توصيل فعلي.</p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
