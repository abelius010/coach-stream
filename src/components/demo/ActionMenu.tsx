import { useEffect, useRef, useState, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";

export type ActionItem = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
};

export function ActionMenu({
  items,
  alwaysVisible = false,
  label = "Acciones",
}: {
  items: ActionItem[];
  alwaysVisible?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        className={`grid h-8 w-8 place-items-center rounded-lg border border-border bg-background text-ink-muted transition-all hover:bg-surface hover:text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10 ${
          alwaysVisible || open
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        } ${open ? "bg-surface text-foreground" : ""}`}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1.5 w-56 origin-top-right animate-scale-in overflow-hidden rounded-xl border border-border bg-background p-1 shadow-lg shadow-black/5"
        >
          {items.map((item, i) => (
            <button
              key={i}
              role="menuitem"
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                item.danger
                  ? "text-rose-600 hover:bg-rose-50"
                  : "text-foreground hover:bg-surface"
              }`}
            >
              <span className={`grid h-4 w-4 place-items-center ${item.danger ? "text-rose-500" : "text-ink-muted"}`}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
