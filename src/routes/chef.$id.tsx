import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Star, MessageCircle, Phone, CalendarCheck, Play, BadgeCheck } from "lucide-react";
import { AppShell, DemoBadge, TopBar } from "@/components/AppShell";
import { getChef, recipes } from "@/lib/data";

export const Route = createFileRoute("/chef/$id")({
  loader: ({ params }) => {
    const c = getChef(params.id);
    if (!c) throw notFound();
    return { id: c.id, name: c.name };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — سُفرة` },
          { name: "description", content: `ريلز ووصفات ومدونة ${loaderData.name}.` },
          { property: "og:title", content: `${loaderData.name} — سُفرة` },
          { property: "og:description", content: `تابع ${loaderData.name} على سُفرة.` },
        ]
      : [{ title: "غير موجود" }, { name: "robots", content: "noindex" }],
  }),
  component: ChefPage,
});

const reviews = [
  { n: "عبدالله", t: "الكبسة طلعت مثل كبسة الوالدة بالضبط!", s: 5 },
  { n: "ريم", t: "شرح واضح والبدائل الخالية من المكسرات ممتازة.", s: 5 },
];

function ChefPage() {
  const { id } = Route.useLoaderData();
  const c = getChef(id)!;
  const own = recipes.filter((r) => r.chefId === c.id);
  const [tab, setTab] = useState<"reels" | "blog" | "reviews">("reels");

  return (
    <AppShell>
      <TopBar title="" action={<DemoBadge />} />
      <div className="px-5 text-center">
        <img src={c.img} alt={c.name} className="mx-auto h-28 w-28 rounded-full border-4 border-card object-cover shadow-soft" />
        <h1 className="mt-3 flex items-center justify-center gap-1 text-2xl">{c.name}<BadgeCheck className="h-5 w-5 text-olive" /></h1>
        <p className="text-sm text-muted-foreground">{c.title} · {c.city}</p>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed">{c.bio}</p>
        <div className="mt-4 grid grid-cols-3 rounded-2xl bg-card py-3">
          <div><p className="font-bold">{c.followers}</p><p className="text-[11px] text-muted-foreground">متابع</p></div>
          <div><p className="font-bold">{own.length * 31}</p><p className="text-[11px] text-muted-foreground">وصفة</p></div>
          <div><p className="flex items-center justify-center gap-1 font-bold"><Star className="h-4 w-4 fill-gold text-gold" />{c.rating}</p><p className="text-[11px] text-muted-foreground">تقييم</p></div>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="flex-1 rounded-2xl bg-primary py-3 font-semibold text-primary-foreground">متابعة</button>
          {[{ i: MessageCircle, l: "محادثة" }, { i: Phone, l: "مكالمة" }, { i: CalendarCheck, l: "حجز" }].map(({ i: I, l }) => (
            <button key={l} className="relative grid w-14 place-items-center rounded-2xl border bg-card" aria-label={l}>
              <I className="h-5 w-5" /><span className="absolute -top-2 rounded-full bg-gold px-1.5 text-[9px] text-ink">قريباً</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mx-5 mt-6 grid grid-cols-3 rounded-2xl bg-muted p-1 text-sm">
        {([["reels", "الريلز"], ["blog", "المدونة"], ["reviews", "التقييمات"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-xl py-2.5 ${tab === k ? "bg-card font-medium shadow-soft" : "text-muted-foreground"}`}>{l}</button>
        ))}
      </div>

      <div className="mt-4 px-5">
        {tab === "reels" && (
          <div className="grid grid-cols-2 gap-2">
            {[...own, ...own].map((r, i) => (
              <Link key={i} to="/recipe/$id" params={{ id: r.id }} className="relative h-56 overflow-hidden rounded-2xl">
                <img src={r.img} alt={r.title} className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 scrim" />
                <span className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-ink-foreground"><Play className="h-3 w-3 fill-current" />{r.title}</span>
              </Link>
            ))}
          </div>
        )}
        {tab === "blog" && (
          <div className="space-y-3">
            {["سر الأرز المفلفل في الكبسة", "٥ بهارات لا يخلو منها مطبخ نجدي", "كيف تقلل الدهون في الأطباق التراثية"].map((t) => (
              <article key={t} className="rounded-2xl bg-card p-4"><p className="font-semibold">{t}</p><p className="mt-1 text-xs text-muted-foreground">مقال · ٤ دقائق قراءة</p></article>
            ))}
          </div>
        )}
        {tab === "reviews" && (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.n} className="rounded-2xl bg-card p-4">
                <div className="flex justify-between"><p className="font-semibold">{r.n}</p><span className="flex">{Array.from({ length: r.s }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />)}</span></div>
                <p className="mt-1 text-sm">{r.t}</p>
              </div>
            ))}
          </div>
        )}

        <h2 className="mt-8 text-lg">يوصي به الشيف</h2>
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-2">
          {recipes.filter((r) => r.chefId !== c.id).map((r) => (
            <Link key={r.id} to="/recipe/$id" params={{ id: r.id }} className="w-40 shrink-0 overflow-hidden rounded-2xl bg-card">
              <img src={r.img} alt={r.title} className="h-24 w-full object-cover" loading="lazy" />
              <p className="p-3 text-sm font-semibold">{r.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
