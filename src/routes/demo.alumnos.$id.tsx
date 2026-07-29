import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  MessageSquare,
  MoreHorizontal,
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
} from "lucide-react";
import {
  students as seedStudents,
  workoutWeeks,
  nutritionPlan,
  weightSeries,
  habitsData,
  measurements,
  gallery,
  chatMessages,
} from "../lib/demo-data";
import { useDemoStore } from "../lib/demo-store";
import { EditStudentSheet } from "../components/demo/EditStudentSheet";

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
  const [tab, setTab] = useState<TabId>("resumen");
  const [editing, setEditing] = useState(false);

  if (!student) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-center">
        <h1 className="text-xl font-semibold">Alumno no encontrado</h1>
        <p className="mt-2 text-sm text-ink-muted">Puede que hayas restablecido la demo.</p>
        <Link to="/demo/alumnos" className="mt-4 inline-flex rounded-lg bg-foreground px-4 py-2 text-sm text-background">Volver a alumnos</Link>
      </div>
    );
  }




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
              {student.goal} · {student.age} años · {student.height} cm · Desde {student.startDate}
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-muted">
              <Stat label="Actual" value={`${student.weight} kg`} />
              <Stat label="Inicio" value={`${student.weightStart} kg`} />
              <Stat label="Objetivo" value={`${student.weightGoal} kg`} />
              <Stat label="Cumplimiento" value={`${student.compliance}%`} />
              <Stat label="Plan" value={student.plan} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-surface">
              <Pencil className="h-3.5 w-3.5" /> Editar alumno
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-surface">
              <MessageSquare className="h-3.5 w-3.5" /> Mensaje
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-surface">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

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
        {tab === "resumen" && <ResumenTab student={student} />}
        {tab === "entrenos" && <EntrenosTab />}
        {tab === "nutricion" && <NutricionTab />}
        {tab === "progreso" && <ProgresoTab />}
        {tab === "habitos" && <HabitosTab />}
        {tab === "multimedia" && <MultimediaTab />}
        {tab === "chat" && <ChatTab />}
      </div>
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

/* ---------- Tabs ---------- */

