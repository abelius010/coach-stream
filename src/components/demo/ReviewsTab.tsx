import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Dumbbell,
  Utensils,
  Activity,
  GitCompare,
  Plus,
  Ruler,
  Settings2,
  Scale,
  Smile,
  StickyNote,
  Sparkles,
  X,
} from "lucide-react";
import { Modal, ModalButton } from "./Modal";
import { Field, inputCls, textareaCls } from "./Field";

/* ---------------- Datos de ejemplo ---------------- */

export type ReviewPhotos = { front: string; side: string; back: string };
export type Measures = {
  cintura: number;
  cadera: number;
  pecho: number;
  brazoDer: number;
  brazoIzq: number;
  musloDer: number;
  musloIzq: number;
};
export type DemoReview = {
  id: string;
  week: number;
  label: string;
  date: string;
  weight: number;
  prevWeight: number;
  status: "Completada" | "Borrador" | "Pendiente";
  photos: ReviewPhotos;
  measures: Measures;
  prevMeasures: Measures;
  training: { planned: number; done: number };
  nutrition: { daysDone: number; photos: number; freeMeals: number };
  habits: { water: number; sleep: number; steps: number; weightLogs: number };
  feelings: { energia: number; hambre: number; estres: number; motivacion: number; sueno: number };
  notes: string;
  changes: string[];
};

const PHOTOS: ReviewPhotos[] = [
  {
    front: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=650&fit=crop",
    side: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&h=650&fit=crop",
    back: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&h=650&fit=crop",
  },
  {
    front: "https://images.unsplash.com/photo-1550345332-09e3ac987658?w=500&h=650&fit=crop",
    side: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&h=650&fit=crop",
    back: "https://images.unsplash.com/photo-1540474527619-a24b0e5a29b5?w=500&h=650&fit=crop",
  },
  {
    front: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=500&h=650&fit=crop",
    side: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&h=650&fit=crop",
    back: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=500&h=650&fit=crop",
  },
];

const NOTES = [
  "Semana muy sólida. Ha cumplido con todos los entrenamientos y la adherencia nutricional se mantiene alta. Se nota mejor definición en la zona abdominal y las medidas acompañan. Seguimos con el mismo enfoque una semana más antes de tocar calorías.",
  "Buen trabajo aunque el fin de semana se le complicó con dos comidas fuera. No es preocupante: el peso sigue bajando dentro del rango objetivo. Insistimos en preparar la comida del sábado con antelación.",
  "El descanso ha bajado y se refleja en la energía de los entrenamientos de pierna. Priorizamos rutina de sueño esta semana y bajamos ligeramente el volumen para facilitar la recuperación.",
  "Excelente evolución. Fuerza al alza en los básicos y cintura otra vez a la baja. Mantiene la motivación muy alta, aprovechamos para consolidar hábitos antes de la siguiente fase.",
];

const CHANGES = [
  ["Reducir 200 kcal diarias.", "Añadir 2 sesiones de cardio suave.", "Mantener proteínas en 165 g."],
  ["Cambiar rutina Push.", "Subir 50 g de hidratos en días de pierna.", "Añadir 10 min de movilidad."],
  ["Mantener calorías.", "Sustituir prensa por hack squat.", "Objetivo de 9.000 pasos diarios."],
  ["Semana de descarga: -20% volumen.", "Aumentar 150 kcal.", "Registrar el peso 5 días a la semana."],
];

