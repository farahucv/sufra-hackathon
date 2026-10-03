import { Link } from "@tanstack/react-router";
import { Home, Compass, Refrigerator, ShoppingBasket, User, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/home", label: "الرئيسية", icon: Home },
  { to: "/explore", label: "استكشف", icon: Compass },
  { to: "/pantry", label: "مطبخي", icon: Refrigerator },
  { to: "/grocery", label: "التسوّق", icon: ShoppingBasket },
  { to: "/profile", label: "حسابي", icon: User },
] as const;

export function AppShell({ children, nav: showNav = true, dark = false }: { children: ReactNode; nav?: boolean; dark?: boolean }) {
  return (
    <div className="min-h-screen bg-sand md:py-6">
      <div className={`relative mx-auto min-h-screen max-w-md overflow-hidden md:min-h-[860px] md:rounded-[2.5rem] md:shadow-soft ${dark ? "bg-ink text-ink-foreground" : "bg-background"}`}>
        <div className={showNav ? "pb-24" : ""}>{children}</div>
        {showNav && (
          <nav className="absolute inset-x-0 bottom-0 z-30 border-t bg-card/95 px-2 pb-3 pt-2 backdrop-blur">
            <ul className="grid grid-cols-5">
              {nav.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <Link to={to} className="flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] text-muted-foreground"
                    activeProps={{ className: "text-primary font-semibold" }}>
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
}

export function TopBar({ title, sub, back = true, action }: { title: string; sub?: string; back?: boolean; action?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 bg-background/90 px-5 pb-3 pt-6 backdrop-blur">
      {back && (
        <button onClick={() => history.back()} aria-label="رجوع" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-card shadow-soft">
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl">{title}</h1>
        {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </header>
  );
}

export function DemoBadge() {
  return <span className="rounded-full bg-gold/20 px-2.5 py-1 text-[10px] font-medium text-primary">بيانات تجريبية · Demo</span>;
}

export function Chip({ active, children, onClick }: { active?: boolean; children: ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${active ? "border-primary bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-muted"}`}>
      {children}
    </button>
  );
}
