import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Salad, Camera, Check, X, Sparkles, StickyNote, ChevronDown, ChevronUp } from "lucide-react";
import {
  useDemoStore,
  type NutritionMeal,
  type NutritionPlanData,
  type MealLog,
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
  const coachName = displayName(getAccountProfile());

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

  return (
    <div className="flex flex-col gap-5 p-5">
      <header className="pt-2">
        <div className="text-xs font-medium uppercase tracking-wider text-ink-muted">
          Nutrición de hoy
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
