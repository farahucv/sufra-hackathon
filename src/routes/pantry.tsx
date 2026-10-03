import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, CheckCircle2 } from "lucide-react";
import { AppShell, Chip, TopBar } from "@/components/AppShell";
import { pantryAll, pantryMeals } from "@/lib/data";

export const Route = createFileRoute("/pantry")({
  head: () => ({
    meta: [
      { title: "مطبخي — اطبخ بالموجود | سُفرة" },
      { name: "description", content: "أضف المكونات الموجودة عندك واحصل على وصفات تستخدمها فقط." },
      { property: "og:title", content: "مطبخي — اطبخ بالموجود" },
      { property: "og:description", content: "وصفات من المكونات الموجودة في بيتك فقط." },
    ],
  }),
  component: Pantry,
});

function Pantry() {
  const [have, setHave] = useState<string[]>(["دجاج", "أرز", "بصل", "طماطم", "بهارات", "بيض"]);
  const [input, setInput] = useState("");
  const all = [...new Set([...pantryAll, ...have])];
  const toggle = (v: string) => setHave((h) => (h.includes(v) ? h.filter((x) => x !== v) : [...h, v]));
  const add = () => { const v = input.trim(); if (v && !have.includes(v)) setHave([...have, v]); setInput(""); };
  const ready = pantryMeals.filter((m) => m.needs.every((n) => have.includes(n)));
  const almost = pantryMeals.filter((m) => !ready.includes(m)).map((m) => ({ ...m, miss: m.needs.filter((n) => !have.includes(n)) })).filter((m) => m.miss.length <= 2);

  return (
    <AppShell>
      <TopBar back={false} title="مطبخي" sub="اختر ما عندك، ونقترح وصفات بالموجود فقط" />
      <div className="px-5">
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="أضف مكوّن… مثل: جزر" className="min-w-0 flex-1 rounded-2xl border bg-card px-4 py-3 outline-none focus:border-olive" />
          <button onClick={add} aria-label="إضافة" className="grid w-12 place-items-center rounded-2xl bg-olive text-olive-foreground"><Plus /></button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {all.map((p) => <Chip key={p} active={have.includes(p)} onClick={() => toggle(p)}>{p}</Chip>)}
        </div>

        <h2 className="mt-8 flex items-center gap-2 text-lg"><CheckCircle2 className="h-5 w-5 text-olive" /> جاهزة بالكامل ({ready.length})</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {ready.length === 0 && <p className="col-span-2 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">لا توجد وصفة مكتملة بعد — أضف مكونات أكثر.</p>}
          {ready.map((m) => (
            <Link key={m.title} to="/recipe/$id" params={{ id: m.id }} className="overflow-hidden rounded-2xl bg-card shadow-soft">
              <img src={m.img} alt={m.title} className="h-28 w-full object-cover" loading="lazy" />
              <div className="p-3"><p className="font-semibold">{m.title}</p><p className="text-xs text-olive">١٠٠٪ من مطبخك</p></div>
            </Link>
          ))}
        </div>

        {almost.length > 0 && (
          <>
            <h2 className="mt-8 text-lg">ينقصك مكوّن أو اثنين</h2>
            <ul className="mt-3 space-y-2">
              {almost.map((m) => (
                <li key={m.title} className="flex items-center gap-3 rounded-2xl bg-card p-3">
                  <img src={m.img} alt={m.title} className="h-14 w-14 rounded-xl object-cover" loading="lazy" />
                  <div className="min-w-0 flex-1"><p className="font-semibold">{m.title}</p><p className="truncate text-xs text-muted-foreground">ينقص: {m.miss.join("، ")}</p></div>
                  <Link to="/grocery" className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium">اشترِ</Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </AppShell>
  );
}
