import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, CreditCard, Bell, Shield, User, Building2, Sparkles } from "lucide-react";
import { useMode, useAccountProfile, planLabel, getPlanLimit } from "../lib/fitflow-mode";
import { useDemoStore } from "../lib/demo-store";
import { ToastStack, type ToastData } from "../components/demo/Toast";

export const Route = createFileRoute("/demo/configuracion")({
  head: () => ({
    meta: [
      { title: "Configuración · FitFlow" },
      { name: "description", content: "Gestiona tu perfil, plan y facturación en FitFlow." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfiguracionPage,
});

type TabId = "perfil" | "empresa" | "plan" | "seguridad" | "notificaciones";

const tabs: { id: TabId; label: string; icon: typeof User }[] = [
  { id: "perfil", label: "Perfil", icon: User },
  { id: "empresa", label: "Empresa", icon: Building2 },
  { id: "plan", label: "Plan y facturación", icon: CreditCard },
  { id: "seguridad", label: "Seguridad", icon: Shield },
  { id: "notificaciones", label: "Notificaciones", icon: Bell },
];

function ConfiguracionPage() {
  const [tab, setTab] = useState<TabId>("plan");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Gestiona tu cuenta, tu plan y las preferencias de FitFlow.
        </p>
      </header>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent text-ink-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "plan" ? <PlanTab /> : <Placeholder tab={tab} />}
    </div>
  );
}

function Placeholder({ tab }: { tab: TabId }) {
  const label = tabs.find((t) => t.id === tab)?.label ?? "";
  return (
    <div className="rounded-2xl border border-dashed border-border bg-background p-10 text-center">
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-surface text-ink-muted">
        <Sparkles className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-base font-medium">{label}</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Esta sección estará disponible próximamente.
      </p>
    </div>
  );
}

const featuresIncluded = [
  "Gestión de alumnos",
  "Rutinas",
  "Nutrición",
  "Chat",
  "Progreso",
  "Hábitos",
  "Multimedia",
  "Revisiones",
];

const upgradePlans = [
  {
    id: "pro",
    name: "Pro",
    price: "29 €",
    period: "/mes",
    tagline: "Lo más elegido",
    limit: "Hasta 75 alumnos",
    cta: "Actualizar a Pro",
    highlight: true,
  },
  {
    id: "business",
    name: "Business",
    price: "59 €",
    period: "/mes",
    tagline: "Para equipos",
    limit: "Alumnos ilimitados",
    cta: "Actualizar a Business",
  },
];

function PlanTab() {
  const mode = useMode();
  const accountProfile = useAccountProfile();
  const profile = mode === "account" ? accountProfile : null;
  const plan = mode === "account" ? profile?.plan ?? "gratuito" : "pro";
  const students = useDemoStore((s) => s.students);
  const limit = getPlanLimit(plan);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const push = (text: string) =>
    setToasts((t) => [...t, { id: Date.now() + Math.random(), text }]);
  const remove = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  const usage = useMemo(() => {
    if (limit === null) return `${students.length} alumnos`;
    return `${students.length} / ${limit} alumnos utilizados`;
  }, [students.length, limit]);

  const currentPrice =
    plan === "pro" ? "29 €" : plan === "business" ? "59 €" : "0 €";
  const currentLimit =
    plan === "pro" ? "Hasta 75 alumnos" : plan === "business" ? "Alumnos ilimitados" : "Hasta 5 alumnos";

  const shown = upgradePlans.filter((p) => p.id !== plan);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-background p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-ink-muted">Tu plan actual</div>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <h2 className="text-xl font-semibold">{planLabel(plan)}</h2>
            </div>
            <div className="mt-1 text-sm text-ink-muted">
              {currentPrice}/mes · {currentLimit}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm">
            <div className="text-xs text-ink-muted">Uso actual</div>
            <div className="mt-0.5 font-medium">{usage}</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-xs uppercase tracking-wide text-ink-muted">Funciones incluidas</div>
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {featuresIncluded.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-emerald-600" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {shown.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-medium text-ink-muted">Planes disponibles</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {shown.map((p) => (
              <div
                key={p.id}
                className={`relative rounded-2xl border bg-background p-6 ${
                  p.highlight ? "border-foreground shadow-sm" : "border-border"
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-2 left-6 rounded-md bg-foreground px-2 py-0.5 text-[10px] font-medium text-background">
                    {p.tagline}
                  </span>
                )}
                <div className="flex items-baseline justify-between">
                  <h4 className="text-lg font-semibold">{p.name}</h4>
                  <div className="text-right">
                    <div className="text-xl font-semibold">{p.price}</div>
                    <div className="text-xs text-ink-muted">{p.period}</div>
                  </div>
                </div>
                <div className="mt-1 text-sm text-ink-muted">{p.limit}</div>
                <button
                  onClick={() =>
                    push("La integración con pagos se implementará próximamente.")
                  }
                  className={`mt-5 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                    p.highlight
                      ? "bg-foreground text-background hover:opacity-90"
                      : "border border-border bg-background hover:bg-surface"
                  }`}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="text-xs text-ink-muted">
        Los pagos se activarán próximamente. Podrás cambiar o cancelar tu plan en cualquier momento.
      </p>

      <ToastStack toasts={toasts} onDismiss={remove} />
    </div>
  );
}
