import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Minus, Plus, PlayCircle, ShieldCheck, ShoppingBasket } from "lucide-react";
import kabsa from "@/assets/kabsa.jpg";
import haneeth from "@/assets/haneeth.jpg";
import veggie from "@/assets/veggie.jpg";
import { Chip, DemoBadge, Wordmark } from "@/components/AppShell";
import { allergensList, diets, dislikesList } from "@/lib/data";
import { setStore, toggleIn, useStore } from "@/lib/store";
import { list, t } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "سُفرة — منصة الطبخ السعودي الذكية" },
      { name: "description", content: "ريلز طهاة سعوديين، وصفات تتكيف مع حساسيتك، اقتراحات من مخزنك، ومقارنة أسعار السوبرماركت المحلية." },
      { property: "og:title", content: "سُفرة — منصة الطبخ السعودي الذكية" },
      { property: "og:description", content: "من ريل إلى سلة مشتريات مخصصة لحساسيتك وميزانيتك." },
    ],
  }),
  component: Onboarding,
});

const slides = () => [
  { img: kabsa, icon: PlayCircle, title: t("اكتشف من طهاة سعوديين"), body: t("ريلز قصيرة تتحول إلى وصفات واضحة بالمقادير والخطوات.") },
  { img: veggie, icon: ShieldCheck, title: t("وصفات تناسب جسمك"), body: t("نكشف الحساسية تلقائياً ونقترح بدائل آمنة بذكاء.") },
  { img: haneeth, icon: ShoppingBasket, title: t("اطبخ بالموجود… واشترِ الأوفر"), body: t("نقترح من مخزنك ونقارن أسعار الناقص بين المتاجر.") },
];

