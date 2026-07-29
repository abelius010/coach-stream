import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Dumbbell,
  Calendar,
  Scale,
  MessageCircle,
  ChevronRight,
  Flame,
  Play,
} from "lucide-react";

export const Route = createFileRoute("/alumno/")({
  head: () => ({
    meta: [
      { title: "Inicio · FitFlow Alumno" },
      { name: "description", content: "Resumen de tu día: entrenamiento, revisión y progreso." },
    ],
  }),
  component: AlumnoInicio,
});

function AlumnoInicio() {
  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* Header */}
      <header className="flex items-center justify-between pt-2">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-ink-muted">
            {today}
          </div>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">Hola, Alex 👋</h1>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-full bg-foreground text-sm font-semibold text-background">
          A
        </div>
      </header>

      {/* Hero card: entrenamiento de hoy */}
      <section className="relative overflow-hidden rounded-3xl bg-foreground p-5 text-background shadow-card">
        <div className="flex items-center gap-2 text-xs font-medium text-background/70">
          <Flame className="h-3.5 w-3.5" /> ENTRENAMIENTO DE HOY
        </div>
        <h2 className="mt-2 text-xl font-semibold leading-tight">Push · Pecho y hombros</h2>
        <div className="mt-1 text-sm text-background/70">6 ejercicios · ~55 min</div>
        <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 text-sm font-semibold text-foreground">
          <Play className="h-4 w-4 fill-current" />
          Empezar sesión
        </button>
        <div className="pointer-events-none absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-brand/20 blur-2xl" />
      </section>

      {/* Grid rápido */}
      <section className="grid grid-cols-2 gap-3">
        <QuickCard
          icon={<Calendar className="h-4 w-4" />}
          label="Próxima revisión"
          value="Domingo"
          hint="En 3 días"
        />
        <QuickCard
          icon={<Scale className="h-4 w-4" />}
          label="Último peso"
          value="78,4 kg"
          hint="-0,3 esta semana"
        />
      </section>

      {/* Accesos */}
      <section className="space-y-2">
        <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Accesos rápidos
        </h3>
        <RowLink
          to="/alumno/chat"
          icon={<MessageCircle className="h-5 w-5" />}
          title="Mensajes con tu entrenador"
          hint="2 mensajes nuevos"
        />
        <RowLink
          to="/alumno/entrenamiento"
          icon={<Dumbbell className="h-5 w-5" />}
          title="Mi plan de entrenamiento"
          hint="Semana 4 de 8"
        />
      </section>
    </div>
  );
}

function QuickCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-center gap-1.5 text-xs text-ink-muted">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-lg font-semibold">{value}</div>
      <div className="text-xs text-ink-muted">{hint}</div>
    </div>
  );
}

function RowLink({
  to,
  icon,
  title,
  hint,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4 transition-colors hover:bg-surface"
    >
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-muted text-brand">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{title}</div>
        <div className="truncate text-xs text-ink-muted">{hint}</div>
      </div>
      <ChevronRight className="h-4 w-4 text-ink-muted" />
    </Link>
  );
}
