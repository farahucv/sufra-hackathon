import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Clock, Gauge, Truck, ShieldCheck, AlertTriangle, Sparkles, Snowflake, Leaf, Package, Store, ChefHat, ShoppingBag, ArrowLeft, BadgeCheck, ChevronRight, Home as HomeIcon, MapPin } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { BoxArt } from "@/components/BoxArt";
import { JourneyCallout } from "@/components/Journey";
import { getChef, getRecipe, ingredientLoc, sar } from "@/lib/data";
import { BOX_SERVINGS, autoSubs, buildBox, householdBasics, isBoxEligible, unsafeLeft } from "@/lib/box";
import { setStore, useStore, useTr } from "@/lib/store";

export const Route = createFileRoute("/box/$id")({
  loader: ({ params }) => {
    const r = getRecipe(params.id);
    if (!r || !isBoxEligible(r)) throw notFound();
    return { id: r.id, title: r.title };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `صندوق ${loaderData.title} الجاهز للطبخ — سُفرة` : "الصندوق غير متاح — سُفرة";
    return {
      meta: [
        { title: t },
        { name: "description", content: "A Ready-to-Cook Box lets users order a curated meal kit containing all the ingredients needed for a selected recipe, pre-portioned and ready to use." },
        { property: "og:title", content: t },
        { property: "og:description", content: "Everything you need for this recipe, pre-portioned and delivered." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
        ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  notFoundComponent: BoxNotFound,
  component: BoxPage,
});

function BoxNotFound() {
  return (
    <AppShell>
      <div className="px-5 pt-16 text-center">
        <p className="font-display text-2xl">هذه الوصفة غير متاحة كصندوق حالياً</p>
        <Link to="/home" className="mt-5 inline-block rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">تصفّح الوصفات</Link>
      </div>
    </AppShell>
  );
}

const FRESH = ["بصل", "طماطم", "كوسا", "جزر", "كراث"];
function packTag(key: string) {
  const loc = ingredientLoc[key];
  if (loc === "freezer" || loc === "fridge") return { ar: "مبرّد", en: "Chilled", Icon: Snowflake, cls: "bg-accent text-accent-foreground" };
  if (FRESH.includes(key)) return { ar: "طازج", en: "Fresh", Icon: Leaf, cls: "bg-accent text-accent-foreground" };
  return { ar: "مخزن", en: "Pantry", Icon: Package, cls: "bg-secondary text-secondary-foreground" };
}

function BoxPage() {
  const { id } = Route.useLoaderData();
  const r = getRecipe(id)!;
  const chef = getChef(r.chefId)!;
  const s = useStore();
  const tr = useTr();
  const nav = useNavigate();
  const draft = s.box?.recipeId === r.id ? s.box : null;
  const [serv, setServ] = useState<number>(draft?.serv ?? ((BOX_SERVINGS as readonly number[]).includes(s.household) ? s.household : 4));
  const [subs, setSubs] = useState<Record<string, number>>(draft?.subs ?? autoSubs(r, s.allergies));
  useEffect(() => { setStore(() => ({ box: { recipeId: r.id, serv, subs } })); }, [r.id, serv, subs]);

  const flagged = r.ingredients.filter((i) => i.allergen && s.allergies.includes(i.allergen));
  const left = unsafeLeft(r, s.allergies, subs);
  const box = buildBox(r, serv, subs);
  const delta = box.subtotal - buildBox(r, serv, {}).subtotal;
  const personalized = flagged.length > 0 && left.length === 0;
  const blocked = left.some((i) => !i.subs?.length);
  const Back = s.lang === "ar" ? ChevronRight : ArrowLeft;

  const applySafe = () => { setSubs(autoSubs(r, s.allergies)); toast.success(tr("تم تطبيق البديل الآمن", "Safe substitution applied"), { description: tr("صار الصندوق مخصصاً لملفك الغذائي.", "Your box is now personalized for your dietary needs.") }); };
  const toCheckout = () => { if (s.journey === 3) setStore(() => ({ journey: 4 })); nav({ to: "/checkout" }); };

  return (
    <AppShell wide nav={false}>
      {/* Hero */}
      <section className="relative">
        <div className="relative h-64 overflow-hidden lg:mx-8 lg:mt-8 lg:h-80 lg:rounded-2xl">
          <img src={r.img} alt={r.title} className="h-full w-full object-cover" width={1280} height={640} fetchPriority="high" />
          <div className="absolute inset-0 scrim" />
          <button onClick={() => history.back()} aria-label="رجوع" className="press absolute start-5 top-[max(env(safe-area-inset-top),1.25rem)] grid h-10 w-10 place-items-center rounded-full bg-card"><Back className="h-5 w-5" /></button>
          <span className="absolute end-5 top-[max(env(safe-area-inset-top),1.25rem)] rounded-full bg-card/90 px-3 py-1.5 text-[11px] font-medium text-primary">Ready-to-Cook Box</span>
        </div>
        <div className="relative z-10 mx-auto -mt-20 w-[78%] max-w-sm lg:-mt-28">
          <BoxArt title={r.title} serv={serv} size="lg" img={r.img} />
        </div>
      </section>

      <div className="px-5 pt-6 lg:grid lg:grid-cols-[1fr_340px] lg:gap-10 lg:px-8">
        <div className="space-y-8">
          <header className="text-center lg:text-start">
            <p className="text-xs font-medium tracking-wide text-olive">{tr("صندوق جاهز للطبخ", "Ready-to-Cook Box")}</p>
            <h1 className="mt-1 text-4xl lg:text-5xl">{r.title}</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground lg:mx-0">{tr("كل ما تحتاجه لهذه الوصفة، مقسّم بالحصة ويصلك لباب البيت.", "Everything you need for this recipe, pre-portioned and delivered.")}</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground lg:justify-start">
              <Link to="/chef/$id" params={{ id: chef.id }} className="flex items-center gap-1.5 text-foreground">
                <img src={chef.img} alt={chef.name} className="h-6 w-6 rounded-full object-cover" loading="lazy" width={24} height={24} />{chef.name}<BadgeCheck className="h-3.5 w-3.5 text-olive" />
              </Link>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{r.time} د</span>
              <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" />{r.difficulty}</span>
              <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" />{tr("يصل خلال ٩٠ د", "Delivery in 90 min")}</span>
            </div>
          </header>

          <JourneyCallout step={3} hideNext />

          {/* Servings */}
          <section>
            <SectionTitle ar="اختر عدد الحصص" en="Choose your servings" />
            <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup">
              {BOX_SERVINGS.map((n) => {
                const p = buildBox(r, n, subs).subtotal;
                const on = serv === n;
                return (
                  <button key={n} role="radio" aria-checked={on} onClick={() => setServ(n)}
                    className={`press rounded-xl border-2 px-2 py-3 text-center transition-colors ${on ? "border-primary bg-secondary/60" : "border-transparent bg-card"}`}>
                    <span className="block font-display text-2xl text-primary">{n}</span>
                    <span className="block text-[11px] text-muted-foreground">حصص</span>
                    <span className="mt-1 block text-xs font-semibold tabular-nums">{sar(p)}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Personalization */}
          {flagged.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-accent-foreground"><ShieldCheck className="h-5 w-5 text-olive" />{tr("الصندوق آمن لملفك الغذائي كما هو.", "This box already suits your dietary profile.")}</p>
          ) : personalized ? (
            <section className="overflow-hidden rounded-2xl bg-accent/50">
              <div className="flex items-center gap-3 px-4 pt-4">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-olive text-olive-foreground"><ShieldCheck className="h-5 w-5" /></span>
                <div className="flex-1">
                  <p className="font-semibold text-accent-foreground">{tr("نسخة مناسبة لك", "Personalized for you")}</p>
                  <p className="text-xs text-muted-foreground">{tr(`خالية من ${flagged.map((i) => i.allergen).join("، ")} حسب ملفك`, "Adapted to your saved allergies")}</p>
                </div>
              </div>
              <ul className="space-y-2 p-4">
                {box.lines.filter((l) => l.swapped).map((l) => (
                  <li key={l.key} className="rounded-xl bg-card p-3 text-sm">
                    <p className="flex flex-wrap items-center gap-2"><s className="text-muted-foreground">{l.swapped!.from}</s><ArrowLeft className="h-3.5 w-3.5 text-olive ltr:rotate-180" /><b>{l.name}</b></p>
                    <p className="mt-1 text-xs text-muted-foreground">{l.swapped!.reason}</p>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-olive/15 px-4 py-2.5 text-xs">
                <span className="text-muted-foreground">{tr("أثر السعر", "Price impact")}: <b className="tabular-nums text-foreground">{delta === 0 ? "—" : `${delta > 0 ? "+" : "−"}${sar(Math.abs(delta))}`}</b></span>
                <button onClick={() => { setSubs({}); toast(tr("عُرض الصندوق الأصلي", "Showing the original box"), { description: tr("يحتوي على مسببات حساسية من ملفك.", "It contains allergens from your profile.") }); }} className="text-muted-foreground underline underline-offset-2">{tr("عرض الأصلي", "View original")}</button>
              </div>
            </section>
          ) : (
            <section className="rounded-2xl bg-terracotta-soft p-4">
              <p className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-terracotta" />{tr("يحتوي على", "Contains")}: {left.map((i) => i.allergen).join("، ")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{blocked ? tr("لا يتوفر بديل آمن لبعض المكونات.", "No safe substitution is available for some items.") : tr("يتعارض مع حساسيتك المحفوظة — لدينا بدائل آمنة جاهزة.", "Conflicts with your saved allergies — safe substitutions are ready.")}</p>
              {!blocked && <button onClick={applySafe} className="press mt-3 w-full rounded-xl bg-olive py-3 text-sm font-semibold text-olive-foreground">{tr("استبدل المكونات غير المناسبة", "Replace unsuitable ingredients")}</button>}
            </section>
          )}

          {/* Contents */}
          <section>
            <div className="flex items-baseline justify-between">
              <SectionTitle ar="داخل الصندوق" en="What's inside the box" />
              <span className="text-xs text-muted-foreground">{box.lines.length} {tr("عبوات مقسّمة", "pre-portioned packs")}</span>
            </div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {box.lines.map((l) => {
                const tag = packTag(l.key);
                const unsafe = !!l.allergen && s.allergies.includes(l.allergen);
                return (
                  <li key={l.key} className={`flex items-center gap-3 rounded-xl bg-card p-3 ring-1 ${unsafe ? "ring-terracotta/50" : l.swapped ? "ring-olive/40" : "ring-border"}`}>
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${tag.cls}`}><tag.Icon className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{l.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {unsafe ? <span className="text-terracotta">{tr("يحتوي", "Contains")} {l.allergen}</span> : l.swapped ? <span className="text-olive">{tr("بديل آمن", "Safe substitution")}</span> : tr(tag.ar, tag.en)}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md bg-primary px-2 py-1 text-[11px] font-semibold tabular-nums text-primary-foreground">{l.qty}</span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <HomeIcon className="h-4 w-4" />
              <span>{tr("غير مشمول — من أساسيات البيت:", "Household basics not included:")}</span>
              {householdBasics.map((b) => <span key={b} className="rounded-full border border-dashed px-2.5 py-0.5">{b}</span>)}
            </div>
          </section>

          {/* Commercial model */}
          <section className="border-t pt-6">
            <div className="flex items-baseline justify-between">
              <SectionTitle ar="من المورد إلى مطبخك" en="How it works" />
              <span className="text-[11px] text-muted-foreground">Demo data</span>
            </div>
            <ol className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
              {[
                { Icon: Store, t: tr("مورد محلي", "Local supplier"), d: tr("سوبرماركت أو مزرعة تجهّز العبوات", "A supermarket or farm prepares the packs") },
                { Icon: ChefHat, t: tr("حصة للشيف", "Chef share"), d: tr("جزء من كل صندوق لصاحب الوصفة", "Part of every box goes to the recipe creator") },
                { Icon: ShoppingBag, t: tr("طلب مباشر", "One-tap order"), d: tr("من الوصفة إلى الطلب بنقرة", "From recipe to order in one tap") },
              ].map(({ Icon, t, d }) => (
                <li key={t}><span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary"><Icon className="h-4 w-4" /></span><b className="mt-2 block text-sm">{t}</b><span className="text-muted-foreground">{d}</span></li>
              ))}
            </ol>
            <p className="mt-6 text-center font-display text-lg leading-relaxed text-primary">«من الإلهام إلى المائدة: وصفة مخصصة، مكونات مجهزة، وتوصيل في تجربة واحدة.»</p>
            <p className="mt-1 text-center text-xs text-muted-foreground" dir="ltr">From inspiration to the table: a personalized recipe, prepared ingredients, and delivery in one seamless experience.</p>
          </section>
        </div>

        {/* Summary (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-8 space-y-4 rounded-2xl bg-card p-6 shadow-soft">
            <PriceBlock total={box.subtotal} per={box.perServing} serv={serv} tr={tr} />
            <div className="space-y-2 border-t pt-4 text-sm">
              <p className="flex items-center gap-2"><Truck className="h-4 w-4 text-olive" />{tr("التوصيل المتوقع: خلال ٩٠ دقيقة", "Estimated delivery: within 90 min")}</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-olive" />{tr("الرياض — ضمن نطاق التوصيل", "Riyadh — within delivery area")}</p>
              <p className="flex items-center gap-2"><Check className="h-4 w-4 text-olive" />{tr("عبوات مقسّمة بدقة", "Precisely pre-portioned")}</p>
            </div>
            <CTA disabled={left.length > 0} onClick={toCheckout} tr={tr} />
            <p className="text-center text-[11px] text-muted-foreground">{tr("الأسعار والتوصيل بيانات تجريبية", "Prices and delivery are demo data")}</p>
          </div>
        </aside>
      </div>
      <div className="h-32 lg:h-12" />

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card px-5 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 lg:hidden">
        <div className="mx-auto flex max-w-md items-center gap-4">
          <div className="shrink-0">
            <p key={box.subtotal} className="animate-float-up font-display text-2xl leading-none text-primary tabular-nums">{sar(box.subtotal)}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{serv} حصص · Demo data</p>
          </div>
          <div className="flex-1"><CTA disabled={left.length > 0} onClick={toCheckout} tr={tr} /></div>
        </div>
      </div>
    </AppShell>
  );
}

function SectionTitle({ ar, en }: { ar: string; en: string }) {
  const tr = useTr();
  return <h2 className="text-xl">{tr(ar, en)}</h2>;
}

function PriceBlock({ total, per, serv, tr }: { total: number; per: number; serv: number; tr: (a: string, e: string) => string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{tr("سعر الصندوق", "Box price")} · {serv} {tr("حصص", "servings")}</p>
      <p key={total} className="animate-float-up font-display text-4xl text-primary tabular-nums">{sar(total)}</p>
      <p className="text-xs text-muted-foreground">≈ {sar(per)} {tr("للحصة", "per serving")}</p>
    </div>
  );
}

function CTA({ disabled, onClick, tr }: { disabled: boolean; onClick: () => void; tr: (a: string, e: string) => string }) {
  return (
    <button disabled={disabled} onClick={onClick}
      className="press flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground disabled:opacity-40">
      {disabled ? tr("استبدل المكونات أولاً", "Replace ingredients first") : tr("راجع صندوقك", "Review your box")}
      {!disabled && <Sparkles className="h-4 w-4 text-gold" />}
    </button>
  );
}
