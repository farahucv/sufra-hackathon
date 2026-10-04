import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, CheckCircle2, ScanLine, Loader2, Refrigerator, Snowflake, Archive, X, ShoppingCart, PackageOpen } from "lucide-react";
import { toast } from "sonner";
import { AppShell, DemoBadge, EmptyState, TopBar } from "@/components/AppShell";
import { JourneyCallout } from "@/components/Journey";
import { locations, quickAdd, recipes, type Loc } from "@/lib/data";
import { hasPantry, setStore, togglePantry, useStore, useTr } from "@/lib/store";

export const Route = createFileRoute("/pantry")({
  head: () => ({
    meta: [
      { title: "مخزني — اطبخ بالموجود | سُفرة" },
      { name: "description", content: "أضف مكونات المخزن والثلاجة والفريزر واحصل على وصفات تستخدمها فقط." },
      { property: "og:title", content: "مخزني — اطبخ بالموجود" },
      { property: "og:description", content: "وصفات من المكونات الموجودة في بيتك." },
    ],
  }),
  component: Pantry,
});

const locIcon: Record<Loc, typeof Archive> = { pantry: Archive, fridge: Refrigerator, freezer: Snowflake };

function Pantry() {
  const s = useStore();
  const tr = useTr();
  const [input, setInput] = useState("");
  const [loc, setLoc] = useState<Loc>("pantry");
  const [scanning, setScanning] = useState(false);

  const add = () => {
    const v = input.trim();
    if (!v) return;
    if (hasPantry(s, v)) toast("موجود مسبقاً في مخزنك");
    else { togglePantry(v, loc); toast.success(`أُضيف «${v}»`); }
    setInput("");
  };
  const scan = () => {
    setScanning(true);
    setTimeout(() => {
      const found = ["لحم مفروم", "جزر", "كوسا"].filter((x) => !hasPantry(s, x));
      setStore((st) => ({ pantry: [...st.pantry, ...found.map((name) => ({ name, loc: (name === "لحم مفروم" ? "freezer" : "fridge") as Loc }))] }));
      setScanning(false);
      toast.success(found.length ? `تعرّفنا على ${found.length} مكونات` : "لا مكونات جديدة", { description: "مسح تجريبي — يحاكي التعرّف بالكاميرا." });
    }, 1400);
  };

  const scored = recipes.map((r) => ({ r, miss: r.ingredients.filter((i) => !hasPantry(s, i.key)).map((i) => i.key) }));
  const ready = scored.filter((x) => x.miss.length === 0);
  const almost = scored.filter((x) => x.miss.length > 0 && x.miss.length <= 2).sort((a, b) => a.miss.length - b.miss.length);

  return (
    <AppShell wide>
      <TopBar back={false} title={tr("مخزني", "My pantry")} sub="أضف ما عندك ونقترح وصفات بالموجود فقط" action={<span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">{s.pantry.length} مكوّن</span>} />
      <JourneyCallout step={3} />
      <div className="space-y-6 px-5 lg:grid lg:grid-cols-[1fr_380px] lg:gap-8 lg:space-y-0 lg:px-8">
        <div className="space-y-5">
          <div className="rounded-3xl bg-card p-4 shadow-soft">
            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} aria-label="اسم المكون"
                placeholder="اكتب مكوّن… مثل: جزر" className="min-w-0 flex-1 rounded-2xl border bg-background px-4 py-3 outline-none transition focus:border-olive" />
              <button onClick={add} aria-label="إضافة" className="press grid w-12 place-items-center rounded-2xl bg-olive text-olive-foreground"><Plus /></button>
              <button onClick={scan} disabled={scanning} aria-label="مسح بالكاميرا" className="press relative grid w-12 place-items-center rounded-2xl border bg-background">
                {scanning ? <Loader2 className="h-5 w-5 animate-spin" /> : <ScanLine className="h-5 w-5" />}
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              {locations.map((l) => (
                <button key={l.id} onClick={() => setLoc(l.id)} className={`press rounded-full px-3 py-1 text-xs ${loc === l.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{l.ar}</button>
              ))}
              <span className="ms-auto"><DemoBadge label="المسح تجريبي" /></span>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">إضافة سريعة</p>
            <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
              {quickAdd.filter((q) => !hasPantry(s, q)).map((q) => (
                <button key={q} onClick={() => togglePantry(q)} className="press shrink-0 rounded-full border border-dashed px-3 py-1.5 text-sm hover:bg-muted">+ {q}</button>
              ))}
            </div>
          </div>

          {s.pantry.length === 0 ? (
            <EmptyState icon={<PackageOpen className="h-6 w-6" />} title="مخزنك فاضي" body="أضف مكوناتك أو جرّب المسح السريع لنقترح عليك وصفات فوراً." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {locations.map((l) => {
                const items = s.pantry.filter((p) => p.loc === l.id);
                const Icon = locIcon[l.id];
                return (
                  <section key={l.id} className="rounded-2xl bg-card p-4">
                    <p className="flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4 text-olive" />{l.ar}<span className="text-xs font-normal text-muted-foreground">({items.length})</span></p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {items.length === 0 && <p className="text-xs text-muted-foreground">لا شيء هنا</p>}
                      {items.map((p) => (
                        <span key={p.name} className="animate-in zoom-in-95 inline-flex items-center gap-1 rounded-full bg-secondary py-1 pe-1.5 ps-3 text-sm">
                          {p.name}
                          <button onClick={() => togglePantry(p.name)} aria-label={`حذف ${p.name}`} className="grid h-5 w-5 place-items-center rounded-full hover:bg-muted"><X className="h-3 w-3" /></button>
                        </span>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="flex items-center gap-2 text-lg"><CheckCircle2 className="h-5 w-5 text-olive" /> يمكنك طبخها الآن <span className="text-sm text-muted-foreground">({ready.length})</span></h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {ready.length === 0 && <p className="col-span-2 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">لا توجد وصفة مكتملة بعد — أضف مكوّناً أو اثنين من القائمة التالية.</p>}
              {ready.map(({ r }) => (
                <Link key={r.id} to="/recipe/$id" params={{ id: r.id }} className="lift overflow-hidden rounded-2xl bg-card shadow-soft">
                  <img src={r.img} alt={r.title} className="h-28 w-full object-cover" loading="lazy" />
                  <div className="p-3"><p className="font-semibold">{r.title}</p><p className="text-xs text-olive">١٠٠٪ من مخزنك · {r.time} د</p></div>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg">ينقصك عنصر أو عنصران</h2>
            <ul className="mt-3 space-y-2">
              {almost.length === 0 && <li className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">لا اقتراحات قريبة حالياً.</li>}
              {almost.map(({ r, miss }) => (
                <li key={r.id} className="flex items-center gap-3 rounded-2xl bg-card p-3">
                  <Link to="/recipe/$id" params={{ id: r.id }}><img src={r.img} alt={r.title} className="h-14 w-14 rounded-xl object-cover" loading="lazy" /></Link>
                  <div className="min-w-0 flex-1">
                    <Link to="/recipe/$id" params={{ id: r.id }} className="font-semibold">{r.title}</Link>
                    <p className="truncate text-xs text-terracotta">ينقص: {miss.join("، ")}</p>
                  </div>
                  <Link to="/grocery" search={{ recipe: r.id }} className="press inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                    <ShoppingCart className="h-3.5 w-3.5" /> اشترِ الناقص
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
