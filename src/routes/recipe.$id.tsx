import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, Clock, Flame, Minus, Plus, AlertTriangle, Repeat, ShoppingCart, Bookmark } from "lucide-react";
import { AppShell, DemoBadge } from "@/components/AppShell";
import { getRecipe, getChef } from "@/lib/data";
import { matchesAllergy, toggleIn, useStore } from "@/lib/store";

export const Route = createFileRoute("/recipe/$id")({
  loader: ({ params }) => {
    const r = getRecipe(params.id);
    if (!r) throw notFound();
    return { id: r.id, title: r.title };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — وصفة على سُفرة` },
          { name: "description", content: `طريقة ${loaderData.title} مع بدائل الحساسية والتكلفة المحلية.` },
          { property: "og:title", content: `${loaderData.title} — سُفرة` },
          { property: "og:description", content: `مقادير وخطوات ${loaderData.title} مع بدائل آمنة.` },
        ]
      : [{ title: "غير موجودة" }, { name: "robots", content: "noindex" }],
  }),
  component: RecipePage,
});

function RecipePage() {
  const { id } = Route.useLoaderData();
  const r = getRecipe(id)!;
  const chef = getChef(r.chefId)!;
  const s = useStore();
  const [serv, setServ] = useState(r.servings);
  const [useSubs, setUseSubs] = useState(true);
  const [tab, setTab] = useState<"ing" | "steps">("ing");
  const k = serv / r.servings;
  const flagged = r.ingredients.filter((i) => i.allergen && matchesAllergy(i.allergen, s.allergies));

  return (
    <AppShell nav={false}>
      <div className="relative h-80">
        <img src={r.img} alt={r.title} className="h-full w-full object-cover" width={768} height={1024} />
        <div className="absolute inset-0 scrim" />
        <div className="absolute inset-x-5 top-6 flex justify-between">
          <button onClick={() => history.back()} aria-label="رجوع" className="grid h-10 w-10 place-items-center rounded-full bg-card"><ChevronRight className="h-5 w-5" /></button>
          <button onClick={() => toggleIn("saved", r.id)} aria-label="حفظ" className="grid h-10 w-10 place-items-center rounded-full bg-card">
            <Bookmark className={`h-5 w-5 ${s.saved.includes(r.id) ? "fill-gold text-gold" : ""}`} />
          </button>
        </div>
        <div className="absolute bottom-5 right-5 text-ink-foreground">
          <p className="text-xs opacity-80">{r.en} · {r.region}</p>
          <h1 className="text-4xl">{r.title}</h1>
        </div>
      </div>

      <div className="-mt-4 relative rounded-t-3xl bg-background px-5 pb-32 pt-6">
        <Link to="/chef/$id" params={{ id: chef.id }} className="flex items-center gap-3">
          <img src={chef.img} alt={chef.name} className="h-11 w-11 rounded-full object-cover" loading="lazy" />
          <div className="flex-1"><p className="font-semibold">{chef.name}</p><p className="text-xs text-muted-foreground">{chef.title}</p></div>
          <DemoBadge />
        </Link>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <Stat icon={<Clock className="h-4 w-4" />} v={`${r.time} د`} l="الوقت" />
          <Stat icon={<Flame className="h-4 w-4" />} v={`${r.kcal}`} l="سعرة/حصة" />
          <Stat icon={<ShoppingCart className="h-4 w-4" />} v={`${Math.round(r.cost * k)} ر.س`} l="تكلفة تقديرية" />
        </div>

        {flagged.length > 0 && (
          <div className="mt-5 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
            <div className="flex items-center gap-2 font-semibold text-destructive"><AlertTriangle className="h-4 w-4" /> تنبيه حساسية</div>
            <p className="mt-1 text-sm">هذه الوصفة تحتوي: {[...new Set(flagged.map((f) => f.allergen))].join("، ")}</p>
            <label className="mt-3 flex items-center justify-between rounded-xl bg-card p-3 text-sm">
              <span className="flex items-center gap-2"><Repeat className="h-4 w-4 text-olive" /> استبدل تلقائياً ببدائل آمنة</span>
              <input type="checkbox" checked={useSubs} onChange={(e) => setUseSubs(e.target.checked)} className="h-5 w-5 accent-[var(--olive)]" />
            </label>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between rounded-2xl bg-card p-3 shadow-soft">
          <span className="text-sm font-medium">عدد الحصص</span>
          <div className="flex items-center gap-4">
            <button aria-label="إنقاص" onClick={() => setServ(Math.max(1, serv - 1))} className="grid h-9 w-9 place-items-center rounded-full bg-muted"><Minus className="h-4 w-4" /></button>
            <span className="w-6 text-center text-lg font-semibold">{serv}</span>
            <button aria-label="زيادة" onClick={() => setServ(serv + 1)} className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground"><Plus className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 rounded-2xl bg-muted p-1">
          {(["ing", "steps"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-xl py-2.5 text-sm font-medium ${tab === t ? "bg-card shadow-soft" : "text-muted-foreground"}`}>
              {t === "ing" ? "المقادير" : "الخطوات"}
            </button>
          ))}
        </div>

        {tab === "ing" ? (
          <ul className="mt-4 divide-y rounded-2xl bg-card px-4">
            {r.ingredients.map((i) => {
              const bad = i.allergen && matchesAllergy(i.allergen, s.allergies);
              const swapped = bad && useSubs && i.sub;
              return (
                <li key={i.name} className="flex items-center justify-between py-3.5">
                  <div>
                    <p className={swapped ? "font-medium text-olive" : "font-medium"}>{swapped ? i.sub : i.name}</p>
                    {swapped && <p className="text-xs text-muted-foreground line-through">{i.name}</p>}
                    {bad && !swapped && <p className="text-xs text-destructive">يحتوي {i.allergen}</p>}
                  </div>
                  <span className="text-sm text-muted-foreground">{+(i.qty * k).toFixed(2)} {i.unit}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <ol className="mt-4 space-y-3">
            {r.steps.map((st, n) => (
              <li key={n} className="flex gap-3 rounded-2xl bg-card p-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary font-display text-primary">{n + 1}</span>
                <p className="leading-relaxed">{st}</p>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 border-t bg-card/95 p-4 backdrop-blur">
        <Link to="/grocery" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-semibold text-primary-foreground">
          <ShoppingCart className="h-5 w-5" /> تسوّق المكونات الناقصة · قارن الأسعار
        </Link>
      </div>
    </AppShell>
  );
}

function Stat({ icon, v, l }: { icon: React.ReactNode; v: string; l: string }) {
  return (
    <div className="rounded-2xl bg-secondary p-3">
      <div className="mx-auto mb-1 w-fit text-primary">{icon}</div>
      <p className="font-semibold">{v}</p>
      <p className="text-[11px] text-muted-foreground">{l}</p>
    </div>
  );
}
