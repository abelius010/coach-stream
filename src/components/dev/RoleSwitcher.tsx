import { Link, useRouterState } from "@tanstack/react-router";
import { GraduationCap, UserCog } from "lucide-react";

/**
 * Dev-only role switcher. Lets us hop between the coach panel (/demo)
 * and the student panel (/alumno) while we build the student experience.
 * Will be removed once real auth decides the role automatically.
 */
export function RoleSwitcher({ className = "" }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAlumno = pathname.startsWith("/alumno");

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full border border-border bg-background p-0.5 text-xs ${className}`}
      title="Cambiar rol (solo desarrollo)"
    >
      <Link
        to="/demo"
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors ${
          !isAlumno ? "bg-foreground text-background" : "text-ink-muted hover:text-foreground"
        }`}
      >
        <UserCog className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Entrenador</span>
      </Link>
      <Link
        to="/alumno"
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors ${
          isAlumno ? "bg-foreground text-background" : "text-ink-muted hover:text-foreground"
        }`}
      >
        <GraduationCap className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Alumno</span>
      </Link>
    </div>
  );
}
