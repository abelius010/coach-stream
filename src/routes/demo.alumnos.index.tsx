import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, Filter, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useDemoStore, type StudentExt } from "../lib/demo-store";
import { ActionMenu, type ActionItem } from "../components/demo/ActionMenu";
import { DeleteStudentDialog } from "../components/demo/DeleteStudentDialog";
import { EditStudentSheet } from "../components/demo/EditStudentSheet";
import { ToastStack, type ToastData } from "../components/demo/Toast";

export const Route = createFileRoute("/demo/alumnos/")({
  component: AlumnosList,
});

const statusStyle: Record<StudentExt["status"], string> = {
  activo: "bg-emerald-50 text-emerald-700",
  atencion: "bg-amber-50 text-amber-700",
  riesgo: "bg-rose-50 text-rose-700",
};

const statusLabel: Record<StudentExt["status"], string> = {
  activo: "Activo",
  atencion: "Atención",
  riesgo: "En riesgo",
};

type FilterKey = "todos" | "activos" | "inactivos" | "revision" | "nuevos";
const filterLabel: Record<FilterKey, string> = {
  todos: "Todos",
  activos: "Activos",
  inactivos: "Inactivos",
  revision: "Revisión pend.",
  nuevos: "Nuevos",
};

function AlumnosList() {
  const students = useDemoStore((s) => s.students);
  const role = useDemoStore((s) => s.role);
  const removeStudent = useDemoStore((s) => s.removeStudent);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<FilterKey>("todos");
  const [toDelete, setToDelete] = useState<StudentExt | null>(null);
  const [toEdit, setToEdit] = useState<StudentExt | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const pushToast = (text: string) =>
    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), text }]);
  const dismissToast = (tid: number) => setToasts((prev) => prev.filter((t) => t.id !== tid));

  const filtered = useMemo(() => {
    const now = Date.now();
    return students.filter((s) => {
      if (filter === "activos" && s.status !== "activo") return false;
      if (filter === "inactivos" && s.status !== "riesgo") return false;
      if (filter === "revision" && s.status !== "atencion") return false;
      if (filter === "nuevos") {
        const created = s.createdAt ? new Date(s.createdAt).getTime() : 0;
        if (!created || now - created > 30 * 24 * 60 * 60 * 1000) return false;
      }
      if (q && !s.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [students, q, filter]);

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Alumnos</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {students.length} alumnos · {filtered.length} mostrados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-surface">
            <Filter className="h-3.5 w-3.5" /> Filtros
          </button>
          <Link
            to="/demo/alumnos/nuevo"
            className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" /> Nuevo alumno
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre…"
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-ink-muted focus:border-foreground/20"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-background p-1">
          {(Object.keys(filterLabel) as FilterKey[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs ${
                filter === f ? "bg-foreground text-background" : "text-ink-muted hover:text-foreground"
              }`}
            >
              {filterLabel[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-background">
        <div className="hidden grid-cols-12 gap-4 border-b border-border bg-surface/50 px-5 py-2.5 text-[11px] font-medium uppercase tracking-wide text-ink-muted md:grid">
          <div className="col-span-4">Alumno</div>
          <div className="col-span-2">Objetivo</div>
          <div className="col-span-1 text-right">Peso</div>
          <div className="col-span-2">Estado</div>
          <div className="col-span-2">Última conexión</div>
          <div className="col-span-1 text-right">Cumpl.</div>
        </div>
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-muted">
            No hay alumnos que coincidan con la búsqueda.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((s) => {
              const menuItems: ActionItem[] = [
                {
                  icon: <Eye className="h-3.5 w-3.5" />,
                  label: "Ver alumno",
                  onClick: () => navigate({ to: "/demo/alumnos/$id", params: { id: s.id } }),
                },
                {
                  icon: <Pencil className="h-3.5 w-3.5" />,
                  label: "Editar alumno",
                  onClick: () => setToEdit(s),
                },
                {
                  icon: <Trash2 className="h-3.5 w-3.5" />,
                  label: "Eliminar alumno",
                  onClick: () => setToDelete(s),
                  danger: true,
                },
              ];
              return (
                <li key={s.id} className="group relative">
                  <Link
                    to="/demo/alumnos/$id"
                    params={{ id: s.id }}
                    className={`grid grid-cols-2 items-center gap-4 px-5 py-3 hover:bg-surface/50 md:grid-cols-12 ${role === "coach" ? "pr-14" : ""}`}
                  >
                    <div className="col-span-2 flex items-center gap-3 md:col-span-4">
                      <img src={s.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{s.name}</div>
                        <div className="truncate text-xs text-ink-muted md:hidden">{s.goal}</div>
                      </div>
                    </div>
                    <div className="hidden text-sm text-ink-muted md:col-span-2 md:block">{s.goal}</div>
                    <div className="hidden text-right text-sm md:col-span-1 md:block">{s.weight} kg</div>
                    <div className="col-span-1 md:col-span-2">
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${statusStyle[s.status]}`}>
                        {statusLabel[s.status]}
                      </span>
                    </div>
                    <div className="hidden text-sm text-ink-muted md:col-span-2 md:block">{s.lastActive}</div>
                    <div className="col-span-1 text-right">
                      <div className="text-sm font-semibold">{s.compliance}%</div>
                      <div className="mt-1 h-1 w-14 overflow-hidden rounded-full bg-surface md:ml-auto">
                        <div
                          className={`h-full ${s.compliance >= 85 ? "bg-emerald-500" : s.compliance >= 65 ? "bg-amber-500" : "bg-rose-500"}`}
                          style={{ width: `${s.compliance}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                  {role === "coach" && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <ActionMenu items={menuItems} alwaysVisible label={`Acciones de ${s.name}`} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {toEdit && (
        <EditStudentSheet student={toEdit} open={!!toEdit} onClose={() => setToEdit(null)} />
      )}
      <DeleteStudentDialog
        open={!!toDelete}
        studentName={toDelete?.name ?? ""}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          removeStudent(toDelete.id);
          setToDelete(null);
          pushToast("Alumno eliminado correctamente.");
        }}
      />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
