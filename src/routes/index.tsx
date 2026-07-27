import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Dumbbell,
  LineChart,
  MessageSquare,
  Calendar,
  Camera,
  Users,
  Sparkles,
  Zap,
  ShieldCheck,
  Menu,
} from "lucide-react";
import { useState } from "react";
import dashboardHero from "@/assets/dashboard-hero.jpg";
import featureProgress from "@/assets/feature-progress.jpg";
import featureTraining from "@/assets/feature-training.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FitFlow — La plataforma para entrenadores personales online" },
      {
        name: "description",
        content:
          "Centraliza la gestión de tus alumnos: entrenamientos, nutrición, progreso y comunicación. Ahorra horas cada semana. Olvídate de WhatsApp y Excel.",
      },
      { property: "og:title", content: "FitFlow — Gestión total para entrenadores online" },
      {
        property: "og:description",
        content:
          "El sistema operativo de los entrenadores personales online. Todo tu negocio en un solo lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <LogoStrip />
      <Benefits />
      <FeatureShowcase />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-brand-foreground">
            <Dumbbell className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">FitFlow</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-ink-muted md:flex">
          <a href="#benefits" className="hover:text-foreground transition-colors">Producto</a>
          <a href="#features" className="hover:text-foreground transition-colors">Funciones</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Precios</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <a href="#" className="text-sm text-ink-muted hover:text-foreground transition-colors">
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
            <a href="#benefits">Producto</a>
            <a href="#features">Funciones</a>
            <a href="#pricing">Precios</a>
            <a href="#faq">FAQ</a>
            <a
              href="#pricing"
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-2.5 font-medium text-background"
            >
              Empieza gratis
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px]"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, oklch(0.55 0.22 260 / 0.10), transparent 60%)",
        }}
      />
      <div className="container-page pt-20 pb-20 text-center md:pt-28 md:pb-28">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-ink-muted">
          <Sparkles className="h-3 w-3 text-brand" />
          Nuevo · Panel unificado para entrenadores online
        </div>
        <h1 className="mx-auto max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
          El sistema operativo de los{" "}
          <span className="text-brand">entrenadores</span> online.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-muted md:text-xl">
          Centraliza entrenamientos, nutrición, progreso y comunicación con tus alumnos.
          Olvídate de WhatsApp, Excel y Google Drive.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-sm font-medium text-background shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-glow"
          >
            Empieza gratis
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-6 py-3.5 text-sm font-medium hover:bg-surface transition-colors"
          >
            Ver cómo funciona
          </a>
        </div>
        <p className="mt-4 text-xs text-ink-muted">14 días gratis · Sin tarjeta de crédito</p>

        <div className="relative mx-auto mt-16 max-w-6xl">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 rounded-3xl"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.22 260 / 0.20), oklch(0.55 0.22 260 / 0.05))",
              filter: "blur(40px)",
              transform: "translateY(20px)",
            }}
          />
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <img
              src={dashboardHero}
              alt="Dashboard de FitFlow"
              width={1600}
              height={1104}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function LogoStrip() {
  const labels = ["+2.400 entrenadores", "180K alumnos gestionados", "12M sesiones", "4.9/5 valoración"];
  return (
    <section className="border-y border-border bg-surface">
      <div className="container-page grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
        {labels.map((l) => (
          <div key={l} className="text-center text-sm text-ink-muted">
            {l}
          </div>
        ))}
      </div>
    </section>
  );
}

