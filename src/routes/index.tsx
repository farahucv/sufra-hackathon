import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Check } from "lucide-react";
import kabsa from "@/assets/kabsa.jpg";
import { AppShell, Chip, DemoBadge } from "@/components/AppShell";
import { allergensList, dislikesList } from "@/lib/data";
import { toggleIn, useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "سُفرة — ابدأ تجربتك المخصصة" },
      { name: "description", content: "حدد حساسيتك والأطعمة التي لا تفضلها لتحصل على وصفات سعودية آمنة ومخصصة." },
      { property: "og:title", content: "سُفرة — ابدأ تجربتك المخصصة" },
      { property: "og:description", content: "وصفات سعودية آمنة ومخصصة لحساسيتك." },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const [step, setStep] = useState(0);
  const s = useStore();

  return (
    <AppShell nav={false}>
      {step === 0 ? (
        <div className="relative flex min-h-screen flex-col md:min-h-[860px]">
          <img src={kabsa} alt="كبسة" className="absolute inset-0 h-full w-full object-cover" width={768} height={1024} />
          <div className="absolute inset-0 scrim" />
          <div className="relative mt-auto space-y-5 p-7 text-ink-foreground">
            <DemoBadge />
            <h1 className="text-5xl leading-tight">سُفرة</h1>
            <p className="text-lg leading-relaxed opacity-90">ريلز طهاة سعوديين، وصفات تناسب حساسيتك، وأرخص سلة من السوبرماركت القريب.</p>
            <button onClick={() => setStep(1)} className="w-full rounded-2xl bg-gold py-4 font-semibold text-ink">ابدأ الآن</button>
            <Link to="/home" className="block text-center text-sm opacity-80">تخطّي إلى الرئيسية</Link>
          </div>
        </div>
      ) : (
        <div className="flex min-h-screen flex-col px-6 pb-8 pt-10 md:min-h-[860px]">
          <div className="mb-8 flex gap-2">
            {[1, 2].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />)}
          </div>
          {step === 1 ? (
            <>
              <ShieldCheck className="mb-4 h-10 w-10 text-olive" strokeWidth={1.5} />
              <h1 className="text-3xl">هل لديك حساسية؟</h1>
              <p className="mt-2 text-muted-foreground">سننبهك في كل وصفة ونقترح بدائل آمنة.</p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {allergensList.map((a) => {
                  const on = s.allergies.includes(a);
                  return (
                    <button key={a} onClick={() => toggleIn("allergies", a)}
                      className={`flex items-center justify-between rounded-2xl border p-4 text-right transition ${on ? "border-olive bg-accent text-accent-foreground" : "bg-card"}`}>
                      <span className="font-medium">{a}</span>
                      {on && <Check className="h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl">أطعمة لا تفضّلها</h1>
              <p className="mt-2 text-muted-foreground">لن نُكثر من الوصفات التي تحتويها.</p>
              <div className="mt-8 flex flex-wrap gap-2">
                {dislikesList.map((d) => <Chip key={d} active={s.dislikes.includes(d)} onClick={() => toggleIn("dislikes", d)}>{d}</Chip>)}
              </div>
              <div className="mt-8 rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">
                ملفك: {s.allergies.length ? s.allergies.join("، ") : "بدون حساسية"}
              </div>
            </>
          )}
          <div className="mt-auto flex gap-3 pt-8">
            <button onClick={() => setStep(step - 1)} className="rounded-2xl border px-6 py-4">رجوع</button>
            {step === 1
              ? <button onClick={() => setStep(2)} className="flex-1 rounded-2xl bg-primary py-4 font-semibold text-primary-foreground">التالي</button>
              : <Link to="/home" className="flex-1 rounded-2xl bg-primary py-4 text-center font-semibold text-primary-foreground">جهّز وصفاتي</Link>}
          </div>
        </div>
      )}
    </AppShell>
  );
}
