import type { ReactNode } from "react";

export function PlaceholderScreen({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 p-5">
      <header className="pt-2">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      </header>

      <div className="grid place-items-center rounded-3xl border border-dashed border-border bg-surface px-6 py-16 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-background text-brand shadow-soft">
          {icon}
        </div>
        <div className="mt-4 max-w-xs text-sm text-ink-muted">{subtitle}</div>
        <div className="mt-3 rounded-full bg-background px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-ink-muted">
          Próximamente
        </div>
      </div>
    </div>
  );
}