function round(n: number, d = 1) {
  const f = 10 ** d;
  return Math.round(n * f) / f;
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function fmtDate(d: Date) {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtLongDate(d: Date) {
  return `${DAYS[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()].toLowerCase()}`;
}

export function buildReviews(seed: string, startWeight = 82.5): DemoReview[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 997;
  const rnd = (i: number, mod: number) => (h + i * 37) % mod;

  const base: Measures = {
    cintura: 92 + rnd(1, 4),
    cadera: 101 + rnd(2, 3),
    pecho: 104 + rnd(3, 4),
    brazoDer: 37 + rnd(4, 3),
    brazoIzq: 36.5 + rnd(5, 3),
    musloDer: 60 + rnd(6, 3),
    musloIzq: 59.5 + rnd(7, 3),
  };

  const today = new Date();
  const reviews: DemoReview[] = [];
  let prevW = startWeight;
  let prevM = base;

  for (let w = 1; w <= 8; w++) {
    const drop = 0.4 + ((rnd(w, 7) % 7) / 10);
    const weight = round(prevW - drop, 1);
    const m: Measures = {
      cintura: round(prevM.cintura - 0.4 - (rnd(w + 1, 5) / 10), 1),
      cadera: round(prevM.cadera - 0.2 - (rnd(w + 2, 4) / 10), 1),
      pecho: round(prevM.pecho - 0.1 - (rnd(w + 3, 3) / 10), 1),
      brazoDer: round(prevM.brazoDer + 0.1, 1),
      brazoIzq: round(prevM.brazoIzq + 0.1, 1),
      musloDer: round(prevM.musloDer - 0.2, 1),
      musloIzq: round(prevM.musloIzq - 0.2, 1),
    };
    const date = new Date(today);
    date.setDate(today.getDate() - (8 - w) * 7);
    const planned = 4 + (rnd(w, 2) === 0 ? 0 : 1);
    const done = Math.max(3, planned - (rnd(w + 4, 3) === 0 ? 1 : 0));
    reviews.push({
      id: `rev-${w}`,
      week: w,
      label: `Semana ${w}`,
      date: fmtDate(date),
      weight,
      prevWeight: prevW,
      status: "Completada",
      photos: PHOTOS[(w + h) % PHOTOS.length],
      measures: m,
      prevMeasures: prevM,
      training: { planned, done },
      nutrition: {
        daysDone: 5 + (rnd(w + 5, 3)),
        photos: 14 + rnd(w + 6, 8),
        freeMeals: 1 + (rnd(w + 7, 2)),
      },
      habits: {
        water: round(2.1 + rnd(w + 8, 8) / 10, 1),
        sleep: round(6.6 + rnd(w + 9, 12) / 10, 1),
        steps: 7200 + rnd(w + 10, 30) * 100,
        weightLogs: 4 + rnd(w + 11, 4),
      },
      feelings: {
        energia: 6 + (rnd(w, 4)),
        hambre: 3 + (rnd(w + 1, 5)),
        estres: 2 + (rnd(w + 2, 5)),
        motivacion: 7 + (rnd(w + 3, 3)),
        sueno: 5 + (rnd(w + 4, 5)),
      },
      notes: NOTES[(w + h) % NOTES.length],
      changes: CHANGES[(w + h) % CHANGES.length],
    });
    prevW = weight;
    prevM = m;
  }
  return reviews.reverse();
}

const FREQS = [
  { id: "7", label: "Semanal", days: 7 },
  { id: "14", label: "Cada 2 semanas", days: 14 },
  { id: "28", label: "Cada 4 semanas", days: 28 },
  { id: "30", label: "Mensual", days: 30 },
  { id: "custom", label: "Personalizada", days: 10 },
] as const;

/* ---------------- UI helpers ---------------- */

function SummaryCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wide text-ink-muted">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className={`mt-2 text-lg font-semibold ${accent ? "text-brand" : "text-foreground"}`}>{value}</div>
      {hint && <div className="mt-0.5 text-[11px] text-ink-muted">{hint}</div>}
    </div>
  );
}

