import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { DemoBanner } from "@/components/demo/DemoBanner";
import {
  LayoutDashboard,
  Users,
  Inbox,
  MessageSquare,
  Bell,
  Search,
  Settings,
  LogOut,
  Dumbbell,
} from "lucide-react";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "FitFlow · Demo interactiva" },
      { name: "description", content: "Explora FitFlow como si ya llevaras meses usándolo." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DemoLayout,
});

const nav = [
  { to: "/demo", label: "Inicio", icon: LayoutDashboard, exact: true },
  { to: "/demo/alumnos", label: "Alumnos", icon: Users },
  { to: "/demo/bandeja", label: "Tu trabajo de hoy", icon: Inbox, badge: 8 },
  { to: "/demo/chat", label: "Mensajes", icon: MessageSquare, badge: 4 },
];

function DemoLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen w-full bg-surface">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-background md:flex">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-foreground text-background">
            <Dumbbell className="h-4 w-4" />
          </div>
          <div className="text-sm font-semibold">FitFlow</div>
          <span className="ml-auto rounded-md bg-brand-muted px-1.5 py-0.5 text-[10px] font-medium text-brand">DEMO</span>
        </div>
        <nav className="flex-1 space-y-0.5 p-2">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                  active ? "bg-surface font-medium text-foreground" : "text-ink-muted hover:bg-surface hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-medium text-background">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
            <img src="https://i.pravatar.cc/64?img=68" alt="" className="h-8 w-8 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">Carlos Ruiz</div>
              <div className="truncate text-xs text-ink-muted">Coach · Plan Pro</div>
            </div>
            <button className="rounded-md p-1 text-ink-muted hover:bg-surface hover:text-foreground">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              placeholder="Buscar alumno, ejercicio, comida…"
              className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm outline-none placeholder:text-ink-muted focus:border-foreground/20"
            />
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Link
              to="/"
              className="hidden rounded-md px-2.5 py-1.5 text-xs text-ink-muted hover:bg-surface hover:text-foreground md:inline-flex"
            >
              Salir de la demo
            </Link>
            <button className="grid h-9 w-9 place-items-center rounded-lg text-ink-muted hover:bg-surface">
              <Bell className="h-4 w-4" />
            </button>
            <img src="https://i.pravatar.cc/64?img=68" alt="" className="h-8 w-8 rounded-full object-cover md:hidden" />
          </div>
        </header>
        {/* Mobile tabs */}
        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-background px-2 py-2 md:hidden">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs ${
                  active ? "bg-surface font-medium" : "text-ink-muted"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <main className="flex-1 bg-surface">
          <DemoBanner />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
