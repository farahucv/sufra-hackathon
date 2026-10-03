import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Bookmark, Clock, Link2, Play, Sparkles, AlertTriangle } from "lucide-react";
import { AppShell, Chip, DemoBadge } from "@/components/AppShell";
import { recipes, getChef } from "@/lib/data";
import { matchesAllergy, toggleIn, useStore } from "@/lib/store";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "ريلز الطهاة — سُفرة" },
      { name: "description", content: "شاهد ريلز قصيرة لطهاة سعوديين واحفظ وصفاتك المفضلة." },
      { property: "og:title", content: "ريلز الطهاة — سُفرة" },
      { property: "og:description", content: "ريلز وصفات سعودية قصيرة من طهاة محليين." },
    ],
  }),
  component: HomePage,
});

const cats = ["الكل", "تراثي", "أطباق رئيسية", "مقبلات"];

function HomePage() {
  const [cat, setCat] = useState("الكل");
  const s = useStore();
  const list = recipes.filter((r) => cat === "الكل" || r.category === cat);

  return (
    <AppShell>
      <header className="flex items-center justify-between px-5 pb-2 pt-6">
        <div>
          <p className="text-sm text-muted-foreground">مساء الخير، {s.name}</p>
          <h1 className="text-2xl">وش نطبخ اليوم؟</h1>
        </div>
        <DemoBadge />
      </header>

      <Link to="/import" className="mx-5 mt-3 flex items-center gap-3 rounded-2xl bg-ink p-4 text-ink-foreground">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold text-ink"><Link2 className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">استورد وصفة من تيك توك أو يوتيوب</p>
          <p className="truncate text-xs opacity-70">الصق الرابط والذكاء الاصطناعي يستخرج المقادير</p>
        </div>
        <Sparkles className="h-5 w-5 text-gold" />
      </Link>

      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto px-5">
        {cats.map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}
      </div>

      <section className="mt-5 space-y-5 px-5">
        {list.map((r) => {
          const chef = getChef(r.chefId)!;
          const warn = r.allergens.filter((a) => matchesAllergy(a, s.allergies));
          const liked = s.liked.includes(r.id), saved = s.saved.includes(r.id);
          return (
            <article key={r.id} className="relative h-[520px] overflow-hidden rounded-3xl shadow-soft">
              <img src={r.img} alt={r.title} className="absolute inset-0 h-full w-full object-cover" loading="lazy" width={768} height={1024} />
              <div className="absolute inset-0 scrim" />
              <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-ink/60 px-3 py-1.5 text-xs text-ink-foreground backdrop-blur">
                <Play className="h-3.5 w-3.5 fill-current" /> ريل · ٠:٤٥
              </div>
              {warn.length > 0 && (
                <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-destructive px-3 py-1.5 text-xs text-destructive-foreground">
                  <AlertTriangle className="h-3.5 w-3.5" /> يحتوي {warn.join("، ")} · له بديل
                </div>
              )}
              <div className="absolute bottom-24 left-4 flex flex-col gap-4 text-ink-foreground">
                <button onClick={() => toggleIn("liked", r.id)} className="flex flex-col items-center text-xs" aria-label="إعجاب">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-ink/50 backdrop-blur"><Heart className={`h-5 w-5 ${liked ? "fill-destructive text-destructive" : ""}`} /></span>{r.likes}
                </button>
                <button onClick={() => toggleIn("saved", r.id)} className="flex flex-col items-center text-xs" aria-label="حفظ">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-ink/50 backdrop-blur"><Bookmark className={`h-5 w-5 ${saved ? "fill-gold text-gold" : ""}`} /></span>حفظ
                </button>
              </div>
              <div className="absolute inset-x-0 bottom-0 space-y-3 p-5 text-ink-foreground">
                <Link to="/chef/$id" params={{ id: chef.id }} className="flex items-center gap-2">
                  <img src={chef.img} alt={chef.name} className="h-9 w-9 rounded-full border-2 border-gold object-cover" loading="lazy" />
                  <span className="text-sm font-medium">{chef.name}</span>
                </Link>
                <h2 className="text-3xl">{r.title}</h2>
                <div className="flex items-center gap-3 text-xs opacity-85">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{r.time} دقيقة</span>
                  <span>· {r.region}</span><span>· ~{r.cost} ر.س</span>
                </div>
                <Link to="/recipe/$id" params={{ id: r.id }} className="block rounded-2xl bg-card py-3 text-center font-semibold text-foreground">عرض الوصفة</Link>
              </div>
            </article>
          );
        })}
      </section>
    </AppShell>
  );
}
