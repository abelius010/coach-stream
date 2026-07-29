import { useMemo, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Copy,
  Pencil,
  Save,
  X,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Utensils,
  ClipboardCopy,
  ClipboardPaste,
  FileText,
  CheckCircle2,
  MoreHorizontal,
} from "lucide-react";
import {
  useDemoStore,
  starterNutritionPlan,
  starterNutritionWeek,
  genId,
  WEEKDAYS,
  type NutritionPlanData,
  type NutritionWeek,
  type NutritionDay,
  type NutritionMeal,
  type NutritionItem,
} from "../../lib/demo-store";
import { Modal, ModalButton } from "./Modal";
import { ActionMenu, type ActionItem } from "./ActionMenu";

const DEFAULT_MEAL_NAMES = [
  "Desayuno",
  "Media mañana",
  "Comida",
  "Merienda",
  "Cena",
  "Recena",
];
const UNIT_OPTIONS = ["g", "ml", "unidades", "cucharadas", "cucharaditas", "tazas"];

const inputCls =
  "h-9 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-ink-muted focus:border-foreground/30";
const smallInputCls =
  "h-8 w-full min-w-0 rounded-md border border-border bg-background px-2 text-xs outline-none focus:border-foreground/30";

function syncTopLevelMeals(plan: NutritionPlanData): NutritionPlanData {
  if (!plan.weeks || plan.weeks.length === 0) return plan;
  const jsDay = new Date().getDay();
  const idx = (jsDay + 6) % 7;
  const meals = plan.weeks[0].days[idx]?.meals ?? plan.weeks[0].days[0].meals;
  return { ...plan, meals };
}

function nextWeekName(weeks: NutritionWeek[]): string {
  const nums = weeks
    .map((w) => /Semana\s+(\d+)/i.exec(w.name)?.[1])
    .filter(Boolean)
    .map((n) => parseInt(n as string, 10));
  const max = nums.length ? Math.max(...nums) : weeks.length;
  return `Semana ${max + 1}`;
}

function cloneWeek(w: NutritionWeek, name: string): NutritionWeek {
  return {
    id: genId("nwk"),
    name,
    days: w.days.map((d) => ({
      id: genId("nday"),
      day: d.day,
      meals: d.meals.map((m) => ({
        ...m,
        id: genId("meal"),
        items: m.items.map((it) => ({ ...it, id: genId("it") })),
      })),
    })),
  };
}

function cloneDay(d: NutritionDay): NutritionDay {
  return {
    id: genId("nday"),
    day: d.day,
    meals: d.meals.map((m) => ({
      ...m,
      id: genId("meal"),
      items: m.items.map((it) => ({ ...it, id: genId("it") })),
    })),
  };
}

