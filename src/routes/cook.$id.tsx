import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { X, Timer, Lightbulb, PartyPopper, Pause, Play, RotateCcw } from "lucide-react";
import { getRecipe } from "@/lib/data";
import { buildBox, chefTips } from "@/lib/box";
import { setStore, useStore } from "@/lib/store";
import { toast } from "sonner";
import { t } from "@/lib/i18n";

export const Route = createFileRoute("/cook/$id")({
  loader: ({ params }) => { const r = getRecipe(params.id); if (!r) throw notFound(); return { id: r.id, title: r.title }; },
  head: ({ loaderData }) => {
    const t = loaderData ? `وضع الطبخ: ${loaderData.title} — سُفرة` : "وضع الطبخ — سُفرة";
    return { meta: [
      { title: t }, { name: "description", content: "طبخ خطوة بخطوة مع مؤقتات ونصائح الشيف ومقادير صندوقك." },
      { property: "og:title", content: t }, { property: "og:description", content: "وضع طبخ مركّز خطوة بخطوة." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ] };
  },
  component: Cook,
});

function Cook() {
  const { id } = Route.useLoaderData();
  const r = getRecipe(id)!;
  const s = useStore();
  const nav = useNavigate();
  const o = s.order?.recipeId === r.id ? s.order : null;
  const box = buildBox(r, o?.serv ?? r.servings, o?.subs ?? {});
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const [left, setLeft] = useState<number | null>(null);
  const [run, setRun] = useState(false);
  const step = r.steps[i]!;
  const tip = chefTips[r.id]?.[i];
  // ingredients mentioned in this step
  const used = box.lines.filter((l) => step.t.includes(l.key) || step.t.includes(l.name));

  useEffect(() => { setLeft(null); setRun(false); }, [i]);
  useEffect(() => {
    if (!run || left === null) return;
    if (left <= 0) { setRun(false); toast.success("انتهى المؤقت ⏰"); return; }
    const t = setTimeout(() => setLeft((x) => (x ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [run, left]);

  const startTimer = (min: number) => { setLeft(min * 60); setRun(true); };
  const mmss = (n: number) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink px-6 text-center text-ink-foreground">
        <PartyPopper className="h-14 w-14 text-gold" />
        <h1 className="mt-6 text-4xl">{t("تمت الوصفة!")}</h1>
        <p className="mt-2 max-w-xs opacity-80">{t("صحتين وعافية —")} {t(r.title)} {t("جاهزة على سفرتك.")}</p>
        <div className="mt-8 flex w-full max-w-xs flex-col gap-2">
          <button onClick={() => { toast.success("شكراً لتقييمك", { description: t("يصل تقييمك للشيف (تجريبي).") }); }} className="press rounded-xl bg-gold py-3.5 font-semibold text-ink">{t("قيّم الوصفة ★★★★★")}</button>
          {s.journey === 5 && (
            <button onClick={() => { setStore(() => ({ journey: 0 })); toast.success("اكتملت رحلة العرض", { description: t("من ريل إلى طبق جاهز على سفرتك.") }); nav({ to: "/home" }); }}
              className="press rounded-xl border border-ink-foreground/30 py-3.5">{t("إنهاء رحلة العرض ✓")}</button>
          )}
          <Link to="/home" className="press rounded-xl py-3 text-sm opacity-80">{t("العودة للرئيسية")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink text-ink-foreground">
      <header className="flex items-center gap-3 px-5 pt-[max(env(safe-area-inset-top),1.25rem)]">
        <button onClick={() => history.back()} aria-label={t("إغلاق")} className="press grid h-11 w-11 place-items-center rounded-full bg-ink-foreground/10"><X className="h-5 w-5" /></button>
        <div className="flex-1">
          <p className="text-xs opacity-70">{t("وضع الطبخ · Cook Mode")}{o ? ` · ${t("{n} حصص", { n: o.serv })}` : ""}</p>
          <p className="font-display text-lg">{t(r.title)}</p>
        </div>
        <span className="text-sm tabular-nums opacity-80">{i + 1}/{r.steps.length}</span>
      </header>
      <div className="mx-5 mt-4 flex gap-1">{r.steps.map((_, n) => <span key={n} className={`h-1.5 flex-1 rounded-full transition-colors ${n <= i ? "bg-gold" : "bg-ink-foreground/15"}`} />)}</div>

      <main key={i} className="animate-float-up mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center overflow-y-auto px-6 py-6">
        <p className="text-sm text-gold">{t("الخطوة")} {i + 1}</p>
        <p className="mt-3 font-display text-3xl leading-snug lg:text-5xl">{t(step.t)}</p>
        {used.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">{used.map((l) => <span key={l.key} className="rounded-full bg-ink-foreground/10 px-3 py-1.5 text-sm">{t(l.name)} · <b className="tabular-nums">{l.qty}</b></span>)}</div>
        )}
        {step.min && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {left === null ? (
              <>
                <button onClick={() => startTimer(step.min!)} className="press flex items-center gap-2 rounded-full bg-gold px-5 py-3 font-semibold text-ink"><Timer className="h-5 w-5" />{t("مؤقت")} {step.min} {t("د")}</button>
                {step.min > 5 && <button onClick={() => startTimer(5)} className="press rounded-full border border-ink-foreground/30 px-4 py-3 text-sm">{t("٥ د")}</button>}
              </>
            ) : (
              <div className="flex items-center gap-3 rounded-full bg-ink-foreground/10 py-2 pe-2 ps-5">
                <span className="font-display text-3xl tabular-nums">{mmss(left)}</span>
                <button onClick={() => setRun((x) => !x)} aria-label={run ? t("إيقاف") : t("تشغيل")} className="press grid h-11 w-11 place-items-center rounded-full bg-gold text-ink">{run ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}</button>
                <button onClick={() => setLeft(null)} aria-label={t("إعادة")} className="press grid h-11 w-11 place-items-center rounded-full bg-ink-foreground/10"><RotateCcw className="h-5 w-5" /></button>
              </div>
            )}
          </div>
        )}
        {tip && <p className="mt-6 flex gap-2 rounded-2xl bg-gold/15 p-4 text-sm leading-relaxed"><Lightbulb className="h-5 w-5 shrink-0 text-gold" /><span><b>{t("نصيحة الشيف:")}</b> {tip}</span></p>}
      </main>

      <footer className="mx-auto flex w-full max-w-2xl gap-3 px-5 pb-[max(env(safe-area-inset-bottom),1.25rem)]">
        <button disabled={i === 0} onClick={() => setI(i - 1)} className="press rounded-2xl border border-ink-foreground/20 px-6 py-5 text-lg disabled:opacity-30">{t("السابق")}</button>
        {i < r.steps.length - 1
          ? <button onClick={() => setI(i + 1)} className="press flex-1 rounded-2xl bg-gold py-5 text-lg font-semibold text-ink">{t("التالي")}</button>
          : <button onClick={() => setDone(true)} className="press flex-1 rounded-2xl bg-gold py-5 text-lg font-semibold text-ink">{t("تمت الوصفة ✓")}</button>}
      </footer>
    </div>
  );
}
