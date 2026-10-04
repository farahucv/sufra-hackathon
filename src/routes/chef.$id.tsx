import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Star, MessageCircle, CalendarCheck, Play, BadgeCheck, MapPin, UserPlus, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell, TopBar } from "@/components/AppShell";
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
          { name: "description", content: `ريلز ووصفات ومدونة وتقييمات ${loaderData.name} على سُفرة.` },
          { property: "og:title", content: `${loaderData.name} — سُفرة` },
          { property: "og:description", content: `تابع ${loaderData.name} على سُفرة.` },
        ]
      : [{ title: "الطاهي غير موجود" }, { name: "robots", content: "noindex" }],
  }),
  component: ChefPage,
});

const reviews = [
  { n: "عبدالله", t: "الكبسة طلعت مثل كبسة الوالدة بالضبط!", s: 5, d: "قبل يومين" },
  { n: "ريم", t: "البدائل الخالية من المكسرات أنقذت عزيمتنا.", s: 5, d: "الأسبوع الماضي" },
  { n: "ماجد", t: "شرح واضح، أتمنى فيديوهات أطول للخطوات الصعبة.", s: 4, d: "قبل أسبوعين" },
];
const blog = ["سر الأرز المفلفل في الكبسة", "٥ بهارات لا يخلو منها مطبخ نجدي", "كيف تخفف الدهون في الأطباق التراثية"];

