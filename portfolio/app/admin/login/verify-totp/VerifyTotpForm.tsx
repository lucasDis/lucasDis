"use client";

import { useActionState } from "react";
import type { VerifyTotpState } from "./actions";
import { Button } from "@/components/ui/Button";

interface Props {
  action: (prev: VerifyTotpState, formData: FormData) => Promise<VerifyTotpState>;
}

export function VerifyTotpForm({ action }: Props) {
  const [state, formAction, isPending] = useActionState<VerifyTotpState, FormData>(
    action,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-caption font-semibold uppercase tracking-wider text-muted">
          Código de autenticación
        </span>
        <input
          name="code"
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          required
          autoComplete="one-time-code"
          placeholder="000 000"
          className="h-12 rounded-md border border-hairline bg-canvas px-3 text-center text-title-md tracking-[0.3em] text-ink outline-none transition-colors focus:border-primary placeholder:tracking-normal placeholder:text-muted/50"
        />
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
        {isPending ? "Verificando..." : "Verificar código"}
      </Button>
    </form>
  );
}
