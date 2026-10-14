import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Sparkles, Loader2, CheckCircle2, Clipboard, AlertTriangle, Youtube, Minus, Plus } from "lucide-react";
import { MAX_SERVINGS, MIN_SERVINGS, clampServings, scaledAmount } from "@/lib/box";
import { NutritionPanel } from "@/components/Nutrition";
import { getRecipe, recipeAllergens, baseCost, safeSubs, sar } from "@/lib/data";
import { importSourceUrl, isImportedId } from "@/lib/import";
import { backupList } from "@/lib/import-backups";
import { isHydrated, matchesAllergy } from "@/lib/store";
import { list, t } from "@/lib/i18n";

/** Shared presentational pieces of the Import screen (used by /import and /submission-visual). */
/** Demo video order on the Import screen (video ids); backups not listed here follow at the end. */
const SAMPLE_ORDER = ["wHonhtAaXos", "BO4rJBMBS-M", "ElhIU-i2FJs", "4y-7nf1-yFE"];
const rank = (id: string) => { const i = SAMPLE_ORDER.indexOf(id); return i < 0 ? SAMPLE_ORDER.length : i; };

/** Sample buttons = the demo videos that have a bundled backup (src/data/imports). */
export const importSamples = backupList().sort((a, b) => rank(a.source.videoId) - rank(b.source.videoId)).map((b) => ({ videoId: b.source.videoId, url: `https://youtu.be/${b.source.videoId}`, title: b.recipe.title, img: b.recipe.img }));
export const importStages = () => [t("تحليل الفيديو والإطارات"), t("تفريغ الصوت والنص"), t("استخراج المقادير والكميات"), t("ترتيب الخطوات"), t("فحص الحساسية وحساب التكلفة")];

export function ImportFormCard({ url, error, errorMsg, loading, onUrl, onSample, onRun, showNote = true, showRun = true }: {
  url: string; error?: boolean; errorMsg?: string | undefined; loading?: boolean; onUrl?: (v: string) => void; onSample?: (u: string) => void; onRun?: () => void; showNote?: boolean; showRun?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-soft">
      <label className="text-sm font-medium" htmlFor="url">{t("رابط الفيديو")}</label>
      <div className={`mt-2 flex items-center gap-2 rounded-2xl border bg-background px-3 transition ${error ? "border-terracotta" : "focus-within:border-olive"}`}>
        <Clipboard className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input id="url" dir="ltr" value={url} readOnly={!onUrl} placeholder="https://youtu.be/…" onChange={(e) => onUrl?.(e.target.value)}
          className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" />
      </div>
      {error && <p className="mt-2 flex items-center gap-1 text-xs text-terracotta"><AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {errorMsg ?? t("الرابط غير مدعوم. الصق رابط فيديو من يوتيوب.")}</p>}
      <p className="mt-4 text-xs text-muted-foreground">{t("جرّب مثالاً:")}</p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {importSamples.map((x) => (
          <button key={x.videoId} onClick={() => onSample?.(x.url)} aria-pressed={url === x.url}
            className={`press overflow-hidden rounded-xl border text-start transition ${url === x.url ? "border-olive ring-1 ring-olive" : "hover:bg-muted"}`}>
            <span className="relative block aspect-video bg-muted">
              <img src={x.img} alt="" className="h-full w-full object-cover" loading="lazy" />
              <Youtube className="absolute bottom-1 end-1 h-4 w-4 text-white drop-shadow" />
            </span>
            <span className="block truncate px-2 py-1.5 text-xs font-medium">{t(x.title)}</span>
          </button>
        ))}
      </div>
      {showRun && <button onClick={onRun} disabled={loading || !url} className="press mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 font-semibold text-ink-foreground disabled:opacity-50">
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 text-gold" />}
        {t("استخرج الوصفة")}
      </button>}
      {showNote && <p className="mt-3 text-center text-[11px] text-muted-foreground">{t("حالياً ندعم روابط يوتيوب، تيك توك قريباً")}</p>}
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

export function ImportResultCard({ rid, allergies, actions, layout = "stack", imgEager, showCost = true, serv: servProp, onServ }: {
  rid: string; allergies: string[]; actions?: ReactNode; layout?: "stack" | "wide"; imgEager?: boolean; showCost?: boolean;
  /** Optional servings stepper; amounts scale when set. */
  serv?: number | undefined; onServ?: ((n: number) => void) | undefined;
}) {
  const r = getRecipe(rid)!;
  const warn = recipeAllergens(r).filter((a) => matchesAllergy(a, allergies));
  const wide = layout === "wide";
  const serv = servProp ?? r.servings;
  const ingredients = (
    <div>
      {onServ && (
        <div className="mb-3 flex items-center justify-between rounded-xl bg-secondary px-3 py-2">
          <span className="text-sm font-medium">{t("لكم شخص؟")}</span>
          <span className="flex items-center gap-3">
            <button aria-label={t("إنقاص")} disabled={serv <= MIN_SERVINGS} onClick={() => onServ(clampServings(serv - 1))} className="press grid h-8 w-8 place-items-center rounded-full bg-card disabled:opacity-40"><Minus className="h-4 w-4" /></button>
            <span className="w-5 text-center font-semibold tabular-nums">{serv}</span>
            <button aria-label={t("زيادة")} disabled={serv >= MAX_SERVINGS} onClick={() => onServ(clampServings(serv + 1))} className="press grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"><Plus className="h-4 w-4" /></button>
          </span>
        </div>
      )}
      <p className="mb-2 text-sm font-semibold">{t("المقادير المستخرجة (")}{r.ingredients.length})</p>
      <div className="flex flex-wrap gap-2 text-xs">
        {r.ingredients.map((i) => <span key={i.key} className={`rounded-full px-3 py-1.5 ${i.allergen && matchesAllergy(i.allergen, allergies) ? "bg-terracotta-soft text-terracotta" : "bg-secondary"}`}>{t(i.key)} · {scaledAmount(i.qty, i.unit, serv, r.servings)}</span>)}
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
    <div className={`grid gap-3 ${showCost ? "sm:grid-cols-2" : ""}`}>
      <div className={showCost ? "sm:col-span-2" : ""}><NutritionPanel r={r} serv={onServ ? serv : undefined} compact /></div>
      <div className={`rounded-2xl p-3 text-sm ${warn.length ? "bg-terracotta-soft" : "bg-accent/50"}`}>
        <p className="font-semibold">{warn.length ? t("⚠ حساسية مكتشفة") : t("✓ لا حساسية من قائمتك")}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t("يحتوي:")} {list(recipeAllergens(r)) || "—"}</p>
        {r.ingredients.filter((i) => i.allergen && matchesAllergy(i.allergen, allergies)).map((i) => <p key={i.key} className="mt-1 text-xs">{t("بديل")} {t(i.key)}: {(() => { const first = safeSubs(i, allergies)[0]; return first ? <b className="text-olive">{t(first.sub.name)}</b> : <span className="text-terracotta">{t("لا يوجد بديل آمن لملفك الغذائي")}</span>; })()}</p>)}
      </div>
      {showCost && <div className="rounded-2xl bg-secondary p-3 text-sm">
        <p className="font-semibold">{t("التكلفة التقديرية")}</p>
        <p className="mt-1 font-display text-2xl text-primary">{sar(baseCost(r))}</p>
        <p className="text-[11px] text-muted-foreground">{t("بأسعار تجريبية")}</p>
      </div>}
    </div>
  );
  return (
    <article className="animate-in fade-in duration-150 overflow-hidden rounded-2xl bg-card shadow-soft">
      <div className={`relative ${wide ? "h-52" : "h-48"}`}>
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
      {isImportedId(rid) && <div className={wide ? "px-6 pb-6" : "px-5 pb-5"}><ImportedNote /></div>}
    </article>
  );
}

