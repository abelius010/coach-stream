import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { useDemoStore, type NewStudentInput } from "../lib/demo-store";
import { Field, inputCls, selectCls, textareaCls } from "../components/demo/Field";

export const Route = createFileRoute("/demo/alumnos/nuevo")({
  component: NuevoAlumno,
});

type Draft = {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  age: string;
  sex: "" | "hombre" | "mujer" | "otro";
  startDate: string;
  avatar: string;
  height: string;
  weightStart: string;
  weight: string;
  weightGoal: string;
  bodyFat: string;
  chest: string;
  arm: string;
  waist: string;
  hip: string;
  thigh: string;
  goal: string;
  secondaryGoal: string;
  experience: "" | "principiante" | "intermedio" | "avanzado";
  daysPerWeek: string;
  sessionMinutes: string;
  equipment: string;
  preference: string;
  injuries: string;
  coachNotes: string;
};

const empty: Draft = {
  name: "", lastName: "", email: "", phone: "", birthDate: "", age: "", sex: "",
  startDate: new Date().toISOString().slice(0, 10),
  avatar: "", height: "", weightStart: "", weight: "", weightGoal: "",
  bodyFat: "", chest: "", arm: "", waist: "", hip: "", thigh: "",
  goal: "", secondaryGoal: "", experience: "", daysPerWeek: "", sessionMinutes: "",
  equipment: "", preference: "", injuries: "", coachNotes: "",
};

const DRAFT_KEY = "fitflow-demo-nuevo-draft";

const goals = [
  "Pérdida de grasa", "Ganancia muscular", "Fuerza", "Rendimiento deportivo",
  "Salud general", "Preparación para competición", "Otro",
];

const steps = ["Datos personales", "Datos físicos", "Objetivo y experiencia", "Resumen"] as const;

