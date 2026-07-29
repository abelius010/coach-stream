import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users,
  ClipboardCheck,
  Video,
  Camera,
  AlertTriangle,
  Scale,
  ArrowUpRight,
  Dumbbell,
  Utensils,
  Trophy,
  MessageSquare,
  Droplets,
  Image as ImageIcon,
  Plus,
  Inbox,
  Sparkles,
} from "lucide-react";
import { activityFeed, smartTasks, stats, students as seededStudents } from "../lib/demo-data";
import { useDemoStore } from "../lib/demo-store";
import { useMode, getAccountProfile } from "../lib/fitflow-mode";

export const Route = createFileRoute("/demo/")({
  component: DemoDashboard,
});

const iconFor: Record<string, typeof Dumbbell> = {
  workout: Dumbbell,
  weight: Scale,
  meal: Utensils,
  video: Video,
  habit: Droplets,
  photo: ImageIcon,
  chat: MessageSquare,
};

function DemoDashboard() {
  const mode = useMode();
  const students = useDemoStore((s) => s.students);
  const routines = useDemoStore((s) => s.routines);
  const nutritionPlans = useDemoStore((s) => s.nutritionPlans);
  const reviews = useDemoStore((s) => s.reviews);

  const isAccount = mode === "account";
  const profile = getAccountProfile();
  const firstName = profile?.firstName || "entrenador";

  if (isAccount) {
    const routinesCount = Object.values(routines).filter((r) => r && r.length > 0).length;
    const plansCount = Object.values(nutritionPlans).filter((p) => p && p.meals.length > 0).length;
    const reviewsCount = Object.values(reviews).reduce((n, list) => n + list.length, 0);
    const hasStudents = students.length > 0;

    const emptyKpis = [
      { label: "Alumnos activos", value: students.filter((s) => s.status === "activo").length, icon: Users },
      { label: "Rutinas creadas", value: routinesCount, icon: Dumbbell },
      { label: "Planes nutricionales", value: plansCount, icon: Utensils },
      { label: "Revisiones realizadas", value: reviewsCount, icon: ClipboardCheck },
    ];

    return (
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Hola, {firstName} 👋
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              Tu espacio está listo. Empieza creando tu primer alumno.
            </p>
          </div>
          <Link
            to="/demo/alumnos/nuevo"
            className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" /> Crear primer alumno
          </Link>
        </div>

        {/* Empty KPIs */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {emptyKpis.map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="rounded-2xl border border-border bg-background p-4 shadow-soft">
                <div className="flex items-center justify-between">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-surface text-ink-muted">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-semibold tracking-tight">{k.value}</div>
                <div className="text-xs text-ink-muted">{k.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Students empty */}
          <EmptyCard
            className="lg:col-span-2"
            icon={Users}
            title={hasStudents ? "Tus alumnos" : "No tienes ningún alumno todavía"}
            description={
              hasStudents
                ? `Ya gestionas ${students.length} ${students.length === 1 ? "alumno" : "alumnos"}.`
                : "Cuando añadas tu primer alumno aparecerá aquí junto con su actividad."
            }
            cta={hasStudents ? "Ver alumnos" : "Crear primer alumno"}
            to={hasStudents ? "/demo/alumnos" : "/demo/alumnos/nuevo"}
          />
          <EmptyCard
            icon={Inbox}
            title="No hay tareas pendientes"
            description="Cuando tus alumnos empiecen a subir información, aparecerán aquí las tareas priorizadas."
          />
          <EmptyCard
            icon={MessageSquare}
            title="Todavía no tienes conversaciones"
            description="Los mensajes con tus alumnos aparecerán aquí en tiempo real."
            className="lg:col-span-2"
          />
          <EmptyCard
            icon={ClipboardCheck}
            title="No hay revisiones programadas"
            description="Registra la primera revisión desde la ficha de tu alumno."
          />
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-surface/40 p-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-muted text-brand">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1 text-sm">
            <div className="font-medium">Bienvenido a FitFlow</div>
            <div className="text-xs text-ink-muted">
              Cuando tu cuenta empiece a moverse, verás aquí los logros de tus alumnos.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----- Demo mode (seeded) -----
  const kpis = [
    { label: "Alumnos activos", value: stats.activeStudents, icon: Users, tone: "neutral" },
    { label: "Revisiones pendientes", value: stats.pendingReviews, icon: ClipboardCheck, tone: "brand" },
    { label: "Vídeos por revisar", value: stats.pendingVideos, icon: Video, tone: "brand" },
    { label: "Fotos de comida nuevas", value: stats.newMealPhotos, icon: Camera, tone: "neutral" },
    { label: "Sin actividad +3 días", value: stats.inactiveStudents, icon: AlertTriangle, tone: "warn" },
    { label: "Sin peso semanal", value: stats.missingWeights, icon: Scale, tone: "warn" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Buenos días, Carlos 👋</h1>
          <p className="mt-1 text-sm text-ink-muted">Aquí tienes todo lo que necesita tu atención hoy.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <span className="grid h-1.5 w-1.5 place-items-center rounded-full bg-brand" />
          Datos actualizados hace 2 min
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-2xl border border-border bg-background p-4 shadow-soft">
              <div className="flex items-center justify-between">
                <div
                  className={`grid h-8 w-8 place-items-center rounded-lg ${
                    k.tone === "brand"
                      ? "bg-brand-muted text-brand"
                      : k.tone === "warn"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-surface text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-tight">{k.value}</div>
              <div className="text-xs text-ink-muted">{k.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-background lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div>
              <h2 className="text-sm font-semibold">Actividad en tiempo real</h2>
              <p className="text-xs text-ink-muted">Lo que tus alumnos han hecho en las últimas horas</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> en vivo
            </span>
          </div>
          <ul className="divide-y divide-border">
            {activityFeed.map((a, i) => {
              const Icon = iconFor[a.type] || Dumbbell;
              return (
                <li key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-surface/50">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface text-ink-muted">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">
                      <span className="font-medium">{a.who}</span>{" "}
                      <span className="text-ink-muted">{a.what}</span>
                    </div>
                    <div className="text-xs text-ink-muted">{a.time}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div>
              <h2 className="text-sm font-semibold">Tu trabajo de hoy</h2>
              <p className="text-xs text-ink-muted">Tareas priorizadas por FitFlow</p>
            </div>
            <Link to="/demo/bandeja" className="text-xs font-medium text-brand hover:underline">
              Ver todo
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {smartTasks.slice(0, 6).map((t) => (
              <li key={t.id} className="flex items-start gap-3 px-5 py-3 hover:bg-surface/50">
                <input type="checkbox" className="mt-1 h-4 w-4 rounded border-border" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium leading-snug">{t.title}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted">
                    <span className="rounded bg-surface px-1.5 py-0.5">{t.tag}</span>
                    <span>{t.meta}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-background">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold">Alumnos destacados hoy</h2>
            <p className="text-xs text-ink-muted">Los que están más activos esta semana</p>
          </div>
          <Link to="/demo/alumnos" className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline">
            Ver los {seededStudents.length} <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {students.slice(0, 4).map((s) => (
            <Link
              key={s.id}
              to="/demo/alumnos/$id"
              params={{ id: s.id }}
              className="flex items-center gap-3 bg-background p-4 hover:bg-surface/50"
            >
              <img src={s.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{s.name}</div>
                <div className="truncate text-xs text-ink-muted">{s.goal} · {s.weight} kg</div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-sm font-semibold">{s.compliance}%</div>
                <div className="text-[10px] text-ink-muted">cumplimiento</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3 rounded-2xl border border-border bg-gradient-to-r from-brand-muted to-background p-4">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-brand-foreground">
          <Trophy className="h-5 w-5" />
        </div>
        <div className="flex-1 text-sm">
          <div className="font-medium">Adrián Molina ha batido un PR: sentadilla 140 kg x 3</div>
          <div className="text-xs text-ink-muted">Es su tercer récord personal este mes.</div>
        </div>
        <button className="hidden rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface md:inline-flex">
          Felicitar
        </button>
      </div>
    </div>
  );
}

function EmptyCard({
  icon: Icon,
  title,
  description,
  cta,
  to,
  className = "",
}: {
  icon: typeof Users;
  title: string;
  description: string;
  cta?: string;
  to?: string;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-dashed border-border bg-background p-6 ${className}`}
    >
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-surface text-ink-muted">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-ink-muted">{description}</p>
      {cta && to && (
        <Link
          to={to as never}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" /> {cta}
        </Link>
      )}
    </section>
  );
}
