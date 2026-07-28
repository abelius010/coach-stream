import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Circle, Filter } from "lucide-react";
import { smartTasks } from "../lib/demo-data";

export const Route = createFileRoute("/demo/bandeja")({
  component: BandejaPage,
});

const priorityStyle: Record<string, string> = {
  alta: "bg-rose-50 text-rose-700",
  media: "bg-amber-50 text-amber-700",
  baja: "bg-emerald-50 text-emerald-700",
};

function BandejaPage() {
  const [done, setDone] = useState<Record<number, boolean>>({});

  const toggle = (id: number) => setDone((d) => ({ ...d, [id]: !d[id] }));

  const remaining = smartTasks.filter((t) => !done[t.id]).length;

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4 md:p-8">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-brand">Bandeja inteligente</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Tu trabajo de hoy</h1>
        <p className="mt-1 text-sm text-ink-muted">
          FitFlow ha priorizado {smartTasks.length} tareas por ti. Te quedan <span className="font-medium text-foreground">{remaining}</span>.
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
