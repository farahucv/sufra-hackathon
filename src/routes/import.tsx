import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Bookmark, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { AppShell, DemoBadge, TopBar } from "@/components/AppShell";
import { ImportAnalysisState, ImportFormCard, ImportPrimaryAction, ImportResultCard, importStages } from "@/components/ImportParts";
import { extractRecipe } from "@/lib/import.functions";
import { backupFor } from "@/lib/import-backups";
import { addImported, toggleIn, useStore } from "@/lib/store";
import { parseYouTubeId } from "@/lib/youtube";
import { t } from "@/lib/i18n";

export const Route = createFileRoute("/import")({
  head: () => ({
    meta: [
      { title: "استيراد وصفة من يوتيوب — سُفرة" },
      { name: "description", content: "الصق رابط فيديو طبخ من يوتيوب واستخرج المقادير والخطوات والحساسية والتكلفة بالذكاء الاصطناعي." },
      { property: "og:title", content: "استيراد وصفة — سُفرة" },
      { property: "og:description", content: "حوّل فيديو الطبخ إلى وصفة مكتوبة بالذكاء الاصطناعي." },
    ],
  }),
  component: ImportPage,
});

// Live extraction takes ~15s: stages advance on this schedule and the last one spins until the response arrives.
const LIVE_STAGE_AT = [1200, 3500, 7000, 11000];
const CLIENT_TIMEOUT_MS = 60_000;
/** Demo videos with a bundled backup don't keep the audience waiting: after this, show the saved copy. */
const BACKUP_TIMEOUT_MS = 25_000;

const errorText = (code: string) => {
  switch (code) {
    case "NOT_A_RECIPE": return t("هذا الفيديو لا يبدو وصفة طبخ.");
    case "VIDEO_UNAVAILABLE": return t("الفيديو غير متاح (خاص أو محذوف).");
    case "TIMEOUT": return t("استغرق الاستخراج وقتاً طويلاً. حاول مرة أخرى.");
    case "NOT_CONFIGURED": return t("الاستخراج غير مُعدّ على الخادم.");
    default: return t("تعذّر استخراج الوصفة. حاول مرة أخرى.");
  }
};

function ImportPage() {
  const s = useStore();
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>();
  const [stage, setStage] = useState(0);
  const [rid, setRid] = useState("mutabbaq");
  const [serv, setServ] = useState<number>(); // undefined = the recipe's own servings
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const request = useRef(0); // bumping it makes in-flight responses stale
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => () => { clear(); request.current++; }, []);

  const finish = (id: string) => { clear(); setStage(importStages().length); setRid(id); setServ(undefined); setPhase("done"); };
  const fail = (msg?: string) => { clear(); setErrorMsg(msg); setPhase("error"); };
  const reset = () => { clear(); request.current++; setPhase("idle"); setErrorMsg(undefined); };

  const live = async (videoId: string, link: string) => {
    const mine = ++request.current;
    const backup = backupFor(videoId);
    const limit = backup ? BACKUP_TIMEOUT_MS : CLIENT_TIMEOUT_MS;
    timers.current = LIVE_STAGE_AT.map((ms, i) => setTimeout(() => setStage(i + 1), ms));
    let code = "GEMINI_FAILED";
    try {
      const x = await Promise.race([
        extractRecipe({ data: { url: link } }),
        new Promise<never>((_, reject) => { timers.current.push(setTimeout(() => reject(new Error("TIMEOUT")), limit)); }),
      ]);
      if (mine !== request.current) return;
      addImported(x);
      finish(x.recipe.id);
      return;
    } catch (e) {
      if (mine !== request.current) return;
      if (e instanceof Error && e.message) code = e.message;
      console.warn("[import] live extraction failed:", code);
    }
    if (!backup) return fail(errorText(code));
    addImported(backup);
    finish(backup.recipe.id);
    toast(t("عرضنا نسخة محفوظة من هذه الوصفة"), { description: t("تعذّر الاستخراج المباشر الآن.") });
  };

  const run = () => {
    if (phase === "loading") return;
    const link = url.trim();
    const videoId = parseYouTubeId(link);
    if (!videoId) return fail(/^https?:\/\/([\w-]+\.)?(tiktok\.com|instagram\.com)\//i.test(link) ? t("حالياً ندعم روابط يوتيوب، تيك توك قريباً") : undefined);
    clear(); setErrorMsg(undefined); setPhase("loading"); setStage(0);
    void live(videoId, link);
  };

  return (
    <AppShell>
      <TopBar title={t("استيراد وصفة")} sub="YouTube" action={<DemoBadge label={t("استخراج بالذكاء الاصطناعي")} />} />
      <div className="space-y-5 px-5 lg:px-8">
        <ImportFormCard url={url} error={phase === "error"} errorMsg={errorMsg} loading={phase === "loading"}
          onUrl={(v) => { setUrl(v); if (phase === "error") reset(); }}
          onSample={(u) => { setUrl(u); reset(); }} onRun={run} />
        {phase === "loading" && <ImportAnalysisState stage={stage} />}
        {phase === "done" && (
          <ImportResultCard rid={rid} allergies={s.allergies} serv={serv} onServ={setServ} actions={
            <div className="flex gap-2">
              <ImportPrimaryAction rid={rid} servings={serv} />
              <button onClick={() => { if (!s.saved.includes(rid)) toggleIn("saved", rid); toast.success(t("حُفظت في وصفاتك")); }} className="press grid w-12 place-items-center rounded-2xl border" aria-label={t("حفظ")}><Bookmark className="h-5 w-5" /></button>
              <button onClick={() => { reset(); setUrl(""); }} className="press grid w-12 place-items-center rounded-2xl border" aria-label={t("استيراد آخر")}><RotateCcw className="h-5 w-5" /></button>
            </div>
          } />
        )}
      </div>
    </AppShell>
  );
}
