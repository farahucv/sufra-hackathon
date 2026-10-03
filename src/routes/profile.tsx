import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Bell, Globe, MapPin, ChevronLeft, Rocket } from "lucide-react";
import { AppShell, DemoBadge, TopBar } from "@/components/AppShell";
import { getRecipe } from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "حسابي والوصفات المحفوظة — سُفرة" },
      { name: "description", content: "وصفاتك المحفوظة وتفضيلاتك الغذائية وإعدادات التطبيق." },
      { property: "og:title", content: "حسابي — سُفرة" },
      { property: "og:description", content: "وصفاتك المحفوظة وإعداداتك." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const s = useStore();
  const saved = s.saved.map(getRecipe).filter(Boolean);
  const rows = [
    { i: ShieldCheck, l: "الحساسية والتفضيلات", v: s.allergies.join("، ") || "لا يوجد", to: "/" as const },
    { i: MapPin, l: "المدينة", v: "الرياض" },
    { i: Globe, l: "اللغة", v: "العربية" },
    { i: Bell, l: "الإشعارات", v: "مفعّلة" },
  ];

  return (
    <AppShell>
      <TopBar back={false} title="حسابي" action={<DemoBadge />} />
      <div className="px-5">
        <div className="flex items-center gap-4 rounded-3xl bg-primary p-5 text-primary-foreground">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-gold font-display text-2xl text-ink">{s.name[0]}</div>
          <div><p className="text-lg font-semibold">{s.name}</p><p className="text-xs opacity-75">عضو منذ ٢٠٢٦ · {saved.length} وصفة محفوظة</p></div>
        </div>

        <h2 className="mt-7 text-lg">المحفوظات</h2>
        {saved.length === 0 && <p className="mt-3 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">احفظ وصفات من الريلز لتظهر هنا.</p>}
        <div className="mt-3 grid grid-cols-2 gap-3">
          {saved.map((r) => (
            <Link key={r!.id} to="/recipe/$id" params={{ id: r!.id }} className="overflow-hidden rounded-2xl bg-card shadow-soft">
              <img src={r!.img} alt={r!.title} className="h-28 w-full object-cover" loading="lazy" />
              <p className="p-3 text-sm font-semibold">{r!.title}</p>
            </Link>
          ))}
        </div>

        <h2 className="mt-7 text-lg">الإعدادات</h2>
        <ul className="mt-3 divide-y rounded-2xl bg-card">
          {rows.map(({ i: I, l, v, to }) => {
            const inner = (<><I className="h-5 w-5 text-olive" /><span className="flex-1">{l}</span><span className="max-w-32 truncate text-xs text-muted-foreground">{v}</span><ChevronLeft className="h-4 w-4 text-muted-foreground" /></>);
            return <li key={l}>{to ? <Link to={to} className="flex items-center gap-3 p-4">{inner}</Link> : <div className="flex items-center gap-3 p-4">{inner}</div>}</li>;
          })}
        </ul>

        <Link to="/future" className="mt-6 flex items-center gap-3 rounded-2xl border-2 border-dashed border-gold bg-gold/10 p-4">
          <Rocket className="h-6 w-6 text-primary" />
          <div className="flex-1"><p className="font-semibold">قادم في سُفرة</p><p className="text-xs text-muted-foreground">المدونات · الأكاديمية · استشارات الطهاة المباشرة</p></div>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </div>
    </AppShell>
  );
}
