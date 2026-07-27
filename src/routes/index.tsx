import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Dumbbell,
  MessageSquare,
  Calendar,
  Camera,
  Users,
  Utensils,
  Video,
  ClipboardCheck,
  BarChart3,
  Activity,
  Footprints,
  Droplets,
  Scale,
  Search,
  Bell,
  Plus,
  AlertTriangle,
  TrendingUp,
  Clock,
  Menu,
  Play,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FitFlow — Gestiona todos tus alumnos desde un solo lugar" },
      {
        name: "description",
        content:
          "La plataforma que centraliza entrenamientos, nutrición, progreso y comunicación para entrenadores personales online. Ahorra horas cada semana.",
      },
      { property: "og:title", content: "FitFlow — Un solo lugar para todos tus alumnos" },
      {
        property: "og:description",
        content:
          "Olvídate de WhatsApp, Excel y Google Drive. Gestiona el doble de alumnos sin volverte loco.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-brand/20">
      <Nav />
      <Hero />
      <TrustStrip />
      <Problems />
      <MorningSection />
      <EverythingGrid />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

/* ---------- Reveal on scroll ---------- */
function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------- Nav ---------- */
function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-foreground text-background">
            <Dumbbell className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">FitFlow</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-ink-muted md:flex">
          <a href="#problems" className="hover:text-foreground transition-colors">Producto</a>
          <a href="#everything" className="hover:text-foreground transition-colors">Funciones</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Precios</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <a href="#" className="rounded-lg px-3 py-2 text-sm text-ink-muted hover:text-foreground transition-colors">
            Iniciar sesión
          </a>
          <a
            href="#pricing"
            className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-all hover:opacity-90"
          >
            Empieza gratis
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-border md:hidden"
          aria-label="Menú"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>
      {open && (
        <div className="border-t border-border md:hidden">
          <div className="container-page flex flex-col gap-4 py-4 text-sm">
            <a href="#problems">Producto</a>
            <a href="#everything">Funciones</a>
            <a href="#pricing">Precios</a>
            <a href="#faq">FAQ</a>
            <a href="#pricing" className="mt-2 inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-2.5 font-medium text-background">
              Empieza gratis
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px]"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, oklch(0.55 0.22 260 / 0.09), transparent 60%)",
        }}
      />
      <div className="container-page pt-20 pb-16 md:pt-28 md:pb-24">
        <Reveal>
          <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-ink-muted">
            <span className="grid h-1.5 w-1.5 place-items-center rounded-full bg-brand" />
            Diseñado para entrenadores online
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mx-auto max-w-5xl text-center text-5xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-7xl lg:text-[88px]">
            Gestiona todos tus alumnos desde{" "}
            <span className="text-brand">un solo lugar</span>.
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-ink-muted md:text-xl">
            Olvídate de WhatsApp, Excel, Google Drive y los mensajes perdidos. Organiza
            entrenamientos, nutrición, progreso y comunicación desde una única plataforma
            diseñada para entrenadores online.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-sm font-medium text-background shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              Empieza gratis
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#morning"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-6 py-3.5 text-sm font-medium hover:bg-surface transition-colors"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Ver una demo
            </a>
          </div>
        </Reveal>
        <Reveal delay={320}>
          <p className="mt-4 text-center text-xs text-ink-muted">14 días gratis · Sin tarjeta</p>
        </Reveal>

        <Reveal delay={400}>
          <div className="relative mx-auto mt-20 max-w-6xl">
            <div
              aria-hidden
              className="absolute inset-x-8 -bottom-8 top-16 -z-10 rounded-3xl"
              style={{
                background:
                  "linear-gradient(180deg, oklch(0.55 0.22 260 / 0.2), oklch(0.55 0.22 260 / 0))",
                filter: "blur(48px)",
              }}
            />
            <FitFlowDashboardMock />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- FitFlow dashboard mock (built, not image) ---------- */
