import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  MessageSquare,
  Dumbbell,
  Utensils,
  TrendingUp,
  Activity,
  Image as ImageIcon,
  User,
  Check,
  Circle,
  Send,
  Pencil,
  Plus,
  ClipboardCheck,
  Trash2,
  Upload,
} from "lucide-react";
import {
  students as seedStudents,
  weightSeries as seedWeightSeries,
  habitsData,
  measurements as seedMeasurements,
  gallery,
  chatMessages as seedChat,
} from "../lib/demo-data";
import {
  useDemoStore,
  isNewStudent,
  type StudentExt,
  type Review,
  type WeightLog,
} from "../lib/demo-store";
import { EditStudentSheet } from "../components/demo/EditStudentSheet";
import { TabActions, EmptyDeletedState } from "../components/demo/TabActions";
import { ToastStack, type ToastData } from "../components/demo/Toast";
import { WorkoutRoutine } from "../components/demo/WorkoutRoutine";
import { NutritionPlan } from "../components/demo/NutritionPlan";
import { Modal, ModalButton } from "../components/demo/Modal";
import { Field, inputCls, textareaCls } from "../components/demo/Field";

export const Route = createFileRoute("/demo/alumnos/$id")({
  loader: ({ params }) => ({ id: params.id }),
  component: StudentDetail,
});

const tabs = [
  { id: "resumen", label: "Resumen", icon: User },
  { id: "entrenos", label: "Entrenamientos", icon: Dumbbell },
  { id: "nutricion", label: "Nutrición", icon: Utensils },
  { id: "progreso", label: "Progreso", icon: TrendingUp },
  { id: "habitos", label: "Hábitos", icon: Activity },
  { id: "multimedia", label: "Multimedia", icon: ImageIcon },
  { id: "chat", label: "Chat", icon: MessageSquare },
] as const;

type TabId = (typeof tabs)[number]["id"];

