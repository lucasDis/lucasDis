"use client";

import { useActionState } from "react";
import type { RecoveryState } from "./actions";
import { Button } from "@/components/ui/Button";

interface Props {
  action: (prev: RecoveryState, formData: FormData) => Promise<RecoveryState>;
}

export function RecoveryForm({ action }: Props) {
  const [state, formAction, isPending] = useActionState<RecoveryState, FormData>(
    action,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-caption font-semibold uppercase tracking-wider text-muted">
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="tu@email.com"
          className="h-11 rounded-md border border-hairline bg-canvas px-3 text-body-md text-ink outline-none transition-colors focus:border-primary"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-caption font-semibold uppercase tracking-wider text-muted">
          Backup code
        </span>
        <input
          name="code"
          type="text"
          required
          autoComplete="off"
          placeholder="XXXXXXXXXX"
          className="h-11 rounded-md border border-hairline bg-canvas px-3 font-mono text-body-md uppercase tracking-wider text-ink outline-none transition-colors focus:border-primary"
        />
        <span className="text-caption text-muted">
          10 caracteres, sin espacios ni guiones.
        </span>
      </label>
      {state?.error && (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-body-sm text-error"
        >
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={isPending} className="w-full mt-1">
        {isPending ? "Verificando..." : "Ingresar con backup code"}
      </Button>
    </form>
  );
}
