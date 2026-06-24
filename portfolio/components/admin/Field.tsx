"use client";

import type { ReactNode } from "react";

/**
 * Field — labeled form control with inline error. Reusable across
 * the admin forms so the visual rhythm stays consistent.
 */
export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-caption font-semibold uppercase tracking-wider text-muted">
        {label}
      </span>
      {children}
      {hint && !error && <span className="text-body-sm text-muted">{hint}</span>}
      {error && <span className="text-body-sm text-error">{error}</span>}
    </label>
  );
}

export const inputClass =
  "h-11 rounded-md border border-hairline bg-canvas px-3 text-body-md text-ink outline-none transition-colors focus:border-primary";

export const textareaClass =
  "min-h-[120px] rounded-md border border-hairline bg-canvas px-3 py-3 text-body-md text-ink outline-none transition-colors focus:border-primary";