/** Shown wherever an AI-imported recipe is displayed. */
export function ImportedNote() {
  return <p className="flex items-center gap-1.5 rounded-xl bg-gold/15 px-3 py-2 text-xs"><Sparkles className="h-3.5 w-3.5 shrink-0 text-gold" />{t("مستخرجة بالذكاء الاصطناعي، راجع المقادير")}</p>;
}

/** Source row shown instead of the chef on imported recipes. */
export function ImportedSource({ id }: { id: string }) {
  const href = importSourceUrl(id);
  return (
    <div className="space-y-3">
      {href && <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-terracotta-soft text-terracotta"><Youtube className="h-5 w-5" /></span>
        <span className="flex-1"><span className="block font-semibold">{t("وصفة مستوردة من يوتيوب")}</span><span className="block text-xs text-muted-foreground">{t("شاهد الفيديو الأصلي")}</span></span>
      </a>}
      <ImportedNote />
    </div>
  );
}

/** For "imp-*" pages whose recipe isn't registered yet: loading until local state hydrates, then not found. */
export function ImportedRecipeFallback() {
  return (
    <div className="grid min-h-screen place-items-center p-8 text-center">
      {isHydrated() ? (
        <div><p className="font-display text-2xl">{t("الوصفة غير موجودة")}</p><Link to="/import" className="mt-4 inline-block rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground">{t("استيراد وصفة")}</Link></div>
      ) : <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label={t("جارٍ تحميل الوصفة…")} />}
    </div>
  );
}

export function ImportPrimaryAction({ rid, servings }: { rid: string; servings?: number | undefined }) {
  return <Link to="/recipe/$id" params={{ id: rid }} search={{ servings }} className="press flex-1 rounded-2xl bg-primary py-3 text-center font-semibold text-primary-foreground">{t("خصّص وابدأ")}</Link>;
}