function StudentDetail() {
  const { id } = Route.useLoaderData();
  const student = useDemoStore((s) => s.students.find((x) => x.id === id));
  const routine = useDemoStore((s) => s.routines[id]);
  const nutrition = useDemoStore((s) => s.nutritionPlans[id]);
  const reviewsRaw = useDemoStore((s) => s.reviews[id]); const reviews = reviewsRaw ?? [];
  const habitsConfigured = useDemoStore((s) => s.habitsConfigured[id]);

  const [tab, setTab] = useState<TabId>("resumen");
  const [editing, setEditing] = useState(false);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [workoutDeleted, setWorkoutDeleted] = useState(false);
  const [nutritionDeleted, setNutritionDeleted] = useState(false);
  const pushToast = (text: string) =>
    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), text }]);
  const dismissToast = (tid: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== tid));

  if (!student) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-center">
        <h1 className="text-xl font-semibold">Alumno no encontrado</h1>
        <p className="mt-2 text-sm text-ink-muted">Puede que hayas restablecido la demo.</p>
        <Link to="/demo/alumnos" className="mt-4 inline-flex rounded-lg bg-foreground px-4 py-2 text-sm text-background">Volver a alumnos</Link>
      </div>
    );
  }

  const isNew = isNewStudent(student);
  const checklist = [
    { key: "datos", label: "Datos del alumno", done: !!(student.age && student.height) },
    { key: "rutina", label: "Crear rutina", done: !!(routine && routine.some((w) => w.days.some((d) => d.exercises.length > 0))) },
    { key: "nutricion", label: "Crear plan nutricional", done: !!(nutrition && nutrition.meals.length > 0 && nutrition.meals.some((m) => m.items.length > 0)) },
    { key: "habitos", label: "Configurar hábitos", done: !!habitsConfigured },
    { key: "revision", label: "Primera revisión", done: reviews.length > 0 },
  ];
  const completed = checklist.filter((c) => c.done).length;
  const showChecklist = isNew && completed < checklist.length;

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8">
      <Link to="/demo/alumnos" className="mb-4 inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Volver a alumnos
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-background p-5 md:p-6">
        <div className="flex flex-wrap items-start gap-5">
          <img src={student.avatar} alt="" className="h-20 w-20 rounded-2xl object-cover" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold md:text-2xl">{student.name}</h1>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                {student.status === "activo" ? "Activo" : student.status === "atencion" ? "Atención" : "En riesgo"}
              </span>
            </div>
            <div className="mt-1 text-sm text-ink-muted">
              {student.goal}
              {student.age ? ` · ${student.age} años` : ""}
              {student.height ? ` · ${student.height} cm` : ""}
              {student.startDate ? ` · Desde ${student.startDate}` : ""}
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-muted">
              <Stat label="Actual" value={student.weight ? `${student.weight} kg` : "—"} />
              <Stat label="Inicio" value={student.weightStart ? `${student.weightStart} kg` : "—"} />
              <Stat label="Objetivo" value={student.weightGoal ? `${student.weightGoal} kg` : "—"} />
              <Stat label="Cumplimiento" value={`${student.compliance}%`} />
              <Stat label="Plan" value={student.plan} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-surface">
              <Pencil className="h-3.5 w-3.5" /> Editar alumno
            </button>
            <button onClick={() => setTab("chat")} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-surface">
              <MessageSquare className="h-3.5 w-3.5" /> Mensaje
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-surface">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {showChecklist && (
        <SetupChecklist
          items={checklist}
          completed={completed}
          total={checklist.length}
          onGo={(k) => {
            if (k === "datos") setEditing(true);
            else if (k === "rutina") setTab("entrenos");
            else if (k === "nutricion") setTab("nutricion");
            else if (k === "habitos") setTab("habitos");
            else if (k === "revision") setTab("progreso");
          }}
        />
      )}

      {/* Tabs */}
      <div className="mt-5 flex gap-1 overflow-x-auto rounded-xl border border-border bg-background p-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${
                active ? "bg-foreground text-background" : "text-ink-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        {tab === "resumen" && <ResumenTab student={student} isNew={isNew} onGoReview={() => setTab("progreso")} />}
        {tab === "entrenos" && (
          <TabShell
            title="Entrenamientos"
            actions={
              <TabActions
                kind="workout"
                studentName={student.name}
                onToast={pushToast}
                deleted={workoutDeleted}
                onDeletedChange={setWorkoutDeleted}
              />
            }
          >
            {workoutDeleted ? (
              <EmptyDeletedState kind="workout" />
            ) : (
              <WorkoutRoutine studentId={student.id} onToast={pushToast} />
            )}
          </TabShell>
        )}
        {tab === "nutricion" && (
          <TabShell
            title="Nutrición"
            actions={
              <TabActions
                kind="nutrition"
                studentName={student.name}
                onToast={pushToast}
                deleted={nutritionDeleted}
                onDeletedChange={setNutritionDeleted}
              />
            }
          >
            {nutritionDeleted ? (
              <EmptyDeletedState kind="nutrition" />
            ) : (
              <NutritionPlan studentId={student.id} onToast={pushToast} />
            )}
          </TabShell>
        )}
        {tab === "progreso" && <ProgresoTab student={student} isNew={isNew} onToast={pushToast} />}
        {tab === "habitos" && <HabitosTab student={student} isNew={isNew} onToast={pushToast} />}
        {tab === "multimedia" && <MultimediaTab student={student} isNew={isNew} onToast={pushToast} />}
        {tab === "chat" && <ChatTab student={student} isNew={isNew} />}
      </div>
      <EditStudentSheet student={student} open={editing} onClose={() => setEditing(false)} />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

/* ---------- Setup checklist ---------- */

