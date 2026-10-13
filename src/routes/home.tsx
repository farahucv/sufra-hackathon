import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Bookmark, Clock, Link2, Play, Sparkles, AlertTriangle, BadgeCheck, Share2, Flame, Gauge, Route as RouteIcon, SearchX } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Chip, EmptyState, Wordmark } from "@/components/AppShell";
import { JourneyCallout, startJourney } from "@/components/Journey";
import { BoxArt } from "@/components/BoxArt";
import { buildBox } from "@/lib/box";
import { categories, sar, recipes, getChef, recipeAllergens, safeSubs, type Recipe } from "@/lib/data";
import { matchesAllergy, toggleIn, useStore, useTr, type State } from "@/lib/store";
import { isEn, list, t } from "@/lib/i18n";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "ريلز الطهاة — سُفرة" },
      { name: "description", content: "ريلز قصيرة لطهاة سعوديين مع شارة «مناسب لك» حسب حساسيتك ونمط أكلك." },
      { property: "og:title", content: "ريلز الطهاة — سُفرة" },
      { property: "og:description", content: "اكتشف وصفات سعودية قصيرة مخصصة لك." },
    ],
  }),
  component: HomePage,
});

export function fitFor(r: Recipe, s: State) {
  const warn = recipeAllergens(r).filter((a) => matchesAllergy(a, s.allergies));
  const dietOk = s.diet === "veg" ? r.cats.includes("نباتي") : s.diet === "healthy" ? r.nutrition.kcal < 560 : s.diet === "highprotein" ? r.nutrition.protein >= 30 : true;
  return { warn, fit: warn.length === 0 && dietOk, adaptable: warn.length > 0 && r.ingredients.every((i) => !i.allergen || !s.allergies.includes(i.allergen) || safeSubs(i, s.allergies).length > 0) };
}

