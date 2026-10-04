import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Sparkles, Loader2, CheckCircle2, Clipboard, AlertTriangle, Youtube, Music2 } from "lucide-react";
import { getRecipe, recipeAllergens, baseCost, sar } from "@/lib/data";
import { matchesAllergy } from "@/lib/store";
import { list, t } from "@/lib/i18n";

/** Shared presentational pieces of the Import screen (used by /import and /submission-visual). */
export const importSamples = [
  { icon: Music2, label: "TikTok", url: "https://www.tiktok.com/@chef.noura/video/7391022", id: "mutabbaq" },
  { icon: Youtube, label: "YouTube", url: "https://youtu.be/kabsa-najdi-2026", id: "kabsa" },
];
export const importStages = () => [t("تحليل الفيديو والإطارات"), t("تفريغ الصوت والنص"), t("استخراج المقادير والكميات"), t("ترتيب الخطوات"), t("فحص الحساسية وحساب التكلفة")];

export function ImportFormCard({ url, error, loading, onUrl, onSample, onRun, showNote = true }: {
  url: string; error?: boolean; loading?: boolean; onUrl?: (v: string) => void; onSample?: (u: string) => void; onRun?: () => void; showNote?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-soft">
      <label className="text-sm font-medium" htmlFor="url">{t("رابط الفيديو")}</label>
      <div className={`mt-2 flex items-center gap-2 rounded-2xl border bg-background px-3 transition ${error ? "border-terracotta" : "focus-within:border-olive"}`}>
        <Clipboard className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input id="url" dir="ltr" value={url} readOnly={!onUrl} placeholder="https://www.tiktok.com/@chef/video/…" onChange={(e) => onUrl?.(e.target.value)}
          className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" />
      </div>
      {error && <p className="mt-2 flex items-center gap-1 text-xs text-terracotta"><AlertTriangle className="h-3.5 w-3.5" /> {t("الرابط غير مدعوم. جرّب رابط تيك توك أو يوتيوب أو إنستغرام.")}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground">{t("جرّب مثالاً:")}</span>
        {importSamples.map(({ icon: I, label, url: u }) => (
          <button key={label} onClick={() => onSample?.(u)} className="press inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs"><I className="h-3.5 w-3.5" />{label}</button>
        ))}
      </div>
      <button onClick={onRun} disabled={loading || !url} className="press mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 font-semibold text-ink-foreground disabled:opacity-50">
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 text-gold" />}
        {t("استخرج الوصفة")}
      </button>
      {showNote && <p className="mt-3 text-center text-[11px] text-muted-foreground">{t("نموذج عرض: النتيجة محاكاة من وصفات تجريبية، وليست استخراجاً حياً من الفيديو.")}</p>}
    </div>
  );
}

export function ImportAnalysisState({ stage, skeleton = true }: { stage: number; skeleton?: boolean }) {
  const st = importStages();
  return (
    <div className="space-y-4 rounded-2xl bg-card p-5">
      <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-olive transition-[width] duration-200 ease-out" style={{ width: `${(stage / st.length) * 100}%` }} /></div>
      <ul className="space-y-2.5">
        {st.map((label, i) => (
          <li key={label} className={`flex items-center gap-3 text-sm transition ${i < stage ? "text-olive" : i === stage ? "text-foreground" : "text-muted-foreground/60"}`}>
            {i < stage ? <CheckCircle2 className="h-4 w-4" /> : i === stage ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="h-4 w-4 rounded-full border" />}
            {label}
          </li>
        ))}
      </ul>
      {skeleton && <div className="grid grid-cols-3 gap-2"><div className="skeleton h-16" /><div className="skeleton h-16" /><div className="skeleton h-16" /></div>}
    </div>
  );
}

export function ImportResultCard({ rid, allergies, actions, layout = "stack", imgEager }: {
  rid: string; allergies: string[]; actions?: ReactNode; layout?: "stack" | "wide"; imgEager?: boolean;
}) {
  const r = getRecipe(rid)!;
  const warn = recipeAllergens(r).filter((a) => matchesAllergy(a, allergies));
  const wide = layout === "wide";
  const ingredients = (
    <div>
      <p className="mb-2 text-sm font-semibold">{t("المقادير المستخرجة (")}{r.ingredients.length})</p>
      <div className="flex flex-wrap gap-2 text-xs">
        {r.ingredients.map((i) => <span key={i.key} className={`rounded-full px-3 py-1.5 ${i.allergen && matchesAllergy(i.allergen, allergies) ? "bg-terracotta-soft text-terracotta" : "bg-secondary"}`}>{t(i.key)} · {i.qty} {t(i.unit)}</span>)}
      </div>
    </div>
  );
  const steps = (
    <div>
      <p className="mb-2 text-sm font-semibold">{t("الخطوات")}</p>
      <ol className="space-y-1.5 text-sm">{r.steps.map((st, n) => <li key={n} className="flex gap-2"><span className="font-display text-primary">{n + 1}.</span>{t(st.t)}</li>)}</ol>
    </div>
  );
  const panels = (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className={`rounded-2xl p-3 text-sm ${warn.length ? "bg-terracotta-soft" : "bg-accent/50"}`}>
        <p className="font-semibold">{warn.length ? t("⚠ حساسية مكتشفة") : t("✓ لا حساسية من قائمتك")}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t("يحتوي:")} {list(recipeAllergens(r)) || "—"}</p>
        {r.ingredients.filter((i) => i.allergen && matchesAllergy(i.allergen, allergies)).map((i) => <p key={i.key} className="mt-1 text-xs">{t("بديل")} {t(i.key)}: <b className="text-olive">{i.subs?.[0]?.name}</b></p>)}
      </div>
      <div className="rounded-2xl bg-secondary p-3 text-sm">
        <p className="font-semibold">{t("التكلفة التقديرية")}</p>
        <p className="mt-1 font-display text-2xl text-primary">{sar(baseCost(r))}</p>
        <p className="text-[11px] text-muted-foreground">{t("بأسعار تجريبية")}</p>
      </div>
    </div>
  );
  return (
    <article className="animate-in fade-in duration-150 overflow-hidden rounded-2xl bg-card shadow-soft">
      <div className={`relative ${wide ? "h-56" : "h-48"}`}>
        <img src={r.img} alt={t(r.title)} className="h-full w-full object-cover" loading={imgEager ? "eager" : "lazy"} />
        <div className="absolute inset-0 scrim" />
        <span className="absolute start-3 top-3 flex items-center gap-1 rounded-full bg-olive px-3 py-1 text-xs text-olive-foreground"><CheckCircle2 className="h-3.5 w-3.5" /> {t("تم الاستخراج")}</span>
        <div className="absolute bottom-3 start-4 text-ink-foreground"><h2 className={wide ? "text-3xl" : "text-2xl"}>{t(r.title)}</h2><p className="text-xs opacity-80">{r.time} {t("دقيقة ·")} {r.servings} {t("حصص ·")} {t(r.difficulty)}</p></div>
      </div>
      {wide ? (
        <div className="grid grid-cols-2 gap-6 p-6">
          <div className="space-y-5">{ingredients}{panels}</div>
          <div className="space-y-5">{steps}{actions}</div>
        </div>
      ) : (
        <div className="space-y-5 p-5">{ingredients}{steps}{panels}{actions}</div>
      )}
    </article>
  );
}

export function ImportPrimaryAction({ rid }: { rid: string }) {
  return <Link to="/recipe/$id" params={{ id: rid }} className="press flex-1 rounded-2xl bg-primary py-3 text-center font-semibold text-primary-foreground">{t("خصّص وابدأ")}</Link>;
}
