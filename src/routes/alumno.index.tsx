import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Dumbbell,
  Calendar,
  Scale,
  MessageCircle,
  ChevronRight,
  Flame,
  Play,
  Moon,
  Target,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
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

const motivators = [
  "💪 Hoy toca darlo todo.",
  "🔥 Vamos a por otro entrenamiento.",
  "🚀 Sigue así, vas por buen camino.",
  "✅ Hoy tienes entrenamiento.",
];

function AlumnoInicio() {
  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Simulated daily state. In the future this will come from the real backend/store.
  const hasWorkout = true;
  const motivator = motivators[Math.floor(Math.random() * motivators.length)];
  const unreadMessages = 2;
  const pendingTasks = [
    { id: 1, label: "Registrar peso", done: false },
    { id: 2, label: "Subir foto semanal", done: false },
  ];

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* Header */}
      <header className="flex items-start justify-between pt-2">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-ink-muted">
            {today}
          </div>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">Hola, Alex 👋</h1>
          <p className="mt-1 text-sm text-ink-muted">{motivator}</p>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-foreground text-sm font-semibold text-background">
          A
        </div>
      </header>

      {/* Entrenamiento de hoy */}
      {hasWorkout ? (
        <section className="relative overflow-hidden rounded-3xl bg-foreground p-5 text-background shadow-card">
          <div className="flex items-center gap-2 text-xs font-medium text-background/70">
            <Flame className="h-3.5 w-3.5" /> ENTRENAMIENTO DE HOY
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-full bg-background/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-background/90">
              Push
            </span>
            <span className="text-xs text-background/70">Pecho y hombros</span>
          </div>
          <h2 className="mt-2 text-2xl font-semibold leading-tight">Push · Pecho y hombros</h2>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-background/70">
            <span>6 ejercicios</span>
            <span>~55 min</span>
            <span>Con Carlos</span>
          </div>
          <button className="mt-5 inline-flex items-center gap-2 rounded-full bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-transform active:scale-95">
            <Play className="h-4 w-4 fill-current" />
            Empezar entrenamiento
          </button>
          <div className="pointer-events-none absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-brand/20 blur-2xl" />
        </section>
      ) : (
        <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-5 text-foreground">
          <div className="flex items-center gap-2 text-xs font-medium text-ink-muted">
            <Moon className="h-3.5 w-3.5" /> DÍA DE DESCANSO
          </div>
          <h2 className="mt-2 text-xl font-semibold leading-tight">Hoy toca descansar</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Recupera bien. Tu próxima sesión será el lunes: Pull · Espalda y bíceps.
          </p>
        </section>
      )}

      {/* Objetivo principal */}
      <section className="rounded-3xl border border-border bg-background p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
            <Target className="h-3.5 w-3.5" /> Objetivo
          </div>
          <span className="text-xs font-medium text-brand">Perder grasa</span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-semibold">78,4</span>
          <span className="text-sm text-ink-muted">kg</span>
          <ArrowRight className="h-4 w-4 text-ink-muted" />
          <span className="text-2xl font-semibold">74,0</span>
          <span className="text-sm text-ink-muted">kg</span>
        </div>
        <div className="mt-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: "75%" }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">75 % completado</span>
            <span className="text-ink-muted">Quedan 4,4 kg</span>
          </div>
        </div>
      </section>

      {/* Grid rápido: revisión + peso */}
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

      {/* Mensajes */}
      <Link
        to="/alumno/chat"
        className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4 transition-colors hover:bg-surface"
      >
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-muted text-brand">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">Mensajes</div>
          <div className="truncate text-xs text-ink-muted">
            {unreadMessages > 0
              ? `${unreadMessages} mensajes nuevos`
              : "No tienes mensajes nuevos"}
          </div>
        </div>
        {unreadMessages > 0 && (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[10px] font-semibold text-brand-foreground">
            {unreadMessages}
          </span>
        )}
        <ChevronRight className="h-4 w-4 shrink-0 text-ink-muted" />
      </Link>

      {/* Pendientes */}
      <section className="rounded-2xl border border-border bg-background p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
          <Clock className="h-3.5 w-3.5" /> Pendientes
        </div>
        <div className="space-y-2">
          {pendingTasks.map((task) => (
            <button
              key={task.id}
              className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-surface"
              onClick={() => {}}
            >
              {task.done ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-brand" />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-ink-muted" />
              )}
              <span className={`text-sm ${task.done ? "text-ink-muted line-through" : "text-foreground"}`}>
                {task.label}
              </span>
            </button>
          ))}
        </div>
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