function Benefits() {
  const items = [
    {
      icon: Zap,
      title: "Todo en un mismo lugar",
      desc: "Entrenamientos, dietas, progreso, chat y calendario. Un único panel, cero pestañas abiertas.",
    },
    {
      icon: Users,
      title: "Gestiona cientos de alumnos",
      desc: "Filtra, agrupa y asigna programas a varios alumnos a la vez. Escala sin perder calidad.",
    },
    {
      icon: LineChart,
      title: "Ahorra horas cada semana",
      desc: "Plantillas de rutina, revisiones automáticas y recordatorios inteligentes.",
    },
    {
      icon: MessageSquare,
      title: "Olvídate de WhatsApp",
      desc: "Chat integrado con notas, vídeos y feedback dentro de la ficha de cada alumno.",
    },
  ];
  return (
    <section id="benefits" className="container-page py-24 md:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-brand">Beneficios</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Diseñado para entrenadores que quieren crecer.
        </h2>
        <p className="mt-4 text-lg text-ink-muted">
          Un producto pensado para eliminar la fricción diaria y liberar tu tiempo.
        </p>
      </div>
      <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"
          >
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-muted text-brand transition-transform group-hover:scale-110">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-base font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureShowcase() {
  const features = [
    {
      tag: "Entrenamiento",
      title: "Rutinas que se envían solas.",
      desc: "Crea plantillas de entrenamiento con vídeos explicativos, series y repeticiones. Asigna a uno o cientos de alumnos en un clic.",
      bullets: ["Biblioteca de ejercicios", "Vídeos explicativos", "Progresión automática"],
      image: featureTraining,
      reverse: false,
    },
    {
      tag: "Progreso",
      title: "Ficha completa por alumno.",
      desc: "Peso, medidas, fotos antes/después, gráficas de evolución y revisiones semanales. Todo lo que necesitas para saber cómo va tu alumno.",
      bullets: ["Comparador de fotos", "Gráficas de evolución", "Revisiones semanales"],
      image: featureProgress,
      reverse: true,
    },
  ];
  return (
    <section id="features" className="border-t border-border bg-surface py-24 md:py-32">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-brand">Producto</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Todo lo que necesitas. Nada de lo que sobra.
          </h2>
        </div>
        <div className="mt-20 space-y-24">
          {features.map((f) => (
            <div
              key={f.title}
              className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${f.reverse ? "lg:[&>*:first-child]:order-2" : ""}`}
            >
              <div>
                <span className="inline-flex rounded-full bg-brand-muted px-3 py-1 text-xs font-medium text-brand">
                  {f.tag}
                </span>
                <h3 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">{f.title}</h3>
                <p className="mt-4 text-lg text-ink-muted">{f.desc}</p>
                <ul className="mt-6 space-y-3">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-3 text-sm">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-brand text-brand-foreground">
                        <Check className="h-3 w-3" />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                <img
                  src={f.image}
                  alt={f.title}
                  width={1200}
                  height={912}
                  loading="lazy"
                  className="w-full"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 grid gap-4 md:grid-cols-3">
          {[
            { icon: Calendar, title: "Calendario", desc: "Planifica revisiones y sesiones." },
            { icon: Camera, title: "Multimedia", desc: "Fotos, vídeos y archivos por alumno." },
            { icon: ShieldCheck, title: "Hábitos", desc: "Agua, pasos, sueño y estado de ánimo." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-foreground text-background">
                <Icon className="h-5 w-5" />
              </div>
              <h4 className="mt-4 font-semibold">{title}</h4>
              <p className="mt-1 text-sm text-ink-muted">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

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
        "El comparador de fotos y las gráficas de progreso son oro puro para las revisiones.",
      author: "Diego Álvarez",
      role: "Nutricionista deportivo",
    },
  ];
  return (
    <section className="container-page py-24 md:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-brand">Testimonios</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Entrenadores que ya no vuelven atrás.
        </h2>
      </div>
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {items.map((t) => (
          <figure
            key={t.author}
            className="rounded-2xl border border-border bg-card p-8 shadow-soft"
          >
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
        ))}
      </div>
    </section>
  );
}

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
    <section id="pricing" className="border-t border-border bg-surface py-24 md:py-32">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-brand">Precios</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Simple, transparente, escalable.
          </h2>
          <p className="mt-4 text-lg text-ink-muted">
            Empieza gratis y crece a tu ritmo. Cancela cuando quieras.
          </p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl border p-8 transition-all ${
                p.highlight
                  ? "border-brand bg-card shadow-card lg:scale-[1.02]"
                  : "border-border bg-card shadow-soft"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-medium text-brand-foreground">
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
                    ? "bg-brand text-brand-foreground hover:opacity-90"
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
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    {
      q: "¿Puedo probar FitFlow sin pagar?",
      a: "Sí. Tienes 14 días de prueba gratuita en el plan Pro y un plan Starter gratis para siempre con hasta 5 alumnos.",
    },
    {
      q: "¿Mis alumnos también tienen acceso?",
      a: "Sí. Cada alumno tiene su propio acceso con una experiencia simplificada: entrenamiento del día, comidas, hábitos y chat contigo.",
    },
    {
      q: "¿Puedo migrar mis rutinas y datos actuales?",
      a: "Nuestro equipo te ayuda a importar tus rutinas, dietas y alumnos desde Excel, Google Drive u otras plataformas.",
    },
    {
      q: "¿Funciona en móvil?",
      a: "Totalmente responsive. Tú gestionas desde el escritorio y tus alumnos entrenan desde el móvil.",
    },
    {
      q: "¿Puedo cancelar cuando quiera?",
      a: "Sí, sin permanencia. Cancela desde tu panel en un clic.",
    },
  ];
  return (
    <section id="faq" className="container-page py-24 md:py-32">
      <div className="grid gap-16 lg:grid-cols-[1fr_2fr]">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-brand">FAQ</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Preguntas frecuentes.
          </h2>
          <p className="mt-4 text-ink-muted">
            ¿Otra duda? Escríbenos a{" "}
            <a href="mailto:hola@fitflow.app" className="text-brand underline underline-offset-4">
              hola@fitflow.app
            </a>
          </p>
        </div>
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
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="container-page pb-24">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-foreground p-12 text-center text-background md:p-20">
        <div
          aria-hidden
          className="absolute inset-0 -z-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, oklch(0.55 0.22 260 / 0.6), transparent 50%), radial-gradient(circle at 70% 80%, oklch(0.55 0.22 260 / 0.4), transparent 50%)",
          }}
        />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
            Deja de perder tiempo. Empieza a entrenar mejor.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg opacity-70">
            Únete a miles de entrenadores que ya centralizan todo en FitFlow.
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
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-brand-foreground">
                <Dumbbell className="h-4 w-4" />
              </div>
              <span className="text-lg font-semibold tracking-tight">FitFlow</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-ink-muted">
              La plataforma que centraliza todo el trabajo del entrenador personal online.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Producto</h4>
            <ul className="mt-3 space-y-2 text-sm text-ink-muted">
              <li><a href="#features" className="hover:text-foreground">Funciones</a></li>
              <li><a href="#pricing" className="hover:text-foreground">Precios</a></li>
              <li><a href="#faq" className="hover:text-foreground">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Compañía</h4>
            <ul className="mt-3 space-y-2 text-sm text-ink-muted">
              <li><a href="#" className="hover:text-foreground">Sobre nosotros</a></li>
              <li><a href="#" className="hover:text-foreground">Contacto</a></li>
              <li><a href="#" className="hover:text-foreground">Privacidad</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-ink-muted sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} FitFlow. Todos los derechos reservados.</span>
          <span>Hecho con precisión para entrenadores.</span>
        </div>
      </div>
    </footer>
  );
}
