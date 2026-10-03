import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, Clipboard } from "lucide-react";
import { AppShell, DemoBadge, TopBar } from "@/components/AppShell";
import mutabbaq from "@/assets/mutabbaq.jpg";

export const Route = createFileRoute("/import")({
  head: () => ({
    meta: [
      { title: "استيراد وصفة من تيك توك ويوتيوب — سُفرة" },
      { name: "description", content: "الصق رابط فيديو وصفة ودع الذكاء الاصطناعي يستخرج المقادير والخطوات." },
      { property: "og:title", content: "استيراد وصفة بالذكاء الاصطناعي — سُفرة" },
      { property: "og:description", content: "حوّل أي فيديو طبخ إلى وصفة مكتوبة." },
    ],
  }),
  component: ImportPage,
});

const stages = ["تحليل الفيديو", "تفريغ الصوت", "استخراج المقادير", "فحص الحساسية"];

function ImportPage() {
  const [url, setUrl] = useState("https://www.tiktok.com/@chef.noura/video/7391…");
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const [stage, setStage] = useState(0);

  const run = () => {
    setPhase("loading"); setStage(0);
    stages.forEach((_, i) => setTimeout(() => setStage(i + 1), 600 * (i + 1)));
    setTimeout(() => setPhase("done"), 600 * stages.length + 300);
  };

  return (
    <AppShell>
      <TopBar title="استيراد وصفة" sub="TikTok · YouTube · Instagram" action={<DemoBadge />} />
      <div className="space-y-5 px-5">
        <div className="rounded-3xl bg-card p-5 shadow-soft">
          <label className="text-sm font-medium" htmlFor="url">رابط الفيديو</label>
          <div className="mt-2 flex items-center gap-2 rounded-2xl border bg-background px-3">
            <Clipboard className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input id="url" dir="ltr" value={url} onChange={(e) => setUrl(e.target.value)} className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" />
          </div>
          <button onClick={run} disabled={phase === "loading" || !url} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 font-semibold text-ink-foreground disabled:opacity-60">
            {phase === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 text-gold" />}
            استخرج الوصفة بالذكاء الاصطناعي
          </button>
        </div>

        {phase === "loading" && (
          <ul className="space-y-2 rounded-3xl bg-card p-5">
            {stages.map((s, i) => (
              <li key={s} className={`flex items-center gap-3 text-sm ${i < stage ? "text-olive" : "text-muted-foreground"}`}>
                {i < stage ? <CheckCircle2 className="h-4 w-4" /> : i === stage ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="h-4 w-4 rounded-full border" />}
                {s}
              </li>
            ))}
          </ul>
        )}

        {phase === "done" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 overflow-hidden rounded-3xl bg-card shadow-soft">
            <div className="relative h-40">
              <img src={mutabbaq} alt="مطبق" className="h-full w-full object-cover" loading="lazy" />
              <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-olive px-3 py-1 text-xs text-olive-foreground"><CheckCircle2 className="h-3.5 w-3.5" /> تم الاستخراج · دقة ٩٤٪</span>
            </div>
            <div className="space-y-4 p-5">
              <div><h2 className="text-2xl">مطبق لحم بالكراث</h2><p className="text-xs text-muted-foreground">من @chef.noura · ٤٠ دقيقة · ٣ حصص</p></div>
              <div>
                <p className="mb-2 text-sm font-semibold">المقادير المستخرجة (٥)</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {["عجينة رقيقة ×٦", "لحم مفروم ٣٠٠غ", "بيض ×٣", "كراث ربطة", "بصل ×١"].map((x) => <span key={x} className="rounded-full bg-secondary px-3 py-1.5">{x}</span>)}
                </div>
              </div>
              <div className="rounded-2xl bg-destructive/10 p-3 text-xs text-destructive">⚠ يحتوي قمح وبيض — متوفر بدائل آمنة</div>
              <div className="flex gap-2">
                <Link to="/recipe/$id" params={{ id: "mutabbaq" }} className="flex-1 rounded-2xl bg-primary py-3 text-center font-semibold text-primary-foreground">افتح الوصفة</Link>
                <button className="rounded-2xl border px-4 text-sm">حفظ</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
