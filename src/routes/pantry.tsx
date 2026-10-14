import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, CheckCircle2, ScanLine, Loader2, Refrigerator, Snowflake, Archive, X, ShoppingCart, PackageOpen, Trash2 } from "lucide-react";
import { ConfirmAction } from "@/components/ConfirmAction";
import { toast } from "sonner";
import { AppShell, DemoBadge, EmptyState, TopBar } from "@/components/AppShell";
import { locations, quickAdd, type Loc } from "@/lib/data";
import { allRecipes, hasPantry, setStore, togglePantry, useStore, useTr } from "@/lib/store";
import { list, t } from "@/lib/i18n";

export const Route = createFileRoute("/pantry")({
  head: () => ({
    meta: [
      { title: "ثلاجتي — اطبخ بالموجود | سُفرة" },
      { name: "description", content: "أضف ما في ثلاجتك وفريزرك ورف المؤونة واحصل على وصفات تستخدمها فقط." },
      { property: "og:title", content: "ثلاجتي — اطبخ بالموجود" },
      { property: "og:description", content: "وصفات من المكونات الموجودة في بيتك." },
    ],
  }),
  component: Pantry,
});

const locIcon: Record<Loc, typeof Archive> = { pantry: Archive, fridge: Refrigerator, freezer: Snowflake };

