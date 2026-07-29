import { type ReactNode } from "react";

export function Field({
  label,
  required,
  error,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-foreground">
        {label} {required && <span className="text-rose-600">*</span>}
      </span>
      {children}
      {hint && !error && <span className="block text-[11px] text-ink-muted">{hint}</span>}
      {error && <span className="block text-[11px] text-rose-600">{error}</span>}
    </label>
  );
}

export const inputCls =
  "h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-ink-muted focus:border-foreground/30";

export const textareaCls =
  "min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-ink-muted focus:border-foreground/30";

export const selectCls = inputCls;
