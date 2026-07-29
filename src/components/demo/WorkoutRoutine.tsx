import { useMemo, useState } from "react";
import {
  Check,
  Circle,
  Pencil,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  X,
  Save,
} from "lucide-react";
import {
  useDemoStore,
  seedRoutine,
  genId,
  type RoutineWeek,
  type RoutineDay,
  type RoutineExercise,
} from "../../lib/demo-store";
import { Modal, ModalButton } from "./Modal";

export function WorkoutRoutine({
  studentId,
  onToast,
}: {
  studentId: string;
  onToast: (t: string) => void;
}) {
  const role = useDemoStore((s) => s.role);
  const stored = useDemoStore((s) => s.routines?.[studentId]);
  const setRoutine = useDemoStore((s) => s.setRoutine);

  const weeks = useMemo<RoutineWeek[]>(() => stored ?? seedRoutine(), [stored]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<RoutineWeek[]>(weeks);

  const startEdit = () => {
    setDraft(structuredClone(weeks));
    setEditing(true);
  };
  const cancel = () => setEditing(false);
  const save = () => {
    setRoutine(studentId, draft);
    setEditing(false);
    onToast("Rutina actualizada correctamente.");
  };

  return (
    <section className="rounded-2xl border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div>
          <h3 className="text-sm font-semibold">Rutina semanal</h3>
          <p className="text-xs text-ink-muted">
            {editing
              ? "Modo edición · los cambios se guardan al pulsar Guardar."
              : `${weeks.length} ${weeks.length === 1 ? "semana" : "semanas"} planificadas`}
          </p>
        </div>
        {role === "coach" && !editing && (
          <button
            onClick={startEdit}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface"
          >
            <Pencil className="h-3.5 w-3.5" /> Modificar rutina
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
          <RoutineEditor draft={draft} setDraft={setDraft} />
        ) : (
          <RoutineView weeks={weeks} />
        )}
      </div>
    </section>
  );
}

/* ------------------------- Read-only view ------------------------- */

function RoutineView({ weeks }: { weeks: RoutineWeek[] }) {
  return (
    <div className="space-y-5">
      {weeks.map((wk) => (
        <div key={wk.id} className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h4 className="text-sm font-semibold">{wk.week}</h4>
            <span className="text-xs text-ink-muted">
              {wk.days.filter((d) => d.done).length}/{wk.days.length} completados
            </span>
          </div>
          <div className="space-y-3">
            {wk.days.map((d) => (
              <div key={d.id} className="overflow-hidden rounded-xl border border-border">
                <div className="flex items-center justify-between border-b border-border bg-surface/50 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    {d.done ? (
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                        <Check className="h-3 w-3" />
                      </span>
                    ) : (
                      <Circle className="h-4 w-4 text-ink-muted" />
                    )}
                    <span className="text-sm font-medium">{d.day}</span>
                  </div>
                  <span className={`text-xs ${d.done ? "text-emerald-600" : "text-ink-muted"}`}>
                    {d.done ? "Completado" : "Pendiente"}
                  </span>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-background text-[11px] uppercase text-ink-muted">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Ejercicio</th>
                      <th className="px-4 py-2 text-left font-medium">Series</th>
                      <th className="px-4 py-2 text-left font-medium">Reps</th>
                      <th className="px-4 py-2 text-left font-medium">Peso</th>
                      <th className="hidden px-4 py-2 text-left font-medium md:table-cell">Notas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {d.exercises.map((e) => (
                      <tr key={e.id}>
                        <td className="px-4 py-2.5 font-medium">{e.name}</td>
                        <td className="px-4 py-2.5 text-ink-muted">{e.sets || "—"}</td>
                        <td className="px-4 py-2.5 text-ink-muted">{e.reps || "—"}</td>
                        <td className="px-4 py-2.5 text-ink-muted">{e.weight || "—"}</td>
                        <td className="hidden px-4 py-2.5 text-ink-muted md:table-cell">{e.note || "—"}</td>
                      </tr>
                    ))}
                    {d.exercises.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-4 text-center text-xs text-ink-muted">
                          Sin ejercicios en este día.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------- Editor ---------------------------- */

const inputCls =
  "h-8 w-full min-w-0 rounded-md border border-border bg-background px-2 text-xs outline-none focus:border-foreground/30";

function RoutineEditor({
  draft,
  setDraft,
}: {
  draft: RoutineWeek[];
  setDraft: (v: RoutineWeek[]) => void;
}) {
  const [confirm, setConfirm] = useState<
    | { kind: "week"; wi: number }
    | { kind: "day"; wi: number; di: number }
    | { kind: "exercise"; wi: number; di: number; ei: number }
    | null
  >(null);

  const update = (fn: (weeks: RoutineWeek[]) => void) => {
    const next = structuredClone(draft);
    fn(next);
    setDraft(next);
  };

  const addWeek = () =>
    update((w) =>
      w.push({
        id: genId("wk"),
        week: `Semana ${w.length + 1}`,
        days: [{ id: genId("day"), day: "Día 1", exercises: [] }],
      }),
    );

  const move = <T,>(arr: T[], from: number, dir: -1 | 1) => {
    const to = from + dir;
    if (to < 0 || to >= arr.length) return;
    [arr[from], arr[to]] = [arr[to], arr[from]];
  };

  return (
    <div className="space-y-5">
      {draft.map((wk, wi) => (
        <div key={wk.id} className="rounded-xl border border-border bg-surface/30 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={wk.week}
              onChange={(e) => update((w) => void (w[wi].week = e.target.value))}
              className="h-9 flex-1 min-w-[180px] rounded-md border border-border bg-background px-2.5 text-sm font-semibold outline-none focus:border-foreground/30"
              placeholder="Nombre de la semana"
            />
            <button
              onClick={() => setConfirm({ kind: "week", wi })}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
              title="Eliminar semana"
            >
              <Trash2 className="h-3.5 w-3.5" /> Semana
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {wk.days.map((d, di) => (
              <div key={d.id} className="rounded-lg border border-border bg-background">
                <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
                  <input
                    value={d.day}
                    onChange={(e) => update((w) => void (w[wi].days[di].day = e.target.value))}
                    className="h-8 flex-1 min-w-[160px] rounded-md border border-border bg-background px-2 text-sm font-medium outline-none focus:border-foreground/30"
                    placeholder="Ej. Lunes · Push"
                  />
                  <div className="flex items-center gap-1">
                    <IconBtn
                      title="Subir día"
                      onClick={() => update((w) => move(w[wi].days, di, -1))}
                      disabled={di === 0}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </IconBtn>
                    <IconBtn
                      title="Bajar día"
                      onClick={() => update((w) => move(w[wi].days, di, 1))}
                      disabled={di === wk.days.length - 1}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </IconBtn>
                    <IconBtn
                      title="Duplicar día"
                      onClick={() =>
                        update((w) => {
                          const src = w[wi].days[di];
                          w[wi].days.splice(di + 1, 0, {
                            id: genId("day"),
                            day: `${src.day} (copia)`,
                            exercises: src.exercises.map((e) => ({ ...e, id: genId("ex") })),
                          });
                        })
                      }
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </IconBtn>
                    <IconBtn
                      title="Eliminar día"
                      onClick={() => setConfirm({ kind: "day", wi, di })}
                      danger
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconBtn>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="text-[10px] uppercase text-ink-muted">
                      <tr>
                        <th className="w-8 px-2 py-2"></th>
                        <th className="px-2 py-2 text-left font-medium">Ejercicio</th>
                        <th className="px-2 py-2 text-left font-medium">Series</th>
                        <th className="px-2 py-2 text-left font-medium">Reps</th>
                        <th className="px-2 py-2 text-left font-medium">Peso</th>
                        <th className="px-2 py-2 text-left font-medium">Notas</th>
                        <th className="w-24 px-2 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.exercises.map((ex, ei) => (
                        <tr key={ex.id} className="border-t border-border align-top">
                          <td className="px-2 py-1.5 text-center text-[11px] text-ink-muted">
                            {ei + 1}
                          </td>
                          <td className="px-2 py-1.5 min-w-[160px]">
                            <input
                              value={ex.name}
                              onChange={(e) =>
                                update(
                                  (w) => void (w[wi].days[di].exercises[ei].name = e.target.value),
                                )
                              }
                              placeholder="Ej. Press banca"
                              className={inputCls}
                            />
                          </td>
                          <td className="px-2 py-1.5 w-16">
                            <input
                              value={ex.sets}
                              onChange={(e) =>
                                update(
                                  (w) => void (w[wi].days[di].exercises[ei].sets = e.target.value),
                                )
                              }
                              placeholder="4"
                              className={inputCls}
                            />
                          </td>
                          <td className="px-2 py-1.5 w-20">
                            <input
                              value={ex.reps}
                              onChange={(e) =>
                                update(
                                  (w) => void (w[wi].days[di].exercises[ei].reps = e.target.value),
                                )
                              }
                              placeholder="8-10"
                              className={inputCls}
                            />
                          </td>
                          <td className="px-2 py-1.5 w-24">
                            <input
                              value={ex.weight}
                              onChange={(e) =>
                                update(
                                  (w) =>
                                    void (w[wi].days[di].exercises[ei].weight = e.target.value),
                                )
                              }
                              placeholder="70 kg"
                              className={inputCls}
                            />
                          </td>
                          <td className="px-2 py-1.5 min-w-[140px]">
                            <input
                              value={ex.note}
                              onChange={(e) =>
                                update(
                                  (w) => void (w[wi].days[di].exercises[ei].note = e.target.value),
                                )
                              }
                              placeholder="RIR 2, tempo…"
                              className={inputCls}
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <div className="flex items-center justify-end gap-1">
                              <IconBtn
                                title="Subir"
                                onClick={() =>
                                  update((w) => move(w[wi].days[di].exercises, ei, -1))
                                }
                                disabled={ei === 0}
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </IconBtn>
                              <IconBtn
                                title="Bajar"
                                onClick={() =>
                                  update((w) => move(w[wi].days[di].exercises, ei, 1))
                                }
                                disabled={ei === d.exercises.length - 1}
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </IconBtn>
                              <IconBtn
                                title="Eliminar ejercicio"
                                onClick={() => setConfirm({ kind: "exercise", wi, di, ei })}
                                danger
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </IconBtn>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {d.exercises.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-3 py-3 text-center text-[11px] text-ink-muted">
                            Sin ejercicios. Añade el primero abajo.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-border px-3 py-2">
                  <button
                    onClick={() =>
                      update((w) =>
                        w[wi].days[di].exercises.push({
                          id: genId("ex"),
                          name: "",
                          sets: "",
                          reps: "",
                          weight: "",
                          note: "",
                        }),
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border bg-background px-2.5 py-1.5 text-xs text-ink-muted hover:bg-surface hover:text-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" /> Añadir ejercicio
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3">
            <button
              onClick={() =>
                update((w) =>
                  w[wi].days.push({
                    id: genId("day"),
                    day: `Día ${w[wi].days.length + 1}`,
                    exercises: [],
                  }),
                )
              }
              className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border bg-background px-2.5 py-1.5 text-xs text-ink-muted hover:bg-surface hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Añadir día
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addWeek}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border bg-background px-3 py-2 text-sm text-ink-muted hover:bg-surface hover:text-foreground"
      >
        <Plus className="h-4 w-4" /> Añadir semana
      </button>

      <Modal
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={
          confirm?.kind === "week"
            ? "Eliminar semana"
            : confirm?.kind === "day"
              ? "Eliminar día"
              : "Eliminar ejercicio"
        }
        size="sm"
        footer={
          <>
            <ModalButton onClick={() => setConfirm(null)}>Cancelar</ModalButton>
            <ModalButton
              variant="danger"
              onClick={() => {
                if (!confirm) return;
                update((w) => {
                  if (confirm.kind === "week") w.splice(confirm.wi, 1);
                  else if (confirm.kind === "day") w[confirm.wi].days.splice(confirm.di, 1);
                  else w[confirm.wi].days[confirm.di].exercises.splice(confirm.ei, 1);
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

// Re-export types to satisfy TS unused-import checks
export type { RoutineWeek, RoutineDay, RoutineExercise };