function FitFlowDashboardMock() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.85_0.02_25)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.9_0.02_90)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.88_0.05_150)]" />
        <div className="ml-4 flex flex-1 items-center gap-2 rounded-md border border-border bg-background px-3 py-1 text-xs text-ink-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          fitflow.app / panel
        </div>
      </div>

      <div className="grid grid-cols-[220px_1fr] max-md:grid-cols-1">
        {/* Sidebar */}
        <aside className="border-r border-border bg-surface/50 p-4 max-md:hidden">
          <div className="mb-6 flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-background">
              <Dumbbell className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold">FitFlow</span>
          </div>
          <nav className="space-y-1 text-sm">
            {[
              { icon: BarChart3, label: "Panel", active: true },
              { icon: Users, label: "Alumnos", badge: "128" },
              { icon: Dumbbell, label: "Entrenamientos" },
              { icon: Utensils, label: "Nutrición" },
              { icon: ClipboardCheck, label: "Revisiones", badge: "8" },
              { icon: MessageSquare, label: "Mensajes" },
              { icon: Calendar, label: "Calendario" },
            ].map((i) => (
              <div
                key={i.label}
                className={`flex items-center justify-between rounded-md px-2.5 py-2 ${
                  i.active ? "bg-background text-foreground shadow-soft" : "text-ink-muted"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <i.icon className="h-4 w-4" />
                  {i.label}
                </span>
                {i.badge && (
                  <span className="rounded-full bg-brand-muted px-1.5 text-[10px] font-medium text-brand">
                    {i.badge}
                  </span>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <div className="p-5 md:p-6">
          {/* topbar */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-ink-muted">Lunes, 14 de octubre</p>
              <h3 className="truncate text-base font-semibold md:text-lg">Buenos días, Carlos 👋</h3>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-ink-muted md:flex">
                <Search className="h-3.5 w-3.5" />
                Buscar alumno…
              </div>
              <button className="grid h-8 w-8 place-items-center rounded-md border border-border">
                <Bell className="h-3.5 w-3.5" />
              </button>
              <button className="inline-flex items-center gap-1 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background">
                <Plus className="h-3 w-3" /> Alumno
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Alumnos activos" value="128" delta="+6 esta semana" tone="default" />
            <StatCard label="Revisiones pendientes" value="8" delta="Hoy" tone="brand" />
            <StatCard label="Vídeos por revisar" value="14" delta="Nuevo hace 12min" tone="default" />
            <StatCard label="Fotos de comidas" value="27" delta="Últimas 24h" tone="default" />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            {/* Attention list */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-[oklch(0.96_0.05_25)] text-[oklch(0.55_0.2_25)]">
                    <AlertTriangle className="h-3.5 w-3.5" />
                  </span>
                  <h4 className="text-sm font-semibold">Necesitan tu atención</h4>
                </div>
                <span className="text-xs text-ink-muted">5 alumnos</span>
              </div>
              <ul className="mt-4 divide-y divide-border">
                {[
                  { n: "Marta L.", r: "Sin actividad · 4 días", t: "Hipertrofia" },
                  { n: "Iván G.", r: "3 vídeos sin revisar", t: "Fuerza" },
                  { n: "Sofía R.", r: "No registró comidas · 2 días", t: "Definición" },
                  { n: "Pablo M.", r: "Revisión pendiente hoy", t: "Recomp." },
                ].map((s) => (
                  <li key={s.n} className="flex items-center justify-between py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-muted text-xs font-semibold text-brand">
                        {s.n.split(" ").map((x) => x[0]).join("")}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{s.n}</p>
                        <p className="truncate text-xs text-ink-muted">{s.r}</p>
                      </div>
                    </div>
                    <span className="hidden shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] text-ink-muted sm:inline">
                      {s.t}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Today */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Revisiones de hoy</h4>
                <span className="text-xs text-ink-muted">3</span>
              </div>
              <ul className="mt-4 space-y-3">
                {[
                  { t: "09:30", n: "Ana Torres", p: "Fuerza 4d" },
                  { t: "12:00", n: "Luis Peña", p: "Hipertrofia" },
                  { t: "17:15", n: "Nora Vidal", p: "Definición" },
                ].map((r) => (
                  <li key={r.n} className="flex items-center gap-3">
                    <span className="w-12 rounded-md bg-surface px-2 py-1 text-center text-[11px] font-medium tabular-nums">
                      {r.t}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{r.n}</p>
                      <p className="truncate text-xs text-ink-muted">{r.p}</p>
                    </div>
                    <Clock className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-lg border border-border bg-surface p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-muted">Progreso semanal del equipo</span>
                  <span className="font-medium">72%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                  <div className="h-full rounded-full bg-brand" style={{ width: "72%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  delta,
  tone,
}: {
  label: string;
  value: string;
  delta: string;
  tone: "default" | "brand";
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        tone === "brand" ? "border-brand/30 bg-brand-muted/60" : "border-border bg-card"
      }`}
    >
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-muted">
        <TrendingUp className="h-3 w-3" />
        {delta}
      </p>
    </div>
  );
}

/* ---------- Trust strip ---------- */
function TrustStrip() {
  const items = ["+2.400 entrenadores", "180K alumnos gestionados", "12M sesiones", "4.9 / 5 valoración"];
  return (
    <section className="border-y border-border bg-surface">
      <div className="container-page grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
        {items.map((l) => (
          <div key={l} className="text-center text-sm text-ink-muted">
            {l}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Problems / benefits ---------- */
function Problems() {
  const items = [
    {
      title: "Todo organizado",
      desc: "Deja de buscar entrenamientos, fotos y mensajes entre distintas aplicaciones. Todo en un solo panel.",
    },
    {
      title: "Ahorra tiempo",
      desc: "Gestiona cientos de alumnos desde un único lugar. Plantillas, duplicados y asignaciones masivas.",
    },
    {
      title: "Haz mejores seguimientos",
      desc: "Consulta el progreso completo de cualquier alumno en segundos: peso, medidas, fotos, hábitos.",
    },
    {
      title: "Detecta quién necesita atención",
      desc: "FitFlow te avisa de qué alumnos llevan días sin entrenar, no registran comidas o necesitan revisión.",
    },
  ];
  return (
    <section id="problems" className="container-page py-28 md:py-36">
      <Reveal>
        <p className="text-sm font-medium uppercase tracking-widest text-brand">Por qué FitFlow</p>
        <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.02em] md:text-6xl">
          Deja de perder horas entre pestañas.
        </h2>
      </Reveal>
      <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
        {items.map((it, i) => (
          <Reveal key={it.title} delay={i * 80}>
            <div className="h-full bg-card p-8 md:p-10">
              <div className="flex items-center gap-2 text-xs text-ink-muted">
                <span className="tabular-nums">0{i + 1}</span>
                <span className="h-px w-6 bg-border" />
              </div>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">{it.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-ink-muted">{it.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- Morning section (star) ---------- */
function MorningSection() {
  return (
    <section id="morning" className="border-t border-border bg-surface py-28 md:py-36">
      <div className="container-page">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.3fr]">
          <Reveal>
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-brand">Así empieza tu día</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.02em] md:text-6xl">
                Abre FitFlow. Sabes qué hacer.
              </h2>
              <p className="mt-5 max-w-md text-lg text-ink-muted">
                En 30 segundos, tu día está claro. Sin abrir 8 aplicaciones. Sin buscar mensajes
                perdidos. Lo importante, en la primera pantalla.
              </p>
              <ul className="mt-8 space-y-3 text-sm">
                {[
                  "Prioridades resaltadas automáticamente",
                  "Alertas de alumnos inactivos",
                  "Todo lo pendiente, en una sola vista",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-brand text-brand-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <MorningCard />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function MorningCard() {
  const rows = [
    { icon: "🔴", label: "revisiones pendientes", value: 6, tone: "brand" },
    { icon: "📹", label: "vídeos esperando revisión", value: 4 },
    { icon: "📸", label: "fotos nuevas", value: 18 },
    { icon: "🥗", label: "alumnos no registraron su alimentación", value: 9 },
    { icon: "💧", label: "alumnos no alcanzaron el objetivo de agua", value: 14 },
    { icon: "⚠️", label: "alumnos llevan más de 4 días sin actividad", value: 3, tone: "warn" as const },
  ];
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-ink-muted">Lunes · 08:12</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight">Buenos días, Carlos 👋</h3>
        </div>
        <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-ink-muted">
          Hoy
        </span>
      </div>
      <p className="mt-4 text-sm text-ink-muted">Hoy tienes:</p>
      <ul className="mt-4 divide-y divide-border">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-4 py-3.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-base">
              {r.icon}
            </span>
            <span className="flex-1 text-sm">
              <span
                className={`mr-1.5 text-lg font-semibold tabular-nums ${
                  r.tone === "brand" ? "text-brand" : r.tone === "warn" ? "text-[oklch(0.55_0.2_25)]" : ""
                }`}
              >
                {r.value}
              </span>
              <span className="text-ink-muted">{r.label}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center justify-between rounded-xl bg-foreground p-4 text-background">
        <div>
          <p className="text-sm font-medium">Empezar por lo prioritario</p>
          <p className="text-xs opacity-70">6 revisiones te llevarán ~40 min</p>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-background px-3 py-2 text-xs font-medium text-foreground">
          Empezar <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ---------- Everything grid ---------- */
function EverythingGrid() {
  const items = [
    { icon: Users, title: "Gestión de alumnos" },
    { icon: Dumbbell, title: "Entrenamientos" },
    { icon: Utensils, title: "Nutrición" },
    { icon: Camera, title: "Fotos de progreso" },
    { icon: Video, title: "Vídeos" },
    { icon: MessageSquare, title: "Chat" },
    { icon: ClipboardCheck, title: "Revisiones" },
    { icon: Calendar, title: "Calendario" },
    { icon: BarChart3, title: "Estadísticas" },
    { icon: Activity, title: "Hábitos" },
    { icon: Footprints, title: "Pasos" },
    { icon: Droplets, title: "Agua" },
    { icon: Scale, title: "Peso" },
    { icon: Sparkles, title: "Y mucho más" },
  ];
  return (
    <section id="everything" className="container-page py-28 md:py-36">
      <Reveal>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-brand">Funciones</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.02em] md:text-6xl">
            Todo lo que necesitas para gestionar tu negocio.
          </h2>
          <p className="mt-5 text-lg text-ink-muted">
            Un producto completo, sin depender de decenas de herramientas.
          </p>
        </div>
      </Reveal>
      <div className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map(({ icon: Icon, title }, i) => (
          <Reveal key={title} delay={(i % 4) * 60}>
            <div className="group flex h-full items-start gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-soft">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-foreground transition-colors group-hover:bg-brand-muted group-hover:text-brand">
                <Icon className="h-4 w-4" />
              </span>
              <span className="pt-1.5 text-sm font-medium">{title}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- Testimonials ---------- */
function Testimonials() {
  const items = [
    {
      quote:
        "Pasé de gestionar 20 a 90 alumnos sin morir en el intento. FitFlow me devolvió las tardes.",
      author: "Marcos Ruiz",
      role: "Entrenador online · Madrid",
    },
    {
      quote:
        "Antes vivía en WhatsApp y Excel. Ahora abro FitFlow por la mañana y en 5 minutos sé cómo va todo.",
      author: "Laura Fernández",
      role: "Coach de fuerza · Barcelona",
    },
    {
      quote:
        "El comparador de fotos y las gráficas de progreso son oro puro para las revisiones semanales.",
      author: "Diego Álvarez",
      role: "Nutricionista deportivo",
    },
  ];
  return (
    <section className="border-t border-border bg-surface py-28 md:py-36">
      <div className="container-page">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-brand">Testimonios</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.02em] md:text-6xl">
              Entrenadores que ya no vuelven atrás.
            </h2>
          </div>
        </Reveal>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={t.author} delay={i * 100}>
              <figure className="h-full rounded-2xl border border-border bg-card p-8 shadow-soft">
                <blockquote className="text-lg font-medium leading-relaxed">"{t.quote}"</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-muted text-sm font-semibold text-brand">
                    {t.author.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.author}</div>
                    <div className="text-xs text-ink-muted">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Pricing ---------- */
function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "0",
      desc: "Ideal para empezar y probar la plataforma.",
      features: ["Hasta 5 alumnos", "Rutinas y dietas", "Chat integrado", "Progreso básico"],
      cta: "Empezar gratis",
      highlight: false,
    },
    {
      name: "Pro",
      price: "39",
      desc: "Para entrenadores que están creciendo.",
      features: [
        "Alumnos ilimitados",
        "Plantillas avanzadas",
        "Comparador de fotos",
        "Gráficas y hábitos",
        "Recordatorios automáticos",
      ],
      cta: "Prueba 14 días",
      highlight: true,
    },
    {
      name: "Studio",
      price: "89",
      desc: "Para equipos y estudios de entrenamiento.",
      features: [
        "Todo lo de Pro",
        "Multi-entrenador",
        "Marca personalizada",
        "API y exportaciones",
        "Soporte prioritario",
      ],
      cta: "Hablar con ventas",
      highlight: false,
    },
  ];
  return (
    <section id="pricing" className="container-page py-28 md:py-36">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-brand">Precios</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.02em] md:text-6xl">
            Simple. Transparente. Escalable.
          </h2>
          <p className="mt-5 text-lg text-ink-muted">
            Empieza gratis y crece a tu ritmo. Cancela cuando quieras.
          </p>
        </div>
      </Reveal>
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {plans.map((p, i) => (
          <Reveal key={p.name} delay={i * 90}>
            <div
              className={`relative h-full rounded-2xl border p-8 transition-all ${
                p.highlight
                  ? "border-foreground bg-card shadow-card"
                  : "border-border bg-card shadow-soft"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                  Más popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-ink-muted">{p.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-semibold tracking-tight">€{p.price}</span>
                <span className="text-sm text-ink-muted">/mes</span>
              </div>
              <a
                href="#"
                className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-medium transition-all ${
                  p.highlight
                    ? "bg-foreground text-background hover:opacity-90"
                    : "border border-border bg-background hover:bg-surface"
                }`}
              >
                {p.cta}
              </a>
              <ul className="mt-8 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
function FAQ() {
  const items = [
    { q: "¿Puedo probar FitFlow sin pagar?", a: "Sí. 14 días de prueba gratuita en el plan Pro y un plan Starter gratis para siempre con hasta 5 alumnos." },
    { q: "¿Mis alumnos también tienen acceso?", a: "Sí. Cada alumno tiene su propio acceso con una experiencia simplificada: entrenamiento del día, comidas, hábitos y chat contigo." },
    { q: "¿Puedo migrar mis rutinas y datos actuales?", a: "Nuestro equipo te ayuda a importar tus rutinas, dietas y alumnos desde Excel, Google Drive u otras plataformas." },
    { q: "¿Funciona en móvil?", a: "Totalmente responsive. Tú gestionas desde el escritorio y tus alumnos entrenan desde el móvil." },
    { q: "¿Puedo cancelar cuando quiera?", a: "Sí, sin permanencia. Cancela desde tu panel en un clic." },
  ];
  return (
    <section id="faq" className="border-t border-border bg-surface py-28 md:py-36">
      <div className="container-page grid gap-16 lg:grid-cols-[1fr_2fr]">
        <Reveal>
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-brand">FAQ</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
              Preguntas frecuentes.
            </h2>
            <p className="mt-4 text-ink-muted">
              ¿Otra duda? Escríbenos a{" "}
              <a href="mailto:hola@fitflow.app" className="text-brand underline underline-offset-4">
                hola@fitflow.app
              </a>
            </p>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            {items.map((it) => (
              <details key={it.q} className="group p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium">
                  {it.q}
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border text-ink-muted transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{it.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- CTA ---------- */
function CTA() {
  return (
    <section className="container-page py-28">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-foreground p-12 text-center text-background md:p-20">
          <div
            aria-hidden
            className="absolute inset-0 -z-0 opacity-30"
            style={{
              background:
                "radial-gradient(circle at 30% 20%, oklch(0.55 0.22 260 / 0.6), transparent 50%), radial-gradient(circle at 70% 80%, oklch(0.55 0.22 260 / 0.4), transparent 55%)",
            }}
          />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl text-4xl font-semibold tracking-[-0.02em] md:text-6xl">
              Gestiona el doble de alumnos sin volverte loco.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg opacity-70">
              Empieza gratis. Configura tu panel en 5 minutos. Cancela cuando quieras.
            </p>
            <a
              href="#"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-background px-6 py-3.5 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5"
            >
              Empieza gratis
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  const cols = [
    {
      title: "Producto",
      links: [
        { label: "Características", href: "#everything" },
        { label: "Precios", href: "#pricing" },
        { label: "Preguntas frecuentes", href: "#faq" },
      ],
    },
    {
      title: "Compañía",
      links: [
        { label: "Contacto", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Sobre nosotros", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Política de privacidad", href: "#" },
        { label: "Términos y condiciones", href: "#" },
        { label: "Cookies", href: "#" },
      ],
    },
  ];
  return (
    <footer className="border-t border-border bg-background">
      <div className="container-page py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-foreground text-background">
                <Dumbbell className="h-4 w-4" />
              </div>
              <span className="text-lg font-semibold tracking-tight">FitFlow</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-ink-muted">
              La plataforma que centraliza todo el trabajo del entrenador personal online.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-semibold">{c.title}</h4>
              <ul className="mt-4 space-y-3 text-sm text-ink-muted">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="hover:text-foreground transition-colors">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-ink-muted sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} FitFlow. Todos los derechos reservados.</span>
          <span>Hecho con precisión para entrenadores.</span>
        </div>
      </div>
    </footer>
  );
}
