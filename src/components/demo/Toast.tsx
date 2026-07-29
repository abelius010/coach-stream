import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

export type ToastData = { id: number; text: string };

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastData[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const to = setTimeout(() => onDismiss(toast.id), 3200);
    return () => clearTimeout(to);
  }, [toast.id, onDismiss]);
  return (
    <div className="pointer-events-auto flex min-w-[260px] max-w-sm animate-fade-in items-start gap-2.5 rounded-xl border border-border bg-background px-3.5 py-2.5 shadow-lg shadow-black/5">
      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
      <div className="flex-1 text-sm text-foreground">{toast.text}</div>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Cerrar"
        className="text-ink-muted hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
