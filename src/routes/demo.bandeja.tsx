import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Circle, Filter, Inbox, Plus } from "lucide-react";
import { smartTasks } from "../lib/demo-data";
import { useMode } from "../lib/fitflow-mode";
import { useDemoStore } from "../lib/demo-store";

export const Route = createFileRoute("/demo/bandeja")({
  component: BandejaPage,
});

const priorityStyle: Record<string, string> = {
  alta: "bg-rose-50 text-rose-700",
  media: "bg-amber-50 text-amber-700",
  baja: "bg-emerald-50 text-emerald-700",
};

function BandejaPage() {
  const mode = useMode();
  const students = useDemoStore((s) => s.students);
  const [done, setDone] = useState<Record<number, boolean>>({});

  if (mode === "account") {
    return (
      <div className="mx-auto max-w-3xl space-y-5 p-4 md:p-8">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-ink-muted">Bandeja</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Tu trabajo de hoy</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Aquí verás las tareas priorizadas automáticamente por FitFlow.
          </p>
        </div>
        <div className="rounded-2xl border border-dashed border-border bg-background p-10 text-center">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-surface text-ink-muted">
            <Inbox className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-sm font-semibold">No hay tareas pendientes.</h2>
          <p className="mx-auto mt-1 max-w-md text-xs text-ink-muted">
            {students.length === 0
              ? "Cuando añadas tu primer alumno y comience a moverse, aparecerán aquí las tareas que necesitan tu atención."
              : "Cuando tus alumnos suban vídeos, pesos o comidas, aparecerán aquí como tareas priorizadas."}
          </p>
          {students.length === 0 && (
            <Link
              to="/demo/alumnos/nuevo"
              className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-2 text-sm font-medium text-background hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" /> Crear primer alumno
            </Link>
          )}
        </div>
      </div>
    );
  }

  const toggle = (id: number) => setDone((d) => ({ ...d, [id]: !d[id] }));
  const remaining = smartTasks.filter((t) => !done[t.id]).length;

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4 md:p-8">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-brand">Bandeja inteligente</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Tu trabajo de hoy</h1>
        <p className="mt-1 text-sm text-ink-muted">
          FitFlow ha priorizado {smartTasks.length} tareas por ti. Te quedan{" "}
          <span className="font-medium text-foreground">{remaining}</span>.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs hover:bg-surface">
          <Filter className="h-3 w-3" /> Todas
        </button>
        <button className="rounded-lg px-3 py-1.5 text-xs text-ink-muted hover:bg-background">Alta prioridad</button>
        <button className="rounded-lg px-3 py-1.5 text-xs text-ink-muted hover:bg-background">Sin resolver</button>
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-background">
        {smartTasks.map((t) => {
          const isDone = !!done[t.id];
          return (
            <li key={t.id} className={`flex items-start gap-3 px-5 py-4 ${isDone ? "opacity-50" : ""}`}>
              <button onClick={() => toggle(t.id)} className="mt-0.5 shrink-0 text-ink-muted hover:text-brand">
                {isDone ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Circle className="h-5 w-5" />}
              </button>
              <div className="min-w-0 flex-1">
                <div className={`text-sm font-medium ${isDone ? "line-through" : ""}`}>{t.title}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${priorityStyle[t.priority]}`}>
                    {t.priority}
                  </span>
                  <span className="rounded bg-surface px-1.5 py-0.5">{t.tag}</span>
                  <span>{t.meta}</span>
                </div>
              </div>
              <button className="hidden rounded-md border border-border px-2.5 py-1 text-xs hover:bg-surface md:inline-flex">
                Abrir
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
