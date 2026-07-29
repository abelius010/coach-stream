import { useMemo, useState } from "react";
import {
  Pencil,
  Copy,
  Save,
  FolderOpen,
  Trash2,
  Sparkles,
  FileText,
} from "lucide-react";
import { ActionMenu, type ActionItem } from "./ActionMenu";
import { Modal, ModalButton } from "./Modal";
import { useDemoStore } from "../../lib/demo-store";

type Kind = "workout" | "nutrition";

const COPY = {
  workout: {
    entity: "rutina",
    entityCap: "Rutina",
    editLabel: "Editar entrenamiento",
    editTitle: "Constructor de entrenamiento",
    editDesc: "Diseña la rutina completa con series, repeticiones y progresión.",
    dupToast: "Rutina duplicada correctamente.",
    saveTitle: "Guardar rutina como plantilla",
    savePlaceholder: "Ej. Full Body 3 días · Principiantes",
    assignTitle: "Asignar plantilla de entrenamiento",
    deleteTitle: "Eliminar rutina",
    deleteDesc: "El alumno se quedará sin rutina asignada. Esta acción no se puede deshacer.",
    deletedText: "Rutina eliminada. El alumno se ha quedado sin rutina asignada.",
    emptyTitle: "Sin rutina asignada",
    emptyDesc: "Asigna una plantilla o crea una nueva desde el constructor.",
  },
  nutrition: {
    entity: "plan",
    entityCap: "Plan nutricional",
    editLabel: "Editar plan nutricional",
    editTitle: "Constructor de plan nutricional",
    editDesc: "Ajusta macros, comidas y suplementación del plan.",
    dupToast: "Plan nutricional duplicado correctamente.",
    saveTitle: "Guardar plan como plantilla",
    savePlaceholder: "Ej. Déficit 1.800 kcal · Alta proteína",
    assignTitle: "Asignar plantilla nutricional",
    deleteTitle: "Eliminar plan nutricional",
    deleteDesc: "El alumno se quedará sin plan asignado. Esta acción no se puede deshacer.",
    deletedText: "Plan nutricional eliminado.",
    emptyTitle: "Sin plan nutricional",
    emptyDesc: "Asigna una plantilla o construye uno nuevo.",
  },
} as const;