function Onboarding() {
  const [phase, setPhase] = useState<"splash" | "slides()" | "prefs">("splash");
  const [slide, setSlide] = useState(0);
  const [step, setStep] = useState(0);
  const s = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (phase !== "splash") return;
    const t = setTimeout(() => setPhase("slides()"), 1800);
    return () => clearTimeout(t);
  }, [phase]);

  const finish = () => { setStore(() => ({ onboarded: true })); navigate({ to: "/home" }); };

  if (phase === "splash") {
    return (
      <button onClick={() => setPhase("slides()")} className="star-pattern relative grid min-h-screen w-full place-items-center bg-ink">
        <div className="animate-float-up text-center">
          <Wordmark size="lg" tone="light" />
          <p className="mt-5 text-sm text-ink-foreground/70">{t("منصة الطبخ السعودي الذكية")}</p>
          <div className="mx-auto mt-8 h-0.5 w-24 overflow-hidden rounded-full bg-ink-foreground/15">
            <div className="h-full w-1/2 animate-[shimmer_1.2s_linear_infinite] bg-gold" style={{ backgroundImage: "linear-gradient(90deg, transparent, var(--gold), transparent)", backgroundSize: "200% 100%" }} />
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      {/* Visual panel (desktop) */}
      <div className="relative hidden lg:block">
        <img src={slides()[phase === "slides()" ? slide : 2]!.img} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 scrim" />
        <div className="absolute bottom-12 start-12 max-w-md text-ink-foreground">
          <Wordmark size="md" tone="light" />
          <p className="mt-4 text-2xl leading-relaxed">{t("من ريل على جوالك… إلى سفرة آمنة وبميزانية تناسبك.")}</p>
        </div>
      </div>

      {phase === "slides()" ? (
        <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col lg:justify-center">
          <div className="relative h-[58vh] overflow-hidden rounded-b-[2.5rem] lg:hidden">
            <img key={slide} src={slides()[slide]!.img} alt="" className="animate-in fade-in h-full w-full object-cover duration-500" />
            <div className="absolute inset-0 scrim" />
            <div className="absolute start-5 top-6"><Wordmark size="sm" tone="light" /></div>
          </div>
          <button onClick={finish} className="absolute end-5 top-7 rounded-full bg-card/80 px-4 py-1.5 text-xs lg:top-10">{t("تخطَّ")}</button>
          <div key={slide} className="animate-float-up flex-1 px-7 pt-8 lg:flex-none">
            {(() => { const I = slides()[slide]!.icon; return <I className="h-9 w-9 text-olive" strokeWidth={1.5} />; })()}
            <h1 className="mt-4 text-3xl leading-snug lg:text-4xl">{slides()[slide]!.title}</h1>
            <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{slides()[slide]!.body}</p>
          </div>
          <div className="flex items-center justify-between px-7 pb-10 pt-8">
            <div className="flex gap-1.5">{slides().map((_, i) => <span key={i} className={`h-2 rounded-full transition-all ${i === slide ? "w-7 bg-primary" : "w-2 bg-muted-foreground/25"}`} />)}</div>
            <button onClick={() => (slide < 2 ? setSlide(slide + 1) : setPhase("prefs"))} className="press rounded-2xl bg-primary px-8 py-3.5 font-semibold text-primary-foreground">
              {slide < 2 ? t("التالي") : t("خصّص تجربتي")}
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-8 pt-8 lg:justify-center">
          <div className="flex items-center justify-between">
            <Wordmark size="sm" />
            <button onClick={finish} className="text-sm text-muted-foreground">{t("تخطَّ واحفظ كملف تجريبي")}</button>
          </div>
          <div className="mb-8 mt-6 flex gap-2">
            {[0, 1, 2].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full transition ${i <= step ? "bg-primary" : "bg-muted"}`} />)}
          </div>

          <div key={step} className="animate-float-up flex-1 lg:flex-none">
            {step === 0 && (
              <>
                <h1 className="text-3xl">{t("نمط أكلك")}</h1>
                <p className="mt-2 text-muted-foreground">{t("نرتّب الريلز والوصفات على ذوقك.")}</p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {diets.map((d) => (
                    <button key={d.id} onClick={() => setStore(() => ({ diet: d.id }))}
                      className={`press rounded-2xl border p-4 text-start ${s.diet === d.id ? "border-primary bg-secondary" : "bg-card"}`}>
                      <p className="font-medium">{t(d.ar)}</p>{!isEn() && <p className="text-[11px] text-muted-foreground">{d.en}</p>}
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between rounded-2xl bg-card p-4 shadow-soft">
                  <div><p className="font-medium">{t("عدد أفراد البيت")}</p><p className="text-xs text-muted-foreground">{t("نضبط الحصص والكميات تلقائياً")}</p></div>
                  <div className="flex items-center gap-3">
                    <button aria-label={t("إنقاص")} onClick={() => setStore((x) => ({ household: Math.max(1, x.household - 1) }))} className="press grid h-9 w-9 place-items-center rounded-full bg-muted"><Minus className="h-4 w-4" /></button>
                    <span className="w-5 text-center text-lg font-semibold">{s.household}</span>
                    <button aria-label={t("زيادة")} onClick={() => setStore((x) => ({ household: Math.min(12, x.household + 1) }))} className="press grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground"><Plus className="h-4 w-4" /></button>
                  </div>
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <h1 className="text-3xl">{t("هل لديك حساسية؟")}</h1>
                <p className="mt-2 text-muted-foreground">{t("سننبهك في كل وصفة ونقترح بدائل آمنة.")}</p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {allergensList.map((a) => {
                    const on = s.allergies.includes(a);
                    return (
                      <button key={a} onClick={() => toggleIn("allergies", a)} aria-pressed={on}
                        className={`press flex items-center justify-between rounded-2xl border p-4 text-start ${on ? "border-terracotta bg-terracotta-soft" : "bg-card"}`}>
                        <span className="font-medium">{t(a)}</span>
                        <span className={`grid h-5 w-5 place-items-center rounded-full border ${on ? "border-terracotta bg-terracotta text-primary-foreground" : ""}`}>{on && <Check className="h-3 w-3" />}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h1 className="text-3xl">{t("مكونات لا تحبها")}</h1>
                <p className="mt-2 text-muted-foreground">{t("نقلل ظهورها في اقتراحاتك.")}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {dislikesList.map((d) => <Chip key={d} active={s.dislikes.includes(d)} onClick={() => toggleIn("dislikes", d)}>{t(d)}</Chip>)}
                </div>
                <div className="mt-8 space-y-1 rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">
                  <p className="font-semibold">{t("ملفك الغذائي")}</p>
                  <p>{t("النمط:")} {diets.find((d) => d.id === s.diet)?.ar} · {s.household} {t("أفراد")}</p>
                  <p>{t("الحساسية:")} {s.allergies.length ? list(s.allergies) : t("لا يوجد")}</p>
                  <div className="pt-2"><DemoBadge label={t("يُحفظ كملف تجريبي بدون تسجيل")} /></div>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 pt-8">
            {step > 0 && <button onClick={() => setStep(step - 1)} className="press rounded-2xl border px-6 py-4">{t("رجوع")}</button>}
            {step < 2
              ? <button onClick={() => setStep(step + 1)} className="press flex-1 rounded-2xl bg-primary py-4 font-semibold text-primary-foreground">{t("التالي")}</button>
              : <button onClick={finish} className="press flex-1 rounded-2xl bg-primary py-4 font-semibold text-primary-foreground">{t("جهّز سُفرتي")}</button>}
          </div>
          {s.onboarded && <Link to="/home" className="mt-4 block text-center text-xs text-muted-foreground">{t("لديك ملف محفوظ — ادخل مباشرة")}</Link>}
        </div>
      )}
    </div>
  );
}
