"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { authenticate, type LoginState } from "./actions";
import { Button } from "@/components/ui/Button";

/**
 * Login form — step 1 of the auth flow.
 * Includes toggleable password visibility (eye icon).
 */
export function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    authenticate,
    undefined
  );
  const [showPassword, setShowPassword] = useState(false);

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
        <div className="relative flex items-center">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className="h-11 w-full rounded-md border border-hairline bg-canvas pl-3 pr-10 text-body-md text-ink outline-none transition-colors focus:border-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-3 flex h-7 w-7 items-center justify-center rounded text-muted hover:text-ink transition-colors cursor-pointer"
          >
            {showPassword ? (
              // Eye Slash Icon (Hide)
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" y1="2" x2="22" y2="22" />
              </svg>
            ) : (
              // Eye Icon (Show)
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
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

      <p className="text-center text-caption text-muted">
        ¿Perdiste acceso a tu app de autenticación?{" "}
        <Link
          href="/admin/login/recovery"
          className="text-ink underline underline-offset-4 hover:opacity-70 transition-opacity"
        >
          Usá un backup code
        </Link>
      </p>
    </form>
  );
}
