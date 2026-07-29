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
import { useDemoStore, parseSetsCount, type RoutineDay, type RoutineWeek, type ChatMsg } from "@/lib/demo-store";
import { useActiveAlumnoId, getAccountProfile, displayName } from "@/lib/fitflow-mode";

const EMPTY_MESSAGES: ChatMsg[] = [];

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
  "✅ Tu entrenador ya te preparó el día.",
];

function pickNextDay(weeks: RoutineWeek[] | undefined): { week: RoutineWeek; day: RoutineDay } | null {
  if (!weeks) return null;
  for (const w of weeks) {
    for (const d of w.days) {
      if (!d.done && d.exercises.length > 0) return { week: w, day: d };
    }
  }
  return null;
}

function AlumnoInicio() {
  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const activeId = useActiveAlumnoId();
  const students = useDemoStore((s) => s.students);
  const studentId = activeId ?? students[0]?.id ?? null;
  const student = useDemoStore((s) =>
    studentId ? s.students.find((x) => x.id === studentId) : undefined,
  );
  const weeks = useDemoStore((s) => (studentId ? s.routines[studentId] : undefined));
  const messages = useDemoStore((s) => (studentId ? s.messages[studentId] : undefined)) ?? EMPTY_MESSAGES;

  const next = pickNextDay(weeks);
  const coachName = displayName(getAccountProfile());
  const firstName = student?.name.split(" ")[0] ?? "Alumno";
  const initials = firstName[0]?.toUpperCase() ?? "A";
  const motivator = motivators[Math.floor(Math.random() * motivators.length)];
  const unreadMessages = messages.filter((m) => m.from === "coach").length;

  const totalSets = next ? next.day.exercises.reduce((a, e) => a + parseSetsCount(e.sets), 0) : 0;
  const estMinutes = Math.max(15, Math.round((totalSets * 2.5) / 5) * 5);

  const pendingTasks = [
    { id: 1, label: "Registrar peso", done: false },
    { id: 2, label: "Subir foto semanal", done: false },
  ];

  const startWeight = student?.weightStart ?? 0;
  const goalWeight = student?.weightGoal ?? 0;
  const currentWeight = student?.weight ?? 0;
  const totalDelta = Math.abs(goalWeight - startWeight);
  const doneDelta = Math.abs(currentWeight - startWeight);
  const goalPct = totalDelta === 0 ? 0 : Math.min(100, Math.round((doneDelta / totalDelta) * 100));
  const remaining = Math.abs(goalWeight - currentWeight).toFixed(1).replace(".", ",");

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* Header */}
      <header className="flex items-start justify-between pt-2">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-ink-muted">
            {today}
          </div>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">Hola, {firstName} 👋</h1>
          <p className="mt-1 text-sm text-ink-muted">{motivator}</p>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-foreground text-sm font-semibold text-background">
          {initials}
        </div>
      </header>

      {/* Entrenamiento de hoy */}
      {next ? (
        <section className="relative overflow-hidden rounded-3xl bg-foreground p-5 text-background shadow-card">
          <div className="flex items-center gap-2 text-xs font-medium text-background/70">
            <Flame className="h-3.5 w-3.5" /> ENTRENAMIENTO DE HOY
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-full bg-background/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-background/90">
              {next.week.week}
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-semibold leading-tight">{next.day.day}</h2>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-background/70">
            <span>{next.day.exercises.length} ejercicios</span>
            <span>~{estMinutes} min</span>
            <span>Con {coachName.split(" ")[0]}</span>
          </div>
          <Link
            to="/alumno/entrenamiento"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-transform active:scale-95"
          >
            <Play className="h-4 w-4 fill-current" />
            Empezar entrenamiento
          </Link>
          <div className="pointer-events-none absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-brand/20 blur-2xl" />
        </section>
      ) : weeks && weeks.length > 0 ? (
        <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-5 text-foreground">
          <div className="flex items-center gap-2 text-xs font-medium text-ink-muted">
            <Moon className="h-3.5 w-3.5" /> DÍA DE DESCANSO
          </div>
          <h2 className="mt-2 text-xl font-semibold leading-tight">¡Rutina completada!</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Has terminado todas las sesiones de esta rutina. {coachName.split(" ")[0]} preparará la próxima pronto.
          </p>
        </section>
      ) : (
        <section className="relative overflow-hidden rounded-3xl border border-dashed border-border bg-surface p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-ink-muted">
            <Dumbbell className="h-3.5 w-3.5" /> SIN RUTINA
          </div>
          <h2 className="mt-2 text-xl font-semibold leading-tight">
            Aún no tienes rutina asignada
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            {coachName} está preparando tu entrenamiento. Aparecerá aquí en cuanto lo asigne.
          </p>
        </section>
      )}

      {/* Objetivo principal */}
      {student && startWeight > 0 && goalWeight > 0 && (
        <section className="rounded-3xl border border-border bg-background p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
              <Target className="h-3.5 w-3.5" /> Objetivo
            </div>
            <span className="text-xs font-medium text-brand">{student.goal}</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold">
              {String(currentWeight).replace(".", ",")}
            </span>
            <span className="text-sm text-ink-muted">kg</span>
            <ArrowRight className="h-4 w-4 text-ink-muted" />
            <span className="text-2xl font-semibold">
              {String(goalWeight).replace(".", ",")}
            </span>
            <span className="text-sm text-ink-muted">kg</span>
          </div>
          <div className="mt-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${goalPct}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{goalPct} % completado</span>
              <span className="text-ink-muted">Quedan {remaining} kg</span>
            </div>
          </div>
        </section>
      )}

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
          value={currentWeight ? `${String(currentWeight).replace(".", ",")} kg` : "—"}
          hint="Registra el nuevo"
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
          <div className="truncate text-sm font-medium">Mensajes de {coachName.split(" ")[0]}</div>
          <div className="truncate text-xs text-ink-muted">
            {unreadMessages > 0
              ? `${unreadMessages} mensajes de tu entrenador`
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
