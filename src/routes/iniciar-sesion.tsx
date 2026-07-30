import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Dumbbell } from "lucide-react";
import { setMode } from "../lib/fitflow-mode";
import { signInTrainer } from "../lib/auth";
import { resetAccountStore } from "../lib/demo-store";

export const Route = createFileRoute("/iniciar-sesion")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión · FitFlow" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Completa todos los campos.");
      return;
    }
    setLoading(true);
    const { user, error: authError } = await signInTrainer(email.trim(), password);
    setLoading(false);
    if (authError || !user) {
      setError(authError || "No se pudo iniciar sesión.");
      return;
    }
    // Evita que queden datos locales de una sesión anterior en este
    // navegador antes de cargar los del usuario que acaba de entrar.
    resetAccountStore();
    setMode("account");
    if (typeof window !== "undefined") {
      window.location.href = "/demo";
    } else {
      navigate({ to: "/demo" });
    }
  };

  return (
    <div className="min-h-screen bg-surface text-foreground">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-foreground text-background">
              <Dumbbell className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-tight">FitFlow</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-12 md:px-6">
        <div className="rounded-2xl border border-border bg-background p-6 shadow-soft md:p-8">
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Inicia sesión</h1>
          <p className="mt-1 text-sm text-ink-muted">Entra con tu cuenta de entrenador.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Correo electrónico</label>
              <input
                type="email"
                required
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-ink-muted focus:border-foreground/30"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Contraseña</label>
              <input
                type="password"
                required
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-ink-muted focus:border-foreground/30"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-rose-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Entrando…" : "Iniciar sesión"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-ink-muted">
            ¿Aún no tienes cuenta?{" "}
            <Link to="/registro" className="font-medium text-foreground hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