function ChefPage() {
  const { id } = Route.useLoaderData();
  const c = getChef(id)!;
  const own = recipes.filter((r) => r.chefId === c.id);
  const [tab, setTab] = useState<"reels" | "recipes" | "reviews" | "blog">("reels");
  const [following, setFollowing] = useState(false);
  const soon = (what: string) => toast(`${what} — قريباً`, { description: "ميزة مستقبلية: جلسات مدفوعة مع الطهاة بالمحادثة أو الفيديو." });

  return (
    <AppShell wide>
      <TopBar title="" />
      <div className="px-5 lg:px-8">
        <div className="lg:flex lg:items-center lg:gap-8">
          <div className="text-center lg:text-start">
            <img src={c.img} alt={c.name} className="mx-auto h-28 w-28 rounded-full border-4 border-card object-cover shadow-soft lg:h-36 lg:w-36" />
          </div>
          <div className="mt-3 flex-1 text-center lg:mt-0 lg:text-start">
            <h1 className="flex items-center justify-center gap-1 text-2xl lg:justify-start lg:text-3xl">{c.name}<BadgeCheck className="h-5 w-5 text-olive" /></h1>
            <p className="text-sm text-muted-foreground">{c.title}</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground lg:justify-start"><MapPin className="h-3.5 w-3.5" />{c.city} · جذوره {c.roots}</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed lg:mx-0">{c.bio}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5 lg:justify-start">
              {c.specialties.map((x) => <span key={x} className="rounded-full bg-secondary px-3 py-1 text-xs">{x}</span>)}
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 rounded-2xl bg-card py-3 text-center">
          <div><p className="font-bold">{c.followers}</p><p className="text-[11px] text-muted-foreground">متابع</p></div>
          <div><p className="font-bold">{own.length}</p><p className="text-[11px] text-muted-foreground">وصفة منشورة</p></div>
          <div><p className="flex items-center justify-center gap-1 font-bold"><Star className="h-4 w-4 fill-gold text-gold" />{c.rating}</p><p className="text-[11px] text-muted-foreground">{c.reviews} تقييم</p></div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button onClick={() => { setFollowing(!following); toast.success(following ? "ألغيت المتابعة" : `تتابع الآن ${c.name}`); }}
            className={`press flex items-center justify-center gap-1.5 rounded-2xl py-3 text-sm font-semibold ${following ? "border bg-card" : "bg-primary text-primary-foreground"}`}>
            {following ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}{following ? "تتابعه" : "متابعة"}
          </button>
          <button onClick={() => soon("اسأل الشيف")} className="press relative flex items-center justify-center gap-1.5 rounded-2xl border bg-card py-3 text-sm"><MessageCircle className="h-4 w-4" />اسأل الشيف<span className="absolute -top-2 end-2 rounded-full bg-gold px-1.5 text-[9px] text-ink">قريباً</span></button>
          <button onClick={() => soon("احجز جلسة")} className="press relative flex items-center justify-center gap-1.5 rounded-2xl border bg-card py-3 text-sm"><CalendarCheck className="h-4 w-4" />احجز جلسة<span className="absolute -top-2 end-2 rounded-full bg-gold px-1.5 text-[9px] text-ink">قريباً</span></button>
        </div>
      </div>

      <div className="mx-5 mt-6 grid grid-cols-4 rounded-2xl bg-muted p-1 text-sm lg:mx-8 lg:max-w-xl">
        {([["reels", "الريلز"], ["recipes", "الوصفات"], ["reviews", "التقييمات"], ["blog", "المدونة"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-xl py-2.5 transition ${tab === k ? "bg-card font-medium shadow-soft" : "text-muted-foreground"}`}>{l}</button>
        ))}
      </div>

      <div key={tab} className="animate-float-up mt-4 px-5 lg:px-8">
        {tab === "reels" && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {own.map((r, i) => (
              <Link key={r.id} to="/recipe/$id" params={{ id: r.id }} className="lift relative h-60 overflow-hidden rounded-2xl">
                <img src={r.img} alt={r.title} className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 scrim" />
                <span className="absolute start-2 top-2 rounded-full bg-ink/50 px-2 py-0.5 text-[10px] text-ink-foreground">{["١٢٠ ألف", "٨٤ ألف", "٢٠٠ ألف", "٤٥ ألف", "٦٦ ألف"][i % 5]} مشاهدة</span>
                <span className="absolute bottom-2 start-2 flex items-center gap-1 text-xs text-ink-foreground"><Play className="h-3 w-3 fill-current" />{r.title}</span>
              </Link>
            ))}
          </div>
        )}
        {tab === "recipes" && (
          <ul className="grid gap-2 lg:grid-cols-2">
            {own.map((r) => (
              <li key={r.id}><Link to="/recipe/$id" params={{ id: r.id }} className="flex items-center gap-3 rounded-2xl bg-card p-3">
                <img src={r.img} alt={r.title} className="h-16 w-16 rounded-xl object-cover" loading="lazy" />
                <div className="flex-1"><p className="font-semibold">{r.title}</p><p className="text-xs text-muted-foreground">{r.time} د · {r.difficulty} · {r.nutrition.kcal} سعرة</p></div>
              </Link></li>
            ))}
          </ul>
        )}
        {tab === "reviews" && (
          <div className="grid gap-3 lg:grid-cols-3">
            {reviews.map((r) => (
              <div key={r.n} className="rounded-2xl bg-card p-4">
                <div className="flex items-center justify-between"><p className="font-semibold">{r.n}</p><span className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < r.s ? "fill-gold text-gold" : "text-muted"}`} />)}</span></div>
                <p className="mt-1 text-sm">{r.t}</p><p className="mt-2 text-[11px] text-muted-foreground">{r.d}</p>
              </div>
            ))}
          </div>
        )}
        {tab === "blog" && (
          <div className="grid gap-3 lg:grid-cols-3">
            {blog.map((t) => (
              <article key={t} className="rounded-2xl bg-card p-4"><p className="font-semibold">{t}</p><p className="mt-1 text-xs text-muted-foreground">مقال · ٤ دقائق قراءة</p>
                <Link to="/future" className="mt-3 inline-block text-xs text-olive">المدونات قادمة قريباً ←</Link></article>
            ))}
          </div>
        )}

        <h2 className="mt-8 text-lg">يوصي به {c.name.split(" ")[0]}</h2>
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-2">
          {recipes.filter((r) => r.chefId !== c.id).map((r) => (
            <Link key={r.id} to="/recipe/$id" params={{ id: r.id }} className="lift w-40 shrink-0 overflow-hidden rounded-2xl bg-card">
              <img src={r.img} alt={r.title} className="h-24 w-full object-cover" loading="lazy" />
              <p className="p-3 text-sm font-semibold">{r.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