function Pantry() {
  const s = useStore();
  const [input, setInput] = useState("");
  const [loc, setLoc] = useState<Loc>("pantry");
  const [scanning, setScanning] = useState(false);

  const add = () => {
    const v = input.trim();
    if (!v) return;
    if (hasPantry(s, v)) toast(t("موجود مسبقاً في ثلاجتك"));
    else { togglePantry(v, loc); toast.success(t("أُضيف «{x}»", { x: t(v) })); }
    setInput("");
  };
  const scan = () => {
    setScanning(true);
    setTimeout(() => {
      const found = ["لحم مفروم", "جزر", "كوسا"].filter((x) => !hasPantry(s, x));
      setStore((st) => ({ pantry: [...st.pantry, ...found.map((name) => ({ name, loc: (name === "لحم مفروم" ? "freezer" : "fridge") as Loc }))] }));
      setScanning(false);
      toast.success(found.length ? t("تعرّفنا على {n} مكونات", { n: found.length }) : t("لا مكونات جديدة"), { description: t("مسح تجريبي — يحاكي التعرّف بالكاميرا.") });
    }, 600);
  };

  const scored = allRecipes(s).map((r) => ({ r, miss: r.ingredients.filter((i) => !hasPantry(s, i.key)).map((i) => i.key) }));
  const ready = scored.filter((x) => x.miss.length === 0);
  const almost = scored.filter((x) => x.miss.length > 0 && x.miss.length <= 2).sort((a, b) => a.miss.length - b.miss.length);

  return (
    <AppShell wide>
      <TopBar back={false} title={t("ثلاجتي")} sub={t("أضف ما عندك ونقترح وصفات بالموجود فقط")} action={<span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">{s.pantry.length} {t("مكوّن")}</span>} />
      <div className="space-y-6 px-5 lg:grid lg:grid-cols-[1fr_380px] lg:gap-8 lg:space-y-0 lg:px-8">
        <div className="space-y-5">
          <div className="rounded-2xl bg-card p-4 shadow-soft">
            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} aria-label={t("اسم المكون")}
                placeholder={t("اكتب مكوّن… مثل: جزر")} className="min-w-0 flex-1 rounded-2xl border bg-background px-4 py-3 outline-none transition focus:border-olive" />
              <button onClick={add} aria-label={t("إضافة")} className="press grid w-12 place-items-center rounded-2xl bg-olive text-olive-foreground"><Plus /></button>
              <button onClick={scan} disabled={scanning} aria-label={t("مسح بالكاميرا")} className="press relative grid w-12 place-items-center rounded-2xl border bg-background">
                {scanning ? <Loader2 className="h-5 w-5 animate-spin" /> : <ScanLine className="h-5 w-5" />}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {locations.map((l) => (
                <button key={l.id} onClick={() => setLoc(l.id)} className={`press rounded-full px-3 py-1 text-xs ${loc === l.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{t(l.ar)}</button>
              ))}
              <span className="ms-auto"><DemoBadge label={t("المسح تجريبي")} /></span>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{t("إضافة سريعة")}</p>
            <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
              {quickAdd.filter((q) => !hasPantry(s, q)).map((q) => (
                <button key={q} onClick={() => togglePantry(q)} className="press shrink-0 rounded-full border border-dashed px-3 py-1.5 text-sm hover:bg-muted">+ {t(q)}</button>
              ))}
            </div>
          </div>

          {s.pantry.length > 0 && (
            <div className="flex justify-end">
              <ConfirmAction
                trigger={<button className="press inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs text-terracotta"><Trash2 className="h-3.5 w-3.5" />{t("تفريغ الثلاجة")}</button>}
                title={t("تفريغ الثلاجة؟")} body={t("سنحذف كل المكونات ({n}) من الثلاجة والفريزر ورف المؤونة.", { n: s.pantry.length })} confirm={t("تفريغ")}
                onConfirm={() => { setStore(() => ({ pantry: [] })); toast.success(t("فُرّغت الثلاجة")); }} />
            </div>
          )}
          {s.pantry.length === 0 ? (
            <EmptyState icon={<PackageOpen className="h-6 w-6" />} title={t("ثلاجتك فاضية")} body={t("أضف مكوناتك أو جرّب المسح السريع لنقترح عليك وصفات فوراً.")} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {locations.map((l) => {
                const items = s.pantry.filter((p) => p.loc === l.id);
                const Icon = locIcon[l.id];
                return (
                  <section key={l.id} className="rounded-2xl bg-card p-4">
                    <p className="flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4 text-olive" />{t(l.ar)}<span className="text-xs font-normal text-muted-foreground">({items.length})</span></p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {items.length === 0 && <p className="text-xs text-muted-foreground">{t("لا شيء هنا")}</p>}
                      {items.map((p) => (
                        <span key={p.name} className="animate-in zoom-in-95 inline-flex items-center gap-1 rounded-full bg-secondary py-1 pe-1.5 ps-3 text-sm">
                          {t(p.name)}
                          <button onClick={() => togglePantry(p.name)} aria-label={t("حذف {x}", { x: t(p.name) })} className="grid h-5 w-5 place-items-center rounded-full hover:bg-muted"><X className="h-3 w-3" /></button>
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
            <h2 className="flex items-center gap-2 text-lg"><CheckCircle2 className="h-5 w-5 text-olive" /> {t("يمكنك طبخها الآن")} <span className="text-sm text-muted-foreground">({ready.length})</span></h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {ready.length === 0 && <p className="col-span-2 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">{t("لا توجد وصفة مكتملة بعد — أضف مكوّناً أو اثنين من القائمة التالية.")}</p>}
              {ready.map(({ r }) => (
                <Link key={r.id} to="/recipe/$id" params={{ id: r.id }} className="lift overflow-hidden rounded-2xl bg-card shadow-soft">
                  <img src={r.img} alt={t(r.title)} className="h-28 w-full object-cover" loading="lazy" />
                  <div className="p-3"><p className="font-semibold">{t(r.title)}</p><p className="text-xs text-olive">{t("١٠٠٪ من ثلاجتك ·")} {r.time} {t("د")}</p></div>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg">{t("ينقصك عنصر أو عنصران")}</h2>
            <ul className="mt-3 space-y-2">
              {almost.length === 0 && <li className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">{t("لا اقتراحات قريبة حالياً.")}</li>}
              {almost.map(({ r, miss }) => (
                <li key={r.id} className="flex items-center gap-3 rounded-2xl bg-card p-3">
                  <Link to="/recipe/$id" params={{ id: r.id }}><img src={r.img} alt={t(r.title)} className="h-14 w-14 rounded-xl object-cover" loading="lazy" /></Link>
                  <div className="min-w-0 flex-1">
                    <Link to="/recipe/$id" params={{ id: r.id }} className="font-semibold">{t(r.title)}</Link>
                    <p className="truncate text-xs text-terracotta">{t("ينقص:")} {list(miss)}</p>
                  </div>
                  <Link to="/grocery" search={{ recipe: r.id }} className="press inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                    <ShoppingCart className="h-3.5 w-3.5" /> {t("اشترِ الناقص")}
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