export function TabActions({
  kind,
  studentName,
  onToast,
  deleted,
  onDeletedChange,
}: {
  kind: Kind;
  studentName: string;
  onToast: (text: string) => void;
  deleted: boolean;
  onDeletedChange: (v: boolean) => void;
}) {
  const role = useDemoStore((s) => s.role);
  const workoutTemplates = useDemoStore((s) => s.workoutTemplates);
  const nutritionTemplates = useDemoStore((s) => s.nutritionTemplates);
  const addWorkoutTemplate = useDemoStore((s) => s.addWorkoutTemplate);
  const addNutritionTemplate = useDemoStore((s) => s.addNutritionTemplate);

  const templates = kind === "workout" ? workoutTemplates : nutritionTemplates;
  const addTemplate = kind === "workout" ? addWorkoutTemplate : addNutritionTemplate;
  const t = COPY[kind];

  const [dialog, setDialog] = useState<null | "edit" | "save" | "assign" | "delete">(null);
  const [templateName, setTemplateName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const items: ActionItem[] = useMemo(
    () => [
      { icon: <Pencil className="h-3.5 w-3.5" />, label: t.editLabel, onClick: () => setDialog("edit") },
      {
        icon: <Copy className="h-3.5 w-3.5" />,
        label: `Duplicar ${t.entity}`,
        onClick: () => onToast(t.dupToast),
      },
      {
        icon: <Save className="h-3.5 w-3.5" />,
        label: "Guardar como plantilla",
        onClick: () => {
          setTemplateName("");
          setDialog("save");
        },
      },
      {
        icon: <FolderOpen className="h-3.5 w-3.5" />,
        label: "Asignar plantilla",
        onClick: () => {
          setSelectedTemplate(templates[0]?.id ?? null);
          setDialog("assign");
        },
      },
      {
        icon: <Trash2 className="h-3.5 w-3.5" />,
        label: `Eliminar ${t.entity}`,
        onClick: () => setDialog("delete"),
        danger: true,
      },
    ],
    [t, templates, onToast],
  );

  if (role !== "coach") return null;

  const selected = templates.find((x) => x.id === selectedTemplate) ?? null;

  return (
    <>
      <ActionMenu items={items} label={`Acciones de ${t.entity}`} />

      {/* Edit — coming soon professional empty state */}
      <Modal
        open={dialog === "edit"}
        onClose={() => setDialog(null)}
        title={t.editTitle}
        description={t.editDesc}
        size="lg"
        footer={
          <>
            <ModalButton onClick={() => setDialog(null)}>Cerrar</ModalButton>
            <ModalButton
              variant="primary"
              onClick={() => {
                setDialog(null);
                onToast(`Constructor de ${t.entity} listo para conectar con la lógica final.`);
              }}
            >
              Entendido
            </ModalButton>
          </>
        }
      >
        <div className="rounded-xl border border-dashed border-border bg-surface/40 p-8 text-center">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-background shadow-sm">
            <Sparkles className="h-5 w-5 text-brand" />
          </div>
          <h4 className="mt-3 text-sm font-semibold">Constructor preparado para {studentName.split(" ")[0]}</h4>
          <p className="mx-auto mt-1 max-w-sm text-xs text-ink-muted">
            El flujo de edición está listo para conectarse. Aquí aparecerá el editor
            completo con bloques, series, repeticiones y progresión automática.
          </p>
        </div>
      </Modal>

      {/* Save as template */}
      <Modal
        open={dialog === "save"}
        onClose={() => setDialog(null)}
        title={t.saveTitle}
        description="Podrás reutilizar esta plantilla con cualquier alumno."
        footer={
          <>
            <ModalButton onClick={() => setDialog(null)}>Cancelar</ModalButton>
            <ModalButton
              variant="primary"
              onClick={() => {
                if (!templateName.trim()) return;
                addTemplate({
                  name: templateName.trim(),
                  summary: `Guardada desde la ficha de ${studentName}`,
                });
                setDialog(null);
                onToast(`Plantilla "${templateName.trim()}" guardada.`);
              }}
            >
              Guardar plantilla
            </ModalButton>
          </>
        }
      >
        <label className="text-xs font-medium text-ink-muted">Nombre de la plantilla</label>
        <input
          autoFocus
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder={t.savePlaceholder}
          className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground/20"
        />
      </Modal>

      {/* Assign template */}
      <Modal
        open={dialog === "assign"}
        onClose={() => setDialog(null)}
        title={t.assignTitle}
        description="Selecciona una plantilla y revisa la vista previa antes de aplicarla."
        size="lg"
        footer={
          <>
            <ModalButton onClick={() => setDialog(null)}>Cancelar</ModalButton>
            <ModalButton
              variant="primary"
              onClick={() => {
                if (!selected) return;
                setDialog(null);
                onDeletedChange(false);
                onToast(`Plantilla "${selected.name}" asignada a ${studentName.split(" ")[0]}.`);
              }}
            >
              Asignar plantilla
            </ModalButton>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-[1fr,1.1fr]">
          <ul className="max-h-72 space-y-1 overflow-y-auto pr-1">
            {templates.map((tpl) => {
              const active = tpl.id === selectedTemplate;
              return (
                <li key={tpl.id}>
                  <button
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`flex w-full items-start gap-2.5 rounded-lg border p-3 text-left transition-colors ${
                      active
                        ? "border-foreground/20 bg-surface"
                        : "border-border bg-background hover:bg-surface/60"
                    }`}
                  >
                    <FileText className="mt-0.5 h-4 w-4 text-ink-muted" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{tpl.name}</div>
                      <div className="mt-0.5 truncate text-xs text-ink-muted">{tpl.summary}</div>
                    </div>
                  </button>
                </li>
              );
            })}
            {templates.length === 0 && (
              <li className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-ink-muted">
                Aún no hay plantillas. Guarda una desde el menú de acciones.
              </li>
            )}
          </ul>

          <div className="rounded-xl border border-border bg-surface/30 p-4">
            <div className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
              Vista previa
            </div>
            {selected ? (
              <>
                <div className="mt-1 text-sm font-semibold">{selected.name}</div>
                <div className="text-xs text-ink-muted">{selected.summary}</div>
                <div className="mt-3 space-y-1.5 text-xs text-ink-muted">
                  <div>· Creada: {selected.createdAt}</div>
                  <div>· Se aplicará a: <span className="text-foreground">{studentName}</span></div>
                  <div>· Se conservará el histórico anterior del alumno.</div>
                </div>
              </>
            ) : (
              <div className="mt-2 text-xs text-ink-muted">Selecciona una plantilla para ver el detalle.</div>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={dialog === "delete"}
        onClose={() => setDialog(null)}
        title={t.deleteTitle}
        description={t.deleteDesc}
        size="sm"
        footer={
          <>
            <ModalButton onClick={() => setDialog(null)}>Cancelar</ModalButton>
            <ModalButton
              variant="danger"
              onClick={() => {
                setDialog(null);
                onDeletedChange(true);
                onToast(t.deletedText);
              }}
            >
              Eliminar
            </ModalButton>
          </>
        }
      >
        <p className="text-sm text-ink-muted">
          Vas a eliminar la {t.entity} actual de <span className="font-medium text-foreground">{studentName}</span>.
          Esta acción no se puede deshacer.
        </p>
      </Modal>

      {/* If deleted, the parent renders the empty state; expose helpers via context props */}
      {deleted && null}
    </>
  );
}

export function EmptyDeletedState({
  kind,
  onAssign,
}: {
  kind: Kind;
  onAssign?: () => void;
}) {
  const t = COPY[kind];
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface/30 p-10 text-center">
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-background shadow-sm">
        <FolderOpen className="h-5 w-5 text-ink-muted" />
      </div>
      <h4 className="mt-3 text-sm font-semibold">{t.emptyTitle}</h4>
      <p className="mx-auto mt-1 max-w-sm text-xs text-ink-muted">{t.emptyDesc}</p>
      {onAssign && (
        <button
          onClick={onAssign}
          className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-3.5 text-sm font-medium text-background hover:opacity-90"
        >
          Asignar plantilla
        </button>
      )}
    </div>
  );
}
