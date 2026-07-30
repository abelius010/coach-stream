import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Dumbbell,
  Sparkles,
} from "lucide-react";
import {
  setMode,
  setAccountProfile,
  type AccountProfile,
} from "../lib/fitflow-mode";
import { resetAccountStore } from "../lib/demo-store";
import { signUpTrainer } from "../lib/auth";

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [
      { title: "Crea tu cuenta · FitFlow" },
      {
        name: "description",
        content:
          "Crea tu cuenta de entrenador en FitFlow en 5 pasos y empieza a gestionar a tus alumnos desde un único lugar.",
      },
      { property: "og:title", content: "Crea tu cuenta · FitFlow" },
      {
        property: "og:description",
        content: "Registro de entrenador: crea tu espacio y empieza desde cero.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RegistroPage,
});

const totalSteps = 5;

type Draft = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  businessName: string;
  professionalType: string;
  workMode: string;
  studentsRange: string;
  currentTools: string[];
  plan: string;
};

const empty: Draft = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  businessName: "",
  professionalType: "",
  workMode: "",
  studentsRange: "",
  currentTools: [],
  plan: "gratuito",
};

const professionalOptions = [
  "Entrenador personal",
  "Preparador físico",
  "Nutricionista",
  "Centro deportivo",
  "Otro",
];
const workModeOptions = ["Solo online", "Solo presencial", "Ambas"];
const studentsRangeOptions = ["1–10", "11–30", "31–75", "Más de 75"];
const toolOptions = ["WhatsApp", "Excel", "Google Drive", "PDF", "Notion", "Otra aplicación"];

