import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin } from "lucide-react";
import { AppShell, Chip, TopBar } from "@/components/AppShell";
import { regions, recipes, chefs } from "@/lib/data";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "استكشف المطبخ السعودي حسب المنطقة — سُفرة" },
      { name: "description", content: "أطباق نجد والحجاز والجنوب والشرقية والشمال والقصيم التقليدية." },
      { property: "og:title", content: "استكشف المطبخ السعودي — سُفرة" },
      { property: "og:description", content: "رحلة في الأطباق التراثية لكل منطقة سعودية." },
    ],
  }),
  component: Explore,
});

function Explore() {
  const [sel, setSel] = useState(regions[0].name);
  const region = regions.find((r) => r.name === sel)!;
  const list = recipes.filter((r) => r.region === sel);

  return (
    <AppShell>
      <TopBar back={false} title="المطبخ السعودي" sub="أطباق تراثية من كل منطقة" />
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5">
        {regions.map((r) => <Chip key={r.name} active={sel === r.name} onClick={() => setSel(r.name)}>{r.name}</Chip>)}
      </div>

      <div className="mx-5 mt-5 overflow-hidden rounded-3xl shadow-soft">
        <div className="relative h-48">
          <img src={region.img} alt={region.name} className="h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 scrim" />
          <div className="absolute bottom-4 right-5 text-ink-foreground">
            <p className="flex items-center gap-1 text-xs opacity-80"><MapPin className="h-3.5 w-3.5" />{region.en}</p>
            <h2 className="text-3xl">مطبخ {region.name}</h2>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 bg-card p-4">
          {region.dishes.map((d) => <span key={d} className="rounded-full bg-secondary px-3 py-1.5 text-sm">{d}</span>)}
        </div>
      </div>

      <section className="mt-6 px-5">
        <h3 className="text-lg">وصفات من {region.name}</h3>
        {list.length === 0 && <p className="mt-3 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">وصفات هذه المنطقة قادمة قريباً.</p>}
        <div className="mt-3 space-y-3">
          {list.map((r) => (
            <Link key={r.id} to="/recipe/$id" params={{ id: r.id }} className="flex gap-3 rounded-2xl bg-card p-3">
              <img src={r.img} alt={r.title} className="h-20 w-20 rounded-xl object-cover" loading="lazy" />
              <div className="flex-1"><p className="font-semibold">{r.title}</p><p className="text-xs text-muted-foreground">{r.time} دقيقة · {r.category}</p></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 px-5">
        <h3 className="text-lg">جميع المناطق</h3>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {regions.map((r) => (
            <button key={r.name} onClick={() => setSel(r.name)} className="relative h-24 overflow-hidden rounded-2xl">
              <img src={r.img} alt={r.name} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 scrim" />
              <span className="absolute bottom-2 right-2 font-display text-ink-foreground">{r.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8 px-5">
        <h3 className="text-lg">طهاة مميزون</h3>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {chefs.map((c) => (
            <Link key={c.id} to="/chef/$id" params={{ id: c.id }} className="rounded-2xl bg-card p-4 text-center">
              <img src={c.img} alt={c.name} className="mx-auto h-16 w-16 rounded-full object-cover" loading="lazy" />
              <p className="mt-2 text-sm font-semibold">{c.name}</p><p className="text-[11px] text-muted-foreground">{c.city}</p>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
