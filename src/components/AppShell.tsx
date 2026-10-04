import { Link } from "@tanstack/react-router";
import { Home, Compass, Refrigerator, ShoppingBasket, User, ChevronRight, ChevronLeft, Link2, Cloud } from "lucide-react";
import type { ReactNode } from "react";
import { useStore, useTr } from "@/lib/store";

export function Wordmark({ size = "md", tone = "default" }: { size?: "sm" | "md" | "lg"; tone?: "default" | "light" }) {
  const s = { sm: "text-xl", md: "text-2xl", lg: "text-5xl" }[size];
  return (
    <span className={`inline-flex items-center gap-2.5 ${tone === "light" ? "text-ink-foreground" : "text-primary"}`} aria-label="سُفرة">
      <span className={`relative grid shrink-0 place-items-center rounded-xl ${tone === "light" ? "bg-gold text-ink" : "bg-primary text-primary-foreground"} ${size === "lg" ? "h-16 w-16" : "h-9 w-9"}`} aria-hidden>
        <span className={`font-display leading-none ${size === "lg" ? "text-3xl" : "text-lg"}`}>س</span>
        <span className={`absolute -bottom-1 h-2 w-2 rotate-45 ${tone === "light" ? "bg-ink-foreground" : "bg-gold"}`} />
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-display ${s}`}>سُفرة</span>
        <span className="mt-1 text-[9px] font-medium tracking-[0.4em] opacity-60">SUFRA</span>
      </span>
    </span>
  );
}

const nav = [
  { to: "/home", ar: "الرئيسية", en: "Home", icon: Home },
  { to: "/explore", ar: "التراث", en: "Heritage", icon: Compass },
  { to: "/pantry", ar: "مخزني", en: "Pantry", icon: Refrigerator },
  { to: "/grocery", ar: "الأسعار", en: "Prices", icon: ShoppingBasket },
  { to: "/profile", ar: "حسابي", en: "Profile", icon: User },
] as const;

export function AppShell({ children, nav: showNav = true, wide = false }: { children: ReactNode; nav?: boolean; wide?: boolean }) {
  const tr = useTr();
  const s = useStore();
  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-e bg-card/60 px-5 py-8 lg:flex">
        <Link to="/home"><Wordmark /></Link>
        <p className="mt-2 text-xs text-muted-foreground">{tr("وش نطبخ اليوم؟ بذكاء.", "Smart Saudi cooking.")}</p>
        <nav className="mt-10 space-y-1">
          {nav.map(({ to, ar, en, icon: Icon }) => (
            <Link key={to} to={to} className="press flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted"
              activeProps={{ className: "bg-secondary text-primary font-semibold" }}>
              <Icon className="h-5 w-5" strokeWidth={1.8} /> {tr(ar, en)}
            </Link>
          ))}
          <Link to="/import" className="press flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted"
            activeProps={{ className: "bg-secondary text-primary font-semibold" }}>
            <Link2 className="h-5 w-5" strokeWidth={1.8} /> {tr("استيراد وصفة", "Import recipe")}
          </Link>
        </nav>
        <div className="mt-auto space-y-3">
          <Link to="/future" className="block rounded-2xl border border-dashed border-gold/60 bg-gold/10 p-3 text-xs">
            <p className="font-semibold text-primary">{tr("قادم في سُفرة", "Coming to Sufra")}</p>
            <p className="mt-0.5 text-muted-foreground">{tr("الأكاديمية · المدونات · استشارات مباشرة", "Academy · Blogs · Live chefs")}</p>
          </Link>
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Cloud className={`h-3.5 w-3.5 ${s.synced ? "text-olive" : ""}`} /> {s.synced ? tr("ملفك التجريبي محفوظ", "Demo profile saved") : tr("جارِ الحفظ…", "Saving…")}
          </p>
        </div>
      </aside>

      <main className={`mx-auto w-full min-w-0 flex-1 ${wide ? "lg:max-w-5xl" : "max-w-md lg:max-w-3xl"} ${showNav ? "pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-10" : ""}`}>
        {children}
      </main>

      {showNav && (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-card px-2 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 lg:hidden">
          <ul className="mx-auto grid max-w-md grid-cols-5">
            {nav.map(({ to, ar, en, icon: Icon }) => (
              <li key={to}>
                <Link to={to} className="press flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] text-muted-foreground"
                  activeProps={{ className: "text-primary font-semibold" }}>
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                  {tr(ar, en)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

export function TopBar({ title, sub, back = true, action }: { title: string; sub?: string; back?: boolean; action?: ReactNode }) {
  const lang = useStore().lang;
  const Back = lang === "ar" ? ChevronRight : ChevronLeft;
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 bg-background/95 px-5 pb-3 pt-6 lg:px-8 lg:pt-10">
      {back && (
        <button onClick={() => history.back()} aria-label="رجوع" className="press grid h-10 w-10 shrink-0 place-items-center rounded-full bg-card shadow-soft">
          <Back className="h-5 w-5" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl lg:text-3xl">{title}</h1>
        {sub && <p className="truncate text-xs text-muted-foreground lg:text-sm">{sub}</p>}
      </div>
      {action}
    </header>
  );
}

export function DemoBadge({ label }: { label?: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gold/20 px-2.5 py-1 text-[10px] font-medium text-primary">
      <span className="h-1.5 w-1.5 rounded-full bg-gold" /> {label ?? "بيانات تجريبية"}
    </span>
  );
}

export function Chip({ active, children, onClick }: { active?: boolean; children: ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} aria-pressed={active}
      className={`press shrink-0 rounded-full border px-4 py-2 text-sm transition ${active ? "border-primary bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-muted"}`}>
      {children}
    </button>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card/60 px-6 py-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-secondary text-primary">{icon}</div>
      <p className="mt-4 font-semibold">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
