import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, Clipboard, AlertTriangle, Bookmark, RotateCcw, Youtube, Music2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, DemoBadge, TopBar } from "@/components/AppShell";
import { getRecipe, recipeAllergens, baseCost, sar } from "@/lib/data";
import { matchesAllergy, toggleIn, useStore } from "@/lib/store";
import { t } from "@/lib/i18n";

export const Route = createFileRoute("/import")({
  head: () => ({
    meta: [
      { title: "استيراد وصفة من تيك توك ويوتيوب — سُفرة" },
      { name: "description", content: "الصق رابط فيديو طبخ وشاهد استخراجاً تجريبياً للمقادير والخطوات والحساسية والتكلفة." },
      { property: "og:title", content: "استيراد وصفة — سُفرة" },
      { property: "og:description", content: "حوّل فيديو الطبخ إلى وصفة مكتوبة (عرض تجريبي)." },
    ],
  }),
  component: ImportPage,
});

const samples = [
  { icon: Music2, label: "TikTok", url: "https://www.tiktok.com/@chef.noura/video/7391022" , id: "mutabbaq" },
  { icon: Youtube, label: "YouTube", url: "https://youtu.be/kabsa-najdi-2026", id: "kabsa" },
];
const stages = [t("تحليل الفيديو والإطارات"), t("تفريغ الصوت والنص"), t("استخراج المقادير والكميات"), t("ترتيب الخطوات"), t("فحص الحساسية وحساب التكلفة")];

