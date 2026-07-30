import { createFileRoute, Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { DemoBanner } from "@/components/demo/DemoBanner";
import {
  LayoutDashboard,
  Users,
  Inbox,
  MessageSquare,
  Bell,
  Search,
  Settings,
  Dumbbell,
} from "lucide-react";
import {
  useMode,
  getAccountProfile,
  displayName,
  initials,
  setMode,
  clearAccountProfile,
} from "../lib/fitflow-mode";
import { useEffect } from "react";
import { useDemoStore, hydrateStudentsFromSupabase, resetAccountStore } from "../lib/demo-store";
import { RoleSwitcher } from "@/components/dev/RoleSwitcher";
import { useAuthUser, signOutTrainer } from "../lib/auth";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "FitFlow · Panel del entrenador" },
      { name: "description", content: "Panel de gestión de alumnos, entrenamientos y nutrición." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DemoLayout,
});

type NavItem = {
  to: "/demo" | "/demo/alumnos" | "/demo/bandeja" | "/demo/chat" | "/demo/configuracion";
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  badge?: number;
};

function DemoLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const mode = useMode();
  const isDemo = mode === "demo";
  const students = useDemoStore((s) => s.students);
  const messagesMap = useDemoStore((s) => s.messages);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthUser();

  // En modo "cuenta real" (no demo), exige sesión iniciada y carga los
  // alumnos guardados en Supabase. La demo de marketing no necesita login.
  useEffect(() => {
    if (isDemo) return;
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/iniciar-sesion" });
      return;
    }
    hydrateStudentsFromSupabase();
  }, [isDemo, authLoading, user, navigate]);

  // En modo "cuenta real" (no demo), carga los alumnos guardados en Supabase.
  useEffect(() => {
    if (!isDemo) {
      hydrateStudentsFromSupabase();
    }
  }, [isDemo]);
  const pendingMessages = Object.values(messagesMap).reduce((n, list) => n + list.length, 0);
  const profile = getAccountProfile();

  const nav: NavItem[] = [
    { to: "/demo", label: "Inicio", icon: LayoutDashboard, exact: true },
    { to: "/demo/alumnos", label: "Alumnos", icon: Users },
    {
      to: "/demo/bandeja",
      label: "Tu trabajo de hoy",
      icon: Inbox,
      badge: isDemo ? 8 : undefined,
    },
    {
      to: "/demo/chat",
      label: "Mensajes",
      icon: MessageSquare,
      badge: isDemo ? 4 : pendingMessages || undefined,
    },
    { to: "/demo/configuracion", label: "Configuración", icon: Settings },
  ];

  const coachName = isDemo ? "Carlos Ruiz" : displayName(profile);
  const coachSub = isDemo ? "Coach · Plan Pro" : profile?.businessName || "Cuenta nueva";
  const coachInitials = isDemo ? "CR" : initials(profile);

  const exitToLanding = () => {
    if (typeof window !== "undefined") {
      if (!isDemo) {
        signOutTrainer();
        // Evita que queden alumnos/rutinas/mensajes de esta cuenta visibles
        // si otra persona (u otra cuenta) usa este mismo navegador después.
        resetAccountStore();
        clearAccountProfile();
      }
      // Reset mode to demo default when leaving so landing behaves as expected.
      setMode("demo");
      window.location.href = "/";
    }
  };

  // Evita mostrar el panel con datos vacíos mientras comprobamos la sesión
  // o redirigimos a /iniciar-sesion.
  if (!isDemo && (authLoading || !user)) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface text-sm text-ink-muted">
        Comprobando sesión…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-surface">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-background md:flex">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-foreground text-background">
            <Dumbbell className="h-4 w-4" />
          </div>
          <div className="text-sm font-semibold">FitFlow</div>
          {isDemo ? (
            <span className="ml-auto rounded-md bg-brand-muted px-1.5 py-0.5 text-[10px] font-medium text-brand">
              DEMO
            </span>
          ) : (
            <span className="ml-auto rounded-md bg-surface px-1.5 py-0.5 text-[10px] font-medium text-ink-muted">
              {profile?.plan ? profile.plan.toUpperCase() : "CUENTA"}
            </span>
          )}
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
            {isDemo ? (
              <img src="https://i.pravatar.cc/64?img=68" alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground text-[11px] font-semibold text-background">
                {coachInitials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{coachName}</div>
              <div className="truncate text-xs text-ink-muted">{coachSub}</div>
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
              placeholder={
                students.length === 0
                  ? "Aún no hay nada que buscar…"
                  : "Buscar alumno, ejercicio, comida…"
              }
              className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm outline-none placeholder:text-ink-muted focus:border-foreground/20"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <RoleSwitcher />
            <button
              onClick={exitToLanding}
              className="hidden rounded-md px-2.5 py-1.5 text-xs text-ink-muted hover:bg-surface hover:text-foreground md:inline-flex"
            >
              {isDemo ? "Salir de la demo" : "Cerrar sesión"}
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-lg text-ink-muted hover:bg-surface">
              <Bell className="h-4 w-4" />
            </button>
            {isDemo ? (
              <img src="https://i.pravatar.cc/64?img=68" alt="" className="h-8 w-8 rounded-full object-cover md:hidden" />
            ) : (
              <div className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-[11px] font-semibold text-background md:hidden">
                {coachInitials}
              </div>
            )}
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
