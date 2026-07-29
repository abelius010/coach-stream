import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useDemoStore, type StudentExt } from "../../lib/demo-store";
import { Field, inputCls, selectCls, textareaCls } from "./Field";

export function EditStudentSheet({ student, open, onClose }: { student: StudentExt; open: boolean; onClose: () => void }) {
  const update = useDemoStore((s) => s.updateStudent);
  const [form, setForm] = useState(student);

  useEffect(() => { setForm(student); }, [student, open]);

  if (!open) return null;

  const save = () => {
    update(student.id, {
      name: form.name,
      goal: form.goal,
      weight: Number(form.weight) || 0,
      weightStart: Number(form.weightStart) || 0,
      weightGoal: Number(form.weightGoal) || 0,
      height: Number(form.height) || 0,
      age: Number(form.age) || 0,
      plan: form.plan,
      status: form.status,
      email: form.email,
      phone: form.phone,
      goal2: undefined as never,
      coachNotes: form.coachNotes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-lg flex-col overflow-hidden bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold">Editar alumno</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-surface">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <Field label="Nombre completo">
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <input className={inputCls} value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Teléfono">
              <input className={inputCls} value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
            <Field label="Edad">
              <input type="number" className={inputCls} value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} />
            </Field>
            <Field label="Altura (cm)">
              <input type="number" className={inputCls} value={form.height} onChange={(e) => setForm({ ...form, height: Number(e.target.value) })} />
            </Field>
          </div>
          <Field label="Objetivo">
            <input className={inputCls} value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Peso inicial">
              <input type="number" step="0.1" className={inputCls} value={form.weightStart} onChange={(e) => setForm({ ...form, weightStart: Number(e.target.value) })} />
            </Field>
            <Field label="Peso actual">
              <input type="number" step="0.1" className={inputCls} value={form.weight} onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })} />
            </Field>
            <Field label="Peso objetivo">
              <input type="number" step="0.1" className={inputCls} value={form.weightGoal} onChange={(e) => setForm({ ...form, weightGoal: Number(e.target.value) })} />
            </Field>
          </div>
          <Field label="Plan asignado">
            <input className={inputCls} value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} />
          </Field>
          <Field label="Estado">
            <select className={selectCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as StudentExt["status"] })}>
              <option value="activo">Activo</option>
              <option value="atencion">Atención · revisión pendiente</option>
              <option value="riesgo">Inactivo · en riesgo</option>
            </select>
          </Field>
          <Field label="Notas del entrenador">
            <textarea className={textareaCls} value={form.coachNotes ?? ""} onChange={(e) => setForm({ ...form, coachNotes: e.target.value })} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
          <button onClick={onClose} className="rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-surface">Cancelar</button>
          <button onClick={save} className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90">Guardar cambios</button>
        </div>
      </div>
    </div>
  );
}
