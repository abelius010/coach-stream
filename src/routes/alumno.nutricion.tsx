import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  Salad,
  Camera,
  Check,
  X,
  Sparkles,
  StickyNote,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Droplets,
  Moon,
  Footprints,
  Scale,
  CheckCircle2,
} from "lucide-react";
import {
  useDemoStore,
  type NutritionMeal,
  type NutritionPlanData,
  type MealLog,
  type ExtraMeal,
  type HabitLog,
} from "@/lib/demo-store";
import { useActiveAlumnoId } from "@/lib/fitflow-mode";
import { getAccountProfile, displayName } from "@/lib/fitflow-mode";

export const Route = createFileRoute("/alumno/nutricion")({
  head: () => ({
    meta: [
      { title: "Nutrición · FitFlow Alumno" },
      { name: "description", content: "Tu plan de nutrición y registro de comidas." },
    ],
  }),
  component: AlumnoNutricion,
});

const EMPTY_EXTRAS: ExtraMeal[] = [];
const EMPTY_HABITS: HabitLog = {};

function mealIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("desayuno")) return "🍳";
  if (n.includes("almuerzo")) return "🥪";
  if (n.includes("comida")) return "🍗";
  if (n.includes("merienda")) return "🥣";
  if (n.includes("cena")) return "🥩";
  if (n.includes("libre")) return "🍽️";
  if (n.includes("post") || n.includes("pre")) return "🥤";
  return "🍽️";
}

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function AlumnoNutricion() {
  const activeId = useActiveAlumnoId();
  const students = useDemoStore((s) => s.students);
  const studentId = activeId ?? students[0]?.id ?? null;
  const student = useDemoStore((s) =>
    studentId ? s.students.find((x) => x.id === studentId) : undefined,
  );
  const plan = useDemoStore((s) =>
    studentId ? (s.nutritionPlans[studentId] as NutritionPlanData | undefined) : undefined,
  );
  const progress = useDemoStore((s) =>
    studentId ? s.nutritionProgress[studentId] : undefined,
  );
  const extras = useDemoStore((s) =>
    studentId ? s.nutritionExtras[studentId] : undefined,
  ) ?? EMPTY_EXTRAS;
  const habits = useDemoStore((s) =>
    studentId ? s.habitsLog[studentId] : undefined,
  ) ?? EMPTY_HABITS;
  const dayIndex = useDemoStore((s) =>
    studentId ? s.nutritionDayIndex[studentId] : undefined,
  ) ?? 1;
  const finishNutritionDay = useDemoStore((s) => s.finishNutritionDay);

  const coachName = displayName(getAccountProfile());
  const [dayClosed, setDayClosed] = useState(false);

  if (!studentId || !student) {
    return (
      <EmptyState
        title="Aún no eres alumno de nadie"
        subtitle="Cuando tu entrenador te añada, aquí verás tu plan de nutrición."
      />
    );
  }

  if (!plan || plan.meals.length === 0) {
    return (
      <EmptyState
        title="Todavía no tienes plan nutricional"
        subtitle={`${coachName} está preparando tu plan. Aparecerá aquí en cuanto lo asigne.`}
      />
    );
  }

  const doneCount = plan.meals.reduce(
    (n, m) => n + (progress?.[m.id]?.done || progress?.[m.id]?.photo ? 1 : 0),
    0,
  );
  const pct = Math.round((doneCount / plan.meals.length) * 100);

  const onFinishDay = () => {
    setDayClosed(true);
    setTimeout(() => {
      finishNutritionDay(studentId);
      setDayClosed(false);
    }, 1400);
  };

  return (
    <div className="flex flex-col gap-5 p-5 pb-24">
      <header className="pt-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium uppercase tracking-wider text-ink-muted">
            Nutrición · Día {dayIndex}
          </div>
        </div>
        <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">Tu plan</h1>
        <p className="mt-1 text-xs text-ink-muted">
          Diseñado por {coachName}. Sube una foto antes de cada comida.
        </p>
      </header>

      {/* Targets */}
      <section className="rounded-2xl border border-border bg-background p-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          Objetivo diario
        </div>
        <div className="mt-2 grid grid-cols-4 gap-2 text-center">
          <MacroPill label="kcal" value={plan.targets.kcal} />
          <MacroPill label="Prot" value={plan.targets.protein} unit="g" />
          <MacroPill label="Carb" value={plan.targets.carbs} unit="g" />
          <MacroPill label="Grasa" value={plan.targets.fat} unit="g" />
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] text-ink-muted">
            <span>Comidas registradas</span>
            <span className="font-semibold text-foreground">
              {doneCount}/{plan.meals.length}
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </section>

      {/* Meals */}
      <section className="space-y-3">
        {plan.meals.map((meal) => (
          <MealCard
            key={meal.id}
            studentId={studentId}
            meal={meal}
            log={progress?.[meal.id]}
          />
        ))}
      </section>

      {/* Extras */}
      {extras.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              Añadidas por ti
            </div>
            <span className="text-[11px] text-ink-muted">{extras.length}</span>
          </div>
          <div className="space-y-3">
            {extras.map((m) => (
              <ExtraMealCard key={m.id} studentId={studentId} meal={m} />
            ))}
          </div>
        </section>
      )}

      <AddExtraMealButton studentId={studentId} />

      {/* Habits */}
      <HabitsBlock studentId={studentId} habits={habits} />

      {/* Finish day */}
      <section className="mt-2">
        <button
          onClick={onFinishDay}
          disabled={dayClosed}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-4 text-sm font-semibold text-background shadow-soft active:scale-[0.99] disabled:opacity-70"
        >
          <CheckCircle2 className="h-4 w-4" />
          {dayClosed ? "Guardando día…" : "Finalizar día"}
        </button>
        <p className="mt-2 text-center text-[11px] text-ink-muted">
          Se guardarán tus comidas, fotos y hábitos. Se abrirá el día siguiente.
        </p>
      </section>

      {plan.coachNote && (
        <section className="rounded-2xl border border-brand/30 bg-brand-muted/40 p-4">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand">
            <Sparkles className="h-3 w-3" /> Nota de {coachName.split(" ")[0]}
          </div>
          <p className="mt-1 text-sm text-foreground">{plan.coachNote}</p>
        </section>
      )}
    </div>
  );
}