function SetupChecklist({
  items,
  completed,
  total,
  onGo,
}: {
  items: { key: string; label: string; done: boolean }[];
  completed: number;
  total: number;
  onGo: (key: string) => void;
}) {
  const pct = Math.round((completed / total) * 100);
  return (
    <section className="mt-4 rounded-2xl border border-border bg-background p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">Configuración inicial</h3>
          <p className="text-xs text-ink-muted">Completa estos pasos para tener la ficha lista.</p>
        </div>
        <div className="text-xs font-medium text-ink-muted">
          {completed}/{total} · {pct}%
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
      </div>
      <ul className="mt-4 grid gap-2 md:grid-cols-2">
        {items.map((it) => (
          <li
            key={it.key}
            className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2"
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`grid h-5 w-5 place-items-center rounded-full ${
                  it.done ? "bg-emerald-100 text-emerald-700" : "bg-surface text-ink-muted"
                }`}
              >
                {it.done ? <Check className="h-3 w-3" /> : <Circle className="h-2.5 w-2.5" />}
              </span>
              <span className={`text-sm ${it.done ? "text-ink-muted line-through" : ""}`}>
                {it.label}
              </span>
            </div>
            {!it.done && (
              <button
                onClick={() => onGo(it.key)}
                className="text-xs font-medium text-brand hover:underline"
              >
                Ir
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- Shared ---------- */

function TabShell({
  title,
  actions,
  children,
}: {
  title: string;
  actions: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wide text-ink-muted">{title}</h2>
        {actions}
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-background">
      <div className="border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-ink-muted">{subtitle}</p>}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function EmptyPanel({
  icon: Icon,
  title,
  description,
  cta,
  onCta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  cta?: string;
  onCta?: () => void;
}) {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-surface/30 p-10 text-center">
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-background shadow-sm">
        <Icon className="h-5 w-5 text-ink-muted" />
      </div>
      <h4 className="mt-3 text-sm font-semibold">{title}</h4>
      <p className="mx-auto mt-1 max-w-sm text-xs text-ink-muted">{description}</p>
      {cta && (
        <button
          onClick={onCta}
          className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-3.5 text-sm font-medium text-background hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> {cta}
        </button>
      )}
    </section>
  );
}

/* ---------- Resumen ---------- */

function ResumenTab({
  student,
  isNew,
  onGoReview,
}: {
  student: StudentExt;
  isNew: boolean;
  onGoReview: () => void;
}) {
  const logsRaw = useDemoStore((s) => s.weightLogs[student.id]); const logs = logsRaw ?? [];
  const reviewsRaw = useDemoStore((s) => s.reviews[student.id]); const reviews = reviewsRaw ?? [];

  const hasProgress = isNew ? logs.length > 0 : true;
  const series = isNew ? logs.map((l) => l.kg) : seedWeightSeries.map((p) => p.kg);
  const progress =
    student.weightStart && student.weightGoal && student.weightStart !== student.weightGoal
      ? ((student.weightStart - student.weight) / (student.weightStart - student.weightGoal)) * 100
      : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card title="Evolución del peso" subtitle={hasProgress ? "Datos de revisiones" : "Sin datos todavía"}>
        {hasProgress ? (
          <>
            <MiniChart series={series} />
            <div className="mt-3 flex items-center justify-between text-xs text-ink-muted">
              <span>Inicio: {student.weightStart || "—"} kg</span>
              <span className="font-medium text-emerald-600">
                {student.weightStart && student.weight
                  ? `${student.weightStart - student.weight >= 0 ? "−" : "+"}${Math.abs(student.weightStart - student.weight).toFixed(1)} kg`
                  : ""}
              </span>
              <span>Objetivo: {student.weightGoal || "—"} kg</span>
            </div>
          </>
        ) : (
          <div className="py-6 text-center text-xs text-ink-muted">
            La gráfica se construirá cuando registres la primera revisión.
            <div className="mt-3">
              <button
                onClick={onGoReview}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium hover:bg-surface"
              >
                <Plus className="h-3.5 w-3.5" /> Añadir revisión
              </button>
            </div>
          </div>
        )}
      </Card>
      <Card title="Progreso hacia el objetivo">
        {hasProgress && student.weightStart && student.weightGoal ? (
          <>
            <div className="text-3xl font-semibold tracking-tight">{Math.max(0, Math.round(progress))}%</div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface">
              <div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
            </div>
            <p className="mt-3 text-xs text-ink-muted">
              Actualizado con la última revisión registrada.
            </p>
          </>
        ) : (
          <p className="py-6 text-center text-xs text-ink-muted">
            Sin datos para calcular el progreso.
          </p>
        )}
      </Card>
      <Card title="Últimas revisiones">
        {isNew ? (
          reviews.length === 0 ? (
            <p className="py-6 text-center text-xs text-ink-muted">Aún no hay revisiones.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {reviews
                .slice()
                .reverse()
                .slice(0, 4)
                .map((r) => (
                  <li key={r.id} className="flex items-start gap-2.5">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <div>
                      <div>Revisión {formatDate(r.date)}</div>
                      <div className="text-xs text-ink-muted">
                        {r.weight ? `${r.weight} kg` : ""}
                        {r.notes ? ` · ${r.notes.slice(0, 60)}` : ""}
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          )
        ) : (
          <ul className="space-y-3 text-sm">
            {["Revisión semanal 24 Nov", "Ajuste de dieta 17 Nov", "Cambio de rutina 10 Nov"].map((r) => (
              <li key={r} className="flex items-start gap-2.5">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                <div>
                  <div>{r}</div>
                  <div className="text-xs text-ink-muted">Notas y ajustes registrados</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <div className="lg:col-span-3">
        <Card title="Notas del entrenador">
          <p className="text-sm text-ink-muted">
            {student.coachNotes && student.coachNotes.trim()
              ? student.coachNotes
              : isNew
                ? "Todavía no hay notas. Añádelas desde “Editar alumno”."
                : `${student.name.split(" ")[0]} está respondiendo bien al plan. Mantener las cargas y ajustar carbohidratos según progreso.`}
          </p>
        </Card>
      </div>
    </div>
  );
}

/* ---------- Progreso ---------- */

function ProgresoTab({
  student,
  isNew,
  onToast,
}: {
  student: StudentExt;
  isNew: boolean;
  onToast: (t: string) => void;
}) {
  const logsRaw = useDemoStore((s) => s.weightLogs[student.id]); const logs = logsRaw ?? [];
  const reviewsRaw = useDemoStore((s) => s.reviews[student.id]); const reviews = reviewsRaw ?? [];
  const addReview = useDemoStore((s) => s.addReview);
  const removeReview = useDemoStore((s) => s.removeReview);
  const [reviewOpen, setReviewOpen] = useState(false);

  if (!isNew) {
    return (
      <div className="space-y-4">
        <Card title="Evolución del peso" subtitle="12 semanas · −4,4 kg">
          <MiniChart series={seedWeightSeries.map((p) => p.kg)} />
        </Card>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Antes y después" subtitle="Semana 1 vs Semana 12">
            <div className="grid grid-cols-2 gap-3">
              <figure>
                <img src={gallery[0]} alt="antes" className="h-64 w-full rounded-xl object-cover" />
                <figcaption className="mt-2 text-center text-xs text-ink-muted">Semana 1 · 78,4 kg</figcaption>
              </figure>
              <figure>
                <img src={gallery[1]} alt="después" className="h-64 w-full rounded-xl object-cover" />
                <figcaption className="mt-2 text-center text-xs text-ink-muted">Semana 12 · 74,0 kg</figcaption>
              </figure>
            </div>
          </Card>
          <Card title="Medidas corporales">
            <ul className="space-y-3">
              {seedMeasurements.map((m) => {
                const diff = m.current - m.start;
                const positive = m.part === "% Grasa" || m.part === "Cintura" || m.part === "Cadera" ? diff < 0 : diff > 0;
                return (
                  <li key={m.part} className="flex items-center justify-between text-sm">
                    <span className="text-ink-muted">{m.part}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-ink-muted">{m.start}{m.unit}</span>
                      <span>→</span>
                      <span className="font-medium">{m.current}{m.unit}</span>
                      <span className={`w-14 text-right text-xs font-medium ${positive ? "text-emerald-600" : "text-rose-600"}`}>
                        {diff > 0 ? "+" : ""}{diff.toFixed(1)}{m.unit}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-background">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div>
            <h3 className="text-sm font-semibold">Evolución del peso</h3>
            <p className="text-xs text-ink-muted">
              {logs.length === 0
                ? "Sin registros. Añade una revisión para construir la gráfica."
                : `${logs.length} ${logs.length === 1 ? "registro" : "registros"} · ${logs[0].kg} kg → ${logs[logs.length - 1].kg} kg`}
            </p>
          </div>
          <button
            onClick={() => setReviewOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" /> Añadir revisión
          </button>
        </div>
        <div className="p-5">
          {logs.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-surface">
                <TrendingUp className="h-5 w-5 text-ink-muted" />
              </div>
              <p className="mx-auto mt-2 max-w-sm text-xs text-ink-muted">
                La gráfica y el peso actual se actualizarán automáticamente con cada revisión.
              </p>
            </div>
          ) : (
            <MiniChart series={logs.map((l) => l.kg)} />
          )}
        </div>
      </section>

      <Card title="Historial de revisiones" subtitle={`${reviews.length} ${reviews.length === 1 ? "revisión" : "revisiones"}`}>
        {reviews.length === 0 ? (
          <p className="py-6 text-center text-xs text-ink-muted">Aún no hay revisiones registradas.</p>
        ) : (
          <ul className="divide-y divide-border">
            {reviews
              .slice()
              .reverse()
              .map((r) => (
                <ReviewRow key={r.id} review={r} onDelete={() => removeReview(student.id, r.id)} />
              ))}
          </ul>
        )}
      </Card>

      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onSave={(r) => {
          addReview(student.id, r);
          setReviewOpen(false);
          onToast("Revisión registrada. Peso y gráfica actualizados.");
        }}
      />
    </div>
  );
}

function ReviewRow({ review, onDelete }: { review: Review; onDelete: () => void }) {
  return (
    <li className="flex items-start justify-between gap-3 py-3">
      <div>
        <div className="text-sm font-medium">{formatDate(review.date)}</div>
        <div className="mt-0.5 text-xs text-ink-muted">
          {review.weight ? `${review.weight} kg` : "—"}
          {review.bodyFat ? ` · ${review.bodyFat}% grasa` : ""}
        </div>
        {review.notes && <p className="mt-1 text-sm text-foreground/80">{review.notes}</p>}
      </div>
      <button
        onClick={onDelete}
        className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-surface hover:text-rose-600"
        aria-label="Eliminar revisión"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}

function ReviewModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (r: Omit<Review, "id">) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [notes, setNotes] = useState("");

  const reset = () => {
    setDate(today);
    setWeight("");
    setBodyFat("");
    setNotes("");
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        reset();
      }}
      title="Nueva revisión"
      description="Registra el peso y las notas de esta revisión."
      footer={
        <>
          <ModalButton
            variant="ghost"
            onClick={() => {
              onClose();
              reset();
            }}
          >
            Cancelar
          </ModalButton>
          <ModalButton
            variant="primary"
            onClick={() => {
              onSave({
                date,
                weight: weight ? Number(weight) : undefined,
                bodyFat: bodyFat ? Number(bodyFat) : undefined,
                notes: notes.trim() || undefined,
              });
              reset();
            }}
          >
            Guardar revisión
          </ModalButton>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="Fecha">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Peso (kg)">
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className={inputCls}
            placeholder="0.0"
          />
        </Field>
        <Field label="% Grasa">
          <input
            type="number"
            step="0.1"
            value={bodyFat}
            onChange={(e) => setBodyFat(e.target.value)}
            className={inputCls}
            placeholder="Opcional"
          />
        </Field>
      </div>
      <Field label="Notas">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={textareaCls}
          placeholder="Ajustes, sensaciones, evolución…"
        />
      </Field>
    </Modal>
  );
}

/* ---------- Hábitos ---------- */

function HabitosTab({
  student,
  isNew,
  onToast,
}: {
  student: StudentExt;
  isNew: boolean;
  onToast: (t: string) => void;
}) {
  const configured = useDemoStore((s) => s.habitsConfigured[student.id]);
  const configure = useDemoStore((s) => s.configureHabits);

  if (isNew && !configured) {
    return (
      <EmptyPanel
        icon={Activity}
        title="Los hábitos aún no están configurados"
        description="Activa los hábitos que quieras seguir con este alumno (pasos, agua, sueño, ánimo)."
        cta="Configurar hábitos"
        onCta={() => {
          configure(student.id);
          onToast("Hábitos configurados. Empezarán a llenarse con los registros del alumno.");
        }}
      />
    );
  }

  const empty = isNew && configured;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card title="Pasos diarios" subtitle={empty ? "Sin registros esta semana" : `Media: ${Math.round(habitsData.steps.reduce((a, b) => a + b, 0) / 7).toLocaleString()} pasos`}>
        <BarSeries data={empty ? [0, 0, 0, 0, 0, 0, 0] : habitsData.steps} max={10000} unit=" pasos" colorClass="bg-brand" />
      </Card>
      <Card title="Litros de agua" subtitle="Objetivo: 3 L">
        <BarSeries data={empty ? [0, 0, 0, 0, 0, 0, 0] : habitsData.water} max={4} unit=" L" colorClass="bg-sky-500" />
      </Card>
      <Card title="Horas de sueño" subtitle={empty ? "Sin registros" : "Media: 7,3 h"}>
        <BarSeries data={empty ? [0, 0, 0, 0, 0, 0, 0] : habitsData.sleep} max={9} unit=" h" colorClass="bg-indigo-500" />
      </Card>
      <Card title="Estado de ánimo" subtitle={empty ? "Sin registros" : "Media: 4/5"}>
        <BarSeries data={empty ? [0, 0, 0, 0, 0, 0, 0] : habitsData.mood} max={5} unit="/5" colorClass="bg-emerald-500" />
      </Card>
    </div>
  );
}

function BarSeries({ data, max, unit, colorClass }: { data: number[]; max: number; unit: string; colorClass: string }) {
  const days = ["L", "M", "X", "J", "V", "S", "D"];
  return (
    <div>
      <div className="flex h-32 items-end gap-2">
        {data.map((v, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-full w-full items-end">
              <div
                className={`w-full rounded-t-md ${colorClass}`}
                style={{ height: `${max ? (v / max) * 100 : 0}%` }}
                title={`${v}${unit}`}
              />
            </div>
            <div className="text-[10px] text-ink-muted">{days[i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Multimedia ---------- */

function MultimediaTab({
  student,
  isNew,
  onToast,
}: {
  student: StudentExt;
  isNew: boolean;
  onToast: (t: string) => void;
}) {
  const filesRaw = useDemoStore((s) => s.media[student.id]); const files = filesRaw ?? [];
  const addMedia = useDemoStore((s) => s.addMedia);
  const removeMedia = useDemoStore((s) => s.removeMedia);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    Array.from(fileList).forEach((f) => {
      const url = URL.createObjectURL(f);
      const kind = f.type.startsWith("image/") ? "image" : f.type.startsWith("video/") ? "video" : "file";
      addMedia(student.id, { name: f.name, url, kind });
    });
    onToast(`Se añadieron ${fileList.length} ${fileList.length === 1 ? "archivo" : "archivos"}.`);
  };

  if (isNew && files.length === 0) {
    return (
      <>
        <EmptyPanel
          icon={ImageIcon}
          title="Todavía no hay archivos"
          description="Sube fotos de progreso, vídeos de técnica o documentos que quieras compartir."
          cta="Añadir archivo"
          onCta={() => inputRef.current?.click()}
        />
        <input ref={inputRef} type="file" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
      </>
    );
  }

  if (isNew) {
    return (
      <>
        <Card
          title="Galería"
          subtitle={`${files.length} ${files.length === 1 ? "archivo" : "archivos"}`}
        >
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface"
            >
              <Upload className="h-3.5 w-3.5" /> Subir más
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {files.map((f) => (
              <div key={f.id} className="group relative overflow-hidden rounded-xl border border-border">
                {f.kind === "image" ? (
                  <img src={f.url} alt={f.name} className="aspect-[4/5] w-full object-cover" />
                ) : (
                  <div className="aspect-[4/5] w-full bg-surface p-3 text-xs">
                    <div className="font-medium">{f.name}</div>
                    <div className="mt-1 text-ink-muted">{f.kind}</div>
                  </div>
                )}
                <button
                  onClick={() => removeMedia(student.id, f.id)}
                  className="absolute right-1.5 top-1.5 hidden h-7 w-7 place-items-center rounded-lg bg-black/60 text-white group-hover:grid"
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </Card>
        <input ref={inputRef} type="file" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
      </>
    );
  }

  return (
    <Card title="Galería de progreso" subtitle="Fotos, vídeos y archivos enviados">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {gallery.map((src, i) => (
          <div key={i} className="group relative overflow-hidden rounded-xl">
            <img src={src} alt="" className="aspect-[4/5] w-full object-cover transition-transform group-hover:scale-105" />
            <div className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
              Semana {i + 1}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------- Chat ---------- */

function ChatTab({ student, isNew }: { student: StudentExt; isNew: boolean }) {
  const stored = useDemoStore((s) => s.messages[student.id]);
  const sendMessage = useDemoStore((s) => s.sendMessage);
  const [text, setText] = useState("");

  const messages = isNew ? stored ?? [] : stored ?? seedChat.map((m, i) => ({ id: `s-${i}`, ...m }));

  const send = () => {
    if (!text.trim()) return;
    sendMessage(student.id, { from: "coach", text: text.trim() });
    setText("");
  };

  return (
    <Card title="Conversación">
      <div className="flex h-[420px] flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-surface">
                <MessageSquare className="h-5 w-5 text-ink-muted" />
              </div>
              <p className="mt-2 max-w-xs text-xs text-ink-muted">
                Todavía no hay mensajes. Escribe el primero para iniciar la conversación.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isCoach = m.from === "coach";
              return (
                <div key={m.id} className={`flex ${isCoach ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                      isCoach ? "bg-foreground text-background" : "bg-surface text-foreground"
                    }`}
                  >
                    <div>{m.text}</div>
                    <div className={`mt-1 text-[10px] ${isCoach ? "text-background/60" : "text-ink-muted"}`}>
                      {m.time}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Escribe un mensaje…"
            className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground/20"
          />
          <button
            onClick={send}
            className="grid h-10 w-10 place-items-center rounded-lg bg-foreground text-background hover:opacity-90"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}

/* ---------- Charts + helpers ---------- */

function MiniChart({ series }: { series: number[] }) {
  if (series.length < 2) {
    // Single point → show a dot centered
    return (
      <div className="flex h-32 items-center justify-center text-xs text-ink-muted">
        {series.length === 1 ? `${series[0]} kg` : "Sin datos"}
      </div>
    );
  }
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const points = series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * 100;
      const y = 100 - ((v - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-32 w-full">
      <defs>
        <linearGradient id="wg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.55 0.22 260)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="oklch(0.55 0.22 260)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill="url(#wg)" stroke="none" points={`0,100 ${points} 100,100`} />
      <polyline
        fill="none"
        stroke="oklch(0.55 0.22 260)"
        strokeWidth="1.5"
        points={points}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}
