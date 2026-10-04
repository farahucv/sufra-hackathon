import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, BookOpen, CalendarHeart, ArrowLeft, Landmark } from "lucide-react";
import { AppShell, Chip, TopBar } from "@/components/AppShell";
import { regions, chefs, getRecipe } from "@/lib/data";
import { useTr } from "@/lib/store";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "التراث الطهوي السعودي — سُفرة" },
      { name: "description", content: "قصص الأطباق التقليدية من نجد والحجاز والجنوب والشرقية والشمال: الكبسة، الجريش، القرصان، السليق، الحنيذ." },
      { property: "og:title", content: "التراث الطهوي السعودي — سُفرة" },
      { property: "og:description", content: "رحلة قصصية في أطباق كل منطقة سعودية." },
    ],
  }),
  component: Explore,
});

function Explore() {
  const tr = useTr();
  const [sel, setSel] = useState(0);
  const region = regions[sel]!;

  return (
    <AppShell wide>
      <TopBar back={false} title={tr("التراث الطهوي السعودي", "Saudi culinary heritage")} sub="لكل منطقة حكاية… ولكل طبق ذاكرة" />

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 lg:px-8">
        {regions.map((r, i) => <Chip key={r.name} active={sel === i} onClick={() => setSel(i)}>{r.name}</Chip>)}
      </div>

      <section key={sel} className="animate-float-up mx-5 mt-5 overflow-hidden rounded-2xl shadow-soft lg:mx-8">
        <div className="relative h-64 lg:h-80">
          <img src={region.img} alt={`مطبخ ${region.name}`} className="h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 scrim" />
          <div className="absolute bottom-5 start-5 max-w-lg text-ink-foreground">
            <p className="flex items-center gap-1 text-xs opacity-80"><MapPin className="h-3.5 w-3.5" />{region.en} · {String(sel + 1).padStart(2, "0")}/{String(regions.length).padStart(2, "0")}</p>
            <h2 className="mt-1 text-4xl lg:text-5xl">{region.name}</h2>
            <p className="mt-2 text-sm leading-relaxed opacity-90 lg:text-base">{region.tagline}</p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 px-5 lg:grid-cols-2 lg:px-8">
        {region.dishes.map((d, i) => {
          const r = d.recipeId ? getRecipe(d.recipeId) : undefined;
          return (
            <article key={d.name} className="animate-float-up rounded-2xl border bg-card p-5" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex gap-4">
                {r && <img src={r.img} alt={d.name} className="h-20 w-20 shrink-0 rounded-2xl object-cover" loading="lazy" />}
                <div className="min-w-0">
                  <h3 className="text-2xl">{d.name}</h3>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{d.origin}</span>
                    <span className="flex items-center gap-1"><CalendarHeart className="h-3.5 w-3.5" />{d.occasion}</span>
                  </div>
                </div>
              </div>
              <p className="mt-4 flex gap-2 border-s-2 border-gold ps-3 text-sm leading-loose"><BookOpen className="mt-1 h-4 w-4 shrink-0 text-gold" />{d.story}</p>
              {r ? (
                <Link to="/recipe/$id" params={{ id: r.id }} className="press mt-4 inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">اطبخها الآن <ArrowLeft className="h-3.5 w-3.5 ltr:rotate-180" /></Link>
              ) : (
                <span className="mt-4 inline-block rounded-full bg-muted px-4 py-2 text-xs text-muted-foreground">الوصفة المصوّرة قادمة قريباً</span>
              )}
            </article>
          );
        })}
      </section>

      <section className="star-pattern mx-5 mt-8 rounded-2xl bg-ink p-6 text-ink-foreground lg:mx-8">
        <Landmark className="h-6 w-6 text-gold" />
        <h3 className="mt-3 text-xl">حفظ الإرث الطهوي للأجيال القادمة</h3>
        <p className="mt-2 text-sm leading-relaxed opacity-85">
          تنسجم سُفرة مع تطلعات رؤية السعودية ٢٠٣٠ في تعزيز الهوية الثقافية وجودة الحياة؛ عبر توثيق وصفات المناطق بأصوات طهاتها، وتمكين الطهاة المحليين كصنّاع محتوى. (مبادرة مستقلة، دون أي ارتباط رسمي.)
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[["٥", "مناطق"], ["١١", "طبقاً تراثياً"], ["٢", "طهاة موثّقون"]].map(([v, l]) => (
            <div key={l} className="rounded-2xl bg-ink-foreground/10 py-3"><p className="font-display text-2xl text-gold">{v}</p><p className="text-[11px] opacity-75">{l}</p></div>
          ))}
        </div>
      </section>

      <section className="mt-8 px-5 lg:px-8">
        <h3 className="text-lg">حرّاس النكهة</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {chefs.map((c) => (
            <Link key={c.id} to="/chef/$id" params={{ id: c.id }} className="lift rounded-2xl bg-card p-4 text-center">
              <img src={c.img} alt={c.name} className="mx-auto h-16 w-16 rounded-full object-cover" loading="lazy" />
              <p className="mt-2 text-sm font-semibold">{c.name}</p><p className="text-[11px] text-muted-foreground">{c.roots}</p>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
