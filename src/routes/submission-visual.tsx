import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Wordmark } from "@/components/AppShell";

/**
 * Internal presentation canvas (1600×900) for the hackathon submission.
 * Panels are pixel captures of the real /import screen in its three states.
 * Not linked from navigation.
 */
export const Route = createFileRoute("/submission-visual")({
  head: () => ({
    meta: [
      { title: "من فيديو إلى وصفة جاهزة — سُفرة" },
      { name: "description", content: "عرض ميزة استيراد الوصفات من فيديوهات الطبخ في سُفرة." },
      { property: "og:title", content: "من فيديو إلى وصفة جاهزة — سُفرة" },
      { property: "og:description", content: "ألصق رابط فيديو طبخ وسُفرة تستخرج المكونات والخطوات." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SubmissionVisual,
});

const panels = [
  { src: "/submission/1-paste.png", w: 400, n: "١" },
  { src: "/submission/2-analyzing.png", w: 400, n: "٢" },
  { src: "/submission/3-result.png", w: 312, n: "٣" },
];

function Arrow() {
  return (
    <div className="grid h-11 w-11 shrink-0 place-items-center self-center rounded-full bg-primary text-primary-foreground">
      <ArrowLeft className="h-5 w-5" />
    </div>
  );
}

function SubmissionVisual() {
  return (
    <div dir="rtl" lang="ar" className="sadu relative mx-auto flex h-[900px] w-[1600px] flex-col overflow-hidden bg-background px-14 pt-9">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-[44px] leading-tight text-primary">من فيديو إلى وصفة جاهزة</h1>
          <p className="mt-2 text-lg text-muted-foreground">ألصق رابط TikTok أو YouTube أو Instagram، وسُفرة تستخرج لك المكونات والخطوات تلقائيًا.</p>
        </div>
        <Wordmark />
      </header>
      <div className="mt-7 flex flex-1 items-start justify-center gap-6">
        {panels.map((p, i) => (
          <div key={p.src} className="contents">
            {i > 0 && <Arrow />}
            <div className="relative">
              <span className="absolute -top-3 end-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-gold font-display text-ink">{p.n}</span>
              <div className="overflow-hidden rounded-2xl border bg-background shadow-soft">
                <img src={p.src} alt="" style={{ width: p.w }} className="block" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
