import { Package } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, ChevronLeft, Rocket, Refrigerator, Languages, Cloud, RotateCcw, Minus, Plus, Route as RouteIcon } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Chip, DemoBadge, EmptyState, TopBar } from "@/components/AppShell";
import { startJourney } from "@/components/Journey";
import { allergensList, diets, dislikesList, getRecipe } from "@/lib/data";
import { defaults, setStore, toggleIn, useStore, useTr } from "@/lib/store";
import { t } from "@/lib/i18n";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "حسابي والمحفوظات — سُفرة" },
      { name: "description", content: "وصفاتك المحفوظة، ملفك الغذائي، اللغة، وحسابك التجريبي على سُفرة." },
      { property: "og:title", content: "حسابي — سُفرة" },
      { property: "og:description", content: "وصفاتك المحفوظة وتفضيلاتك." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const s = useStore();
  const saved = s.saved.map(getRecipe).filter((x): x is NonNullable<typeof x> => !!x);

  return (
    <AppShell wide>
      <TopBar back={false} title={t("حسابي")} />
      <div className="space-y-7 px-5 lg:grid lg:grid-cols-[1fr_360px] lg:gap-8 lg:space-y-0 lg:px-8">
        <div className="space-y-7">
          <div className="star-pattern flex items-center gap-4 rounded-2xl bg-primary p-5 text-primary-foreground">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gold font-display text-2xl text-ink">{t("س")}</div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold">{s.name}</p>
              <p className="text-xs opacity-75">{saved.length} {t("وصفة محفوظة ·")} {s.pantry.length} {t("مكوّن في المخزن")}</p>
            </div>
            <DemoBadge label={t("حساب تجريبي")} />
          </div>

          <section>
            <h2 className="flex items-center gap-2 text-lg"><Bookmark className="h-5 w-5 text-gold" /> {t("المحفوظات")}</h2>
            <div className="mt-3">
              {saved.length === 0 ? (
                <EmptyState icon={<Bookmark className="h-6 w-6" />} title={t("لا توجد وصفات محفوظة")} body={t("اضغط على أيقونة الحفظ في أي ريل لتجده هنا لاحقاً.")} action={<Link to="/home" className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">{t("تصفّح الريلز")}</Link>} />
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {saved.map((r) => (
                    <Link key={r.id} to="/recipe/$id" params={{ id: r.id }} className="lift overflow-hidden rounded-2xl bg-card shadow-soft">
                      <img src={r.img} alt={t(r.title)} className="h-28 w-full object-cover" loading="lazy" />
                      <p className="p-3 text-sm font-semibold">{t(r.title)}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl bg-card p-5">
            <h2 className="text-lg">{t("ملفك الغذائي")}</h2>
            <p className="mt-4 text-sm font-medium">{t("الحساسية")}</p>
            <div className="mt-2 flex flex-wrap gap-2">{allergensList.map((a) => <Chip key={a} active={s.allergies.includes(a)} onClick={() => toggleIn("allergies", a)}>{t(a)}</Chip>)}</div>
            <p className="mt-5 text-sm font-medium">{t("مكونات لا تفضّلها")}</p>
            <div className="mt-2 flex flex-wrap gap-2">{dislikesList.map((d) => <Chip key={d} active={s.dislikes.includes(d)} onClick={() => toggleIn("dislikes", d)}>{t(d)}</Chip>)}</div>
            <p className="mt-5 text-sm font-medium">{t("نمط الأكل")}</p>
            <div className="mt-2 flex flex-wrap gap-2">{diets.map((d) => <Chip key={d.id} active={s.diet === d.id} onClick={() => setStore(() => ({ diet: d.id }))}>{t(d.ar)}</Chip>)}</div>
            <div className="mt-5 flex items-center justify-between">
              <p className="text-sm font-medium">{t("أفراد البيت")}</p>
              <div className="flex items-center gap-3">
                <button aria-label={t("إنقاص")} onClick={() => setStore((x) => ({ household: Math.max(1, x.household - 1) }))} className="press grid h-8 w-8 place-items-center rounded-full bg-muted"><Minus className="h-4 w-4" /></button>
                <span className="w-5 text-center font-semibold">{s.household}</span>
                <button aria-label={t("زيادة")} onClick={() => setStore((x) => ({ household: Math.min(12, x.household + 1) }))} className="press grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <Link to="/pantry" className="press flex items-center gap-3 rounded-2xl bg-card p-4">
            <Refrigerator className="h-5 w-5 text-olive" /><span className="flex-1">{t("مخزني")}</span><span className="text-xs text-muted-foreground">{s.pantry.length} {t("مكوّن")}</span><ChevronLeft className="h-4 w-4 ltr:rotate-180" />
          </Link>
          <Link to="/order" className="press flex items-center gap-3 rounded-2xl bg-card p-4">
            <Package className="h-5 w-5 text-olive" /><span className="flex-1">{t("طلباتي · صناديق الوصفات")}</span><span className="text-xs text-muted-foreground">{s.order ? s.order.id : t("لا توجد")}</span><ChevronLeft className="h-4 w-4 ltr:rotate-180" />
          </Link>

          <div className="rounded-2xl bg-card p-4">
            <p className="flex items-center gap-2"><Languages className="h-5 w-5 text-olive" /> {t("اللغة")}</p>
            <div className="mt-3 grid grid-cols-2 rounded-xl bg-muted p-1 text-sm">
              {(["ar", "en"] as const).map((l) => (
                <button key={l} onClick={() => setStore(() => ({ lang: l }))} className={`rounded-lg py-2 transition ${s.lang === l ? "bg-card font-semibold shadow-soft" : "text-muted-foreground"}`}>{l === "ar" ? t("العربية") : "English"}</button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">{t("الإنجليزية تغيّر الاتجاه والقوائم الرئيسية (معاينة).")}</p>
          </div>

          <div className="rounded-2xl bg-card p-4">
            <p className="flex items-center gap-2 font-semibold"><Cloud className={`h-5 w-5 ${s.synced ? "text-olive" : "text-muted-foreground"}`} /> {t("الحساب التجريبي")}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t("بدون تسجيل: تفضيلاتك ومحفوظاتك ومخزنك تُحفظ تلقائياً على هذا الجهاز وفي السحابة كملف تجريبي مجهول الهوية.")}</p>
            <p className="mt-2 text-xs">{s.synced ? t("✓ متزامن مع السحابة") : t("جارِ المزامنة…")}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => startJourney()} className="press flex items-center justify-center gap-1 rounded-xl border py-2 text-xs"><RouteIcon className="h-3.5 w-3.5" /> {t("رحلة العرض")}</button>
              <button onClick={() => { setStore(() => ({ ...defaults, onboarded: true, lang: s.lang })); toast.success("أُعيد ضبط البيانات التجريبية"); }} className="press flex items-center justify-center gap-1 rounded-xl border py-2 text-xs"><RotateCcw className="h-3.5 w-3.5" /> {t("إعادة الضبط")}</button>
            </div>
          </div>

          <Link to="/future" className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-gold bg-gold/10 p-4">
            <Rocket className="h-6 w-6 text-primary" />
            <div className="flex-1"><p className="font-semibold">{t("قادم في سُفرة")}</p><p className="text-xs text-muted-foreground">{t("المدونات · الأكاديمية · استشارات الطهاة المباشرة")}</p></div>
            <ChevronLeft className="h-4 w-4 ltr:rotate-180" />
          </Link>
          <Link to="/" className="block text-center text-xs text-muted-foreground">{t("إعادة مشاهدة شاشات الترحيب")}</Link>
        </div>
      </div>
    </AppShell>
  );
}
