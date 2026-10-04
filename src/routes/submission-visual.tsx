import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Refrigerator, Scale, Package } from "lucide-react";
import { Wordmark } from "@/components/AppShell";
import { ImportFormCard, ImportResultCard, importSamples } from "@/components/ImportParts";

/** Internal 1600×900 presentation canvas built from the real Import components. Not linked. */
export const Route = createFileRoute("/submission-visual")({
  head: () => ({
    meta: [
      { title: "من الفيديو إلى الوصفة — سُفرة" },
      { name: "description", content: "عرض ميزة استيراد الوصفات من فيديوهات الطبخ في سُفرة." },
      { property: "og:title", content: "من الفيديو إلى الوصفة — سُفرة" },
      { property: "og:description", content: "الصق رابط فيديو طبخ، وسُفرة تستخرج الوصفة والمكونات والخطوات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SubmissionVisual,
});

const eco = [
  { I: ShieldCheck, l: "حساسية وبدائل" },
  { I: Refrigerator, l: "اطبخ بالموجود" },
  { I: Scale, l: "مقارنة أسعار" },
  { I: Package, l: "صندوق جاهز" },
];

function SubmissionVisual() {
  return (
    <div dir="rtl" lang="ar" className="relative mx-auto flex h-[900px] w-[1600px] flex-col overflow-hidden bg-background px-24 pb-9 pt-14">
      <div className="sadu pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full opacity-15" />

      <header>
        <Wordmark size="sm" />
        <div className="mt-6">
          <h1 className="text-[46px] leading-tight text-primary">من الفيديو إلى الوصفة</h1>
          <p className="mt-2 text-[17px] text-muted-foreground">الصق رابط فيديو طبخ، وسُفرة تستخرج الوصفة والمكونات والخطوات.</p>
        </div>
      </header>

      <div dir="ltr" className="relative mt-6 flex flex-1 items-center gap-10">
        <div dir="rtl" className="w-[440px] shrink-0">
          <ImportFormCard url={importSamples[1]!.url} showNote={false} showRun={false} />
        </div>

        <div className="flex w-[120px] shrink-0 flex-col items-center gap-3 text-olive">
          <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
          <div className="relative h-px w-full bg-olive/30">
            <div className="absolute inset-y-0 left-0 w-2/3 bg-olive" />
            <span className="absolute -right-0.5 -top-[3px] h-[7px] w-[7px] rotate-45 border-r border-t border-olive" />
          </div>
          <span dir="rtl" className="text-[12px] font-medium tracking-wide">تحليل ذكي</span>
        </div>

        <div dir="rtl" className="min-w-0 flex-1">
          <ImportResultCard rid="kabsa" allergies={["مكسرات"]} layout="wide" imgEager showCost={false} />
        </div>
      </div>

      <footer className="mt-8 flex items-center justify-between border-t pt-5">
        <ul className="flex items-center gap-10 text-olive">
          {eco.map(({ I, l }) => (
            <li key={l} className="flex items-center gap-2 text-[14px]"><I className="h-4 w-4" strokeWidth={1.5} />{l}</li>
          ))}
        </ul>
        <p className="text-[13px] text-muted-foreground">ويبرز المطبخ السعودي والشيفات المحليين</p>
      </footer>
    </div>
  );
}