function Delta({ value, unit, invert = true }: { value: number; unit: string; invert?: boolean }) {
  const good = invert ? value < 0 : value > 0;
  const neutral = Math.abs(value) < 0.05;
  const cls = neutral
    ? "bg-surface text-ink-muted"
    : good
    ? "bg-emerald-50 text-emerald-700"
    : "bg-rose-50 text-rose-600";
  return (
    <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-medium ${cls}`}>
      {value > 0 ? "+" : ""}
      {round(value, 1)} {unit}
    </span>
  );
}

function Block({
  icon: Icon,
  title,
  children,
  right,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-background">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="h-4 w-4 text-ink-muted" /> {title}
        </h3>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function MiniStat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-3">
      <div className="text-[10px] uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="mt-1 text-base font-semibold">{value}</div>
      {hint && <div className="text-[11px] text-ink-muted">{hint}</div>}
    </div>
  );
}

function Scale10({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-ink-muted">{label}</span>
        <span className="font-semibold">{value}/10</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface">
        <div className="h-full rounded-full bg-brand" style={{ width: `${value * 10}%` }} />
      </div>
    </div>
  );
}

const MEASURE_LABELS: [keyof Measures, string][] = [
  ["cintura", "Cintura"],
  ["cadera", "Cadera"],
  ["pecho", "Pecho"],
  ["brazoDer", "Brazo derecho"],
  ["brazoIzq", "Brazo izquierdo"],
  ["musloDer", "Muslo derecho"],
  ["musloIzq", "Muslo izquierdo"],
];

/* ---------------- Componente principal ---------------- */

export function ReviewsTab({
  studentId,
  studentName,
  currentWeight,
  onToast,
}: {
  studentId: string;
  studentName: string;
  currentWeight?: number;
  onToast: (t: string) => void;
}) {
  const reviews = useMemo(
    () => buildReviews(studentId, currentWeight ? currentWeight + 6 : 82.5),
    [studentId, currentWeight],
  );
  const [freqId, setFreqId] = useState<string>("7");
  const [customDays, setCustomDays] = useState(10);
  const [configOpen, setConfigOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [compare, setCompare] = useState(false);
  const [wizard, setWizard] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const freq = FREQS.find((f) => f.id === freqId)!;
  const days = freqId === "custom" ? customDays : freq.days;
  const next = new Date();
  next.setDate(next.getDate() + days);

  const last = reviews[0];
  const open = reviews.find((r) => r.id === openId) ?? null;

  if (open) {
    return (
      <ReviewDetail
        review={open}
        first={reviews[reviews.length - 1]}
        onBack={() => setOpenId(null)}
        onPhoto={setLightbox}
        lightbox={lightbox}
        onCloseLightbox={() => setLightbox(null)}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Revisiones</h2>
          <p className="text-xs text-ink-muted">
            Seguimiento periódico de {studentName.split(" ")[0]} en un solo lugar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCompare(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm hover:bg-surface"
          >
            <GitCompare className="h-4 w-4" /> Comparar revisiones
          </button>
          <button
            onClick={() => setConfigOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm hover:bg-surface"
          >
            <Settings2 className="h-4 w-4" /> Configurar frecuencia
          </button>
          <button
            onClick={() => setWizard(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-3.5 text-sm font-medium text-background hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Nueva revisión
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard
          icon={CalendarDays}
          label="Próxima revisión"
          value={fmtLongDate(next)}
          hint={`En ${days} días`}
          accent
        />
        <SummaryCard
          icon={Settings2}
          label="Frecuencia actual"
          value={freqId === "custom" ? `Cada ${customDays} días` : freq.label}
          hint={`Cada ${days} días`}
        />
        <SummaryCard icon={ClipboardCheck} label="Última revisión" value={last.label} hint={last.date} />
        <SummaryCard icon={Sparkles} label="Total de revisiones" value={`${reviews.length}`} hint="Desde el inicio" />
        <SummaryCard icon={CheckCircle2} label="Pendientes" value="1" hint="Se abre el próximo domingo" />
      </div>

      {/* Historial */}
      <div>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">Historial</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {reviews.map((r) => {
            const change = round(r.weight - r.prevWeight, 1);
            const tr = Math.round((r.training.done / r.training.planned) * 100);
            const nu = Math.round((r.nutrition.daysDone / 7) * 100);
            return (
              <article
                key={r.id}
                className="group rounded-2xl border border-border bg-background p-4 transition-all hover:border-foreground/20 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold">{r.label}</h4>
                      <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                        {r.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-muted">{r.date}</p>
                  </div>
                  <button
                    onClick={() => setOpenId(r.id)}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-medium hover:bg-surface"
                  >
                    Ver revisión <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-ink-muted">Peso</div>
                    <div className="text-sm font-semibold">{r.weight.toFixed(1).replace(".", ",")} kg</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-ink-muted">Cambio</div>
                    <Delta value={change} unit="kg" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-ink-muted">Entreno</div>
                    <div className="text-sm font-semibold">{tr}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-ink-muted">Nutrición</div>
                    <div className="text-sm font-semibold">{nu}%</div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <FrequencyModal
        open={configOpen}
        freqId={freqId}
        customDays={customDays}
        onClose={() => setConfigOpen(false)}
        onSave={(id, cd) => {
          setFreqId(id);
          setCustomDays(cd);
          setConfigOpen(false);
          onToast("Frecuencia de revisiones actualizada.");
        }}
      />
      <CompareModal open={compare} reviews={reviews} onClose={() => setCompare(false)} />
      <NewReviewWizard
        open={wizard}
        studentName={studentName}
        onClose={() => setWizard(false)}
        onToast={onToast}
      />
    </div>
  );
}

/* ---------------- Detalle ---------------- */

function ReviewDetail({
  review,
  first,
  onBack,
  onPhoto,
  lightbox,
  onCloseLightbox,
}: {
  review: DemoReview;
  first: DemoReview;
  onBack: () => void;
  onPhoto: (src: string) => void;
  lightbox: string | null;
  onCloseLightbox: () => void;
}) {
  const r = review;
  const change = round(r.weight - r.prevWeight, 1);
  const total = round(r.weight - first.prevWeight, 1);
  const trPct = Math.round((r.training.done / r.training.planned) * 100);
  const nuPct = Math.round((r.nutrition.daysDone / 7) * 100);

  const photos: [string, string][] = [
    ["Frontal", r.photos.front],
    ["Lateral", r.photos.side],
    ["Espalda", r.photos.back],
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            onClick={onBack}
            className="mb-1 inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Volver a revisiones
          </button>
          <h2 className="text-lg font-semibold">{r.label}</h2>
          <p className="text-xs text-ink-muted">{r.date} · {r.status}</p>
        </div>
      </div>

      <Block icon={Scale} title="Peso">
        <div className="grid gap-3 sm:grid-cols-4">
          <MiniStat label="Peso actual" value={`${r.weight.toFixed(1).replace(".", ",")} kg`} />
          <MiniStat label="Peso anterior" value={`${r.prevWeight.toFixed(1).replace(".", ",")} kg`} />
          <div className="rounded-xl border border-border bg-surface/40 p-3">
            <div className="text-[10px] uppercase tracking-wide text-ink-muted">Cambio</div>
            <div className="mt-1.5"><Delta value={change} unit="kg" /></div>
          </div>
          <div className="rounded-xl border border-border bg-surface/40 p-3">
            <div className="text-[10px] uppercase tracking-wide text-ink-muted">Desde el inicio</div>
            <div className="mt-1.5"><Delta value={total} unit="kg" /></div>
          </div>
        </div>
      </Block>

      <Block icon={Camera} title="Fotografías">
        <div className="grid gap-3 sm:grid-cols-3">
          {photos.map(([label, src]) => (
            <button
              key={label}
              onClick={() => onPhoto(src)}
              className="group overflow-hidden rounded-xl border border-border text-left"
            >
              <img
                src={src}
                alt={`Foto ${label.toLowerCase()} de la revisión ${r.label}`}
                loading="lazy"
                className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <div className="px-3 py-2 text-xs font-medium">{label}</div>
            </button>
          ))}
        </div>
      </Block>

      <Block icon={Ruler} title="Medidas">
        <div className="grid gap-2 sm:grid-cols-2">
          {MEASURE_LABELS.map(([key, label]) => {
            const prev = r.prevMeasures[key];
            const cur = r.measures[key];
            return (
              <div
                key={key}
                className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5"
              >
                <span className="text-sm">{label}</span>
                <span className="flex items-center gap-2 text-xs text-ink-muted">
                  {round(prev, 1)} cm <ArrowRight className="h-3 w-3" />{" "}
                  <span className="font-semibold text-foreground">{round(cur, 1)} cm</span>
                  <Delta value={round(cur - prev, 1)} unit="cm" />
                </span>
              </div>
            );
          })}
        </div>
      </Block>

      <div className="grid gap-5 lg:grid-cols-2">
        <Block icon={Dumbbell} title="Entrenamiento">
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniStat label="Planificados" value={`${r.training.planned}`} />
            <MiniStat label="Completados" value={`${r.training.done}`} />
            <MiniStat label="Cumplimiento" value={`${trPct}%`} />
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface">
            <div className="h-full rounded-full bg-brand" style={{ width: `${trPct}%` }} />
          </div>
        </Block>

        <Block icon={Utensils} title="Nutrición">
          <div className="grid gap-3 sm:grid-cols-4">
            <MiniStat label="Días completados" value={`${r.nutrition.daysDone}/7`} />
            <MiniStat label="Fotos enviadas" value={`${r.nutrition.photos}`} />
            <MiniStat label="Comidas libres" value={`${r.nutrition.freeMeals}`} />
            <MiniStat label="Adherencia" value={`${nuPct}%`} />
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface">
            <div className="h-full rounded-full bg-brand" style={{ width: `${nuPct}%` }} />
          </div>
        </Block>
      </div>

      <Block icon={Activity} title="Hábitos">
        <div className="grid gap-3 sm:grid-cols-4">
          <MiniStat label="Agua (media)" value={`${r.habits.water} L`} />
          <MiniStat label="Sueño (media)" value={`${r.habits.sleep} h`} />
          <MiniStat label="Pasos (media)" value={r.habits.steps.toLocaleString("es-ES")} />
          <MiniStat label="Peso registrado" value={`${r.habits.weightLogs}/7 días`} />
        </div>
      </Block>

      <Block icon={Smile} title="Sensaciones del alumno" right={<span className="text-[11px] text-ink-muted">Escala 1–10</span>}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Scale10 label="Energía" value={r.feelings.energia} />
          <Scale10 label="Hambre" value={r.feelings.hambre} />
          <Scale10 label="Estrés" value={r.feelings.estres} />
          <Scale10 label="Motivación" value={r.feelings.motivacion} />
          <Scale10 label="Calidad del sueño" value={r.feelings.sueno} />
        </div>
      </Block>

      <div className="grid gap-5 lg:grid-cols-2">
        <Block icon={StickyNote} title="Notas del entrenador">
          <p className="text-sm leading-relaxed text-foreground/90">{r.notes}</p>
        </Block>
        <Block icon={Sparkles} title="Cambios realizados">
          <ul className="space-y-2">
            {r.changes.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                {c}
              </li>
            ))}
          </ul>
        </Block>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          onClick={onCloseLightbox}
        >
          <button
            aria-label="Cerrar"
            className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-white"
          >
            <X className="h-4 w-4" />
          </button>
          <img src={lightbox} alt="Fotografía de revisión ampliada" className="max-h-full rounded-xl object-contain" />
        </div>
      )}
    </div>
  );
}

/* ---------------- Frecuencia ---------------- */

function FrequencyModal({
  open,
  freqId,
  customDays,
  onClose,
  onSave,
}: {
  open: boolean;
  freqId: string;
  customDays: number;
  onClose: () => void;
  onSave: (id: string, customDays: number) => void;
}) {
  const [sel, setSel] = useState(freqId);
  const [cd, setCd] = useState(customDays);
  const days = sel === "custom" ? cd : FREQS.find((f) => f.id === sel)!.days;
  const next = new Date();
  next.setDate(next.getDate() + days);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Configurar frecuencia"
      description="Cada cuánto quieres revisar a este alumno."
      footer={
        <>
          <ModalButton onClick={onClose}>Cancelar</ModalButton>
          <ModalButton variant="primary" onClick={() => onSave(sel, cd)}>
            Guardar
          </ModalButton>
        </>
      }
    >
      <div className="space-y-2">
        {FREQS.map((f) => (
          <button
            key={f.id}
            onClick={() => setSel(f.id)}
            className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
              sel === f.id ? "border-foreground/40 bg-surface" : "border-border hover:bg-surface/60"
            }`}
          >
            {f.label}
            {sel === f.id && <CheckCircle2 className="h-4 w-4 text-brand" />}
          </button>
        ))}
        {sel === "custom" && (
          <div className="pt-1">
            <Field label="Número de días" hint="Ej. cada 10 días">
              <input
                type="number"
                min={1}
                max={120}
                value={cd}
                onChange={(e) => setCd(Math.max(1, Number(e.target.value) || 1))}
                className={inputCls}
              />
            </Field>
          </div>
        )}
        <div className="mt-3 rounded-xl border border-border bg-surface/40 p-3 text-xs">
          <div className="text-ink-muted">Frecuencia: <span className="font-medium text-foreground">Cada {days} días</span></div>
          <div className="text-ink-muted">
            Próxima revisión: <span className="font-medium text-foreground">{fmtLongDate(next)}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ---------------- Comparador ---------------- */

