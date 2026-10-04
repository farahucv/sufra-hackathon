import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Apple, CreditCard, Banknote, Check, Lock, MapPin, Clock, PackageOpen } from "lucide-react";
import { toast } from "sonner";
import { AppShell, DemoBadge, EmptyState, TopBar } from "@/components/AppShell";
import { getRecipe, sar } from "@/lib/data";
import { DELIVERY_FEE, addresses, buildBox, payments, slots } from "@/lib/box";
import { setStore, useStore } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "مراجعة الطلب — سُفرة" },
      { name: "description", content: "راجع صندوق الوصفة، اختر العنوان ووقت التوصيل وطريقة الدفع (دفع تجريبي)." },
      { property: "og:title", content: "مراجعة الطلب — سُفرة" },
      { property: "og:description", content: "إتمام طلب صندوق جاهز للطبخ — نموذج تجريبي." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Checkout,
});

const payIcon = { apple: Apple, card: CreditCard, cash: Banknote } as const;

function Checkout() {
  const s = useStore();
  const nav = useNavigate();
  const [address, setAddress] = useState("home");
  const [slot, setSlot] = useState("asap");
  const [pay, setPay] = useState("apple");
  const [busy, setBusy] = useState(false);
  const r = s.box ? getRecipe(s.box.recipeId) : undefined;

  if (!s.box || !r) {
    return (
      <AppShell><TopBar title="مراجعة الطلب" />
        <div className="px-5"><EmptyState icon={<PackageOpen className="h-6 w-6" />} title="لا يوجد صندوق في السلة" body="اختر وصفة واطلب صندوقها الجاهز للطبخ." action={<Link to="/box/$id" params={{ id: "kabsa" }} className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground">جرّب صندوق الكبسة</Link>} /></div>
      </AppShell>
    );
  }
  const box = buildBox(r, s.box.serv, s.box.subs);
  const total = box.subtotal + DELIVERY_FEE;
  const swapped = box.lines.filter((l) => l.swapped);

  const confirm = () => {
    if (busy) return;
    setBusy(true);
    setStore((st) => ({
      order: { ...st.box!, id: `SF-${Math.floor(1000 + Math.random() * 9000)}`, address, slot, pay, total, stage: 0, placedAt: Date.now() },
      journey: st.journey === 3 || st.journey === 4 ? 4 : st.journey,
    }));
    toast.success("تم تأكيد الطلب", { description: "طلب تجريبي — لم يتم خصم أي مبلغ." });
    nav({ to: "/order" });
  };

  return (
    <AppShell wide>
      <TopBar title="راجع صندوقك" sub="Review your box" action={<DemoBadge label="Prototype checkout" />} />
      <div className="space-y-6 px-5 pb-10 lg:grid lg:grid-cols-[1fr_340px] lg:gap-8 lg:space-y-0 lg:px-8">
        <div className="space-y-6">
          <section className="flex items-center gap-4">
            <img src={r.img} alt={r.title} className="h-20 w-20 shrink-0 rounded-xl object-cover" width={80} height={80} />
            <div className="min-w-0 text-sm">
              <p className="font-display text-xl">صندوق {r.title}</p>
              <p className="text-muted-foreground">{s.box.serv} حصص · {box.lines.length} مكونات</p>
              <Link to="/box/$id" params={{ id: r.id }} className="mt-2 inline-block text-xs text-primary underline">تعديل الصندوق</Link>
            </div>
          </section>

          <section>
            <p className="text-sm font-semibold">المكونات المشمولة</p>
            <div className="mt-2 flex flex-wrap gap-1.5">{box.lines.map((l) => <span key={l.key} className="rounded-full bg-card px-2.5 py-1 text-xs ring-1 ring-border">{l.name} <b className="tabular-nums">{l.qty}</b></span>)}</div>
            {swapped.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">{swapped.map((l) => <span key={l.key} className="rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground">{l.swapped!.from} ← {l.name}</span>)}</div>
            )}
          </section>

          <Picker title="عنوان التوصيل" icon={<MapPin className="h-4 w-4" />} value={address} onChange={setAddress} items={addresses.map((a) => ({ id: a.id, label: a.label, sub: a.line }))} />
          <Picker title="وقت التوصيل" icon={<Clock className="h-4 w-4" />} value={slot} onChange={setSlot} items={slots} />

          <section>
            <p className="text-sm font-semibold">طريقة الدفع</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {payments.map((p) => {
                const Icon = payIcon[p.id as keyof typeof payIcon];
                return (
                  <button key={p.id} onClick={() => setPay(p.id)} aria-pressed={pay === p.id}
                    className={`press flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs ${pay === p.id ? "border-primary bg-secondary font-semibold" : "bg-card"}`}>
                    <Icon className="h-5 w-5" />{p.label}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <aside>
          <div className="space-y-3 rounded-2xl border bg-card p-5 font-mono text-sm lg:sticky lg:top-24">
            <p className="font-sans font-semibold">ملخص الطلب <span className="text-xs font-normal text-muted-foreground">· Order Summary</span></p>
            <Row l={`صندوق الوصفة · ${s.box.serv} حصص`} v={sar(box.subtotal)} />
            {swapped.length > 0 && <Row l={`بدائل آمنة (${swapped.length})`} v="مشمولة" />}
            <Row l="التوصيل" v={sar(DELIVERY_FEE)} />
            <div className="border-t border-dashed pt-3"><Row l="الإجمالي" v={sar(total)} bold /></div>
            <button onClick={confirm} disabled={busy}
              className="press mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-sans font-semibold text-primary-foreground disabled:opacity-50">
              <Check className="h-4 w-4" /> تأكيد الطلب
            </button>
            <p className="flex items-center justify-center gap-1 font-sans text-[11px] text-muted-foreground"><Lock className="h-3 w-3" /> Prototype checkout — لا يتم أي دفع فعلي</p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function Row({ l, v, bold }: { l: string; v: string; bold?: boolean }) {
  return <p className={`flex justify-between ${bold ? "text-base font-bold text-primary" : ""}`}><span className="font-sans">{l}</span><span className="tabular-nums">{v}</span></p>;
}

function Picker({ title, icon, items, value, onChange }: { title: string; icon: React.ReactNode; items: { id: string; label: string; sub: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <section>
      <p className="flex items-center gap-1.5 text-sm font-semibold">{icon}{title}</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {items.map((it) => (
          <button key={it.id} onClick={() => onChange(it.id)} aria-pressed={value === it.id}
            className={`press min-w-0 rounded-xl border p-2.5 text-start ${value === it.id ? "border-primary bg-secondary" : "bg-card"}`}>
            <p className="truncate text-sm font-semibold">{it.label}</p><p className="truncate text-[11px] text-muted-foreground">{it.sub}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