function ImportPage() {
  const s = useStore();
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [stage, setStage] = useState(0);
  const [rid, setRid] = useState("mutabbaq");

  const run = () => {
    if (!/^https?:\/\/(www\.)?(tiktok\.com|youtube\.com|youtu\.be|instagram\.com)\//i.test(url.trim())) { setPhase("error"); return; }
    setRid(/youtu/i.test(url) ? "kabsa" : "mutabbaq");
    setPhase("loading"); setStage(0);
    stages.forEach((_, i) => setTimeout(() => setStage(i + 1), 300 * (i + 1)));
    setTimeout(() => setPhase("done"), 300 * stages.length + 200);
  };

  const r = getRecipe(rid)!;
  const warn = recipeAllergens(r).filter((a) => matchesAllergy(a, s.allergies));

  return (
    <AppShell>
      <TopBar title={t("استيراد وصفة")} sub="TikTok · YouTube · Instagram" action={<DemoBadge label="Demo AI extraction" />} />
      <div className="space-y-5 px-5 lg:px-8">
        <div className="rounded-2xl bg-card p-5 shadow-soft">
          <label className="text-sm font-medium" htmlFor="url">{t("رابط الفيديو")}</label>
          <div className={`mt-2 flex items-center gap-2 rounded-2xl border bg-background px-3 transition ${phase === "error" ? "border-terracotta" : "focus-within:border-olive"}`}>
            <Clipboard className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input id="url" dir="ltr" value={url} placeholder="https://www.tiktok.com/@chef/video/…" onChange={(e) => { setUrl(e.target.value); if (phase === "error") setPhase("idle"); }}
              className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" />
          </div>
          {phase === "error" && <p className="mt-2 flex items-center gap-1 text-xs text-terracotta"><AlertTriangle className="h-3.5 w-3.5" /> {t("الرابط غير مدعوم. جرّب رابط تيك توك أو يوتيوب أو إنستغرام.")}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground">{t("جرّب مثالاً:")}</span>
            {samples.map(({ icon: I, label, url: u }) => (
              <button key={label} onClick={() => { setUrl(u); setPhase("idle"); }} className="press inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs"><I className="h-3.5 w-3.5" />{label}</button>
            ))}
          </div>
          <button onClick={run} disabled={phase === "loading" || !url} className="press mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 font-semibold text-ink-foreground disabled:opacity-50">
            {phase === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 text-gold" />}
            استخرج الوصفة
          </button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">{t("نموذج عرض: النتيجة محاكاة من وصفات تجريبية، وليست استخراجاً حياً من الفيديو.")}</p>
        </div>

        {phase === "loading" && (
          <div className="space-y-4 rounded-2xl bg-card p-5">
            <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-olive transition-all duration-300 ease-out" style={{ width: `${(stage / stages.length) * 100}%` }} /></div>
            <ul className="space-y-2.5">
              {stages.map((st, i) => (
                <li key={st} className={`flex items-center gap-3 text-sm transition ${i < stage ? "text-olive" : i === stage ? "text-foreground" : "text-muted-foreground/60"}`}>
                  {i < stage ? <CheckCircle2 className="h-4 w-4" /> : i === stage ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="h-4 w-4 rounded-full border" />}
                  {st}
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-3 gap-2"><div className="skeleton h-16" /><div className="skeleton h-16" /><div className="skeleton h-16" /></div>
          </div>
        )}

        {phase === "done" && (
          <article className="animate-float-up overflow-hidden rounded-2xl bg-card shadow-soft">
            <div className="relative h-48">
              <img src={r.img} alt={r.title} className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 scrim" />
              <span className="absolute start-3 top-3 flex items-center gap-1 rounded-full bg-olive px-3 py-1 text-xs text-olive-foreground"><CheckCircle2 className="h-3.5 w-3.5" /> {t("تم الاستخراج")}</span>
              <div className="absolute bottom-3 start-4 text-ink-foreground"><h2 className="text-2xl">{r.title}</h2><p className="text-xs opacity-80">{r.time} {t("دقيقة ·")} {r.servings} {t("حصص ·")} {r.difficulty}</p></div>
            </div>
            <div className="space-y-5 p-5">
              <div>
                <p className="mb-2 text-sm font-semibold">{t("المقادير المستخرجة (")}{r.ingredients.length})</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {r.ingredients.map((i) => <span key={i.key} className={`rounded-full px-3 py-1.5 ${i.allergen && matchesAllergy(i.allergen, s.allergies) ? "bg-terracotta-soft text-terracotta" : "bg-secondary"}`}>{i.key} · {i.qty} {i.unit}</span>)}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold">{t("الخطوات")}</p>
                <ol className="space-y-1.5 text-sm">{r.steps.map((st, n) => <li key={n} className="flex gap-2"><span className="font-display text-primary">{n + 1}.</span>{st.t}</li>)}</ol>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className={`rounded-2xl p-3 text-sm ${warn.length ? "bg-terracotta-soft" : "bg-accent/50"}`}>
                  <p className="font-semibold">{warn.length ? t("⚠ حساسية مكتشفة") : t("✓ لا حساسية من قائمتك")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t("يحتوي:")} {recipeAllergens(r).join("، ") || "—"}</p>
                  {r.ingredients.filter((i) => i.allergen && matchesAllergy(i.allergen, s.allergies)).map((i) => <p key={i.key} className="mt-1 text-xs">{t("بديل")} {i.key}: <b className="text-olive">{i.subs?.[0]?.name}</b></p>)}
                </div>
                <div className="rounded-2xl bg-secondary p-3 text-sm">
                  <p className="font-semibold">{t("التكلفة التقديرية")}</p>
                  <p className="mt-1 font-display text-2xl text-primary">{sar(baseCost(r))}</p>
                  <p className="text-[11px] text-muted-foreground">{t("بأسعار تجريبية")}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to="/recipe/$id" params={{ id: r.id }} className="press flex-1 rounded-2xl bg-primary py-3 text-center font-semibold text-primary-foreground">{t("خصّص وابدأ")}</Link>
                <button onClick={() => { if (!s.saved.includes(r.id)) toggleIn("saved", r.id); toast.success("حُفظت في وصفاتك"); }} className="press grid w-12 place-items-center rounded-2xl border" aria-label={t("حفظ")}><Bookmark className="h-5 w-5" /></button>
                <button onClick={() => { setPhase("idle"); setUrl(""); }} className="press grid w-12 place-items-center rounded-2xl border" aria-label={t("استيراد آخر")}><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>
          </article>
        )}
      </div>
    </AppShell>
  );
}