function ResumenTab({ student }: { student: (typeof students)[number] }) {
  const progress = ((student.weightStart - student.weight) / (student.weightStart - student.weightGoal)) * 100;
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card title="Evolución del peso" subtitle="Últimas 12 semanas">
        <WeightChart />
        <div className="mt-3 flex items-center justify-between text-xs text-ink-muted">
          <span>Inicio: {student.weightStart} kg</span>
          <span className="font-medium text-emerald-600">−{(student.weightStart - student.weight).toFixed(1)} kg</span>
          <span>Objetivo: {student.weightGoal} kg</span>
        </div>
      </Card>
      <Card title="Progreso hacia el objetivo">
        <div className="text-3xl font-semibold tracking-tight">{Math.round(progress)}%</div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface">
          <div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(100, progress)}%` }} />
        </div>
        <p className="mt-3 text-xs text-ink-muted">
          A este ritmo alcanzará el objetivo en aproximadamente <span className="font-medium text-foreground">6 semanas</span>.
        </p>
      </Card>
      <Card title="Últimas revisiones">
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
      </Card>
      <div className="lg:col-span-3">
        <Card title="Notas del entrenador">
          <p className="text-sm text-ink-muted">
            {student.name.split(" ")[0]} está respondiendo muy bien al aumento de volumen. La adherencia a la dieta es alta,
            aunque los fines de semana bajan un poco los pasos. Mantener las cargas y subir carbohidratos ligeramente
            en días de pierna la próxima semana.
          </p>
        </Card>
      </div>
    </div>
  );
}

function EntrenosTab() {
  return (
    <div className="space-y-4">
      {workoutWeeks.map((wk) => (
        <Card key={wk.week} title={wk.week} subtitle={`${wk.days.filter((d) => d.done).length}/${wk.days.length} completados`}>
          <div className="space-y-4">
            {wk.days.map((d) => (
              <div key={d.day} className="overflow-hidden rounded-xl border border-border">
                <div className="flex items-center justify-between border-b border-border bg-surface/50 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    {d.done ? (
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                        <Check className="h-3 w-3" />
                      </span>
                    ) : (
                      <Circle className="h-4 w-4 text-ink-muted" />
                    )}
                    <span className="text-sm font-medium">{d.day}</span>
                  </div>
                  <span className={`text-xs ${d.done ? "text-emerald-600" : "text-ink-muted"}`}>
                    {d.done ? "Completado" : "Pendiente"}
                  </span>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-background text-[11px] uppercase text-ink-muted">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Ejercicio</th>
                      <th className="px-4 py-2 text-left font-medium">Series</th>
                      <th className="px-4 py-2 text-left font-medium">Peso</th>
                      <th className="hidden px-4 py-2 text-left font-medium md:table-cell">Notas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {d.exercises.map((e) => (
                      <tr key={e.name}>
                        <td className="px-4 py-2.5 font-medium">{e.name}</td>
                        <td className="px-4 py-2.5 text-ink-muted">{e.sets}</td>
                        <td className="px-4 py-2.5 text-ink-muted">{e.weight}</td>
                        <td className="hidden px-4 py-2.5 text-ink-muted md:table-cell">{e.note || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function NutricionTab() {
  const { targets, meals, coachNote } = nutritionPlan;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Calorías", v: `${targets.kcal} kcal` },
          { l: "Proteína", v: `${targets.protein} g` },
          { l: "Carbohidratos", v: `${targets.carbs} g` },
          { l: "Grasas", v: `${targets.fat} g` },
        ].map((m) => (
          <div key={m.l} className="rounded-xl border border-border bg-background p-4">
            <div className="text-xs text-ink-muted">{m.l}</div>
            <div className="mt-1 text-lg font-semibold">{m.v}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {meals.map((m) => (
          <div key={m.name} className="overflow-hidden rounded-2xl border border-border bg-background md:flex">
            {m.photo && (
              <img src={m.photo} alt="" className="h-40 w-full object-cover md:h-auto md:w-48" />
            )}
            <div className="flex-1 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold">{m.name}</div>
                  <div className="text-xs text-ink-muted">{m.time}</div>
                </div>
                <div className="text-xs text-ink-muted">
                  <span className="font-medium text-foreground">{m.kcal} kcal</span> · P {m.protein}g · C {m.carbs}g · G {m.fat}g
                </div>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-ink-muted">
                {m.items.map((i) => (
                  <li key={i}>· {i}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-brand-muted/40 p-4 text-sm">
        <div className="text-xs font-medium uppercase tracking-wide text-brand">Nota del entrenador</div>
        <p className="mt-1 text-foreground">{coachNote}</p>
      </div>
    </div>
  );
}

function WeightChart() {
  const min = Math.min(...weightSeries.map((p) => p.kg));
  const max = Math.max(...weightSeries.map((p) => p.kg));
  const range = max - min || 1;
  const points = weightSeries
    .map((p, i) => {
      const x = (i / (weightSeries.length - 1)) * 100;
      const y = 100 - ((p.kg - min) / range) * 100;
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
      <polyline
        fill="url(#wg)"
        stroke="none"
        points={`0,100 ${points} 100,100`}
      />
      <polyline fill="none" stroke="oklch(0.55 0.22 260)" strokeWidth="1.5" points={points} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function ProgresoTab() {
  return (
    <div className="space-y-4">
      <Card title="Evolución del peso" subtitle="12 semanas · −4,4 kg">
        <WeightChart />
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
            {measurements.map((m) => {
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
                style={{ height: `${(v / max) * 100}%` }}
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

function HabitosTab() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card title="Pasos diarios" subtitle={`Media: ${Math.round(habitsData.steps.reduce((a, b) => a + b, 0) / 7).toLocaleString()} pasos`}>
        <BarSeries data={habitsData.steps} max={10000} unit=" pasos" colorClass="bg-brand" />
      </Card>
      <Card title="Litros de agua" subtitle="Objetivo: 3 L">
        <BarSeries data={habitsData.water} max={4} unit=" L" colorClass="bg-sky-500" />
      </Card>
      <Card title="Horas de sueño" subtitle="Media: 7,3 h">
        <BarSeries data={habitsData.sleep} max={9} unit=" h" colorClass="bg-indigo-500" />
      </Card>
      <Card title="Estado de ánimo" subtitle="Media: 4/5">
        <BarSeries data={habitsData.mood} max={5} unit="/5" colorClass="bg-emerald-500" />
      </Card>
    </div>
  );
}

function MultimediaTab() {
  return (
    <div>
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
    </div>
  );
}

function ChatTab() {
  const [messages, setMessages] = useState(chatMessages);
  const [text, setText] = useState("");
  const send = () => {
    if (!text.trim()) return;
    setMessages([...messages, { from: "coach", text: text.trim(), time: "ahora" }]);
    setText("");
  };
  return (
    <Card title="Conversación">
      <div className="flex h-[420px] flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.map((m, i) => {
            const isCoach = m.from === "coach";
            return (
              <div key={i} className={`flex ${isCoach ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                  isCoach ? "bg-foreground text-background" : "bg-surface text-foreground"
                }`}>
                  <div>{m.text}</div>
                  <div className={`mt-1 text-[10px] ${isCoach ? "text-background/60" : "text-ink-muted"}`}>{m.time}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Escribe un mensaje…"
            className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground/20"
          />
          <button onClick={send} className="grid h-10 w-10 place-items-center rounded-lg bg-foreground text-background hover:opacity-90">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