function NuevoAlumno() {
  const navigate = useNavigate();
  const addStudent = useDemoStore((s) => s.addStudent);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(() => {
    if (typeof window === "undefined") return empty;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      return raw ? { ...empty, ...JSON.parse(raw) } : empty;
    } catch { return empty; }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const validateStep = (s: number): Record<string, string> => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!draft.name.trim()) e.name = "Obligatorio";
      if (!draft.lastName.trim()) e.lastName = "Obligatorio";
      if (!draft.email.trim()) e.email = "Obligatorio";
      else if (!/^\S+@\S+\.\S+$/.test(draft.email)) e.email = "Email no válido";
      if (!draft.sex) e.sex = "Selecciona una opción";
      if (!draft.startDate) e.startDate = "Obligatorio";
      if (!draft.birthDate && !draft.age) e.age = "Indica edad o fecha de nacimiento";
    }
    if (s === 1) {
      if (!draft.height) e.height = "Obligatorio";
      if (!draft.weightStart) e.weightStart = "Obligatorio";
      if (!draft.weight) e.weight = "Obligatorio";
      if (!draft.weightGoal) e.weightGoal = "Obligatorio";
    }
    if (s === 2) {
      if (!draft.goal) e.goal = "Selecciona un objetivo";
      if (!draft.experience) e.experience = "Selecciona un nivel";
      if (!draft.daysPerWeek) e.daysPerWeek = "Obligatorio";
    }
    return e;
  };

  const next = () => {
    const e = validateStep(step);
    setErrors(e);
    if (Object.keys(e).length === 0) setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const saveDraft = () => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch {}
  };

  const cancel = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    navigate({ to: "/demo/alumnos" });
  };

  const submit = () => {
    const input: NewStudentInput = {
      name: draft.name.trim(),
      lastName: draft.lastName.trim() || undefined,
      email: draft.email.trim() || undefined,
      phone: draft.phone.trim() || undefined,
      birthDate: draft.birthDate || undefined,
      age: draft.age ? Number(draft.age) : (draft.birthDate ? Math.max(0, new Date().getFullYear() - new Date(draft.birthDate).getFullYear()) : 0),
      sex: (draft.sex || undefined) as NewStudentInput["sex"],
      startDate: draft.startDate ? new Date(draft.startDate).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : new Date().toLocaleDateString("es-ES"),
      avatar: draft.avatar || undefined,
      height: Number(draft.height) || 0,
      weight: Number(draft.weight) || 0,
      weightStart: Number(draft.weightStart) || 0,
      weightGoal: Number(draft.weightGoal) || 0,
      bodyFat: draft.bodyFat ? Number(draft.bodyFat) : undefined,
      measurements: {
        chest: draft.chest ? Number(draft.chest) : undefined,
        arm: draft.arm ? Number(draft.arm) : undefined,
        waist: draft.waist ? Number(draft.waist) : undefined,
        hip: draft.hip ? Number(draft.hip) : undefined,
        thigh: draft.thigh ? Number(draft.thigh) : undefined,
      },
      goal: draft.goal,
      secondaryGoal: draft.secondaryGoal || undefined,
      experience: (draft.experience || undefined) as NewStudentInput["experience"],
      daysPerWeek: draft.daysPerWeek ? Number(draft.daysPerWeek) : undefined,
      sessionMinutes: draft.sessionMinutes ? Number(draft.sessionMinutes) : undefined,
      equipment: draft.equipment ? draft.equipment.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      preference: draft.preference || undefined,
      injuries: draft.injuries || undefined,
      coachNotes: draft.coachNotes || undefined,
      plan: "Sin plan asignado",
    };
    const id = addStudent(input);
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    navigate({ to: "/demo/alumnos/$id", params: { id } });
  };

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <Link to="/demo/alumnos" className="mb-4 inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Volver a alumnos
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo alumno</h1>
        <p className="mt-1 text-sm text-ink-muted">Paso {step + 1} de {steps.length} · {steps[step]}</p>
        <div className="mt-4 flex gap-1.5">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-foreground" : "bg-border"}`} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-background p-5 md:p-6">
        {step === 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nombre" required error={errors.name}>
              <input className={inputCls} value={draft.name} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <Field label="Apellidos" required error={errors.lastName}>
              <input className={inputCls} value={draft.lastName} onChange={(e) => set("lastName", e.target.value)} />
            </Field>
            <Field label="Correo electrónico" required error={errors.email}>
              <input type="email" className={inputCls} value={draft.email} onChange={(e) => set("email", e.target.value)} />
            </Field>
            <Field label="Teléfono" hint="Opcional">
              <input className={inputCls} value={draft.phone} onChange={(e) => set("phone", e.target.value)} />
            </Field>
            <Field label="Fecha de nacimiento" hint="O indica solo la edad">
              <input type="date" className={inputCls} value={draft.birthDate} onChange={(e) => set("birthDate", e.target.value)} />
            </Field>
            <Field label="Edad" error={errors.age}>
              <input type="number" min={0} className={inputCls} value={draft.age} onChange={(e) => set("age", e.target.value)} />
            </Field>
            <Field label="Sexo" required error={errors.sex}>
              <select className={selectCls} value={draft.sex} onChange={(e) => set("sex", e.target.value as Draft["sex"])}>
                <option value="">Selecciona…</option>
                <option value="hombre">Hombre</option>
                <option value="mujer">Mujer</option>
                <option value="otro">Otro</option>
              </select>
            </Field>
            <Field label="Fecha de inicio" required error={errors.startDate}>
              <input type="date" className={inputCls} value={draft.startDate} onChange={(e) => set("startDate", e.target.value)} />
            </Field>
            <div className="md:col-span-2">
              <Field label="URL de foto" hint="Opcional. Si no indicas ninguna se generará una automática.">
                <input className={inputCls} placeholder="https://…" value={draft.avatar} onChange={(e) => set("avatar", e.target.value)} />
              </Field>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Altura (cm)" required error={errors.height}>
              <input type="number" className={inputCls} value={draft.height} onChange={(e) => set("height", e.target.value)} />
            </Field>
            <Field label="Peso inicial (kg)" required error={errors.weightStart}>
              <input type="number" step="0.1" className={inputCls} value={draft.weightStart} onChange={(e) => set("weightStart", e.target.value)} />
            </Field>
            <Field label="Peso actual (kg)" required error={errors.weight}>
              <input type="number" step="0.1" className={inputCls} value={draft.weight} onChange={(e) => set("weight", e.target.value)} />
            </Field>
            <Field label="Peso objetivo (kg)" required error={errors.weightGoal}>
              <input type="number" step="0.1" className={inputCls} value={draft.weightGoal} onChange={(e) => set("weightGoal", e.target.value)} />
            </Field>
            <Field label="% Grasa corporal" hint="Opcional">
              <input type="number" step="0.1" className={inputCls} value={draft.bodyFat} onChange={(e) => set("bodyFat", e.target.value)} />
            </Field>
            <div className="md:col-span-2">
              <div className="mb-2 text-xs font-medium">Medidas corporales (cm) · Opcional</div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {(["chest", "arm", "waist", "hip", "thigh"] as const).map((k) => (
                  <Field key={k} label={{ chest: "Pecho", arm: "Brazo", waist: "Cintura", hip: "Cadera", thigh: "Muslo" }[k]}>
                    <input type="number" className={inputCls} value={draft[k]} onChange={(e) => set(k, e.target.value)} />
                  </Field>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Objetivo principal" required error={errors.goal}>
              <select className={selectCls} value={draft.goal} onChange={(e) => set("goal", e.target.value)}>
                <option value="">Selecciona…</option>
                {goals.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Objetivo secundario" hint="Opcional">
              <select className={selectCls} value={draft.secondaryGoal} onChange={(e) => set("secondaryGoal", e.target.value)}>
                <option value="">Ninguno</option>
                {goals.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Nivel de experiencia" required error={errors.experience}>
              <select className={selectCls} value={draft.experience} onChange={(e) => set("experience", e.target.value as Draft["experience"])}>
                <option value="">Selecciona…</option>
                <option value="principiante">Principiante</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </Field>
            <Field label="Días de entrenamiento / semana" required error={errors.daysPerWeek}>
              <input type="number" min={1} max={7} className={inputCls} value={draft.daysPerWeek} onChange={(e) => set("daysPerWeek", e.target.value)} />
            </Field>
            <Field label="Tiempo por sesión (min)">
              <input type="number" className={inputCls} value={draft.sessionMinutes} onChange={(e) => set("sessionMinutes", e.target.value)} />
            </Field>
            <Field label="Preferencia de entrenamiento" hint="Ej: Full body, hipertrofia, PPL…">
              <input className={inputCls} value={draft.preference} onChange={(e) => set("preference", e.target.value)} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Material disponible" hint="Separado por comas. Ej: Mancuernas, banco, barra">
                <input className={inputCls} value={draft.equipment} onChange={(e) => set("equipment", e.target.value)} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Lesiones o limitaciones">
                <textarea className={textareaCls} value={draft.injuries} onChange={(e) => set("injuries", e.target.value)} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Observaciones del entrenador">
                <textarea className={textareaCls} value={draft.coachNotes} onChange={(e) => set("coachNotes", e.target.value)} />
              </Field>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <Summary title="Datos personales" rows={[
              ["Nombre", `${draft.name} ${draft.lastName}`.trim() || "—"],
              ["Email", draft.email || "—"],
              ["Teléfono", draft.phone || "—"],
              ["Sexo", draft.sex || "—"],
              ["Edad", draft.age || "—"],
              ["Fecha de inicio", draft.startDate || "—"],
            ]} onEdit={() => setStep(0)} />
            <Summary title="Datos físicos" rows={[
              ["Altura", draft.height ? `${draft.height} cm` : "—"],
              ["Peso inicial", draft.weightStart ? `${draft.weightStart} kg` : "—"],
              ["Peso actual", draft.weight ? `${draft.weight} kg` : "—"],
              ["Peso objetivo", draft.weightGoal ? `${draft.weightGoal} kg` : "—"],
              ["% Grasa", draft.bodyFat || "—"],
            ]} onEdit={() => setStep(1)} />
            <Summary title="Objetivo y experiencia" rows={[
              ["Objetivo", draft.goal || "—"],
              ["Secundario", draft.secondaryGoal || "—"],
              ["Experiencia", draft.experience || "—"],
              ["Días/semana", draft.daysPerWeek || "—"],
              ["Min/sesión", draft.sessionMinutes || "—"],
              ["Material", draft.equipment || "—"],
              ["Lesiones", draft.injuries || "—"],
              ["Notas", draft.coachNotes || "—"],
            ]} onEdit={() => setStep(2)} />
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button onClick={cancel} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-surface">
            <X className="h-3.5 w-3.5" /> Cancelar
          </button>
          <button onClick={saveDraft} className="rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-surface">
            Guardar borrador
          </button>
        </div>
        <div className="flex gap-2">
          {step > 0 && (
            <button onClick={back} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-surface">
              <ArrowLeft className="h-3.5 w-3.5" /> Anterior
            </button>
          )}
          {step < steps.length - 1 ? (
            <button onClick={next} className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90">
              Continuar <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button onClick={submit} className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90">
              <Check className="h-3.5 w-3.5" /> Crear alumno
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Summary({ title, rows, onEdit }: { title: string; rows: [string, string][]; onEdit: () => void }) {
  return (
    <div className="rounded-xl border border-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button onClick={onEdit} className="text-xs text-brand hover:underline">Editar información</button>
      </div>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 px-4 py-3 text-sm md:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 border-b border-dashed border-border/60 py-1 last:border-0">
            <dt className="text-ink-muted">{k}</dt>
            <dd className="text-right font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