function MacroPill({ label, value, unit }: { label: string; value: number; unit?: string }) {
  return (
    <div className="rounded-xl bg-surface px-2 py-2">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted">{label}</div>
      <div className="mt-0.5 text-sm font-semibold">
        {value}
        {unit ? <span className="text-[10px] text-ink-muted"> {unit}</span> : null}
      </div>
    </div>
  );
}

function MealCard({
  studentId,
  meal,
  log,
}: {
  studentId: string;
  meal: NutritionMeal;
  log: MealLog | undefined;
}) {
  const setMealPhoto = useDemoStore((s) => s.setMealPhoto);
  const toggleMealDone = useDemoStore((s) => s.toggleMealDone);
  const setMealNote = useDemoStore((s) => s.setMealNote);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [noteOpen, setNoteOpen] = useState(false);

  const isFree = meal.name.toLowerCase().includes("libre");
  const hasPhoto = !!log?.photo;
  const done = !!log?.done;

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setMealPhoto(studentId, meal.id, String(reader.result));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-background transition-colors ${
        done ? "border-brand/50" : "border-border"
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-lg">
          {mealIcon(meal.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="truncate text-sm font-semibold">{meal.name}</h3>
            {meal.time && (
              <span className="shrink-0 text-[11px] text-ink-muted">{meal.time}</span>
            )}
          </div>
          {isFree ? (
            <p className="mt-0.5 text-xs text-ink-muted">
              Come lo que quieras y sube la foto para el seguimiento.
            </p>
          ) : meal.items.length > 0 ? (
            <ul className="mt-1.5 space-y-0.5 text-xs text-ink-muted">
              {meal.items.map((it) => (
                <li key={it.id} className="flex gap-1.5">
                  <span className="text-foreground">·</span>
                  <span>
                    {it.name}
                    {(it.qty || it.unit) && (
                      <span className="text-ink-muted">
                        {" "}
                        {[it.qty, it.unit].filter(Boolean).join(" ")}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-0.5 text-[11px] italic text-ink-muted">Sin alimentos.</p>
          )}
          {meal.notes && (
            <p className="mt-2 rounded-lg bg-surface px-2.5 py-1.5 text-[11px] text-ink-muted">
              💬 {meal.notes}
            </p>
          )}
        </div>
      </div>

      {/* Photo area */}
      <div className="border-t border-border px-4 py-3">
        {hasPhoto ? (
          <div className="relative overflow-hidden rounded-xl">
            <img
              src={log!.photo!}
              alt={`Foto de ${meal.name}`}
              className="h-40 w-full object-cover"
            />
            <button
              onClick={() => setMealPhoto(studentId, meal.id, null)}
              className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/90 text-ink-muted shadow-soft backdrop-blur active:scale-95"
              aria-label="Quitar foto"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-foreground/90 px-2 py-1 text-[10px] font-medium text-background">
              <Check className="h-3 w-3" /> Foto enviada
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => cameraRef.current?.click()}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-foreground py-3 text-xs font-semibold text-background active:scale-[0.98]"
            >
              <Camera className="h-4 w-4" /> Cámara
            </button>
            <button
              onClick={() => galleryRef.current?.click()}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-3 text-xs font-semibold text-foreground active:scale-[0.98]"
            >
              📷 Galería
            </button>
          </div>
        )}

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onFile}
          className="hidden"
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          onChange={onFile}
          className="hidden"
        />

        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            onClick={() => toggleMealDone(studentId, meal.id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
              done
                ? "bg-brand text-brand-foreground"
                : "border border-border bg-background text-ink-muted"
            }`}
          >
            <Check className="h-3.5 w-3.5" />
            {done ? "Realizada" : "Marcar como hecha"}
          </button>
          <button
            onClick={() => setNoteOpen((v) => !v)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-muted"
          >
            <StickyNote className="h-3.5 w-3.5" />
            Nota
            {noteOpen ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        </div>

        {noteOpen && (
          <textarea
            value={log?.note ?? ""}
            onChange={(e) => setMealNote(studentId, meal.id, e.target.value)}
            placeholder="Observaciones para tu entrenador…"
            rows={2}
            className="mt-2 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-foreground/30"
          />
        )}
      </div>
    </article>
  );
}

function ExtraMealCard({ studentId, meal }: { studentId: string; meal: ExtraMeal }) {
  const updateExtraMeal = useDemoStore((s) => s.updateExtraMeal);
  const removeExtraMeal = useDemoStore((s) => s.removeExtraMeal);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [noteOpen, setNoteOpen] = useState(!!meal.note);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateExtraMeal(studentId, meal.id, { photo: String(reader.result) });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-dashed border-brand/40 bg-brand-muted/20">
      <div className="flex items-start gap-3 p-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-background text-lg">
          🍽️
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="truncate text-sm font-semibold">{meal.name}</h3>
            <span className="shrink-0 text-[11px] text-ink-muted">{meal.time}</span>
          </div>
          <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-brand">
            <Plus className="h-2.5 w-2.5" /> Añadida por ti
          </p>
        </div>
        <button
          onClick={() => removeExtraMeal(studentId, meal.id)}
          className="grid h-8 w-8 place-items-center rounded-full text-ink-muted hover:bg-background"
          aria-label="Eliminar"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="border-t border-brand/20 bg-background px-4 py-3">
        {meal.photo ? (
          <div className="relative overflow-hidden rounded-xl">
            <img src={meal.photo} alt={meal.name} className="h-40 w-full object-cover" />
            <button
              onClick={() => updateExtraMeal(studentId, meal.id, { photo: null })}
              className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/90 text-ink-muted shadow-soft backdrop-blur"
              aria-label="Quitar foto"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => cameraRef.current?.click()}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-foreground py-3 text-xs font-semibold text-background active:scale-[0.98]"
            >
              <Camera className="h-4 w-4" /> Cámara
            </button>
            <button
              onClick={() => galleryRef.current?.click()}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-3 text-xs font-semibold text-foreground active:scale-[0.98]"
            >
              📷 Galería
            </button>
          </div>
        )}

        <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={onFile} className="hidden" />
        <input ref={galleryRef} type="file" accept="image/*" onChange={onFile} className="hidden" />

        <div className="mt-3 flex items-center justify-end">
          <button
            onClick={() => setNoteOpen((v) => !v)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-muted"
          >
            <StickyNote className="h-3.5 w-3.5" /> Nota
            {noteOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
        {noteOpen && (
          <textarea
            value={meal.note ?? ""}
            onChange={(e) => updateExtraMeal(studentId, meal.id, { note: e.target.value })}
            placeholder="Añade un detalle…"
            rows={2}
            className="mt-2 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-foreground/30"
          />
        )}
      </div>
    </article>
  );
}

function AddExtraMealButton({ studentId }: { studentId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [time, setTime] = useState(nowHHMM());
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const addExtraMeal = useDemoStore((s) => s.addExtraMeal);

  const reset = () => {
    setName("");
    setTime(nowHHMM());
    setNote("");
    setPhoto(null);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const onSave = () => {
    if (!name.trim()) return;
    addExtraMeal(studentId, { name: name.trim(), time, note: note.trim() || undefined, photo });
    reset();
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => {
          setTime(nowHHMM());
          setOpen(true);
        }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-background py-4 text-sm font-semibold text-foreground hover:border-foreground/30 active:scale-[0.99]"
      >
        <Plus className="h-4 w-4" /> Añadir comida
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Añadir comida libre</h3>
        <button
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="grid h-8 w-8 place-items-center rounded-full text-ink-muted hover:bg-surface"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 space-y-3">
        <label className="block">
          <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
            Nombre
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Bravas para compartir"
            className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30"
          />
        </label>

        <label className="block">
          <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
            Hora
          </span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30"
          />
        </label>

        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
            Fotografía
          </span>
          {photo ? (
            <div className="relative mt-1 overflow-hidden rounded-xl">
              <img src={photo} alt="Comida" className="h-40 w-full object-cover" />
              <button
                onClick={() => setPhoto(null)}
                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/90 text-ink-muted shadow-soft"
                aria-label="Quitar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="mt-1 grid grid-cols-2 gap-2">
              <button
                onClick={() => cameraRef.current?.click()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-foreground py-3 text-xs font-semibold text-background active:scale-[0.98]"
              >
                <Camera className="h-4 w-4" /> Cámara
              </button>
              <button
                onClick={() => galleryRef.current?.click()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-3 text-xs font-semibold text-foreground active:scale-[0.98]"
              >
                📷 Galería
              </button>
            </div>
          )}
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={onFile} className="hidden" />
          <input ref={galleryRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        </div>

        <label className="block">
          <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
            Nota (opcional)
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Ej: Con amigos en la playa"
            className="mt-1 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
          />
        </label>

        <button
          onClick={onSave}
          disabled={!name.trim()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-sm font-semibold text-background disabled:opacity-40 active:scale-[0.98]"
        >
          Guardar comida
        </button>
      </div>
    </div>
  );
}

function HabitsBlock({ studentId, habits }: { studentId: string; habits: HabitLog }) {
  const updateHabit = useDemoStore((s) => s.updateHabit);
  const waterMl = habits.waterMl ?? 0;
  const waterGoal = 3000;
  const waterPct = Math.min(100, Math.round((waterMl / waterGoal) * 100));

  const [sleepOpen, setSleepOpen] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [weightOpen, setWeightOpen] = useState(false);

  const sleepLabel = useMemo(() => {
    const h = habits.sleepHours ?? 0;
    const m = habits.sleepMinutes ?? 0;
    if (!h && !m) return "—";
    return `${h} h ${String(m).padStart(2, "0")} min`;
  }, [habits.sleepHours, habits.sleepMinutes]);

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          Hábitos diarios
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Water */}
        <div className="rounded-2xl border border-border bg-background p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-brand">
            <Droplets className="h-3.5 w-3.5" /> Agua
          </div>
          <div className="mt-1 text-sm font-semibold">
            {(waterMl / 1000).toFixed(2).replace(".", ",")}
            <span className="text-[10px] font-medium text-ink-muted"> / 3 L</span>
          </div>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${waterPct}%` }} />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <button
              onClick={() => updateHabit(studentId, { waterMl: Math.max(0, waterMl - 250) })}
              className="rounded-lg border border-border bg-background py-1.5 text-[11px] font-semibold text-foreground active:scale-95"
            >
              −250
            </button>
            <button
              onClick={() => updateHabit(studentId, { waterMl: waterMl + 250 })}
              className="rounded-lg bg-foreground py-1.5 text-[11px] font-semibold text-background active:scale-95"
            >
              +250
            </button>
          </div>
        </div>

        {/* Sleep */}
        <HabitCard
          icon={<Moon className="h-3.5 w-3.5" />}
          color="text-indigo-500"
          label="Sueño"
          value={sleepLabel}
          actionLabel="Registrar sueño"
          open={sleepOpen}
          onToggle={() => setSleepOpen((v) => !v)}
        >
          <div className="grid grid-cols-2 gap-2">
            <NumberField
              label="Horas"
              value={habits.sleepHours ?? ""}
              onChange={(v) => updateHabit(studentId, { sleepHours: v })}
              max={14}
            />
            <NumberField
              label="Min"
              value={habits.sleepMinutes ?? ""}
              onChange={(v) => updateHabit(studentId, { sleepMinutes: v })}
              max={59}
            />
          </div>
        </HabitCard>

        {/* Steps */}
        <HabitCard
          icon={<Footprints className="h-3.5 w-3.5" />}
          color="text-emerald-500"
          label="Pasos"
          value={habits.steps != null ? habits.steps.toLocaleString("es-ES") : "—"}
          actionLabel="Registrar pasos"
          open={stepsOpen}
          onToggle={() => setStepsOpen((v) => !v)}
        >
          <NumberField
            label="Pasos"
            value={habits.steps ?? ""}
            onChange={(v) => updateHabit(studentId, { steps: v })}
            max={99999}
          />
        </HabitCard>

        {/* Weight */}
        <HabitCard
          icon={<Scale className="h-3.5 w-3.5" />}
          color="text-rose-500"
          label="Peso"
          value={habits.weight != null ? `${habits.weight.toString().replace(".", ",")} kg` : "—"}
          actionLabel="Registrar peso"
          open={weightOpen}
          onToggle={() => setWeightOpen((v) => !v)}
        >
          <NumberField
            label="kg"
            value={habits.weight ?? ""}
            onChange={(v) => updateHabit(studentId, { weight: v })}
            max={300}
            step={0.1}
          />
        </HabitCard>
      </div>
    </section>
  );
}

function HabitCard({
  icon,
  color,
  label,
  value,
  actionLabel,
  open,
  onToggle,
  children,
}: {
  icon: React.ReactNode;
  color: string;
  label: string;
  value: string;
  actionLabel: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-3">
      <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${color}`}>
        {icon} {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
      <button
        onClick={onToggle}
        className="mt-2 w-full rounded-lg border border-border bg-background py-1.5 text-[11px] font-semibold text-foreground active:scale-95"
      >
        {open ? "Cerrar" : actionLabel}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  max,
  step = 1,
}: {
  label: string;
  value: number | "";
  onChange: (v: number | undefined) => void;
  max: number;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-ink-muted">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "") return onChange(undefined);
          const n = Number(v);
          if (!Number.isNaN(n)) onChange(n);
        }}
        className="mt-0.5 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm outline-none focus:border-foreground/30"
      />
    </label>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col gap-6 p-5">
      <header className="pt-2">
        <h1 className="text-2xl font-semibold tracking-tight">Nutrición</h1>
      </header>
      <div className="grid place-items-center rounded-3xl border border-dashed border-border bg-surface px-6 py-16 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-background text-brand shadow-soft">
          <Salad className="h-6 w-6" />
        </div>
        <div className="mt-4 text-base font-semibold">{title}</div>
        <div className="mt-1 max-w-xs text-sm text-ink-muted">{subtitle}</div>
      </div>
    </div>
  );
}
