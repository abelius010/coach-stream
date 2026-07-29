import { useMemo, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Image as ImageIcon,
  ListChecks,
  MessageSquare,
  Pencil,
  X,
} from "lucide-react";
import {
  useDemoStore,
  todayKey,
  formatDateKey,
  type NutritionMeal,
  type MealLog,
  type ExtraMeal,
  type HabitLog,
  type NutritionDaySnapshot,
} from "../../lib/demo-store";
import { NutritionBuilder } from "./NutritionBuilder";
import { Modal } from "./Modal";

type View = "seguimiento" | "galeria" | "plan";

type PhotoRef = {
  src: string;
  meal: string;
  date: string;
  time?: string;
  kind: "plan" | "extra";
  note?: string;
};

const EMPTY_PROGRESS: Record<string, MealLog> = {};
const EMPTY_EXTRAS: ExtraMeal[] = [];
const EMPTY_HABITS: HabitLog = {};
const EMPTY_COMMENTS: Record<string, Record<string, string>> = {};

function fmtTimeIso(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return undefined;
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function NutritionTab({
  studentId,
  onToast,
}: {
  studentId: string;
  onToast: (t: string) => void;
}) {
  const [view, setView] = useState<View>("seguimiento");
  const [lightbox, setLightbox] = useState<PhotoRef | null>(null);

  const plan = useDemoStore((s) => s.nutritionPlans[studentId]);
  const liveProgress = useDemoStore((s) => s.nutritionProgress[studentId]) ?? EMPTY_PROGRESS;
  const liveExtras = useDemoStore((s) => s.nutritionExtras[studentId]) ?? EMPTY_EXTRAS;
  const liveHabits = useDemoStore((s) => s.habitsLog[studentId]) ?? EMPTY_HABITS;
  const history = useDemoStore((s) => s.nutritionHistory[studentId]);
  const commentsAll =
    useDemoStore((s) => s.coachMealComments[studentId]) ?? EMPTY_COMMENTS;
  const setCoachMealComment = useDemoStore((s) => s.setCoachMealComment);

  const today = todayKey();

  // Days available in the date carousel: today + any snapshotted historical days
  const dayKeys = useMemo(() => {
    const set = new Set<string>([today]);
    if (history) Object.keys(history).forEach((k) => set.add(k));
    return Array.from(set).sort(); // ASC
  }, [history, today]);

  const [dateKey, setDateKey] = useState<string>(today);
  const currentIdx = Math.max(0, dayKeys.indexOf(dateKey));
  const canPrev = currentIdx > 0;
  const canNext = currentIdx < dayKeys.length - 1;
  const goPrev = () => canPrev && setDateKey(dayKeys[currentIdx - 1]);
  const goNext = () => canNext && setDateKey(dayKeys[currentIdx + 1]);

  const isToday = dateKey === today;
  const snap: NutritionDaySnapshot | undefined = history?.[dateKey];
  const progress = isToday ? liveProgress : snap?.progress ?? EMPTY_PROGRESS;
  const extras = isToday ? liveExtras : snap?.extras ?? EMPTY_EXTRAS;
  const habits = isToday ? liveHabits : snap?.habits ?? EMPTY_HABITS;
  const comments = commentsAll[dateKey] ?? {};

  const meals: NutritionMeal[] = plan?.meals ?? [];

  return (
    <div className="space-y-5">
      {/* View switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-border bg-background p-1">
          <ViewBtn active={view === "seguimiento"} onClick={() => setView("seguimiento")} icon={<ListChecks className="h-3.5 w-3.5" />}>
            Seguimiento
          </ViewBtn>
          <ViewBtn active={view === "galeria"} onClick={() => setView("galeria")} icon={<ImageIcon className="h-3.5 w-3.5" />}>
            Galería
          </ViewBtn>
          <ViewBtn active={view === "plan"} onClick={() => setView("plan")} icon={<Pencil className="h-3.5 w-3.5" />}>
            Plan
          </ViewBtn>
        </div>

        {view === "seguimiento" && dayKeys.length > 0 && (
          <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-background px-2 py-1">
            <button
              onClick={goPrev}
              disabled={!canPrev}
              aria-label="Día anterior"
              className="grid h-7 w-7 place-items-center rounded-lg text-ink-muted hover:bg-surface disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5 px-2 text-sm">
              <Calendar className="h-3.5 w-3.5 text-ink-muted" />
              <span className="font-medium">
                {isToday ? `Hoy · ${formatDateKey(dateKey)}` : formatDateKey(dateKey)}
              </span>
            </div>
            <button
              onClick={goNext}
              disabled={!canNext}
              aria-label="Día siguiente"
              className="grid h-7 w-7 place-items-center rounded-lg text-ink-muted hover:bg-surface disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {view === "plan" && <NutritionBuilder studentId={studentId} onToast={onToast} />}

      {view === "seguimiento" && (
        <SeguimientoView
          hasPlan={!!plan}
          meals={meals}
          progress={progress}
          extras={extras}
          habits={habits}
          comments={comments}
          dateLabel={formatDateKey(dateKey)}
          isToday={isToday}
          onCommentChange={(mealId, v) => setCoachMealComment(studentId, dateKey, mealId, v)}
          onOpenPhoto={(p) => setLightbox(p)}
        />
      )}

      {view === "galeria" && (
        <GalleryView
          liveProgress={liveProgress}
          liveExtras={liveExtras}
          history={history}
          plan={plan?.meals ?? []}
          today={today}
          onOpenPhoto={(p) => setLightbox(p)}
        />
      )}

      <Modal
        open={!!lightbox}
        onClose={() => setLightbox(null)}
        title={lightbox ? `${lightbox.meal} · ${lightbox.date}${lightbox.time ? " · " + lightbox.time : ""}` : ""}
        size="lg"
      >
        {lightbox && (
          <div className="space-y-3">
            <img src={lightbox.src} alt={lightbox.meal} className="max-h-[70vh] w-full rounded-xl object-contain" />
            {lightbox.note && (
              <p className="rounded-lg bg-surface px-3 py-2 text-xs text-ink-muted">
                <span className="font-medium text-foreground">Nota del alumno:</span> {lightbox.note}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ------------------------------ Seguimiento ------------------------------ */

function SeguimientoView({
  hasPlan,
  meals,
  progress,
  extras,
  habits,
  comments,
  dateLabel,
  isToday,
  onCommentChange,
  onOpenPhoto,
}: {
  hasPlan: boolean;
  meals: NutritionMeal[];
  progress: Record<string, MealLog>;
  extras: ExtraMeal[];
  habits: HabitLog;
  comments: Record<string, string>;
  dateLabel: string;
  isToday: boolean;
  onCommentChange: (mealId: string, v: string) => void;
  onOpenPhoto: (p: PhotoRef) => void;
}) {
  if (!hasPlan) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface/30 p-10 text-center text-sm text-ink-muted">
        Este alumno todavía no tiene un plan nutricional asignado. Cambia a la vista <b>Plan</b> para crearlo.
      </div>
    );
  }

  const doneCount = meals.reduce((n, m) => n + (progress[m.id]?.done || progress[m.id]?.photo ? 1 : 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Comidas del plan" value={`${doneCount}/${meals.length}`} />
        <StatCard label="Comidas libres" value={String(extras.length)} />
        <StatCard label="Agua" value={habits.waterMl ? `${(habits.waterMl / 1000).toFixed(1)} L` : "—"} />
        <StatCard label="Peso registrado" value={habits.weight ? `${habits.weight} kg` : "—"} />
      </div>

      <div className="space-y-3">
        {meals.map((meal) => (
          <PlanMealRow
            key={meal.id}
            meal={meal}
            log={progress[meal.id]}
            comment={comments[meal.id] ?? ""}
            onCommentChange={(v) => onCommentChange(meal.id, v)}
            onOpenPhoto={(src) =>
              onOpenPhoto({
                src,
                meal: meal.name,
                date: dateLabel,
                time: fmtTimeIso(progress[meal.id]?.photoAt),
                kind: "plan",
                note: progress[meal.id]?.note,
              })
            }
          />
        ))}
        {meals.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-ink-muted">
            El plan no tiene comidas todavía.
          </div>
        )}
      </div>

      {extras.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              🍟 Comidas añadidas por el alumno
            </div>
            <span className="text-[11px] text-ink-muted">{extras.length}</span>
          </div>
          <div className="space-y-3">
            {extras.map((m) => (
              <ExtraMealRow
                key={m.id}
                meal={m}
                comment={comments[`extra:${m.id}`] ?? ""}
                onCommentChange={(v) => onCommentChange(`extra:${m.id}`, v)}
                onOpenPhoto={(src) =>
                  onOpenPhoto({
                    src,
                    meal: m.name || "Comida libre",
                    date: dateLabel,
                    time: m.time,
                    kind: "extra",
                    note: m.note,
                  })
                }
              />
            ))}
          </div>
        </div>
      )}

      {!isToday && (
        <p className="text-center text-[11px] text-ink-muted">
          Estás revisando datos históricos. Los cambios en los comentarios se guardan en este día.
        </p>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="text-xs text-ink-muted">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function PlanMealRow({
  meal,
  log,
  comment,
  onCommentChange,
  onOpenPhoto,
}: {
  meal: NutritionMeal;
  log: MealLog | undefined;
  comment: string;
  onCommentChange: (v: string) => void;
  onOpenPhoto: (src: string) => void;
}) {
  const done = !!log?.done || !!log?.photo;
  const registeredAt = fmtTimeIso(log?.photoAt);
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-background">
      <div className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_180px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-2">
            <h3 className="text-sm font-semibold">{meal.name}</h3>
            {meal.time && <span className="text-xs text-ink-muted">{meal.time}</span>}
            <StatusBadge done={done} />
            {registeredAt && (
              <span className="inline-flex items-center gap-1 text-[11px] text-ink-muted">
                <Clock className="h-3 w-3" /> Registrado {registeredAt}
              </span>
            )}
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface/40 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                Plan
              </div>
              {meal.items.length > 0 ? (
                <ul className="mt-1.5 space-y-0.5 text-xs">
                  {meal.items.map((it) => (
                    <li key={it.id} className="flex gap-1.5 text-foreground">
                      <span className="text-ink-muted">·</span>
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
                <p className="mt-1 text-[11px] italic text-ink-muted">Comida libre.</p>
              )}
              {meal.notes && (
                <p className="mt-2 text-[11px] text-ink-muted">
                  <span className="font-medium text-foreground">Indicaciones:</span> {meal.notes}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-border bg-surface/40 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                Registro del alumno
              </div>
              {log?.note ? (
                <p className="mt-1.5 text-xs text-foreground">“{log.note}”</p>
              ) : (
                <p className="mt-1.5 text-[11px] italic text-ink-muted">
                  {done ? "Sin nota adicional." : "Aún sin registrar."}
                </p>
              )}
            </div>
          </div>

          <CoachCommentBox value={comment} onChange={onCommentChange} />
        </div>

        <div className="md:pl-2">
          <PhotoThumb photo={log?.photo ?? null} onClick={onOpenPhoto} />
        </div>
      </div>
    </article>
  );
}

function ExtraMealRow({
  meal,
  comment,
  onCommentChange,
  onOpenPhoto,
}: {
  meal: ExtraMeal;
  comment: string;
  onCommentChange: (v: string) => void;
  onOpenPhoto: (src: string) => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-dashed border-brand/40 bg-brand-muted/20">
      <div className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_180px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-brand">
              Añadida por el alumno
            </span>
          </div>
          <h3 className="mt-1 text-sm font-semibold">{meal.name || "Comida libre"}</h3>
          {meal.time && (
            <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-ink-muted">
              <Clock className="h-3 w-3" /> {meal.time}
            </div>
          )}
          {meal.note && (
            <p className="mt-2 rounded-lg bg-background px-3 py-2 text-xs text-foreground">
              “{meal.note}”
            </p>
          )}
          <CoachCommentBox value={comment} onChange={onCommentChange} />
        </div>
        <div className="md:pl-2">
          <PhotoThumb photo={meal.photo ?? null} onClick={onOpenPhoto} />
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ done }: { done: boolean }) {
  return done ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
      ✅ Realizada
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
      ⏳ Pendiente
    </span>
  );
}

function PhotoThumb({ photo, onClick }: { photo: string | null; onClick: (src: string) => void }) {
  if (!photo) {
    return (
      <div className="grid h-32 w-full place-items-center rounded-xl border border-dashed border-border bg-surface/40 text-[11px] text-ink-muted">
        Sin fotografía
      </div>
    );
  }
  return (
    <button
      onClick={() => onClick(photo)}
      className="group relative block h-32 w-full overflow-hidden rounded-xl border border-border"
      aria-label="Ver foto en grande"
    >
      <img src={photo} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
      <span className="absolute bottom-1 right-1 inline-flex items-center gap-1 rounded-md bg-foreground/80 px-1.5 py-0.5 text-[10px] font-medium text-background">
        <ImageIcon className="h-2.5 w-2.5" /> Ampliar
      </span>
    </button>
  );
}

function CoachCommentBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(!!value);
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border bg-background px-2.5 py-1.5 text-[11px] text-ink-muted hover:bg-surface hover:text-foreground"
      >
        <MessageSquare className="h-3 w-3" /> Añadir comentario
      </button>
    );
  }
  return (
    <div className="mt-3 rounded-lg border border-border bg-background p-2.5">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
          <MessageSquare className="h-3 w-3" /> Comentario del entrenador
        </div>
        {!value && (
          <button
            onClick={() => setOpen(false)}
            className="grid h-5 w-5 place-items-center rounded text-ink-muted hover:bg-surface"
            aria-label="Cerrar"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ej. Buen desayuno. Intenta reducir la salsa en la próxima comida."
        rows={2}
        className="mt-1 w-full resize-none rounded-md border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-foreground/30"
      />
      <p className="mt-1 text-[10px] text-ink-muted">
        Privado por ahora. Próximamente podrás notificar al alumno.
      </p>
    </div>
  );
}

/* --------------------------------- Galería --------------------------------- */

function GalleryView({
  liveProgress,
  liveExtras,
  history,
  plan,
  today,
  onOpenPhoto,
}: {
  liveProgress: Record<string, MealLog>;
  liveExtras: ExtraMeal[];
  history?: Record<string, NutritionDaySnapshot>;
  plan: NutritionMeal[];
  today: string;
  onOpenPhoto: (p: PhotoRef) => void;
}) {
  const mealNameById = useMemo(() => {
    const m = new Map<string, string>();
    plan.forEach((x) => m.set(x.id, x.name));
    return m;
  }, [plan]);

  const photos: PhotoRef[] = useMemo(() => {
    const out: PhotoRef[] = [];
    const push = (date: string, progress: Record<string, MealLog>, extras: ExtraMeal[]) => {
      Object.entries(progress).forEach(([mealId, log]) => {
        if (log?.photo) {
          out.push({
            src: log.photo,
            meal: mealNameById.get(mealId) ?? "Comida",
            date: formatDateKey(date),
            time: fmtTimeIso(log.photoAt),
            kind: "plan",
            note: log.note,
          });
        }
      });
      extras.forEach((e) => {
        if (e.photo) {
          out.push({
            src: e.photo,
            meal: e.name || "Comida libre",
            date: formatDateKey(date),
            time: e.time,
            kind: "extra",
            note: e.note,
          });
        }
      });
    };
    // Today live
    push(today, liveProgress, liveExtras);
    // History (skip today if it happens to be re-added)
    if (history) {
      Object.entries(history)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .forEach(([date, snap]) => {
          if (date === today) return;
          push(date, snap.progress, snap.extras);
        });
    }
    return out;
  }, [liveProgress, liveExtras, history, mealNameById, today]);

  if (photos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface/30 p-10 text-center">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-background shadow-sm">
          <ImageIcon className="h-5 w-5 text-ink-muted" />
        </div>
        <h4 className="mt-3 text-sm font-semibold">Todavía no hay fotografías de comidas</h4>
        <p className="mx-auto mt-1 max-w-sm text-xs text-ink-muted">
          Cuando el alumno suba fotos desde su app, aparecerán aquí ordenadas por día y comida.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {photos.map((p, i) => (
        <button
          key={i}
          onClick={() => onOpenPhoto(p)}
          className="group overflow-hidden rounded-xl border border-border bg-background text-left"
        >
          <div className="relative aspect-square w-full overflow-hidden">
            <img
              src={p.src}
              alt={p.meal}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            {p.kind === "extra" && (
              <span className="absolute left-2 top-2 rounded-md bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-brand-foreground">
                Libre
              </span>
            )}
          </div>
          <div className="px-2.5 py-2">
            <div className="truncate text-xs font-semibold">{p.meal}</div>
            <div className="mt-0.5 truncate text-[10px] text-ink-muted">
              {p.date}
              {p.time ? ` · ${p.time}` : ""}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ----------------------------------- UI ---------------------------------- */

function ViewBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? "bg-foreground text-background" : "text-ink-muted hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
