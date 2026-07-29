import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Dumbbell,
  Check,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import {
  useDemoStore,
  parseSetsCount,
  type RoutineDay,
  type RoutineWeek,
} from "@/lib/demo-store";
import { useActiveAlumnoId } from "@/lib/fitflow-mode";
import { getAccountProfile, displayName } from "@/lib/fitflow-mode";

export const Route = createFileRoute("/alumno/entrenamiento")({
  head: () => ({
    meta: [
      { title: "Entrenamiento · FitFlow Alumno" },
      { name: "description", content: "Tu plan de entrenamiento asignado por tu entrenador." },
    ],
  }),
  component: AlumnoEntrenamiento,
});

function AlumnoEntrenamiento() {
  const activeId = useActiveAlumnoId();
  const students = useDemoStore((s) => s.students);
  const studentId = activeId ?? students[0]?.id ?? null;
  const student = useDemoStore((s) =>
    studentId ? s.students.find((x) => x.id === studentId) : undefined,
  );
  const weeks = useDemoStore((s) => (studentId ? s.routines[studentId] : undefined));
  const progress = useDemoStore((s) => (studentId ? s.workoutProgress[studentId] : undefined));
  const coachName = displayName(getAccountProfile());

  const activeDay = useMemo(() => pickActiveDay(weeks), [weeks]);

  if (!studentId || !student) {
    return (
      <EmptyState
        title="Aún no eres alumno de nadie"
        subtitle="Cuando tu entrenador te añada, aquí verás tu plan de entrenamiento."
      />
    );
  }

  if (!weeks || weeks.length === 0 || !activeDay) {
    return (
      <EmptyState
        title="Todavía no tienes rutina asignada"
        subtitle={`${coachName} está preparando tu plan de entrenamiento. Aparecerá aquí en cuanto la asigne.`}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 p-5">
      <header className="pt-2">
        <div className="text-xs font-medium uppercase tracking-wider text-ink-muted">
          {activeDay.week.week}
        </div>
        <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">{activeDay.day.day}</h1>
      </header>

      <WorkoutHeaderCard day={activeDay.day} coachName={coachName} />

      <ExerciseList
        studentId={studentId}
        day={activeDay.day}
        progress={progress?.[activeDay.day.id]}
      />

      <FinishBar studentId={studentId} day={activeDay.day} progress={progress?.[activeDay.day.id]} />

      {weeks.length > 0 && (
        <UpcomingList
          weeks={weeks}
          currentDayId={activeDay.day.id}
        />
      )}
    </div>
  );
}

function pickActiveDay(
  weeks: RoutineWeek[] | undefined,
): { week: RoutineWeek; day: RoutineDay } | null {
  if (!weeks) return null;
  for (const w of weeks) {
    for (const d of w.days) {
      if (!d.done && d.exercises.length > 0) return { week: w, day: d };
    }
  }
  const w = weeks[0];
  const d = w?.days[0];
  return w && d ? { week: w, day: d } : null;
}

function estimateMinutes(day: RoutineDay): number {
  const totalSets = day.exercises.reduce((acc, e) => acc + parseSetsCount(e.sets), 0);
  return Math.max(15, Math.round((totalSets * 2.5) / 5) * 5);
}

function parseMuscleGroup(day: string): string {
  // "Lun · Push A" → "Push A" ; "Push · Pecho y hombros" → "Pecho y hombros"
  const parts = day.split("·").map((p) => p.trim()).filter(Boolean);
  return parts[parts.length - 1] ?? day;
}

function WorkoutHeaderCard({ day, coachName }: { day: RoutineDay; coachName: string }) {
  const minutes = estimateMinutes(day);
  const group = parseMuscleGroup(day.day);
  return (
    <section className="relative overflow-hidden rounded-3xl bg-foreground p-5 text-background shadow-card">
      <div className="flex items-center gap-2 text-xs font-medium text-background/70">
        <Dumbbell className="h-3.5 w-3.5" /> ENTRENAMIENTO DE HOY
      </div>
      <h2 className="mt-2 text-2xl font-semibold leading-tight">{day.day}</h2>
      <div className="mt-1 text-sm text-background/70">{group}</div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Ejercicios" value={String(day.exercises.length)} />
        <Stat label="Duración" value={`~${minutes} min`} />
        <Stat label="Entrenador" value={coachName.split(" ")[0]} icon={<User className="h-3 w-3" />} />
      </div>
      <div className="pointer-events-none absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-brand/20 blur-2xl" />
    </section>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-background/10 px-2 py-2">
      <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-background/60">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}

function ExerciseList({
  studentId,
  day,
  progress,
}: {
  studentId: string;
  day: RoutineDay;
  progress: import("@/lib/demo-store").DayProgress | undefined;
}) {
  return (
    <section className="space-y-3">
      {day.exercises.map((ex, idx) => (
        <ExerciseCard
          key={ex.id}
          index={idx + 1}
          studentId={studentId}
          dayId={day.id}
          exercise={ex}
          progress={progress?.exercises[ex.id]}
        />
      ))}
    </section>
  );
}

function ExerciseCard({
  index,
  studentId,
  dayId,
  exercise,
  progress,
}: {
  index: number;
  studentId: string;
  dayId: string;
  exercise: import("@/lib/demo-store").RoutineExercise;
  progress: import("@/lib/demo-store").ExerciseProgress | undefined;
}) {
  const toggleSet = useDemoStore((s) => s.toggleSet);
  const setWeight = useDemoStore((s) => s.setExerciseWeight);
  const setNote = useDemoStore((s) => s.setExerciseNote);
  const [open, setOpen] = useState(false);

  const totalSets = parseSetsCount(exercise.sets);
  const doneSets = progress?.sets?.filter((s) => s.done).length ?? 0;
  const allDone = doneSets === totalSets && totalSets > 0;

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-background transition-colors ${
        allDone ? "border-brand/50" : "border-border"
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        <div
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-semibold ${
            allDone ? "bg-brand text-brand-foreground" : "bg-surface text-ink-muted"
          }`}
        >
          {allDone ? <Check className="h-4 w-4" /> : index}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <div className="truncate text-sm font-semibold">{exercise.name || "Sin nombre"}</div>
            <div className="shrink-0 text-[11px] text-ink-muted">
              {doneSets}/{totalSets}
            </div>
          </div>
          <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-ink-muted">
            <span>{totalSets} series</span>
            {exercise.reps && <span>{exercise.reps} reps</span>}
            {exercise.weight && <span>{exercise.weight}</span>}
          </div>
          {exercise.note && (
            <div className="mt-1.5 rounded-lg bg-surface px-2.5 py-1.5 text-[11px] text-ink-muted">
              💬 {exercise.note}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: totalSets }, (_, i) => {
            const done = progress?.sets?.[i]?.done ?? false;
            return (
              <button
                key={i}
                onClick={() => toggleSet(studentId, dayId, exercise.id, i, totalSets)}
                className={`h-9 min-w-9 rounded-lg border text-xs font-semibold transition-all active:scale-95 ${
                  done
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border bg-background text-ink-muted hover:bg-surface"
                }`}
              >
                {done ? <Check className="mx-auto h-4 w-4" /> : `S${i + 1}`}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="mt-3 flex w-full items-center justify-between text-[11px] font-medium text-ink-muted"
        >
          <span>Peso usado y notas</span>
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        {open && (
          <div className="mt-2 space-y-2">
            <input
              value={progress?.weightUsed ?? ""}
              onChange={(e) => setWeight(studentId, dayId, exercise.id, e.target.value)}
              placeholder={`Peso usado (recom. ${exercise.weight || "—"})`}
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-foreground/30"
            />
            <textarea
              value={progress?.note ?? ""}
              onChange={(e) => setNote(studentId, dayId, exercise.id, e.target.value)}
              placeholder="Cómo te sentiste, sensaciones…"
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-foreground/30"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function FinishBar({
  studentId,
  day,
  progress,
}: {
  studentId: string;
  day: RoutineDay;
  progress: import("@/lib/demo-store").DayProgress | undefined;
}) {
  const finishDay = useDemoStore((s) => s.finishDay);
  const resetDay = useDemoStore((s) => s.resetDayProgress);
  const totalSets = day.exercises.reduce((a, e) => a + parseSetsCount(e.sets), 0);
  const doneSets = day.exercises.reduce((a, e) => {
    const p = progress?.exercises[e.id];
    return a + (p?.sets?.filter((s) => s.done).length ?? 0);
  }, 0);
  const pct = totalSets === 0 ? 0 : Math.round((doneSets / totalSets) * 100);
  const finished = !!progress?.finishedAt || day.done;

  if (finished) {
    return (
      <section className="rounded-2xl border border-brand/40 bg-brand-muted p-4 text-center">
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-brand text-brand-foreground">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="mt-2 text-sm font-semibold">¡Entrenamiento finalizado!</div>
        <div className="text-xs text-ink-muted">
          Tu entrenador puede ver tu progreso en el panel.
        </div>
        <button
          onClick={() => resetDay(studentId, day.id)}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reiniciar sesión
        </button>
      </section>
    );
  }

  return (
    <section className="sticky bottom-24 z-10 rounded-2xl border border-border bg-background/95 p-3 shadow-card backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] text-ink-muted">
            {doneSets}/{totalSets} series completadas
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <button
          onClick={() => finishDay(studentId, day.id)}
          disabled={doneSets === 0}
          className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2.5 text-xs font-semibold text-background transition-transform active:scale-95 disabled:opacity-40"
        >
          <Check className="h-3.5 w-3.5" /> Finalizar
        </button>
      </div>
    </section>
  );
}

function UpcomingList({ weeks, currentDayId }: { weeks: RoutineWeek[]; currentDayId: string }) {
  const upcoming = weeks
    .flatMap((w) => w.days.map((d) => ({ w, d })))
    .filter((x) => x.d.id !== currentDayId)
    .slice(0, 5);
  if (upcoming.length === 0) return null;
  return (
    <section className="rounded-2xl border border-border bg-background p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
        <Clock className="h-3.5 w-3.5" /> Próximas sesiones
      </div>
      <ul className="divide-y divide-border">
        {upcoming.map(({ w, d }) => (
          <li key={d.id} className="flex items-center justify-between py-2 text-sm">
            <div className="min-w-0">
              <div className="truncate font-medium">{d.day}</div>
              <div className="text-[11px] text-ink-muted">
                {w.week} · {d.exercises.length} ejercicios
              </div>
            </div>
            {d.done ? (
              <span className="rounded-full bg-brand-muted px-2 py-0.5 text-[10px] font-medium text-brand">
                Hecho
              </span>
            ) : (
              <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] text-ink-muted">
                Pendiente
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col gap-6 p-5">
      <header className="pt-2">
        <h1 className="text-2xl font-semibold tracking-tight">Entrenamiento</h1>
      </header>
      <div className="grid place-items-center rounded-3xl border border-dashed border-border bg-surface px-6 py-16 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-background text-brand shadow-soft">
          <Dumbbell className="h-6 w-6" />
        </div>
        <div className="mt-4 text-base font-semibold">{title}</div>
        <div className="mt-1 max-w-xs text-sm text-ink-muted">{subtitle}</div>
      </div>
    </div>
  );
}
