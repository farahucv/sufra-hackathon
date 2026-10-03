import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, GraduationCap, Video, Bot, Store } from "lucide-react";
import { AppShell, TopBar } from "@/components/AppShell";
import chef2 from "@/assets/chef2.jpg";

export const Route = createFileRoute("/future")({
  head: () => ({
    meta: [
      { title: "خارطة الطريق — مستقبل سُفرة" },
      { name: "description", content: "المدونات وأكاديمية الطهي والاستشارات المباشرة مع الطهاة: مراحل سُفرة القادمة." },
      { property: "og:title", content: "خارطة الطريق — سُفرة" },
      { property: "og:description", content: "مدونات، أكاديمية، واستشارات طهاة مباشرة." },
    ],
  }),
  component: Future,
});

const items = [
  { i: BookOpen, t: "مدونات الطهاة", d: "مقالات وقصص الأطباق التراثية وأسرار المطبخ.", phase: "المرحلة ٢" },
  { i: GraduationCap, t: "أكاديمية سُفرة", d: "دورات مدفوعة بشهادات: من الأساسيات إلى المطبخ الاحترافي.", phase: "المرحلة ٢" },
  { i: Video, t: "استشارة طاهٍ مباشرة", d: "محادثة أو مكالمة فيديو مع طاهٍ أثناء طبخك، بالحجز.", phase: "المرحلة ٣" },
  { i: Store, t: "طلب السلة مباشرة", d: "ربط مع تطبيقات التوصيل وشراء المكونات بضغطة.", phase: "المرحلة ٣" },
  { i: Bot, t: "مساعد طبخ صوتي", d: "يقرأ لك الخطوات ويجيب على أسئلتك بالعربية.", phase: "رؤية" },
];

function Future() {
  return (
    <AppShell>
      <TopBar title="قادم في سُفرة" sub="Roadmap · خارطة التوسّع" />
      <div className="px-5">
        <div className="relative h-44 overflow-hidden rounded-3xl">
          <img src={chef2} alt="أكاديمية سُفرة" className="h-full w-full object-cover object-top" loading="lazy" />
          <div className="absolute inset-0 scrim" />
          <p className="absolute bottom-4 right-5 max-w-[70%] font-display text-2xl text-ink-foreground">تعلّم من أمهر الطهاة السعوديين</p>
        </div>
        <ol className="relative mt-6 space-y-4 border-r-2 border-dashed border-sand pr-6">
          {items.map(({ i: I, t, d, phase }) => (
            <li key={t} className="relative rounded-2xl bg-card p-4 shadow-soft">
              <span className="absolute -right-[35px] top-5 h-4 w-4 rounded-full border-4 border-background bg-olive" />
              <div className="flex items-center gap-2"><I className="h-5 w-5 text-primary" /><p className="flex-1 font-semibold">{t}</p><span className="rounded-full bg-secondary px-2 py-0.5 text-[10px]">{phase}</span></div>
              <p className="mt-1.5 text-sm text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
        <button className="mt-6 w-full rounded-2xl bg-primary py-4 font-semibold text-primary-foreground">أبلغني عند الإطلاق</button>
      </div>
    </AppShell>
  );
}
