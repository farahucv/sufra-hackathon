import { Link } from "@tanstack/react-router";
import { Sparkles, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { setStore, useStore } from "@/lib/store";
import { t } from "@/lib/i18n";

export const journeySteps = () => [
  { n: 1, title: t("اكتشف وصفة"), insight: t("ريلز قصيرة من طهاة سعوديين تتحول فوراً إلى وصفة قابلة للتنفيذ — لا مزيد من البحث المشتت.") },
  { n: 2, title: t("خصّصها لحساسيتك"), insight: t("نكشف مسببات الحساسية تلقائياً ونقترح بدائل آمنة مع سبب كل بديل وأثره على الطعم والسعرات.") },
  { n: 3, title: t("اطلب صندوق الوصفة"), insight: t("من الإلهام إلى المائدة: وصفة مخصصة، مكونات مجهزة، وتوصيل في تجربة واحدة.") },
  { n: 4, title: t("التوصيل"), insight: t("مكونات مقسّمة بالحصة من موردين محليين — صفر هدر، صفر مشاوير.") },
  { n: 5, title: t("اطبخ خطوة بخطوة"), insight: t("وضع طبخ مركّز بخطوة واحدة ومؤقتات ونصائح الشيف — يصل الصندوق وتبدأ فوراً.") },
] as const;

const next = {
  1: { to: "/recipe/$id", params: { id: "kabsa" } },
  2: { to: "/box/$id", params: { id: "kabsa" } },
  3: { to: "/checkout" },
  4: { to: "/order" },
} as const;

export function startJourney() { setStore(() => ({ journey: 1, allergies: [t("مكسرات")] })); }

/** Inline, dismissible callout — never a modal. Renders only during the matching journey step. */
export function JourneyCallout({ step, hideNext }: { step: 1 | 2 | 3 | 4 | 5; hideNext?: boolean }) {
  const s = useStore();
  if (s.journey !== step) return null;
  const j = journeySteps()[step - 1]!;
  const last = step === journeySteps().length;
  const go = () => setStore(() => ({ journey: step + 1 }));
  return (
    <aside className="animate-float-up mx-5 my-4 rounded-2xl border-s-4 border-olive bg-card p-4 shadow-soft lg:mx-8" aria-label={t("رحلة العرض")}>
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-olive text-xs font-bold text-olive-foreground">{step}</span>
        <p className="flex-1 text-sm font-semibold text-accent-foreground">{t("رحلة العرض ·")} {j.title}</p>
        <div className="flex gap-1">{journeySteps().map((x) => <span key={x.n} className={`h-1.5 w-3.5 rounded-full ${x.n <= step ? "bg-olive" : "bg-olive/20"}`} />)}</div>
        <button onClick={() => setStore(() => ({ journey: 0 }))} aria-label={t("إنهاء الرحلة")} className="text-muted-foreground"><X className="h-4 w-4" /></button>
      </div>
      <p className="mt-2 flex gap-2 text-sm leading-relaxed"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{j.insight}</p>
      {!hideNext && (
        <div className="mt-3 flex justify-end">
          {!last ? (
            <Link {...next[step as 1 | 2 | 3 | 4]} onClick={go} className="press inline-flex items-center gap-1 rounded-full bg-olive px-4 py-2 text-xs font-semibold text-olive-foreground">
              الخطوة التالية <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <button onClick={() => { setStore(() => ({ journey: 0 })); toast.success("اكتملت رحلة العرض", { description: t("من ريل إلى طبق جاهز على سفرتك.") }); }}
              className="press rounded-full bg-olive px-4 py-2 text-xs font-semibold text-olive-foreground">{t("إنهاء الرحلة ✓")}</button>
          )}
        </div>
      )}
    </aside>
  );
}
