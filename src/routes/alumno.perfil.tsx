import { createFileRoute } from "@tanstack/react-router";
import { useDemoStore } from "@/lib/demo-store";
import { useActiveAlumnoId, setActiveAlumnoId } from "@/lib/fitflow-mode";
import { User, Check } from "lucide-react";

export const Route = createFileRoute("/alumno/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil · FitFlow Alumno" },
      { name: "description", content: "Tu perfil, objetivos y ajustes de la cuenta." },
    ],
  }),
  component: AlumnoPerfil,
});

function AlumnoPerfil() {
  const students = useDemoStore((s) => s.students);
  const activeId = useActiveAlumnoId();
  const currentId = activeId ?? students[0]?.id ?? null;
  const current = students.find((s) => s.id === currentId);

  return (
    <div className="flex flex-col gap-5 p-5">
      <header className="pt-2">
        <h1 className="text-2xl font-semibold tracking-tight">Perfil</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Tus datos y objetivos. Sincronizados con tu entrenador.
        </p>
      </header>

      {current ? (
        <section className="rounded-3xl border border-border bg-background p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <img
              src={current.avatar}
              alt={current.name}
              className="h-14 w-14 rounded-full object-cover"
            />
            <div className="min-w-0">
              <div className="text-lg font-semibold">{current.name}</div>
              <div className="text-xs text-ink-muted">
                {current.plan} · {current.goal}
              </div>
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Info label="Edad" value={current.age ? `${current.age} años` : "—"} />
            <Info label="Altura" value={current.height ? `${current.height} cm` : "—"} />
            <Info label="Peso actual" value={`${String(current.weight).replace(".", ",")} kg`} />
            <Info label="Peso objetivo" value={`${String(current.weightGoal).replace(".", ",")} kg`} />
          </dl>
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed border-border bg-surface p-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-background text-ink-muted">
            <User className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm text-ink-muted">
            Todavía no hay ningún alumno en la cuenta.
          </p>
        </section>
      )}

      {/* Dev-only alumno selector */}
      {students.length > 0 && (
        <section className="rounded-2xl border border-dashed border-border bg-surface/40 p-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Vista previa · Ver como
          </div>
          <p className="mb-3 text-[11px] text-ink-muted">
            Solo desarrollo. Simula la sesión de un alumno para ver su rutina asignada.
          </p>
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {students.map((s) => {
              const active = s.id === currentId;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveAlumnoId(s.id)}
                  className={`flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-colors ${
                    active
                      ? "border-foreground bg-background"
                      : "border-transparent bg-background/60 hover:bg-background"
                  }`}
                >
                  <img src={s.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{s.name}</div>
                    <div className="truncate text-[11px] text-ink-muted">{s.plan}</div>
                  </div>
                  {active && <Check className="h-4 w-4 text-brand" />}
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface px-3 py-2">
      <div className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">{label}</div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}