function HomePage() {
  const router = useRouter();
  useEffect(() => {
    // Warm up the judge demo path (Kabsa → box → checkout → order → cook) so the first run has no hitch.
    const go = () => {
      const k = recipes.find((x) => x.id === "kabsa");
      if (k) { const im = new Image(); im.src = k.img; }
      router.preloadRoute({ to: "/recipe/$id", params: { id: "kabsa" } }).catch(() => {});
      router.preloadRoute({ to: "/box/$id", params: { id: "kabsa" } }).catch(() => {});
      router.preloadRoute({ to: "/checkout" }).catch(() => {});
      router.preloadRoute({ to: "/order" }).catch(() => {});
      router.preloadRoute({ to: "/cook/$id", params: { id: "kabsa" } }).catch(() => {});
    };
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    if (ric) ric(go); else setTimeout(go, 300);
  }, [router]);
  const [cat, setCat] = useState<string | null>(null);
  const s = useStore();
  const list = recipes.filter((r) => !cat || r.cats.includes(cat))
    .sort((a, b) => Number(fitFor(b, s).fit) - Number(fitFor(a, s).fit));
  const hour = new Date().getHours();

  return (
    <AppShell wide>
      <header className="flex items-center justify-between px-5 pb-2 pt-6 lg:px-8 lg:pt-10">
        <div className="lg:hidden"><Wordmark size="sm" /></div>
        <div className="hidden lg:block">
          <p className="text-sm text-muted-foreground">{hour < 12 ? t("صباح الخير") : t("مساء الخير")}{t("،")} {t(s.name)}</p>
          <h1 className="text-3xl">{t("وش نطبخ اليوم؟")}</h1>
        </div>
        <button onClick={() => { startJourney(); toast(t("بدأت رحلة العرض"), { description: t("٥ خطوات قصيرة تشرح الفكرة كاملة.") }); }}
          className="press inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] text-muted-foreground hover:bg-muted">
          <RouteIcon className="h-3.5 w-3.5" /> {t("رحلة العرض")}
        </button>
      </header>
      <p className="px-5 text-sm text-muted-foreground lg:hidden">{hour < 12 ? t("صباح الخير") : t("مساء الخير")}{t("،")} {t(s.name)} — {t("وش نطبخ اليوم؟")}</p>

      <JourneyCallout step={1} />

      <div className="grid gap-3 px-5 pt-3 lg:grid-cols-2 lg:px-8">
        <Link to="/import" className="press flex min-w-0 items-center gap-3 rounded-2xl bg-ink p-4 text-ink-foreground">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold text-ink"><Link2 className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{t("استورد وصفة من تيك توك أو يوتيوب")}</p>
            <p className="truncate text-xs opacity-70">{t("الصق الرابط ونستخرج المقادير والخطوات")}</p>
          </div>
          <Sparkles className="h-5 w-5 text-gold" />
        </Link>
        <Link to="/pantry" className="press hidden items-center gap-3 rounded-2xl bg-secondary p-4 lg:flex">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-olive text-olive-foreground font-display">{s.pantry.length}</span>
          <div className="min-w-0 flex-1"><p className="font-semibold">{t("مكوّن في مخزنك")}</p><p className="text-xs text-muted-foreground">{t("شوف وش تقدر تطبخ الحين")}</p></div>
        </Link>
      </div>

      <section className="mt-7">
        <div className="flex items-baseline justify-between px-5 lg:px-8">
          <h2 className="text-xl">{t("جاهز للطبخ")} {!isEn() && <span className="ms-1 text-[10px] tracking-normal text-muted-foreground">Ready-to-Cook Box</span>}</h2>
          <span className="text-[11px] text-muted-foreground">{t("بيانات تجريبية")}</span>
        </div>
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-5 pb-1 lg:grid lg:grid-cols-3 lg:px-8">
          {["kabsa", "jareesh", "freekeh"].map((id) => {
            const r = recipes.find((x) => x.id === id)!;
            return (
              <Link key={id} to="/box/$id" params={{ id }} className="press w-64 shrink-0 lg:w-auto">
                <BoxArt img={r.img} title={t(r.title)} serv={4} size="sm" />
                <p className="mt-2 flex justify-between text-sm"><span>{r.time} {t("د ·")} {t(r.difficulty)}</span><b className="text-primary">{sar(buildBox(r, 4, {}).subtotal)}</b></p>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto px-5 lg:px-8">
        <Chip active={!cat} onClick={() => setCat(null)}>{t("الكل")}</Chip>
        {categories.map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{t(c)}</Chip>)}
      </div>

      <section className="mt-5 grid gap-5 px-5 lg:grid-cols-2 lg:px-8 xl:grid-cols-3">
        {list.length === 0 && (
          <div className="lg:col-span-2"><EmptyState icon={<SearchX className="h-6 w-6" />} title={t("لا توجد ريلز هنا بعد")} body={t("جرّب تصنيفاً آخر — نضيف ريلز جديدة أسبوعياً.")} action={<Chip onClick={() => setCat(null)}>{t("عرض الكل")}</Chip>} /></div>
        )}
        {list.map((r, idx) => <Reel key={r.id} r={r} s={s} idx={idx} />)}
      </section>
    </AppShell>
  );
}

function Reel({ r, s, idx }: { r: Recipe; s: State; idx: number }) {
  const chef = getChef(r.chefId)!;
  const { warn, fit, adaptable } = fitFor(r, s);
  const liked = s.liked.includes(r.id), saved = s.saved.includes(r.id);
  const share = async () => {
    const url = `${t(location.origin)}/recipe/${r.id}`;
    try { await navigator.clipboard.writeText(url); toast.success(t("تم نسخ رابط الوصفة")); } catch { toast(t("رابط الوصفة"), { description: url }); }
  };
  return (
    <article className={`relative h-[460px] overflow-hidden rounded-2xl bg-muted lg:h-[520px]`}>
      <Link to="/recipe/$id" params={{ id: r.id }} aria-label={t(r.title)} className="absolute inset-0">
        <img src={r.img} alt={t(r.title)} className="h-full w-full object-cover" loading={idx ? "lazy" : "eager"} fetchPriority={idx ? "auto" : "high"} decoding="async" width={768} height={1024} />
        <div className="absolute inset-0 scrim" />
      </Link>
      <div className="pointer-events-none absolute inset-x-4 top-4 flex flex-wrap items-start justify-between gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-ink/55 px-3 py-1.5 text-xs text-ink-foreground"><Play className="h-3.5 w-3.5 fill-current" /> {t("٠:٤٥")}</span>
        {fit && <span className="flex items-center gap-1 rounded-full bg-olive px-3 py-1.5 text-xs font-medium text-olive-foreground"><Sparkles className="h-3.5 w-3.5" /> {t("مناسب لك")}</span>}
        {!fit && warn.length > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-terracotta px-3 py-1.5 text-xs text-primary-foreground">
            <AlertTriangle className="h-3.5 w-3.5" /> {list(warn)}{adaptable ? t(" · قابل للتعديل") : ""}
          </span>
        )}
      </div>
      <div className="absolute bottom-36 end-4 flex flex-col gap-4 text-ink-foreground">
        <ActionBtn label={t(r.likes)} aria={t("إعجاب")} onClick={() => toggleIn("liked", r.id)}><Heart className={`h-5 w-5 ${liked ? "fill-terracotta text-terracotta" : ""}`} /></ActionBtn>
        <ActionBtn label={saved ? t("محفوظ") : t("حفظ")} aria={t("حفظ")} onClick={() => { toggleIn("saved", r.id); toast.success(saved ? t("أُزيلت من المحفوظات") : t("حُفظت في وصفاتك")); }}><Bookmark className={`h-5 w-5 ${saved ? "fill-gold text-gold" : ""}`} /></ActionBtn>
        <ActionBtn label={t("مشاركة")} aria={t("مشاركة")} onClick={share}><Share2 className="h-5 w-5" /></ActionBtn>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 space-y-2.5 p-5 text-ink-foreground">
        <Link to="/chef/$id" params={{ id: chef.id }} className="pointer-events-auto flex w-fit items-center gap-2">
          <img src={chef.img} alt={t(chef.name)} className="h-9 w-9 rounded-full border-2 border-gold object-cover" loading="lazy" />
          <span className="text-sm font-medium">{t(chef.name)}</span><BadgeCheck className="h-4 w-4 text-gold" />
        </Link>
        <h2 className="text-3xl">{t(r.title)}</h2>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs opacity-90">
          <span>{t(r.region)}</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{r.time} {t("د")}</span>
          <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5" />{r.nutrition.kcal} {t("سعرة")}</span>
          <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" />{t(r.difficulty)}</span>
        </div>
        <Link to="/recipe/$id" params={{ id: r.id }} className="press pointer-events-auto block rounded-2xl bg-card py-3 text-center font-semibold text-foreground">{t("عرض الوصفة")}</Link>
      </div>
    </article>
  );
}

function ActionBtn({ children, label, aria, onClick }: { children: React.ReactNode; label: string; aria: string; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={aria} className="press flex flex-col items-center gap-1 text-[11px]">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-ink/55">{children}</span>{label}
    </button>
  );
}
