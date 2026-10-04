import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Clock, Gauge, MapPin, Truck, ShieldCheck, AlertTriangle, Sparkles, Snowflake, Leaf, PackageCheck, Store, ChefHat, ShoppingBag, ArrowLeft, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell, DemoBadge, TopBar } from "@/components/AppShell";
import { BoxArt } from "@/components/BoxArt";
import { JourneyCallout } from "@/components/Journey";
import { getChef, getRecipe, sar } from "@/lib/data";
import { BOX_SERVINGS, autoSubs, buildBox, householdBasics, isBoxEligible, unsafeLeft } from "@/lib/box";
import { setStore, useStore } from "@/lib/store";

export const Route = createFileRoute("/box/$id")({
  loader: ({ params }) => {
    const r = getRecipe(params.id);
    if (!r || !isBoxEligible(r)) throw notFound();
    return { id: r.id, title: r.title };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `صندوق ${loaderData.title} الجاهز للطبخ — سُفرة` : "صندوق غير متاح — سُفرة";
    return {
      meta: [
        { title: t },
        { name: "description", content: "صندوق مكونات مقسّمة بالحصة لوصفتك، مخصص لحساسيتك ويصلك جاهزاً للطبخ (عرض تجريبي)." },
        { property: "og:title", content: t },
        { property: "og:description", content: "Ready-to-Cook Box: مكونات مجهزة وتوصيل ووصفة خطوة بخطوة." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  notFoundComponent: () => (
    <AppShell><TopBar title="الصندوق غير متاح" /><p className="px-5 text-sm text-muted-foreground">هذه الوصفة غير متاحة كصندوق حالياً. <Link to="/home" className="text-primary underline">تصفّح الوصفات</Link></p></AppShell>
  ),
  component: BoxPage,
});

function BoxPage() {
  const { id } = Route.useLoaderData();
  const r = getRecipe(id)!;
  const chef = getChef(r.chefId)!;
  const s = useStore();
  const nav = useNavigate();
  const draft = s.box?.recipeId === r.id ? s.box : null;
  const [serv, setServ] = useState<number>(draft?.serv ?? (BOX_SERVINGS.includes(s.household as 2) ? s.household : 4));
  const [subs, setSubs] = useState<Record<string, number>>(draft?.subs ?? autoSubs(r, s.allergies));
  useEffect(() => { setStore(() => ({ box: { recipeId: r.id, serv, subs } })); }, [r.id, serv, subs]);

  const flagged = r.ingredients.filter((i) => i.allergen && s.allergies.includes(i.allergen));
  const left = unsafeLeft(r, s.allergies, subs);
  const box = buildBox(r, serv, subs);
  const original = buildBox(r, serv, {});
  const delta = box.subtotal - original.subtotal;
  const personalized = flagged.length > 0 && left.length === 0;
  const blocked = left.some((i) => !i.subs?.length);

  const applySafe = () => { setSubs(autoSubs(r, s.allergies)); toast.success("استُبدلت المكونات غير المناسبة", { description: "صار الصندوق نسخة مناسبة لك." }); };
  const toCheckout = () => {
    if (s.journey === 3) setStore(() => ({ journey: 4 }));
    nav({ to: "/checkout" });
  };

  return (
    <AppShell wide>
      <TopBar title="صندوق جاهز للطبخ" sub="Ready-to-Cook Box" action={<DemoBadge label="عرض تجريبي" />} />
      <JourneyCallout step={3} hideNext />

      <div className="px-5 lg:grid lg:grid-cols-[1fr_340px] lg:gap-8 lg:px-8">
        <div className="space-y-6">
          <BoxArt img={r.img} title={r.title} serv={serv} />

          <div>
            <h2 className="text-3xl">{r.title}</h2>
            <Link to="/chef/$id" params={{ id: chef.id }} className="mt-2 flex w-fit items-center gap-2 text-sm">
              <img src={chef.img} alt={chef.name} className="h-7 w-7 rounded-full object-cover" loading="lazy" width={28} height={28} />
              {chef.name}<BadgeCheck className="h-4 w-4 text-olive" />
            </Link>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{r.time} د طبخ</span>
              <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" />{r.difficulty}</span>
              <span className="flex items-center gap-1"><Snowflake className="h-3.5 w-3.5" />سلسلة تبريد</span>
              <span className="flex items-center gap-1"><Leaf className="h-3.5 w-3.5" />مُجهّز صباح اليوم</span>
            </div>
          </div>

          <section>
            <p className="text-sm font-semibold">عدد الحصص</p>
            <div className="mt-2 grid grid-cols-3 gap-2" role="radiogroup">
              {BOX_SERVINGS.map((n) => (
                <button key={n} role="radio" aria-checked={serv === n} onClick={() => setServ(n)}
                  className={`press rounded-xl border py-3 text-center transition ${serv === n ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>
                  <span className="block font-display text-xl">{n}</span><span className="text-[11px] opacity-80">حصص</span>
                </button>
              ))}
            </div>
          </section>

          {/* Personalization */}
          {flagged.length === 0 ? (
            <div className="flex items-center gap-3 rounded-2xl bg-accent/50 p-4 text-sm">
              <ShieldCheck className="h-5 w-5 shrink-0 text-olive" /> الصندوق آمن لملفك الغذائي كما هو.
            </div>
          ) : personalized ? (
            <section className="rounded-2xl border border-olive/40 bg-accent/40 p-4">
              <p className="flex items-center gap-2 font-semibold text-accent-foreground"><Sparkles className="h-4 w-4 text-gold" /> نسخة مناسبة لك</p>
              <ul className="mt-3 space-y-2 text-sm">
                {box.lines.filter((l) => l.swapped).map((l) => (
                  <li key={l.key} className="rounded-xl bg-card p-3">
                    <p><s className="text-muted-foreground">{l.swapped!.from}</s> ← <b>{l.name}</b></p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{l.swapped!.reason}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">أثر التعديل على السعر: {delta === 0 ? "بدون تغيير" : `${delta > 0 ? "+" : "−"}${sar(Math.abs(delta))}`}</span>
                <button onClick={() => { setSubs({}); toast("عُرض الصندوق الأصلي", { description: "انتبه: يحتوي على مسببات حساسية من ملفك." }); }} className="text-muted-foreground underline">عرض الأصلي</button>
              </div>
            </section>
          ) : (
            <section className="rounded-2xl border border-terracotta/40 bg-terracotta-soft p-4">
              <p className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-terracotta" /> يحتوي على: {left.map((i) => `${i.key} (${i.allergen})`).join("، ")}</p>
              <p className="mt-1 text-xs text-muted-foreground">يتعارض مع حساسيتك المحفوظة. {blocked ? "لا يتوفر بديل آمن لبعض المكونات." : "لدينا بدائل آمنة جاهزة."}</p>
              {!blocked && <button onClick={applySafe} className="press mt-3 w-full rounded-xl bg-olive py-3 text-sm font-semibold text-olive-foreground">استبدل المكونات غير المناسبة</button>}
            </section>
          )}

          {/* Contents */}
          <section>
            <div className="flex items-baseline justify-between">
              <h3 className="text-xl">داخل الصندوق</h3>
              <span className="text-xs text-muted-foreground">{box.lines.length} مكونات · مقسّمة لـ{serv} حصص</span>
            </div>
            <ul className="mt-3 divide-y rounded-2xl border bg-card">
              {box.lines.map((l) => (
                <li key={l.key} className="flex items-center gap-3 px-4 py-3">
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${l.allergen && s.allergies.includes(l.allergen) ? "bg-terracotta text-primary-foreground" : "bg-olive text-olive-foreground"}`}>
                    {l.allergen && s.allergies.includes(l.allergen) ? <AlertTriangle className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                  </span>
                  <span className="flex-1 text-sm">{l.name}{l.swapped && <span className="ms-2 rounded-full bg-accent px-2 py-0.5 text-[10px] text-accent-foreground">بديل</span>}</span>
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-xs tabular-nums">{l.qty}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 rounded-2xl border border-dashed p-4">
              <p className="text-xs font-semibold text-muted-foreground">غير مشمول — أساسيات متوفرة في كل بيت</p>
              <div className="mt-2 flex flex-wrap gap-1.5">{householdBasics.map((b) => <span key={b} className="rounded-full bg-muted px-3 py-1 text-xs">{b}</span>)}</div>
            </div>
          </section>

          {/* Business model — subtle */}
          <section className="rounded-2xl bg-secondary/60 p-4">
            <div className="flex items-center justify-between"><p className="text-sm font-semibold">كيف يصلك الصندوق</p><DemoBadge label="نموذج تجريبي" /></div>
            <ol className="mt-3 grid gap-3 text-xs sm:grid-cols-3">
              <li className="flex gap-2"><Store className="h-4 w-4 shrink-0 text-olive" /><span><b className="block text-sm">مورد محلي</b>سوبرماركت أو مزرعة شريكة تجهّز المكونات</span></li>
              <li className="flex gap-2"><ChefHat className="h-4 w-4 shrink-0 text-olive" /><span><b className="block text-sm">حصة للشيف</b>جزء من كل صندوق يعود لصاحب الوصفة</span></li>
              <li className="flex gap-2"><ShoppingBag className="h-4 w-4 shrink-0 text-olive" /><span><b className="block text-sm">شراء مباشر</b>من الوصفة إلى الطلب بنقرة</span></li>
            </ol>
          </section>
        </div>

        {/* Summary */}
        <aside className="mt-6 lg:mt-0">
          <div className="space-y-4 rounded-2xl border bg-card p-5 lg:sticky lg:top-24">
            <div>
              <p className="text-xs text-muted-foreground">سعر الصندوق</p>
              <p className="font-display text-4xl text-primary">{sar(box.subtotal)}</p>
              <p className="text-xs text-muted-foreground">≈ {sar(box.perServing)} للحصة</p>
            </div>
            <div className="space-y-2 border-t pt-4 text-sm">
              <p className="flex items-center gap-2"><Truck className="h-4 w-4 text-olive" /> يصل خلال ٩٠ دقيقة</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-olive" /> الرياض — ضمن نطاق التوصيل</p>
              <p className="flex items-center gap-2"><PackageCheck className="h-4 w-4 text-olive" /> مكونات بالحصة الدقيقة</p>
            </div>
            <button disabled={left.length > 0} onClick={toCheckout}
              className="press flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground disabled:opacity-40">
              متابعة الطلب <ArrowLeft className="h-4 w-4" />
            </button>
            {left.length > 0 && <p className="text-center text-xs text-terracotta">استبدل المكونات غير المناسبة للمتابعة</p>}
            <p className="text-center text-[11px] text-muted-foreground">الأسعار والتوصيل بيانات تجريبية</p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
