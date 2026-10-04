import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronRight, Clock, Minus, Plus, AlertTriangle, ShieldCheck, Sparkles, Bookmark, BadgeCheck, Refrigerator, ShoppingCart, ChefHat, Check, X, Timer, Gauge, Users } from "lucide-react";
import { toast } from "sonner";
import { AppShell, DemoBadge } from "@/components/AppShell";
import { JourneyCallout } from "@/components/Journey";
import { isBoxEligible } from "@/lib/box";
import { Package } from "lucide-react";
import { getRecipe, getChef, baseCost, cheapest, priceOf, sar } from "@/lib/data";
import { hasPantry, matchesAllergy, toggleIn, useStore , setStore } from "@/lib/store";
import { isEn, list, t } from "@/lib/i18n";

export const Route = createFileRoute("/recipe/$id")({
  loader: ({ params }) => {
    const r = getRecipe(params.id);
    if (!r) throw notFound();
    return { id: r.id, title: r.title };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — وصفة على سُفرة` },
          { name: "description", content: `طريقة ${loaderData.title} مع كشف الحساسية وبدائل ذكية وتكلفة السلة.` },
          { property: "og:title", content: `${loaderData.title} — سُفرة` },
          { property: "og:description", content: `مقادير وخطوات ${loaderData.title} مخصصة لك.` },
        ]
      : [{ title: "الوصفة غير موجودة" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center p-8 text-center">
      <div><p className="font-display text-2xl">{t("الوصفة غير موجودة")}</p><Link to="/home" className="mt-4 inline-block rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground">{t("العودة للريلز")}</Link></div>
    </div>
  ),
  component: RecipePage,
});

function RecipePage() {
  const { id } = Route.useLoaderData();
  const r = getRecipe(id)!;
  const chef = getChef(r.chefId)!;
  const s = useStore();
  const [serv, setServ] = useState(s.household || r.servings);
  const [chosen, setChosen] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<"ing" | "steps">("ing");
  const [pantryView, setPantryView] = useState(false);
  const [cooking, setCooking] = useState(false);
  const k = serv / r.servings;

  const flagged = r.ingredients.filter((i) => i.allergen && matchesAllergy(i.allergen, s.allergies));
  const unresolved = flagged.filter((i) => chosen[i.key] === undefined);
  const applied = r.ingredients.map((i) => (chosen[i.key] !== undefined && i.subs ? i.subs[chosen[i.key]!] : undefined));
  const kcalDelta = applied.reduce((a, x) => a + (x?.kcal ?? 0), 0);
  const costDelta = applied.reduce((a, x) => a + (x?.cost ?? 0), 0);
  const cost = (baseCost(r) + costDelta) * Math.max(1, k * 0.85);
  const missing = useMemo(() => r.ingredients.filter((i) => !hasPantry(s, i.key)), [r, s]);

  const applyAll = () => {
    const next = { ...chosen };
    flagged.forEach((i) => { if (i.subs?.length && next[i.key] === undefined) next[i.key] = 0; });
    setChosen(next);
    toast.success(t("طُبّقت البدائل الآمنة"), { description: t("أصبحت الوصفة مناسبة لملفك الغذائي.") });
  };

  return (
    <AppShell nav={false}>
      <div className="relative h-80 lg:mx-8 lg:mt-8 lg:h-[420px] lg:overflow-hidden lg:rounded-2xl">
        <img src={r.img} alt={t(r.title)} className="h-full w-full object-cover" width={768} height={1024} />
        <div className="absolute inset-0 scrim" />
        <div className="absolute inset-x-5 top-6 flex justify-between">
          <button onClick={() => history.back()} aria-label={t("رجوع")} className="press grid h-10 w-10 place-items-center rounded-full bg-card"><ChevronRight className="h-5 w-5 rtl:rotate-0 ltr:rotate-180" /></button>
          <button onClick={() => { toggleIn("saved", r.id); toast.success(s.saved.includes(r.id) ? t("أُزيلت من المحفوظات") : t("حُفظت في وصفاتك")); }} aria-label={t("حفظ")} className="press grid h-10 w-10 place-items-center rounded-full bg-card">
            <Bookmark className={`h-5 w-5 ${s.saved.includes(r.id) ? "fill-gold text-gold" : ""}`} />
          </button>
        </div>
        <div className="absolute bottom-8 start-5 text-ink-foreground">
          <p className="text-xs opacity-80">{isEn() ? t("مطبخ {x}", { x: t(r.region) }) : `${r.en} · ${r.region}`}</p>
          <h1 className="text-4xl lg:text-5xl">{t(r.title)}</h1>
        </div>
      </div>

      <div className="relative -mt-5 rounded-t-3xl bg-background pb-40 pt-6 lg:mt-0 lg:pb-16">
        <div className="px-5 lg:px-8">
          <Link to="/chef/$id" params={{ id: chef.id }} className="flex items-center gap-3">
            <img src={chef.img} alt={t(chef.name)} className="h-11 w-11 rounded-full object-cover" loading="lazy" />
            <div className="flex-1"><p className="flex items-center gap-1 font-semibold">{t(chef.name)}<BadgeCheck className="h-4 w-4 text-olive" /></p><p className="text-xs text-muted-foreground">{t(chef.title)}</p></div>
          </Link>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <Stat icon={<Clock className="h-4 w-4" />} v={t("{n} د", { n: r.time })} l={t("الوقت")} />
            <Stat icon={<Gauge className="h-4 w-4" />} v={t(r.difficulty)} l={t("الصعوبة")} />
            <Stat icon={<Users className="h-4 w-4" />} v={`${serv}`} l={t("حصص")} />
          </div>
        </div>

        <JourneyCallout step={2} />

        <div className="space-y-5 px-5 lg:grid lg:grid-cols-[1fr_320px] lg:gap-6 lg:space-y-0 lg:px-8">
          <div className="space-y-5">
            {/* Allergen detection */}
            {flagged.length === 0 ? (
              <div className="flex items-center gap-3 rounded-2xl border border-olive/30 bg-accent/50 p-4">
                <ShieldCheck className="h-6 w-6 shrink-0 text-olive" />
                <div><p className="font-semibold text-accent-foreground">{t("آمنة لملفك الغذائي")}</p><p className="text-xs text-muted-foreground">{t("لم نكتشف أي مسبب حساسية من قائمتك")}{s.allergies.length ? ` (${list(s.allergies)})` : ""}.</p></div>
              </div>
            ) : (
              <section className={`rounded-2xl border p-4 transition-colors ${unresolved.length ? "border-terracotta/40 bg-terracotta-soft" : "border-olive/30 bg-accent/50"}`}>
                <div className="flex items-center gap-2">
                  {unresolved.length ? <AlertTriangle className="h-5 w-5 text-terracotta" /> : <ShieldCheck className="h-5 w-5 text-olive" />}
                  <p className="flex-1 font-semibold">{unresolved.length ? t("اكتشفنا {n} مكوّن غير مناسب لك", { n: unresolved.length }) : t("أصبحت الوصفة آمنة لك")}</p>
                  <DemoBadge label={t("اقتراحات تجريبية")} />
                </div>
                <div className="mt-4 space-y-3">
                  {flagged.map((i) => (
                    <div key={i.key} className="rounded-xl bg-card p-3">
                      <p className="text-sm"><span className="font-semibold">{t(i.key)}</span> <span className="text-xs text-terracotta">{t("· يحتوي")} {t(i.allergen)}</span></p>
                      <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><Sparkles className="h-3.5 w-3.5 text-gold" /> {t("بدائل مقترحة")}</p>
                      <div className="mt-2 space-y-2">
                        {i.subs?.map((sub, n) => {
                          const on = chosen[i.key] === n;
                          return (
                            <button key={sub.name} onClick={() => setChosen((c) => { const x = { ...c }; if (on) delete x[i.key]; else x[i.key] = n; return x; })}
                              className={`press w-full rounded-xl border p-3 text-start transition ${on ? "border-olive bg-accent/60" : "hover:bg-muted"}`}>
                              <div className="flex items-center gap-2">
                                <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${on ? "border-olive bg-olive text-olive-foreground" : ""}`}>{on && <Check className="h-3 w-3" />}</span>
                                <span className="flex-1 font-medium">{t(sub.name)}</span>
                                <span className="text-[11px] text-muted-foreground">{sub.kcal > 0 ? "+" : ""}{sub.kcal} {t("سعرة")}</span>
                              </div>
                              <p className="mt-1.5 ps-7 text-xs text-muted-foreground"><b className="font-medium text-foreground">{t("لماذا؟")}</b> {t(sub.reason)}</p>
                              <p className="ps-7 text-xs text-muted-foreground"><b className="font-medium text-foreground">{t("الأثر:")}</b> {t(sub.impact)}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {unresolved.length > 0 && <button onClick={applyAll} className="press mt-3 w-full rounded-xl bg-olive py-3 text-sm font-semibold text-olive-foreground">{t("طبّق أفضل البدائل تلقائياً")}</button>}
              </section>
            )}

            {/* Servings */}
            <div className="flex items-center justify-between rounded-2xl bg-card p-3 shadow-soft">
              <div><p className="text-sm font-medium">{t("عدد الحصص")}</p><p className="text-[11px] text-muted-foreground">{t("الكميات والتكلفة تتعدّل تلقائياً")}</p></div>
              <div className="flex items-center gap-4">
                <button aria-label={t("إنقاص")} onClick={() => setServ(Math.max(1, serv - 1))} className="press grid h-9 w-9 place-items-center rounded-full bg-muted"><Minus className="h-4 w-4" /></button>
                <span className="w-6 text-center text-lg font-semibold">{serv}</span>
                <button aria-label={t("زيادة")} onClick={() => setServ(serv + 1)} className="press grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground"><Plus className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="grid grid-cols-2 rounded-2xl bg-muted p-1">
              {(["ing", "steps"] as const).map((k) => (
                <button key={k} onClick={() => setTab(k)} className={`rounded-xl py-2.5 text-sm font-medium transition ${tab === k ? "bg-card shadow-soft" : "text-muted-foreground"}`}>
                  {k === "ing" ? t("المقادير ({n})", { n: r.ingredients.length }) : t("الخطوات ({n})", { n: r.steps.length })}
                </button>
              ))}
            </div>

            {tab === "ing" ? (
              <ul className="divide-y rounded-2xl bg-card px-4">
                {r.ingredients.map((i, n) => {
                  const bad = i.allergen && matchesAllergy(i.allergen, s.allergies);
                  const sub = applied[n];
                  const have = hasPantry(s, i.key);
                  return (
                    <li key={i.key} className="flex items-center gap-3 py-3.5">
                      {pantryView && (have ? <Check className="h-4 w-4 shrink-0 text-olive" /> : <X className="h-4 w-4 shrink-0 text-terracotta" />)}
                      <div className="min-w-0 flex-1">
                        <p className={sub ? "font-medium text-olive" : "font-medium"}>{sub ? t(sub.name) : t(i.key)}</p>
                        {sub && <p className="text-xs text-muted-foreground line-through">{t(i.key)}</p>}
                        {bad && !sub && <p className="text-xs text-terracotta">{t("يحتوي")} {t(i.allergen)}</p>}
                      </div>
                      <span className="text-sm text-muted-foreground">{+(i.qty * k).toFixed(2)} {t(i.unit)}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <ol className="space-y-3">
                {r.steps.map((st, n) => (
                  <li key={n} className="flex gap-3 rounded-2xl bg-card p-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary font-display text-primary">{n + 1}</span>
                    <div><p className="leading-relaxed">{t(st.t)}</p>{st.min && <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Timer className="h-3.5 w-3.5" />{st.min} {t("دقيقة")}</p>}</div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl bg-card p-4 shadow-soft">
              <p className="font-semibold">{t("القيمة الغذائية")} <span className="text-xs font-normal text-muted-foreground">{t("/ حصة")}</span></p>
              <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                {[[t("سعرات"), r.nutrition.kcal + Math.round(kcalDelta / r.servings)], [t("بروتين"), t("{n}غ", { n: r.nutrition.protein })], [t("كارب"), t("{n}غ", { n: r.nutrition.carbs })], [t("دهون"), t("{n}غ", { n: r.nutrition.fat })]].map(([l, v]) => (
                  <div key={l} className="rounded-xl bg-secondary py-2"><p className="text-sm font-bold">{v}</p><p className="text-[10px] text-muted-foreground">{l}</p></div>
                ))}
              </div>
              {kcalDelta !== 0 && <p className="mt-2 text-[11px] text-olive">{t("البدائل غيّرت السعرات بـ")} {Math.round(kcalDelta / r.servings)} {t("سعرة/حصة")}</p>}
            </div>
            {isBoxEligible(r) && (
              <Link to="/box/$id" params={{ id: r.id }} onClick={() => { if (s.journey === 2) setStore(() => ({ journey: 3 })); }} className="press flex items-center gap-3 rounded-2xl bg-primary p-4 text-primary-foreground">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold text-ink"><Package className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block font-semibold">{t("اطلب صندوق الوصفة")}</span><span className="block text-xs opacity-75">{t("مكونات بالحصة الدقيقة · Ready-to-Cook")}</span></span>
              </Link>
            )}
            <div className="rounded-2xl bg-card p-4 shadow-soft">
              <div className="flex items-center justify-between"><p className="font-semibold">{t("تكلفة السلة التقديرية")}</p><DemoBadge /></div>
              <p className="mt-2 font-display text-3xl text-primary">{sar(cost)}</p>
              <p className="text-xs text-muted-foreground">≈ {sar(cost / serv)} {t("للحصة · بأقل الأسعار التجريبية")}</p>
              <p className="mt-2 text-xs">{t("ينقصك من مخزنك:")} <b>{missing.length}</b> {t("من")} {r.ingredients.length} {t("مكونات")}</p>
            </div>
            {pantryView && (
              <div className="animate-float-up rounded-2xl border border-olive/30 bg-accent/40 p-4 text-sm">
                <p className="font-semibold">{t("مطابقة مع مخزنك")}</p>
                <p className="mt-1 text-muted-foreground">{t("لديك")} {r.ingredients.length - missing.length} {t("مكونات. الناقص:")} {list(missing.map((m) => m.key)) || t("لا شيء 🎉")}</p>
                {missing.length > 0 && <p className="mt-1 text-xs">{t("أرخص سعر للناقص يبدأ من")} {sar(missing.reduce((a, m) => { const c = cheapest(m.key); return a + (c >= 0 ? (priceOf(m.key, c) as number) : 0); }, 0))}</p>}
              </div>
            )}
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card p-3 lg:static lg:mx-8 lg:mb-10 lg:rounded-2xl lg:border">
        <div className="mx-auto grid max-w-md grid-cols-[1fr_1fr_1.3fr] gap-2 lg:max-w-none">
          <button onClick={() => { setPantryView((v) => !v); setTab("ing"); }} className={`press flex flex-col items-center gap-1 rounded-2xl border py-2.5 text-[11px] font-medium ${pantryView ? "border-olive bg-accent text-accent-foreground" : ""}`}>
            <Refrigerator className="h-5 w-5" /> {t("استخدم الموجود عندي")}
          </button>
          <Link to="/grocery" search={{ recipe: r.id }} className="press flex flex-col items-center gap-1 rounded-2xl border py-2.5 text-[11px] font-medium">
            <ShoppingCart className="h-5 w-5" /> {t("قارن الأسعار")}
          </Link>
          <button onClick={() => setCooking(true)} className="press flex items-center justify-center gap-2 rounded-2xl bg-primary font-semibold text-primary-foreground">
            <ChefHat className="h-5 w-5" /> {t("ابدأ الطبخ")}
          </button>
        </div>
      </div>

      {cooking && <CookMode steps={r.steps} title={t(r.title)} onClose={() => setCooking(false)} />}
    </AppShell>
  );
}

function CookMode({ steps, title, onClose }: { steps: { t: string; min?: number }[]; title: string; onClose: () => void }) {
  const [i, setI] = useState(0);
  const st = steps[i]!;
  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex flex-col bg-ink p-6 text-ink-foreground duration-300" role="dialog" aria-label={t("وضع الطبخ")}>
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between">
        <p className="text-sm opacity-70">{t("وضع الطبخ ·")} {title}</p>
        <button onClick={onClose} aria-label={t("إغلاق")} className="press grid h-10 w-10 place-items-center rounded-full bg-ink-foreground/10"><X className="h-5 w-5" /></button>
      </div>
      <div className="mx-auto mt-6 flex w-full max-w-2xl gap-1.5">{steps.map((_, n) => <span key={n} className={`h-1 flex-1 rounded-full ${n <= i ? "bg-gold" : "bg-ink-foreground/15"}`} />)}</div>
      <div key={i} className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center">
        <p className="font-display text-7xl text-gold">{i + 1}</p>
        <p className="mt-6 text-3xl leading-relaxed">{t(st.t)}</p>
        {st.min && <p className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-ink-foreground/10 px-4 py-2 text-sm"><Timer className="h-4 w-4" /> {t("مؤقّت مقترح:")} {st.min} {t("دقيقة")}</p>}
      </div>
      <div className="mx-auto flex w-full max-w-2xl gap-3">
        <button disabled={i === 0} onClick={() => setI(i - 1)} className="press rounded-2xl border border-ink-foreground/20 px-6 py-4 disabled:opacity-30">{t("السابق")}</button>
        {i < steps.length - 1
          ? <button onClick={() => setI(i + 1)} className="press flex-1 rounded-2xl bg-gold py-4 font-semibold text-ink">{t("الخطوة التالية")}</button>
          : <button onClick={() => { onClose(); toast.success(t("صحتين وعافية! 🍽️"), { description: t("قيّم الوصفة لتساعد الآخرين.") }); }} className="press flex-1 rounded-2xl bg-gold py-4 font-semibold text-ink">{t("انتهيت")}</button>}
      </div>
    </div>
  );
}

function Stat({ icon, v, l }: { icon: React.ReactNode; v: string; l: string }) {
  return (
    <div className="rounded-2xl bg-secondary p-3">
      <div className="mx-auto mb-1 w-fit text-primary">{icon}</div>
      <p className="font-semibold">{v}</p>
      <p className="text-[11px] text-muted-foreground">{l}</p>
    </div>
  );
}
