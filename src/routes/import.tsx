import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Bookmark, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { AppShell, DemoBadge, TopBar } from "@/components/AppShell";
import { ImportAnalysisState, ImportFormCard, ImportPrimaryAction, ImportResultCard, importStages } from "@/components/ImportParts";
import { toggleIn, useStore } from "@/lib/store";
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

function ImportPage() {
  const s = useStore();
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [stage, setStage] = useState(0);
  const [rid, setRid] = useState("mutabbaq");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const run = () => {
    if (!/^https?:\/\/(www\.)?(tiktok\.com|youtube\.com|youtu\.be|instagram\.com)\//i.test(url.trim())) { setPhase("error"); return; }
    setRid(/youtu/i.test(url) ? "kabsa" : "mutabbaq");
    if (phase === "loading") return;
    setPhase("loading"); setStage(0);
    timers.current.forEach(clearTimeout);
    const n = importStages().length;
    timers.current = [
      ...Array.from({ length: n }, (_, i) => setTimeout(() => setStage(i + 1), 230 * (i + 1))),
      setTimeout(() => setPhase("done"), 230 * n + 120),
    ];
  };

  return (
    <AppShell>
      <TopBar title={t("استيراد وصفة")} sub="TikTok · YouTube · Instagram" action={<DemoBadge label={t("استخراج تجريبي")} />} />
      <div className="space-y-5 px-5 lg:px-8">
        <ImportFormCard url={url} error={phase === "error"} loading={phase === "loading"}
          onUrl={(v) => { setUrl(v); if (phase === "error") setPhase("idle"); }}
          onSample={(u) => { setUrl(u); setPhase("idle"); }} onRun={run} />
        {phase === "loading" && <ImportAnalysisState stage={stage} />}
        {phase === "done" && (
          <ImportResultCard rid={rid} allergies={s.allergies} actions={
            <div className="flex gap-2">
              <ImportPrimaryAction rid={rid} />
              <button onClick={() => { if (!s.saved.includes(rid)) toggleIn("saved", rid); toast.success(t("حُفظت في وصفاتك")); }} className="press grid w-12 place-items-center rounded-2xl border" aria-label={t("حفظ")}><Bookmark className="h-5 w-5" /></button>
              <button onClick={() => { setPhase("idle"); setUrl(""); }} className="press grid w-12 place-items-center rounded-2xl border" aria-label={t("استيراد آخر")}><RotateCcw className="h-5 w-5" /></button>
            </div>
          } />
        )}
      </div>
    </AppShell>
  );
}
