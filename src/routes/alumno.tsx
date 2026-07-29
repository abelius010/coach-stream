import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { Home, Dumbbell, Salad, MessageCircle, User } from "lucide-react";
import { RoleSwitcher } from "@/components/dev/RoleSwitcher";

export const Route = createFileRoute("/alumno")({
  head: () => ({
    meta: [
      { title: "FitFlow · Panel del alumno" },
      { name: "description", content: "Tu entrenamiento, nutrición y progreso en un solo lugar." },
      { name: "robots", content: "noindex" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
    ],
  }),
  component: AlumnoLayout,
});

type NavItem = {
  to: "/alumno" | "/alumno/entrenamiento" | "/alumno/nutricion" | "/alumno/chat" | "/alumno/perfil";
  label: string;
  icon: typeof Home;
  exact?: boolean;
};

const nav: NavItem[] = [
  { to: "/alumno", label: "Inicio", icon: Home, exact: true },
  { to: "/alumno/entrenamiento", label: "Entreno", icon: Dumbbell },
  { to: "/alumno/nutricion", label: "Nutrición", icon: Salad },
  { to: "/alumno/chat", label: "Chat", icon: MessageCircle },
  { to: "/alumno/perfil", label: "Perfil", icon: User },
];

function AlumnoLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-surface text-foreground">
      <div className="fixed left-1/2 top-3 z-30 -translate-x-1/2">
        <RoleSwitcher />
      </div>
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background shadow-soft">
        <main className="flex-1 pb-24">
          <Outlet />
        </main>

        {/* Bottom nav */}
        <nav
          className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="mx-auto flex w-full max-w-md items-stretch justify-between px-2 pt-1.5">
            {nav.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[10px] font-medium transition-colors ${
                    active ? "text-foreground" : "text-ink-muted"
                  }`}
                >
                  <span
                    className={`grid h-8 w-12 place-items-center rounded-lg transition-colors ${
                      active ? "bg-brand-muted text-brand" : ""
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
