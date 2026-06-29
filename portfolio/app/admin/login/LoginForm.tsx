"use client";

import { useActionState } from "react";
import { authenticate, type LoginState } from "./actions";
import { Button } from "@/components/ui/Button";

/**
 * Login form. Uses React 19's `useActionState` (the modern replacement
 * for the deprecated `useFormState`). The third return value,
 * `isPending`, replaces `useFormStatus` for the submit button.
 */
export function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    authenticate,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="text-caption font-semibold uppercase tracking-wider text-muted">
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="h-11 rounded-md border border-hairline bg-canvas px-3 text-body-md text-ink outline-none transition-colors focus:border-primary"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-caption font-semibold uppercase tracking-wider text-muted">
          Contraseña
        </span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="h-11 rounded-md border border-hairline bg-canvas px-3 text-body-md text-ink outline-none transition-colors focus:border-primary"
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
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Ingresando..." : "Ingresar"}
      </Button>
    </form>
  );
}