function CompareModal({
  open,
  reviews,
  onClose,
}: {
  open: boolean;
  reviews: DemoReview[];
  onClose: () => void;
}) {
  const oldest = reviews[reviews.length - 1];
  const newest = reviews[0];
  const [aId, setAId] = useState(oldest.id);
  const [bId, setBId] = useState(newest.id);
  const a = reviews.find((r) => r.id === aId)!;
  const b = reviews.find((r) => r.id === bId)!;

  const pct = (r: DemoReview) => ({
    tr: Math.round((r.training.done / r.training.planned) * 100),
    nu: Math.round((r.nutrition.daysDone / 7) * 100),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Comparar revisiones"
      description={`${a.label} vs ${b.label}`}
      size="lg"
      footer={<ModalButton onClick={onClose}>Cerrar</ModalButton>}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Revisión A">
            <select value={aId} onChange={(e) => setAId(e.target.value)} className={inputCls}>
              {reviews.map((r) => (
                <option key={r.id} value={r.id}>{r.label} · {r.date}</option>
              ))}
            </select>
          </Field>
          <Field label="Revisión B">
            <select value={bId} onChange={(e) => setBId(e.target.value)} className={inputCls}>
              {reviews.map((r) => (
                <option key={r.id} value={r.id}>{r.label} · {r.date}</option>
              ))}
            </select>
          </Field>
        </div>

        <CompareRow label="Peso" a={`${a.weight.toFixed(1)} kg`} b={`${b.weight.toFixed(1)} kg`} delta={round(b.weight - a.weight, 1)} unit="kg" />
        {MEASURE_LABELS.map(([k, label]) => (
          <CompareRow
            key={k}
            label={label}
            a={`${round(a.measures[k], 1)} cm`}
            b={`${round(b.measures[k], 1)} cm`}
            delta={round(b.measures[k] - a.measures[k], 1)}
            unit="cm"
          />
        ))}
        <CompareRow label="Cumplimiento entreno" a={`${pct(a).tr}%`} b={`${pct(b).tr}%`} delta={pct(b).tr - pct(a).tr} unit="%" invert={false} />
        <CompareRow label="Adherencia nutrición" a={`${pct(a).nu}%`} b={`${pct(b).nu}%`} delta={pct(b).nu - pct(a).nu} unit="%" invert={false} />
        <CompareRow label="Agua (media)" a={`${a.habits.water} L`} b={`${b.habits.water} L`} delta={round(b.habits.water - a.habits.water, 1)} unit="L" invert={false} />
        <CompareRow label="Sueño (media)" a={`${a.habits.sleep} h`} b={`${b.habits.sleep} h`} delta={round(b.habits.sleep - a.habits.sleep, 1)} unit="h" invert={false} />
        <CompareRow label="Pasos (media)" a={a.habits.steps.toLocaleString("es-ES")} b={b.habits.steps.toLocaleString("es-ES")} delta={b.habits.steps - a.habits.steps} unit="" invert={false} />

        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">Fotografías</div>
          <div className="grid grid-cols-2 gap-3">
            {([["Frontal", "front"], ["Lateral", "side"], ["Espalda", "back"]] as const).map(([label, key]) => (
              <div key={key} className="contents">
                <figure className="overflow-hidden rounded-xl border border-border">
                  <img src={a.photos[key]} alt={`${label} ${a.label}`} loading="lazy" className="h-44 w-full object-cover" />
                  <figcaption className="px-2 py-1 text-[11px] text-ink-muted">{label} · {a.label}</figcaption>
                </figure>
                <figure className="overflow-hidden rounded-xl border border-border">
                  <img src={b.photos[key]} alt={`${label} ${b.label}`} loading="lazy" className="h-44 w-full object-cover" />
                  <figcaption className="px-2 py-1 text-[11px] text-ink-muted">{label} · {b.label}</figcaption>
                </figure>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function CompareRow({
  label,
  a,
  b,
  delta,
  unit,
  invert = true,
}: {
  label: string;
  a: string;
  b: string;
  delta: number;
  unit: string;
  invert?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2">
      <span className="text-sm">{label}</span>
      <span className="flex items-center gap-2 text-xs text-ink-muted">
        {a} <ArrowRight className="h-3 w-3" /> <span className="font-semibold text-foreground">{b}</span>
        <Delta value={delta} unit={unit} invert={invert} />
      </span>
    </div>
  );
}

/* ---------------- Asistente nueva revisión ---------------- */

const STEPS = [
  { title: "Peso", icon: Scale },
  { title: "Fotografías", icon: Camera },
  { title: "Medidas", icon: Ruler },
  { title: "Entrenamiento", icon: Dumbbell },
  { title: "Nutrición", icon: Utensils },
  { title: "Hábitos", icon: Activity },
  { title: "Notas del entrenador", icon: StickyNote },
  { title: "Cambios para el siguiente periodo", icon: Sparkles },
];

function NewReviewWizard({
  open,
  studentName,
  onClose,
  onToast,
}: {
  open: boolean;
  studentName: string;
  onClose: () => void;
  onToast: (t: string) => void;
}) {
  const [step, setStep] = useState(0);
  const Icon = STEPS[step].icon;

  const close = () => {
    setStep(0);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={`Nueva revisión · ${studentName.split(" ")[0]}`}
      description={`Paso ${step + 1} de ${STEPS.length} · ${STEPS[step].title}`}
      size="lg"
      footer={
        <>
          <ModalButton
            onClick={() => {
              onToast("Borrador de revisión guardado.");
              close();
            }}
          >
            Guardar borrador
          </ModalButton>
          {step > 0 && <ModalButton onClick={() => setStep((s) => s - 1)}>Anterior</ModalButton>}
          {step < STEPS.length - 1 ? (
            <ModalButton variant="primary" onClick={() => setStep((s) => s + 1)}>
              Siguiente
            </ModalButton>
          ) : (
            <ModalButton
              variant="primary"
              onClick={() => {
                onToast("Revisión completada y enviada al alumno.");
                close();
              }}
            >
              Completar revisión
            </ModalButton>
          )}
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-1">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className={`h-1 flex-1 rounded-full ${i <= step ? "bg-brand" : "bg-surface"}`}
              title={s.title}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon className="h-4 w-4 text-ink-muted" /> {STEPS[step].title}
        </div>

        {step === 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Peso actual (kg)" required>
              <input type="number" step="0.1" defaultValue={78.4} className={inputCls} />
            </Field>
            <Field label="Fecha de la revisión">
              <input type="date" className={inputCls} />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-3 sm:grid-cols-3">
            {["Frontal", "Lateral", "Espalda"].map((p) => (
              <div key={p} className="grid h-32 place-items-center rounded-xl border border-dashed border-border bg-surface/40 text-center">
                <div>
                  <Camera className="mx-auto h-5 w-5 text-ink-muted" />
                  <div className="mt-1 text-xs font-medium">{p}</div>
                  <div className="text-[11px] text-ink-muted">Subir foto</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {MEASURE_LABELS.map(([k, label]) => (
              <Field key={k} label={`${label} (cm)`}>
                <input type="number" step="0.1" className={inputCls} />
              </Field>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Entrenamientos planificados">
              <input type="number" defaultValue={5} className={inputCls} />
            </Field>
            <Field label="Entrenamientos completados">
              <input type="number" defaultValue={5} className={inputCls} />
            </Field>
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Días completados"><input type="number" defaultValue={6} className={inputCls} /></Field>
            <Field label="Fotografías enviadas"><input type="number" defaultValue={18} className={inputCls} /></Field>
            <Field label="Comidas libres"><input type="number" defaultValue={2} className={inputCls} /></Field>
            <Field label="Adherencia (%)"><input type="number" defaultValue={88} className={inputCls} /></Field>
          </div>
        )}

        {step === 5 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Agua media (L)"><input type="number" step="0.1" defaultValue={2.6} className={inputCls} /></Field>
            <Field label="Sueño medio (h)"><input type="number" step="0.1" defaultValue={7.2} className={inputCls} /></Field>
            <Field label="Pasos medios"><input type="number" defaultValue={8600} className={inputCls} /></Field>
            <Field label="Días con peso registrado"><input type="number" defaultValue={6} className={inputCls} /></Field>
          </div>
        )}

        {step === 6 && (
          <Field label="Notas para el alumno" hint="Se mostrarán en su panel al recibir la revisión.">
            <textarea
              className={textareaCls}
              rows={6}
              defaultValue="Semana muy sólida. Mantenemos el enfoque y ajustamos ligeramente el cardio."
            />
          </Field>
        )}

        {step === 7 && (
          <Field label="Cambios para el siguiente periodo" hint="Un cambio por línea.">
            <textarea
              className={textareaCls}
              rows={6}
              defaultValue={"Reducir 200 kcal.\nAñadir 2 sesiones de cardio.\nCambiar rutina Push.\nMantener proteínas."}
            />
          </Field>
        )}
      </div>
    </Modal>
  );
}