const plans = [
  {
    id: "gratuito",
    name: "Gratuito",
    price: "0 €",
    period: "/mes",
    tagline: "Empieza sin coste",
    cta: "Comenzar gratis",
    features: [
      "Hasta 5 alumnos",
      "Rutinas y nutrición",
      "Progreso y hábitos",
      "Chat y multimedia",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "29 €",
    period: "/mes",
    tagline: "Lo más elegido",
    cta: "Elegir Pro",
    features: [
      "Hasta 75 alumnos",
      "Bandeja inteligente",
      "Progreso y hábitos",
      "Multimedia ilimitada",
      "Todo lo del plan Gratuito",
    ],
    highlight: true,
  },
  {
    id: "business",
    name: "Business",
    price: "59 €",
    period: "/mes",
    tagline: "Para equipos",
    cta: "Elegir Business",
    features: [
      "Alumnos ilimitados",
      "Multi-entrenador",
      "Marca personalizada",
      "Soporte prioritario",
    ],
  },
];

function RegistroPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const toggleTool = (t: string) =>
    setDraft((d) => ({
      ...d,
      currentTools: d.currentTools.includes(t)
        ? d.currentTools.filter((x) => x !== t)
        : [...d.currentTools, t],
    }));

  const validate = (s: number): Record<string, string> => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!draft.firstName.trim()) e.firstName = "Obligatorio";
      if (!draft.lastName.trim()) e.lastName = "Obligatorio";
      if (!draft.email.trim()) e.email = "Obligatorio";
      else if (!/^\S+@\S+\.\S+$/.test(draft.email)) e.email = "Email no válido";
      if (!draft.password.trim()) e.password = "Obligatorio";
      else if (draft.password.length < 6) e.password = "Mínimo 6 caracteres";
    }
    if (s === 1) {
      if (!draft.professionalType) e.professionalType = "Selecciona una opción";
      if (!draft.workMode) e.workMode = "Selecciona una opción";
    }
    if (s === 2) {
      if (!draft.studentsRange) e.studentsRange = "Selecciona una opción";
    }
    if (s === 3) {
      if (!draft.plan) e.plan = "Elige un plan";
    }
    return e;
  };

  const next = () => {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length === 0) setStep((s) => Math.min(s + 1, totalSteps - 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const finish = async () => {
    setAuthError(null);
    setAuthLoading(true);
    const { user, error } = await signUpTrainer(draft.email.trim(), draft.password);
    setAuthLoading(false);
    if (error || !user) {
      setAuthError(error || "No se pudo crear la cuenta. Inténtalo de nuevo.");
      return;
    }
    const profile: AccountProfile = {
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      email: draft.email.trim(),
      businessName: draft.businessName.trim() || undefined,
      professionalType: draft.professionalType,
      workMode: draft.workMode,
      studentsRange: draft.studentsRange,
      currentTools: draft.currentTools,
      plan: draft.plan,
    };
    setAccountProfile(profile);
    resetAccountStore();
    setMode("account");
    // Full navigation so the store dispatcher picks the account store cleanly.
    if (typeof window !== "undefined") {
      window.location.href = "/demo";
    } else {
      navigate({ to: "/demo" });
    }
  };

  const pct = Math.round(((step + 1) / totalSteps) * 100);

  return (
    <div className="min-h-screen bg-surface text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-foreground text-background">
              <Dumbbell className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-tight">FitFlow</span>
          </Link>
          <Link
            to="/"
            className="text-xs text-ink-muted hover:text-foreground"
          >
            Cancelar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>
              Paso <span className="font-medium text-foreground">{step + 1}</span> de {totalSteps}
            </span>
            <span>{pct}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-foreground transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-6 shadow-soft md:p-8">
          {step === 0 && (
            <Step title="Crea tu cuenta" description="Empieza con tus datos personales.">
              <div className="grid gap-4 md:grid-cols-2">
                <FieldWrap label="Nombre" error={errors.firstName}>
                  <input
                    className={inputCls}
                    value={draft.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                    autoFocus
                  />
                </FieldWrap>
                <FieldWrap label="Apellidos" error={errors.lastName}>
                  <input
                    className={inputCls}
                    value={draft.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                  />
                </FieldWrap>
                <div className="md:col-span-2">
                  <FieldWrap label="Correo electrónico" error={errors.email}>
                    <input
                      type="email"
                      className={inputCls}
                      value={draft.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="tu@correo.com"
                    />
                  </FieldWrap>
                </div>
                <div className="md:col-span-2">
                  <FieldWrap label="Contraseña" hint="Mínimo 6 caracteres" error={errors.password}>
                    <input
                      type="password"
                      className={inputCls}
                      value={draft.password}
                      onChange={(e) => set("password", e.target.value)}
                    />
                  </FieldWrap>
                </div>
              </div>
            </Step>
          )}

          {step === 1 && (
            <Step title="Información del entrenador" description="Cuéntanos a qué te dedicas.">
              <FieldWrap label="Nombre del negocio" hint="Opcional">
                <input
                  className={inputCls}
                  value={draft.businessName}
                  onChange={(e) => set("businessName", e.target.value)}
                  placeholder="Ej: FitStudio Barcelona"
                />
              </FieldWrap>
              <FieldWrap label="Tipo de profesional" error={errors.professionalType}>
                <OptionGrid
                  options={professionalOptions}
                  value={draft.professionalType}
                  onChange={(v) => set("professionalType", v)}
                />
              </FieldWrap>
              <FieldWrap label="¿Cómo trabajas actualmente?" error={errors.workMode}>
                <OptionGrid
                  options={workModeOptions}
                  value={draft.workMode}
                  onChange={(v) => set("workMode", v)}
                />
              </FieldWrap>
            </Step>
          )}

          {step === 2 && (
            <Step title="Información del negocio" description="Ayúdanos a preparar tu espacio.">
              <FieldWrap
                label="¿Cuántos alumnos gestionas actualmente?"
                error={errors.studentsRange}
              >
                <OptionGrid
                  options={studentsRangeOptions}
                  value={draft.studentsRange}
                  onChange={(v) => set("studentsRange", v)}
                />
              </FieldWrap>
              <FieldWrap
                label="¿Cómo gestionas actualmente a tus alumnos?"
                hint="Puedes elegir varias"
              >
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {toolOptions.map((t) => {
                    const active = draft.currentTools.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTool(t)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                          active
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background hover:bg-surface"
                        }`}
                      >
                        <span
                          className={`grid h-4 w-4 place-items-center rounded border ${
                            active ? "border-background bg-background" : "border-border"
                          }`}
                        >
                          {active && <Check className="h-3 w-3 text-foreground" />}
                        </span>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </FieldWrap>
            </Step>
          )}

          {step === 3 && (
            <Step title="Elige tu plan" description="Podrás cambiarlo cuando quieras.">
              <div className="grid gap-3 md:grid-cols-3">
                {plans.map((p) => {
                  const active = draft.plan === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => set("plan", p.id)}
                      className={`relative flex flex-col rounded-xl border p-4 text-left transition-all ${
                        active
                          ? "border-foreground shadow-soft"
                          : "border-border hover:border-foreground/40"
                      }`}
                    >
                      {p.highlight && (
                        <span className="absolute -top-2 right-3 rounded-full bg-brand px-2 py-0.5 text-[10px] font-medium text-brand-foreground">
                          Recomendado
                        </span>
                      )}
                      <div className="text-xs text-ink-muted">{p.tagline}</div>
                      <div className="mt-1 text-lg font-semibold">{p.name}</div>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-2xl font-semibold tracking-tight">{p.price}</span>
                        <span className="text-xs text-ink-muted">{p.period}</span>
                      </div>
                      <ul className="mt-4 space-y-1.5 text-xs text-ink-muted">
                        {p.features.map((f) => (
                          <li key={f} className="flex items-start gap-1.5">
                            <Check className="mt-0.5 h-3 w-3 shrink-0 text-foreground/70" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <div
                        className={`mt-4 rounded-lg border py-1.5 text-center text-xs font-medium ${
                          active
                            ? "border-foreground bg-foreground text-background"
                            : "border-border"
                        }`}
                      >
                        {active ? "Seleccionado" : p.cta}
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.plan && <p className="mt-2 text-xs text-rose-600">{errors.plan}</p>}
              <p className="mt-4 text-center text-xs text-ink-muted">
                No se realizará ningún cargo. Configurarás el pago más adelante.
              </p>
            </Step>
          )}

          {step === 4 && (
            <div className="py-6 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-muted text-brand">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight md:text-3xl">
                Bienvenido a FitFlow 🎉
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">
                Tu cuenta está lista, {draft.firstName || "entrenador"}. Ya puedes empezar a
                gestionar a tus alumnos desde un único lugar.
              </p>
              {authError && (
                <p className="mx-auto mt-3 max-w-md text-sm text-rose-600">{authError}</p>
              )}
              <button
                onClick={finish}
                disabled={authLoading}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
              >
                {authLoading ? "Creando tu cuenta…" : "Entrar al dashboard"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {step < 4 && (
          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              onClick={back}
              disabled={step === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Anterior
            </button>
            <button
              onClick={next}
              className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
            >
              Continuar <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-ink-muted focus:border-foreground/30";

function Step({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-ink-muted">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FieldWrap({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label className="text-sm font-medium">{label}</label>
        {hint && <span className="text-[11px] text-ink-muted">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

function OptionGrid({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
      {options.map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
              active
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background hover:bg-surface"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
