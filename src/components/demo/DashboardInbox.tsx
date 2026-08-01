import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Bell,
  CalendarClock,
  MessageSquare,
  Play,
  Search,
  X,
} from "lucide-react";
import { useDemoStore, todayKey, type StudentExt } from "../../lib/demo-store";
import {
  inactiveStudents,
  mealPhotos,
  missingWeights,
  pendingReviews,
  pendingVideos,
  type InboxView,
  type MealPhoto,
} from "../../lib/demo-inbox";

const titles: Record<Exclude<InboxView, "home">, { title: string; subtitle: string }> = {
  activos: { title: "Alumnos activos", subtitle: "Filtro aplicado: Activos" },
  revisiones: { title: "Revisiones pendientes", subtitle: "Empieza aquí tus revisiones del día" },
  videos: { title: "Vídeos por revisar", subtitle: "Bandeja de vídeos enviados por tus alumnos" },
  comidas: { title: "Fotos de comida nuevas", subtitle: "Compara lo planificado con lo que ha comido" },
  inactivos: { title: "Sin actividad +3 días", subtitle: "Alumnos que necesitan un empujón" },
  peso: { title: "Sin peso semanal", subtitle: "Pendientes de registrar el peso de la semana" },
};

export function InboxPanel({ view, onBack }: { view: Exclude<InboxView, "home">; onBack: () => void }) {
  const students = useDemoStore((s) => s.students);
  const head = titles[view];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{head.title}</h2>
          <p className="text-sm text-ink-muted">{head.subtitle}</p>
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-surface"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver al inicio
        </button>
      </div>

      {view === "activos" && <ActivosPanel students={students} />}
      {view === "revisiones" && <RevisionesPanel students={students} />}
      {view === "videos" && <VideosPanel students={students} />}
      {view === "comidas" && <ComidasPanel students={students} />}
      {view === "inactivos" && <InactivosPanel students={students} />}
      {view === "peso" && <PesoPanel students={students} />}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-background p-10 text-center text-sm text-ink-muted">
      {text}
    </div>
  );
}

function FichaLink({ id, label = "Abrir ficha" }: { id: string; label?: string }) {
  return (
    <Link
      to="/demo/alumnos/$id"
      params={{ id }}
      className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-surface"
    >
      {label} <ArrowUpRight className="h-3 w-3" />
    </Link>
  );
}

