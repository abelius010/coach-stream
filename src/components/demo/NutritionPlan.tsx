import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2, ArrowUp, ArrowDown, Copy, X, Save } from "lucide-react";
import {
  useDemoStore,
  seedNutritionPlan,
  genId,
  type NutritionPlanData,
  type NutritionMeal,
  type NutritionItem,
} from "../../lib/demo-store";
import { Modal, ModalButton } from "./Modal";

const DEFAULT_MEAL_NAMES = ["Desayuno", "Almuerzo", "Comida", "Merienda", "Cena"];

export function NutritionPlan({
  studentId,
  onToast,
}: {
  studentId: string;
  onToast: (t: string) => void;
}) {
  const role = useDemoStore((s) => s.role);
  const stored = useDemoStore((s) => s.nutritionPlans?.[studentId]);
  const setPlan = useDemoStore((s) => s.setNutritionPlan);

  const plan = useMemo<NutritionPlanData>(() => stored ?? seedNutritionPlan(), [stored]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<NutritionPlanData>(plan);

  const startEdit = () => {
    setDraft(structuredClone(plan));
    setEditing(true);
  };
  const cancel = () => setEditing(false);
  const save = () => {
    setPlan(studentId, draft);
    setEditing(false);
    onToast("Plan nutricional actualizado correctamente.");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Calorías", v: `${plan.targets.kcal} kcal` },
          { l: "Proteína", v: `${plan.targets.protein} g` },
          { l: "Carbohidratos", v: `${plan.targets.carbs} g` },
          { l: "Grasas", v: `${plan.targets.fat} g` },
        ].map((m) => (
          <div key={m.l} className="rounded-xl border border-border bg-background p-4">
            <div className="text-xs text-ink-muted">{m.l}</div>
            <div className="mt-1 text-lg font-semibold">{m.v}</div>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-background">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div>
            <h3 className="text-sm font-semibold">Plan nutricional</h3>
            <p className="text-xs text-ink-muted">
              {editing
                ? "Modo edición · los cambios se guardan al pulsar Guardar."
                : `${plan.meals.length} ${plan.meals.length === 1 ? "comida" : "comidas"} planificadas`}
            </p>
          </div>
          {role === "coach" && !editing && (
            <button
              onClick={startEdit}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface"
            >
              <Pencil className="h-3.5 w-3.5" /> Modificar nutrición
            </button>
          )}
          {editing && (
            <div className="flex items-center gap-2">
              <button
                onClick={cancel}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface"
              >
                <X className="h-3.5 w-3.5" /> Cancelar
              </button>
              <button
                onClick={save}
                className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90"
              >
                <Save className="h-3.5 w-3.5" /> Guardar cambios
              </button>
            </div>
          )}
        </div>

        <div className="p-5">
          {editing ? (
            <NutritionEditor draft={draft} setDraft={setDraft} />
          ) : (
            <NutritionView meals={plan.meals} />
          )}
        </div>
      </section>

      <div className="rounded-2xl border border-border bg-brand-muted/40 p-4 text-sm">
        <div className="text-xs font-medium uppercase tracking-wide text-brand">Nota del entrenador</div>
        <p className="mt-1 text-foreground">{plan.coachNote}</p>
      </div>
    </div>
  );
}

/* ------------------------- Read-only view ------------------------- */

function formatItem(it: NutritionItem) {
  const q = [it.qty, it.unit].filter(Boolean).join(" ").trim();
  return q ? `${it.name} ${q}` : it.name;
}

function NutritionView({ meals }: { meals: NutritionMeal[] }) {
  return (
    <div className="space-y-3">
      {meals.map((m) => (
        <div key={m.id} className="rounded-2xl border border-border bg-background p-5">
          <div className="flex items-baseline justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold">{m.name}</div>
              {m.time && <div className="text-xs text-ink-muted">{m.time}</div>}
            </div>
            <div className="shrink-0 text-xs text-ink-muted">
              {m.items.length} {m.items.length === 1 ? "alimento" : "alimentos"}
            </div>
          </div>
          <ul className="mt-3 space-y-1 text-sm text-ink-muted">
            {m.items.map((i) => (
              <li key={i.id} className="flex items-baseline gap-2">
                <span className="text-foreground">·</span>
                <span className="min-w-0">{formatItem(i)}</span>
              </li>
            ))}
            {m.items.length === 0 && (
              <li className="text-xs italic">Sin alimentos.</li>
            )}
          </ul>
          {m.notes && (
            <p className="mt-3 rounded-lg bg-surface/60 px-3 py-2 text-xs text-ink-muted">
              <span className="font-medium text-foreground">Observaciones:</span> {m.notes}
            </p>
          )}
        </div>
      ))}
      {meals.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-ink-muted">
          Aún no hay comidas en el plan.
        </div>
      )}
    </div>
  );
}

/* ---------------------------- Editor ---------------------------- */

const inputCls =
  "h-8 w-full min-w-0 rounded-md border border-border bg-background px-2 text-xs outline-none focus:border-foreground/30";

const UNIT_OPTIONS = ["g", "ml", "unidades", "cucharadas", "cucharaditas", "tazas"];

function NutritionEditor({
  draft,
  setDraft,
}: {
  draft: NutritionPlanData;
  setDraft: (v: NutritionPlanData) => void;
}) {
  const [confirm, setConfirm] = useState<
    | { kind: "meal"; mi: number }
    | { kind: "item"; mi: number; ii: number }
    | null
  >(null);

  const update = (fn: (p: NutritionPlanData) => void) => {
    const next = structuredClone(draft);
    fn(next);
    setDraft(next);
  };

  const move = <T,>(arr: T[], from: number, dir: -1 | 1) => {
    const to = from + dir;
    if (to < 0 || to >= arr.length) return;
    [arr[from], arr[to]] = [arr[to], arr[from]];
  };

  const usedNames = new Set(draft.meals.map((m) => m.name));
  const nextDefaultName = () =>
    DEFAULT_MEAL_NAMES.find((n) => !usedNames.has(n)) ?? `Comida ${draft.meals.length + 1}`;

  return (
    <div className="space-y-4">
      {draft.meals.map((meal, mi) => (
        <div key={meal.id} className="rounded-xl border border-border bg-surface/30 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={meal.name}
              onChange={(e) => update((p) => void (p.meals[mi].name = e.target.value))}
              placeholder="Ej. Pre entrenamiento"
              className="h-9 flex-1 min-w-[180px] rounded-md border border-border bg-background px-2.5 text-sm font-semibold outline-none focus:border-foreground/30"
            />
            <input
              value={meal.time ?? ""}
              onChange={(e) => update((p) => void (p.meals[mi].time = e.target.value))}
              placeholder="Hora (opcional)"
              className="h-9 w-32 rounded-md border border-border bg-background px-2.5 text-xs outline-none focus:border-foreground/30"
            />
            <div className="flex items-center gap-1">
              <IconBtn
                title="Subir comida"
                onClick={() => update((p) => move(p.meals, mi, -1))}
                disabled={mi === 0}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </IconBtn>
              <IconBtn
                title="Bajar comida"
                onClick={() => update((p) => move(p.meals, mi, 1))}
                disabled={mi === draft.meals.length - 1}
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </IconBtn>
              <IconBtn
                title="Duplicar comida"
                onClick={() =>
                  update((p) => {
                    const src = p.meals[mi];
                    p.meals.splice(mi + 1, 0, {
                      ...src,
                      id: genId("meal"),
                      name: `${src.name} (copia)`,
                      items: src.items.map((it) => ({ ...it, id: genId("it") })),
                    });
                  })
                }
              >
                <Copy className="h-3.5 w-3.5" />
              </IconBtn>
              <IconBtn
                title="Eliminar comida"
                onClick={() => setConfirm({ kind: "meal", mi })}
                danger
              >
                <Trash2 className="h-3.5 w-3.5" />
              </IconBtn>
            </div>
          </div>

          <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-background">
            <table className="w-full text-xs">
              <thead className="text-[10px] uppercase text-ink-muted">
                <tr>
                  <th className="w-8 px-2 py-2"></th>
                  <th className="px-2 py-2 text-left font-medium">Alimento</th>
                  <th className="px-2 py-2 text-left font-medium">Cantidad</th>
                  <th className="px-2 py-2 text-left font-medium">Unidad</th>
                  <th className="w-24 px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {meal.items.map((it, ii) => (
                  <tr key={it.id} className="border-t border-border align-top">
                    <td className="px-2 py-1.5 text-center text-[11px] text-ink-muted">{ii + 1}</td>
                    <td className="px-2 py-1.5 min-w-[180px]">
                      <input
                        value={it.name}
                        onChange={(e) =>
                          update((p) => void (p.meals[mi].items[ii].name = e.target.value))
                        }
                        placeholder="Ej. Pollo"
                        className={inputCls}
                      />
                    </td>
                    <td className="px-2 py-1.5 w-24">
                      <input
                        value={it.qty}
                        onChange={(e) =>
                          update((p) => void (p.meals[mi].items[ii].qty = e.target.value))
                        }
                        placeholder="150"
                        className={inputCls}
                      />
                    </td>
                    <td className="px-2 py-1.5 w-36">
                      <input
                        list={`units-${meal.id}`}
                        value={it.unit}
                        onChange={(e) =>
                          update((p) => void (p.meals[mi].items[ii].unit = e.target.value))
                        }
                        placeholder="g"
                        className={inputCls}
                      />
                      <datalist id={`units-${meal.id}`}>
                        {UNIT_OPTIONS.map((u) => (
                          <option key={u} value={u} />
                        ))}
                      </datalist>
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex items-center justify-end gap-1">
                        <IconBtn
                          title="Subir"
                          onClick={() => update((p) => move(p.meals[mi].items, ii, -1))}
                          disabled={ii === 0}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </IconBtn>
                        <IconBtn
                          title="Bajar"
                          onClick={() => update((p) => move(p.meals[mi].items, ii, 1))}
                          disabled={ii === meal.items.length - 1}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </IconBtn>
                        <IconBtn
                          title="Eliminar alimento"
                          onClick={() => setConfirm({ kind: "item", mi, ii })}
                          danger
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </IconBtn>
                      </div>
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

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              onClick={() =>
                update((p) =>
                  p.meals[mi].items.push({
                    id: genId("it"),
                    name: "",
                    qty: "",
                    unit: "",
                  }),
                )
              }
              className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border bg-background px-2.5 py-1.5 text-xs text-ink-muted hover:bg-surface hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Añadir alimento
            </button>
          </div>

          <div className="mt-3">
            <label className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
              Observaciones
            </label>
            <textarea
              value={meal.notes}
              onChange={(e) => update((p) => void (p.meals[mi].notes = e.target.value))}
              placeholder="Ej. Comer 60 min antes del entrenamiento · sustituible por pasta…"
              rows={2}
              className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-2 text-xs outline-none focus:border-foreground/30"
            />
          </div>
        </div>
      ))}

      <button
        onClick={() =>
          update((p) =>
            p.meals.push({
              id: genId("meal"),
              name: nextDefaultName(),
              time: "",
              photo: null,
              notes: "",
              items: [],
            }),
          )
        }
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border bg-background px-3 py-2 text-sm text-ink-muted hover:bg-surface hover:text-foreground"
      >
        <Plus className="h-4 w-4" /> Añadir comida
      </button>

      <Modal
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={confirm?.kind === "meal" ? "Eliminar comida" : "Eliminar alimento"}
        size="sm"
        footer={
          <>
            <ModalButton onClick={() => setConfirm(null)}>Cancelar</ModalButton>
            <ModalButton
              variant="danger"
              onClick={() => {
                if (!confirm) return;
                update((p) => {
                  if (confirm.kind === "meal") p.meals.splice(confirm.mi, 1);
                  else p.meals[confirm.mi].items.splice(confirm.ii, 1);
                });
                setConfirm(null);
              }}
            >
              Eliminar
            </ModalButton>
          </>
        }
      >
        <p className="text-sm text-ink-muted">
          Esta acción se aplicará al guardar los cambios. ¿Quieres continuar?
        </p>
      </Modal>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-7 w-7 place-items-center rounded-md border border-border bg-background transition-colors ${
        disabled
          ? "opacity-40"
          : danger
            ? "text-rose-600 hover:bg-rose-50"
            : "text-ink-muted hover:bg-surface hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