export function NutritionBuilder({
  studentId,
  onToast,
}: {
  studentId: string;
  onToast: (t: string) => void;
}) {
  const role = useDemoStore((s) => s.role);
  const student = useDemoStore((s) => s.students.find((x) => x.id === studentId));
  const stored = useDemoStore((s) => s.nutritionPlans[studentId]);
  const setPlan = useDemoStore((s) => s.setNutritionPlan);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<NutritionPlanData>(() =>
    stored ? ensureWeeks(structuredClone(stored)) : starterNutritionPlan(),
  );
  const [activeWeekIdx, setActiveWeekIdx] = useState(0);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<{ kind: "week"; wi: number } | null>(null);
  const [addWeekOpen, setAddWeekOpen] = useState(false);
  const dayClipboard = useRef<NutritionDay | null>(null);

  const startCreate = () => {
    const init = starterNutritionPlan();
    setDraft(init);
    setActiveWeekIdx(0);
    setActiveDayIdx(0);
    setEditing(true);
  };

  const startEdit = () => {
    const base = ensureWeeks(structuredClone(stored ?? starterNutritionPlan()));
    setDraft(base);
    setActiveWeekIdx(0);
    setActiveDayIdx(0);
    setEditing(true);
  };

  const cancel = () => setEditing(false);

  const saveDraft = () => {
    setPlan(studentId, syncTopLevelMeals({ ...draft, status: "draft" }));
    setEditing(false);
    onToast("Borrador guardado. Aún no está asignado al alumno.");
  };
  const saveAssign = () => {
    setPlan(studentId, syncTopLevelMeals({ ...draft, status: "active" }));
    setEditing(false);
    onToast("Plan nutricional asignado. El alumno ya lo verá en su app.");
  };

  const duplicatePlan = () => {
    if (!stored) return;
    const copy = ensureWeeks(structuredClone(stored));
    copy.name = `${stored.name || "Plan"} (copia)`;
    copy.status = "draft";
    copy.weeks = copy.weeks!.map((w) => cloneWeek(w, w.name));
    setDraft(copy);
    setEditing(true);
    onToast("Plan duplicado como borrador. Edítalo y asígnalo.");
  };

  const addWeekAtEnd = () => {
    if (stored) {
      // Extend the currently saved plan: open builder with an extra week appended.
      const base = ensureWeeks(structuredClone(stored));
      const last = base.weeks![base.weeks!.length - 1];
      const newWeek = starterNutritionWeek(nextWeekName(base.weeks!));
      base.weeks!.push(last ? cloneWeek(last, newWeek.name) : newWeek);
      setDraft(base);
      setActiveWeekIdx(base.weeks!.length - 1);
      setActiveDayIdx(0);
      setEditing(true);
      onToast("Nueva semana añadida al final del plan.");
    } else {
      startCreate();
    }
  };

  /* -------- Empty state -------- */
  if (!stored && !editing) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-surface/30 p-10 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-background shadow-sm">
          <Utensils className="h-5 w-5 text-ink-muted" />
        </div>
        <h4 className="mt-3 text-base font-semibold">Añadir nutrición</h4>
        <p className="mx-auto mt-1 max-w-sm text-sm text-ink-muted">
          Este alumno todavía no tiene un plan nutricional.
        </p>
        {role === "coach" && (
          <button
            onClick={startCreate}
            className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-lg bg-foreground px-4 text-sm font-medium text-background hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Añadir nutrición
          </button>
        )}
      </section>
    );
  }

  /* -------- Read-only overview (plan exists, not editing) -------- */
  if (stored && !editing) {
    return (
      <ReadOnlyOverview
        plan={ensureWeeks(stored)}
        student={student?.name.split(" ")[0]}
        onEdit={startEdit}
        onAddWeek={addWeekAtEnd}
        onDuplicate={duplicatePlan}
      />
    );
  }

  /* -------- Builder (editing) -------- */
  const update = (fn: (p: NutritionPlanData) => void) => {
    const next = structuredClone(draft);
    fn(next);
    setDraft(next);
  };

  const week = draft.weeks![activeWeekIdx];
  const day = week?.days[activeDayIdx];

  const weekActions = (wi: number): ActionItem[] => [
    {
      label: "Renombrar",
      icon: <Pencil className="h-3.5 w-3.5" />,
      onClick: () => {
        const name = prompt("Nombre de la semana", draft.weeks![wi].name);
        if (name) update((p) => void (p.weeks![wi].name = name));
      },
    },
    {
      label: "Duplicar",
      icon: <Copy className="h-3.5 w-3.5" />,
      onClick: () =>
        update((p) => {
          const src = p.weeks![wi];
          const copy = cloneWeek(src, `${src.name} (copia)`);
          p.weeks!.splice(wi + 1, 0, copy);
        }),
    },
    {
      label: "Mover a la izquierda",
      icon: <ArrowLeft className="h-3.5 w-3.5" />,
      onClick: () => {
        if (wi === 0) return;
        update((p) => {
          const [w] = p.weeks!.splice(wi, 1);
          p.weeks!.splice(wi - 1, 0, w);
        });
        setActiveWeekIdx((i) => Math.max(0, i - 1));
      },
    },
    {
      label: "Mover a la derecha",
      icon: <ArrowRight className="h-3.5 w-3.5" />,
      onClick: () => {
        if (wi >= draft.weeks!.length - 1) return;
        update((p) => {
          const [w] = p.weeks!.splice(wi, 1);
          p.weeks!.splice(wi + 1, 0, w);
        });
        setActiveWeekIdx((i) => Math.min(draft.weeks!.length - 1, i + 1));
      },
    },
    {
      label: "Eliminar semana",
      icon: <Trash2 className="h-3.5 w-3.5" />,
      danger: true,
      onClick: () => setConfirmDelete({ kind: "week", wi }),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Metadata */}
      <section className="rounded-2xl border border-border bg-background">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
          <div>
            <h3 className="text-sm font-semibold">Constructor de nutrición</h3>
            <p className="text-xs text-ink-muted">
              Modo edición · los cambios se guardan al pulsar los botones inferiores.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={cancel}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface"
            >
              <X className="h-3.5 w-3.5" /> Cancelar
            </button>
            <button
              onClick={saveDraft}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface"
            >
              <FileText className="h-3.5 w-3.5" /> Guardar borrador
            </button>
            <button
              onClick={saveAssign}
              className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90"
            >
              <Save className="h-3.5 w-3.5" /> Guardar y asignar
            </button>
          </div>
        </header>
        <div className="grid gap-3 p-5 md:grid-cols-3">
          <LabeledInput
            label="Nombre del plan"
            value={draft.name ?? ""}
            onChange={(v) => update((p) => void (p.name = v))}
            placeholder="Definición semana 1"
          />
          <LabeledInput
            label="Objetivo"
            value={draft.objective ?? ""}
            onChange={(v) => update((p) => void (p.objective = v))}
            placeholder="Pérdida de grasa"
          />
          <LabeledInput
            label="Fecha de inicio"
            type="date"
            value={draft.startDate ?? ""}
            onChange={(v) => update((p) => void (p.startDate = v))}
          />
          <LabeledInput
            label="Calorías (kcal)"
            type="number"
            value={String(draft.targets.kcal || "")}
            onChange={(v) => update((p) => void (p.targets.kcal = Number(v) || 0))}
            placeholder="2200"
          />
          <div className="grid grid-cols-3 gap-2 md:col-span-2">
            <LabeledInput
              label="Proteína (g)"
              type="number"
              value={String(draft.targets.protein || "")}
              onChange={(v) => update((p) => void (p.targets.protein = Number(v) || 0))}
            />
            <LabeledInput
              label="Carbohidratos (g)"
              type="number"
              value={String(draft.targets.carbs || "")}
              onChange={(v) => update((p) => void (p.targets.carbs = Number(v) || 0))}
            />
            <LabeledInput
              label="Grasas (g)"
              type="number"
              value={String(draft.targets.fat || "")}
              onChange={(v) => update((p) => void (p.targets.fat = Number(v) || 0))}
            />
          </div>
          <div className="md:col-span-3">
            <label className="mb-1 block text-xs font-medium">Notas generales</label>
            <textarea
              value={draft.notes ?? ""}
              onChange={(e) => update((p) => void (p.notes = e.target.value))}
              rows={2}
              placeholder="Ej. Beber 2,5 L de agua al día. Última comida antes de las 21:00."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
            />
          </div>
        </div>
      </section>

      {/* Week tabs */}
      <section className="rounded-2xl border border-border bg-background">
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
          {/* Desktop tabs */}
          <div className="hidden flex-wrap items-center gap-1 md:flex">
            {draft.weeks!.map((w, wi) => (
              <div key={w.id} className="flex items-center">
                <button
                  onClick={() => {
                    setActiveWeekIdx(wi);
                    setActiveDayIdx(0);
                  }}
                  className={`h-8 rounded-lg px-3 text-xs font-medium transition-colors ${
                    activeWeekIdx === wi
                      ? "bg-foreground text-background"
                      : "text-ink-muted hover:bg-surface hover:text-foreground"
                  }`}
                >
                  {w.name}
                </button>
                {activeWeekIdx === wi && (
                  <ActionMenu items={weekActions(wi)} alwaysVisible />
                )}
              </div>
            ))}
          </div>
          {/* Mobile select */}
          <div className="flex items-center gap-2 md:hidden">
            <select
              value={activeWeekIdx}
              onChange={(e) => {
                setActiveWeekIdx(Number(e.target.value));
                setActiveDayIdx(0);
              }}
              className="h-9 rounded-lg border border-border bg-background px-2 text-sm"
            >
              {draft.weeks!.map((w, wi) => (
                <option key={w.id} value={wi}>
                  {w.name}
                </option>
              ))}
            </select>
            <ActionMenu items={weekActions(activeWeekIdx)} alwaysVisible />
          </div>
          <div className="ml-auto">
            <button
              onClick={() => setAddWeekOpen(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-dashed border-border bg-background px-3 text-xs font-medium text-ink-muted hover:bg-surface hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Añadir otra semana
            </button>
          </div>
        </div>

        {/* Day tabs */}
        <div className="flex flex-wrap items-center gap-1 border-b border-border px-3 py-2">
          {week.days.map((d, di) => (
            <button
              key={d.id}
              onClick={() => setActiveDayIdx(di)}
              className={`h-8 rounded-lg px-3 text-xs font-medium transition-colors ${
                activeDayIdx === di
                  ? "bg-surface text-foreground ring-1 ring-border"
                  : "text-ink-muted hover:bg-surface hover:text-foreground"
              }`}
            >
              {d.day}
              {d.meals.length > 0 && (
                <span className="ml-1.5 rounded-full bg-brand-muted px-1.5 text-[10px] font-semibold text-brand">
                  {d.meals.length}
                </span>
              )}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => {
                dayClipboard.current = day;
                onToast(`${day.day} copiado. Pégalo en otro día.`);
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-[11px] text-ink-muted hover:bg-surface hover:text-foreground"
              title="Copiar día"
            >
              <ClipboardCopy className="h-3.5 w-3.5" /> Copiar día
            </button>
            <button
              onClick={() => {
                const src = dayClipboard.current;
                if (!src) {
                  onToast("Copia primero un día para poder pegarlo.");
                  return;
                }
                update((p) => {
                  const cloned = cloneDay(src);
                  cloned.day = p.weeks![activeWeekIdx].days[activeDayIdx].day;
                  cloned.id = p.weeks![activeWeekIdx].days[activeDayIdx].id;
                  p.weeks![activeWeekIdx].days[activeDayIdx] = cloned;
                });
                onToast("Día pegado.");
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-[11px] text-ink-muted hover:bg-surface hover:text-foreground"
              title="Pegar día"
            >
              <ClipboardPaste className="h-3.5 w-3.5" /> Pegar día
            </button>
          </div>
        </div>

        {/* Meals for the active day */}
        <div className="space-y-3 p-5">
          {day.meals.map((meal, mi) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onChange={(patch) =>
                update((p) => {
                  Object.assign(p.weeks![activeWeekIdx].days[activeDayIdx].meals[mi], patch);
                })
              }
              onDuplicate={() =>
                update((p) => {
                  const src = p.weeks![activeWeekIdx].days[activeDayIdx].meals[mi];
                  p.weeks![activeWeekIdx].days[activeDayIdx].meals.splice(mi + 1, 0, {
                    ...src,
                    id: genId("meal"),
                    name: `${src.name} (copia)`,
                    items: src.items.map((it) => ({ ...it, id: genId("it") })),
                  });
                })
              }
              onRemove={() =>
                update((p) => {
                  p.weeks![activeWeekIdx].days[activeDayIdx].meals.splice(mi, 1);
                })
              }
              onMove={(dir) =>
                update((p) => {
                  const arr = p.weeks![activeWeekIdx].days[activeDayIdx].meals;
                  const to = mi + dir;
                  if (to < 0 || to >= arr.length) return;
                  [arr[mi], arr[to]] = [arr[to], arr[mi]];
                })
              }
              isFirst={mi === 0}
              isLast={mi === day.meals.length - 1}
              onItemsChange={(items) =>
                update((p) => {
                  p.weeks![activeWeekIdx].days[activeDayIdx].meals[mi].items = items;
                })
              }
            />
          ))}
          {day.meals.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-surface/30 p-8 text-center text-xs text-ink-muted">
              Aún no hay comidas en {day.day.toLowerCase()}. Añade la primera abajo.
            </div>
          )}
          <AddMealButtons
            existingNames={day.meals.map((m) => m.name)}
            onAdd={(name) =>
              update((p) => {
                p.weeks![activeWeekIdx].days[activeDayIdx].meals.push({
                  id: genId("meal"),
                  name,
                  time: "",
                  photo: null,
                  notes: "",
                  items: [],
                });
              })
            }
          />
        </div>
      </section>

      {/* Add week dialog */}
      <Modal
        open={addWeekOpen}
        onClose={() => setAddWeekOpen(false)}
        title="Añadir nueva semana"
        description="¿Quieres empezar en blanco o duplicar la semana anterior?"
        footer={
          <>
            <ModalButton onClick={() => setAddWeekOpen(false)}>Cancelar</ModalButton>
            <ModalButton
              onClick={() => {
                update((p) =>
                  p.weeks!.push(starterNutritionWeek(nextWeekName(p.weeks!))),
                );
                setActiveWeekIdx(draft.weeks!.length);
                setActiveDayIdx(0);
                setAddWeekOpen(false);
              }}
            >
              Crear semana vacía
            </ModalButton>
            <ModalButton
              variant="primary"
              onClick={() => {
                update((p) => {
                  const prev = p.weeks![p.weeks!.length - 1];
                  p.weeks!.push(cloneWeek(prev, nextWeekName(p.weeks!)));
                });
                setActiveWeekIdx(draft.weeks!.length);
                setActiveDayIdx(0);
                setAddWeekOpen(false);
              }}
            >
              Duplicar anterior
            </ModalButton>
          </>
        }
      >
        <p className="text-xs text-ink-muted">
          Duplicar copia días, comidas, alimentos, cantidades y horarios. Luego podrás editar
          solo lo que cambie.
        </p>
      </Modal>

      <Modal
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        title="Eliminar semana"
        size="sm"
        footer={
          <>
            <ModalButton onClick={() => setConfirmDelete(null)}>Cancelar</ModalButton>
            <ModalButton
              variant="danger"
              onClick={() => {
                if (!confirmDelete) return;
                const wi = confirmDelete.wi;
                update((p) => {
                  p.weeks!.splice(wi, 1);
                  if (p.weeks!.length === 0) {
                    p.weeks!.push(starterNutritionWeek("Semana 1"));
                  }
                });
                setActiveWeekIdx((i) => Math.max(0, Math.min(i, draft.weeks!.length - 2)));
                setActiveDayIdx(0);
                setConfirmDelete(null);
              }}
            >
              Eliminar
            </ModalButton>
          </>
        }
      >
        <p className="text-sm text-ink-muted">
          ¿Seguro que quieres eliminar la {draft.weeks?.[confirmDelete?.wi ?? 0]?.name}? Esta
          acción no se puede deshacer.
        </p>
      </Modal>
    </div>
  );
}

/* --------------------------- Read-only overview --------------------------- */

function ReadOnlyOverview({
  plan,
  student,
  onEdit,
  onAddWeek,
  onDuplicate,
}: {
  plan: NutritionPlanData;
  student?: string;
  onEdit: () => void;
  onAddWeek: () => void;
  onDuplicate: () => void;
}) {
  const role = useDemoStore((s) => s.role);
  const [openWeek, setOpenWeek] = useState(0);
  const weeks = plan.weeks ?? [];
  const w = weeks[openWeek];

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-background p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold">
                {plan.name || "Plan nutricional"}
              </h3>
              {plan.status === "draft" && (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                  Borrador
                </span>
              )}
              {plan.status === "active" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" /> Asignado
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-ink-muted">
              {plan.objective || "Sin objetivo definido"}
              {plan.startDate && ` · Inicio ${plan.startDate}`}
              {` · ${weeks.length} ${weeks.length === 1 ? "semana" : "semanas"}`}
            </p>
          </div>
          {role === "coach" && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface"
              >
                <Pencil className="h-3.5 w-3.5" /> Modificar nutrición
              </button>
              <button
                onClick={onAddWeek}
                className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" /> Añadir semana
              </button>
              <button
                onClick={onDuplicate}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface"
              >
                <Copy className="h-3.5 w-3.5" /> Duplicar plan
              </button>
            </div>
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { l: "Calorías", v: `${plan.targets.kcal} kcal` },
            { l: "Proteína", v: `${plan.targets.protein} g` },
            { l: "Carbohidratos", v: `${plan.targets.carbs} g` },
            { l: "Grasas", v: `${plan.targets.fat} g` },
          ].map((m) => (
            <div key={m.l} className="rounded-xl border border-border p-3">
              <div className="text-[10px] uppercase tracking-wide text-ink-muted">{m.l}</div>
              <div className="mt-1 text-sm font-semibold">{m.v}</div>
            </div>
          ))}
        </div>
        {plan.notes && (
          <p className="mt-3 rounded-lg bg-surface/60 px-3 py-2 text-xs text-ink-muted">
            <span className="font-medium text-foreground">Notas:</span> {plan.notes}
          </p>
        )}
      </section>

      {weeks.length > 0 && (
        <section className="rounded-2xl border border-border bg-background">
          <div className="flex flex-wrap items-center gap-1 border-b border-border px-3 py-2">
            {weeks.map((wk, wi) => (
              <button
                key={wk.id}
                onClick={() => setOpenWeek(wi)}
                className={`h-8 rounded-lg px-3 text-xs font-medium transition-colors ${
                  openWeek === wi
                    ? "bg-foreground text-background"
                    : "text-ink-muted hover:bg-surface hover:text-foreground"
                }`}
              >
                {wk.name}
              </button>
            ))}
          </div>
          <div className="grid gap-3 p-4 md:grid-cols-2">
            {w?.days.map((d) => (
              <div key={d.id} className="rounded-xl border border-border bg-surface/30 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{d.day}</div>
                  <span className="text-[11px] text-ink-muted">
                    {d.meals.length} {d.meals.length === 1 ? "comida" : "comidas"}
                  </span>
                </div>
                <ul className="mt-2 space-y-1 text-xs">
                  {d.meals.map((m) => (
                    <li key={m.id} className="flex items-baseline gap-1.5">
                      <span className="text-ink-muted">·</span>
                      <span className="font-medium">{m.name}</span>
                      {m.time && <span className="text-ink-muted">· {m.time}</span>}
                      {m.items.length > 0 && (
                        <span className="text-ink-muted">
                          · {m.items.length} alimentos
                        </span>
                      )}
                    </li>
                  ))}
                  {d.meals.length === 0 && (
                    <li className="text-[11px] italic text-ink-muted">Descanso o sin comidas.</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {plan.coachNote && (
        <div className="rounded-2xl border border-border bg-brand-muted/40 p-4 text-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-brand">
            Nota del entrenador
          </div>
          <p className="mt-1 text-foreground">{plan.coachNote}</p>
        </div>
      )}

      {student && role === "coach" && plan.status === "draft" && (
        <p className="text-center text-[11px] text-ink-muted">
          Este plan aún es un borrador. {student} no lo verá hasta que pulses
          <b> Guardar y asignar</b>.
        </p>
      )}
    </div>
  );
}

/* -------------------------------- Meal card ------------------------------- */

function MealCard({
  meal,
  onChange,
  onDuplicate,
  onRemove,
  onMove,
  isFirst,
  isLast,
  onItemsChange,
}: {
  meal: NutritionMeal;
  onChange: (patch: Partial<NutritionMeal>) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  isFirst: boolean;
  isLast: boolean;
  onItemsChange: (items: NutritionItem[]) => void;
}) {
  const [confirmDel, setConfirmDel] = useState(false);
  const actions: ActionItem[] = [
    { label: "Subir", icon: <ChevronDown className="h-3.5 w-3.5" />, onClick: () => onMove(-1), disabled: isFirst },
    { label: "Bajar", icon: <ChevronDown className="h-3.5 w-3.5" />, onClick: () => onMove(1), disabled: isLast },
    { label: "Duplicar", icon: <Copy className="h-3.5 w-3.5" />, onClick: onDuplicate },
    { label: "Eliminar", icon: <Trash2 className="h-3.5 w-3.5" />, danger: true, onClick: () => setConfirmDel(true) },
  ];

  const updateItem = (idx: number, patch: Partial<NutritionItem>) => {
    const items = meal.items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    onItemsChange(items);
  };
  const addItem = () =>
    onItemsChange([...meal.items, { id: genId("it"), name: "", qty: "", unit: "" }]);
  const removeItem = (idx: number) => onItemsChange(meal.items.filter((_, i) => i !== idx));

  return (
    <div className="rounded-xl border border-border bg-surface/30 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={meal.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Ej. Desayuno"
          className="h-9 flex-1 min-w-[180px] rounded-md border border-border bg-background px-2.5 text-sm font-semibold outline-none focus:border-foreground/30"
        />
        <input
          value={meal.time ?? ""}
          onChange={(e) => onChange({ time: e.target.value })}
          placeholder="Hora"
          className="h-9 w-28 rounded-md border border-border bg-background px-2.5 text-xs outline-none focus:border-foreground/30"
        />
        <ActionMenu items={actions} alwaysVisible />
      </div>

      <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-background">
        <table className="w-full text-xs">
          <thead className="text-[10px] uppercase text-ink-muted">
            <tr>
              <th className="w-8 px-2 py-2"></th>
              <th className="px-2 py-2 text-left font-medium">Alimento</th>
              <th className="px-2 py-2 text-left font-medium">Cantidad</th>
              <th className="px-2 py-2 text-left font-medium">Unidad</th>
              <th className="w-10 px-2 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {meal.items.map((it, ii) => (
              <tr key={it.id} className="border-t border-border align-top">
                <td className="px-2 py-1.5 text-center text-[11px] text-ink-muted">{ii + 1}</td>
                <td className="px-2 py-1.5 min-w-[180px]">
                  <input
                    value={it.name}
                    onChange={(e) => updateItem(ii, { name: e.target.value })}
                    placeholder="Ej. Avena"
                    className={smallInputCls}
                  />
                </td>
                <td className="px-2 py-1.5 w-24">
                  <input
                    value={it.qty}
                    onChange={(e) => updateItem(ii, { qty: e.target.value })}
                    placeholder="60"
                    className={smallInputCls}
                  />
                </td>
                <td className="px-2 py-1.5 w-36">
                  <input
                    list={`units-${meal.id}`}
                    value={it.unit}
                    onChange={(e) => updateItem(ii, { unit: e.target.value })}
                    placeholder="g"
                    className={smallInputCls}
                  />
                  <datalist id={`units-${meal.id}`}>
                    {UNIT_OPTIONS.map((u) => (
                      <option key={u} value={u} />
                    ))}
                  </datalist>
                </td>
                <td className="px-2 py-1.5">
                  <button
                    onClick={() => removeItem(ii)}
                    className="grid h-7 w-7 place-items-center rounded-md text-rose-600 hover:bg-rose-50"
                    title="Eliminar alimento"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {meal.items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-3 text-center text-[11px] text-ink-muted">
                  Sin alimentos. Añade el primero abajo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-2">
        <button
          onClick={addItem}
          className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border bg-background px-2.5 py-1.5 text-xs text-ink-muted hover:bg-surface hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" /> Añadir alimento
        </button>
      </div>

      <textarea
        value={meal.notes}
        onChange={(e) => onChange({ notes: e.target.value })}
        placeholder="Observaciones (opcional)"
        rows={2}
        className="mt-2 w-full rounded-md border border-border bg-background px-2.5 py-2 text-xs outline-none focus:border-foreground/30"
      />

      <Modal
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
        title="Eliminar comida"
        size="sm"
        footer={
          <>
            <ModalButton onClick={() => setConfirmDel(false)}>Cancelar</ModalButton>
            <ModalButton
              variant="danger"
              onClick={() => {
                setConfirmDel(false);
                onRemove();
              }}
            >
              Eliminar
            </ModalButton>
          </>
        }
      >
        <p className="text-sm text-ink-muted">
          Esta comida se eliminará del día. ¿Quieres continuar?
        </p>
      </Modal>
    </div>
  );
}

function AddMealButtons({
  existingNames,
  onAdd,
}: {
  existingNames: string[];
  onAdd: (name: string) => void;
}) {
  const suggestions = DEFAULT_MEAL_NAMES.filter((n) => !existingNames.includes(n));
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      {suggestions.slice(0, 4).map((n) => (
        <button
          key={n}
          onClick={() => onAdd(n)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border bg-background px-3 py-1.5 text-xs text-ink-muted hover:bg-surface hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" /> {n}
        </button>
      ))}
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" /> Añadir comida
        </button>
      ) : (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && custom.trim()) {
                onAdd(custom.trim());
                setCustom("");
                setOpen(false);
              }
              if (e.key === "Escape") {
                setCustom("");
                setOpen(false);
              }
            }}
            placeholder="Nombre de la comida"
            className={inputCls + " !h-8 w-56"}
          />
          <button
            onClick={() => {
              if (custom.trim()) {
                onAdd(custom.trim());
                setCustom("");
                setOpen(false);
              }
            }}
            className="inline-flex h-8 items-center gap-1 rounded-md bg-foreground px-2.5 text-xs text-background"
          >
            Añadir
          </button>
          <button
            onClick={() => {
              setCustom("");
              setOpen(false);
            }}
            className="grid h-8 w-8 place-items-center rounded-md text-ink-muted hover:bg-surface"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
    </label>
  );
}

/* -------------------------------- Utilities ------------------------------- */

function ensureWeeks(plan: NutritionPlanData): NutritionPlanData {
  if (plan.weeks && plan.weeks.length > 0) return plan;
  // Migrate legacy flat plan into "Semana 1" with meals on Monday.
  const week: NutritionWeek = {
    id: genId("nwk"),
    name: "Semana 1",
    days: WEEKDAYS.map((d, i) => ({
      id: genId("nday"),
      day: d,
      meals: i === 0 ? plan.meals.map((m) => ({ ...m })) : [],
    })),
  };
  return { ...plan, weeks: [week] };
}
