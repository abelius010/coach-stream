import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

export function PlanLimitBanner({
  limit,
  compact = false,
}: {
  limit: number;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 ${
        compact ? "p-3" : "p-4"
      } text-amber-900`}
    >
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-700">
        <AlertTriangle className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 text-sm">
        <div className="font-medium">
          Has alcanzado el límite de {limit} alumnos del plan gratuito.
        </div>
        <div className="text-xs text-amber-800/80">
          Actualiza a Pro para seguir creciendo con FitFlow.
        </div>
      </div>
      <Link
        to="/demo/configuracion"
        className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90"
      >
        Ver planes
      </Link>
    </div>
  );
}
