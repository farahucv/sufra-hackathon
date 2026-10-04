import { createFileRoute } from "@tanstack/react-router";
import { Wordmark } from "@/components/AppShell";
import { ImportAnalysisState, ImportFormCard, ImportPrimaryAction, ImportResultCard, importSamples } from "@/components/ImportParts";

/** Internal 1600×900 presentation canvas built from the real Import components. Not linked. */
export const Route = createFileRoute("/submission-visual")({
  head: () => ({
    meta: [
      { title: "حوّل فيديو الطبخ إلى وصفة كاملة — سُفرة" },
      { name: "description", content: "عرض ميزة استيراد الوصفات من فيديوهات الطبخ في سُفرة." },
      { property: "og:title", content: "حوّل فيديو الطبخ إلى وصفة كاملة — سُفرة" },
      { property: "og:description", content: "ألصق رابط فيديو طبخ وسُفرة تستخرج المكونات والخطوات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SubmissionVisual,
});

const Caption = ({ children }: { children: string }) => (
  <p className="mb-2.5 flex items-center gap-2 text-[13px] font-medium text-olive"><span className="h-px w-5 bg-olive/60" />{children}</p>
);

function SubmissionVisual() {
  const yt = importSamples[1];
  return (
    <div dir="rtl" lang="ar" className="relative mx-auto h-[900px] w-[1600px] overflow-hidden bg-background">
      <div className="sadu pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative grid h-full grid-cols-[560px_1fr] gap-x-20 px-20 py-14">
        {/* right column (RTL start): header + supporting steps */}
        <div className="flex flex-col">
          <Wordmark size="sm" />
          <h1 className="mt-7 text-[40px] leading-[1.25] text-primary">حوّل فيديو الطبخ إلى وصفة كاملة</h1>
          <p className="mt-3 max-w-[480px] text-[15px] leading-7 text-muted-foreground">ألصق رابط TikTok أو YouTube أو Instagram، وسُفرة تستخرج لك المكونات والخطوات تلقائيًا.</p>

          <div className="mt-9">
            <Caption>الرابط</Caption>
            <ImportFormCard url={yt.url} showNote={false} />
          </div>
          <div className="relative mt-6 ms-12">
            <Caption>تحليل ذكي</Caption>
            <ImportAnalysisState stage={3} skeleton={false} />
          </div>
        </div>

        {/* hero: result */}
        <div className="relative flex flex-col justify-center">
          {/* olive connector */}
          <svg className="absolute -start-[76px] top-1/2 h-8 w-16 -translate-y-1/2 text-olive" viewBox="0 0 64 32" fill="none" aria-hidden>
            <path d="M60 16H8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 4" strokeLinecap="round" />
            <path d="M14 9 6 16l8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <Caption>الوصفة</Caption>
          <ImportResultCard rid="kabsa" allergies={["مكسرات"]} layout="wide" imgEager actions={<div className="flex"><ImportPrimaryAction rid="kabsa" /></div>} />
        </div>
      </div>
    </div>
  );
}
