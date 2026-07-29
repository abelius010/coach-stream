import { useState } from "react";
import { RotateCcw, Info } from "lucide-react";
import { useDemoStore } from "../../lib/demo-store";

export function DemoBanner() {
  const reset = useDemoStore((s) => s.resetDemo);
  const [confirming, setConfirming] = useState(false);

  const handleReset = () => {
    reset();
    try { localStorage.removeItem("fitflow-demo-nuevo-draft"); } catch {}
    setConfirming(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-brand-muted/40 px-4 py-1.5 text-[11px] text-ink-muted md:px-6">
      <Info className="h-3 w-3 shrink-0" />
      <span>Demo local · los cambios se guardan solo en este navegador.</span>
      <div className="ml-auto flex items-center gap-2">
        {confirming ? (
          <>
            <span className="text-foreground">¿Restablecer todo?</span>
            <button onClick={handleReset} className="rounded-md bg-foreground px-2 py-0.5 text-[11px] font-medium text-background">Sí, restablecer</button>
            <button onClick={() => setConfirming(false)} className="rounded-md px-2 py-0.5 text-[11px] hover:bg-background">Cancelar</button>
          </>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] hover:bg-background hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" /> Restablecer demo
          </button>
        )}
      </div>
    </div>
  );
}