/* ---------------- 1. Activos ---------------- */
function ActivosPanel({ students }: { students: StudentExt[] }) {
  const [q, setQ] = useState("");
  const list = students.filter(
    (s) => s.status === "activo" && (!q || s.name.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <>
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre…"
          className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-ink-muted focus:border-foreground/20"
        />
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
        {list.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-muted">No hay alumnos activos.</div>
        ) : (
          <ul className="divide-y divide-border">
            {list.map((s) => (
              <li key={s.id}>
                <Link
                  to="/demo/alumnos/$id"
                  params={{ id: s.id }}
                  className="grid grid-cols-2 items-center gap-4 px-5 py-3 hover:bg-surface/50 md:grid-cols-12"
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
                    <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      Activo
                    </span>
                  </div>
                  <div className="hidden text-sm text-ink-muted md:col-span-2 md:block">{s.lastActive}</div>
                  <div className="col-span-1 text-right text-sm font-semibold">{s.compliance}%</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

/* ---------------- 2. Revisiones ---------------- */
function RevisionesPanel({ students }: { students: StudentExt[] }) {
  const list = useMemo(() => pendingReviews(students), [students]);
  if (list.length === 0) return <Empty text="No hay revisiones pendientes." />;
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background">
      <ul className="divide-y divide-border">
        {list.map(({ student: s, lastReview, nextReview, overdue }) => (
          <li key={s.id} className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-surface/50">
            <img src={s.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{s.name}</div>
              <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                <span>Última revisión: {lastReview}</span>
                <span className="inline-flex items-center gap-1">
                  <CalendarClock className="h-3 w-3" /> Siguiente: {nextReview}
                </span>
              </div>
            </div>
            {overdue && (
              <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700">
                Atrasada
              </span>
            )}
            <FichaLink id={s.id} label="Empezar revisión" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- 3. Vídeos ---------------- */
function VideosPanel({ students }: { students: StudentExt[] }) {
  const list = useMemo(() => pendingVideos(students), [students]);
  const [open, setOpen] = useState<string | null>(null);
  if (list.length === 0) return <Empty text="No hay vídeos pendientes de revisar." />;
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((v) => (
          <div key={v.id} className="overflow-hidden rounded-2xl border border-border bg-background">
            <button
              onClick={() => setOpen(v.id)}
              className="group relative block w-full"
              aria-label={`Ver vídeo de ${v.student.name}`}
            >
              <img src={v.thumb} alt="" className="h-40 w-full object-cover" />
              <span className="absolute inset-0 grid place-items-center bg-black/25 transition group-hover:bg-black/40">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-background/90">
                  <Play className="h-4 w-4" />
                </span>
              </span>
            </button>
            <div className="space-y-2 p-4">
              <div className="flex items-center gap-3">
                <img src={v.student.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{v.student.name}</div>
                  <div className="truncate text-xs text-ink-muted">{v.exercise}</div>
                </div>
              </div>
              <div className="text-xs text-ink-muted">{v.uploadedAt}</div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setOpen(v.id)}
                  className="inline-flex items-center gap-1 rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-medium text-background hover:opacity-90"
                >
                  <Play className="h-3 w-3" /> Ver vídeo
                </button>
                <FichaLink id={v.student.id} />
              </div>
            </div>
          </div>
        ))}
      </div>
      {open && (
        <Overlay onClose={() => setOpen(null)}>
          {(() => {
            const v = list.find((x) => x.id === open)!;
            return (
              <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-background">
                <div className="relative">
                  <img src={v.thumb} alt="" className="h-72 w-full object-cover" />
                  <div className="absolute inset-0 grid place-items-center bg-black/30">
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-background/90">
                      <Play className="h-5 w-5" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <div className="text-sm font-medium">
                      {v.student.name} · {v.exercise}
                    </div>
                    <div className="text-xs text-ink-muted">{v.uploadedAt}</div>
                  </div>
                  <FichaLink id={v.student.id} />
                </div>
              </div>
            );
          })()}
        </Overlay>
      )}
    </>
  );
}

/* ---------------- 4. Comidas ---------------- */
function ComidasPanel({ students }: { students: StudentExt[] }) {
  const list = useMemo(() => mealPhotos(students), [students]);
  const [open, setOpen] = useState<MealPhoto | null>(null);
  if (list.length === 0) return <Empty text="No hay fotos de comida pendientes." />;
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((m) => (
          <div key={m.id} className="overflow-hidden rounded-2xl border border-border bg-background">
            <button onClick={() => setOpen(m)} className="block w-full">
              <img src={m.photo} alt={`Comida de ${m.student.name}`} className="h-48 w-full object-cover" />
            </button>
            <div className="space-y-2 p-4">
              <div className="flex items-center gap-3">
                <img src={m.student.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{m.student.name}</div>
                  <div className="truncate text-xs text-ink-muted">
                    {m.mealType} · {m.at}
                  </div>
                </div>
              </div>
              {m.comment && (
                <p className="rounded-lg bg-surface px-3 py-2 text-xs text-ink-muted">“{m.comment}”</p>
              )}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setOpen(m)}
                  className="rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-medium text-background hover:opacity-90"
                >
                  Revisar
                </button>
                <FichaLink id={m.student.id} />
              </div>
            </div>
          </div>
        ))}
      </div>
      {open && <MealReview meal={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function MealReview({ meal, onClose }: { meal: MealPhoto; onClose: () => void }) {
  const setComment = useDemoStore((s) => s.setCoachMealComment);
  const saved = useDemoStore(
    (s) => s.coachMealComments[meal.student.id]?.[todayKey()]?.[meal.id] ?? "",
  );
  const [text, setText] = useState(saved);
  const [done, setDone] = useState(false);

  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-background">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-3">
            <img src={meal.student.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
            <div>
              <div className="text-sm font-medium">{meal.student.name}</div>
              <div className="text-xs text-ink-muted">
                {meal.mealType} · {meal.at}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-surface" aria-label="Cerrar">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">Enviado</div>
            <img src={meal.photo} alt="" className="h-56 w-full rounded-xl object-cover" />
            {meal.comment && (
              <p className="mt-2 rounded-lg bg-surface px-3 py-2 text-xs text-ink-muted">“{meal.comment}”</p>
            )}
          </div>
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">Planificado</div>
            <div className="rounded-xl border border-dashed border-border p-4 text-sm">
              <div className="font-medium">{meal.mealType}</div>
              <p className="mt-1 text-ink-muted">{meal.planned}</p>
            </div>
            <label className="mt-4 block text-xs font-medium text-ink-muted">Comentario del entrenador</label>
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setDone(false);
              }}
              rows={4}
              placeholder="Escribe feedback para tu alumno…"
              className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-foreground/20"
            />
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => {
                  setComment(meal.student.id, todayKey(), meal.id, text);
                  setDone(true);
                }}
                className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90"
              >
                Guardar comentario
              </button>
              <FichaLink id={meal.student.id} />
              {done && <span className="text-xs text-emerald-600">Guardado</span>}
            </div>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

/* ---------------- 5. Inactivos ---------------- */
function InactivosPanel({ students }: { students: StudentExt[] }) {
  const list = useMemo(() => inactiveStudents(students), [students]);
  if (list.length === 0) return <Empty text="Todos tus alumnos han registrado actividad recientemente." />;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map(({ student: s, days, lastActive }) => (
        <div key={s.id} className="rounded-2xl border border-border bg-background p-4">
          <div className="flex items-center gap-3">
            <img src={s.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{s.name}</div>
              <div className="text-xs text-ink-muted">Última conexión: {lastActive}</div>
            </div>
          </div>
          <div className="mt-3 inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
            {days} días sin actividad
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Link
              to="/demo/chat"
              className="inline-flex items-center gap-1 rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-medium text-background hover:opacity-90"
            >
              <MessageSquare className="h-3 w-3" /> Enviar mensaje
            </Link>
            <FichaLink id={s.id} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- 6. Peso semanal ---------------- */
function PesoPanel({ students }: { students: StudentExt[] }) {
  const list = useMemo(() => missingWeights(students), [students]);
  const [sent, setSent] = useState<Record<string, boolean>>({});
  if (list.length === 0) return <Empty text="Todos han registrado su peso semanal." />;
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background">
      <ul className="divide-y divide-border">
        {list.map(({ student: s, lastWeight, lastWeightDate }) => (
          <li key={s.id} className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-surface/50">
            <img src={s.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{s.name}</div>
              <div className="text-xs text-ink-muted">
                Último peso: {lastWeight} kg · {lastWeightDate}
              </div>
            </div>
            <button
              onClick={() => setSent((p) => ({ ...p, [s.id]: true }))}
              disabled={!!sent[s.id]}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-surface disabled:opacity-50"
            >
              <Bell className="h-3 w-3" /> {sent[s.id] ? "Recordatorio enviado" : "Enviar recordatorio"}
            </button>
            <FichaLink id={s.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl">
        {children}
      </div>
    </div>
  );
}
