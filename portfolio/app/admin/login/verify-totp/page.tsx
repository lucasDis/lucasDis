import { verifyTotp } from "./actions";
import { VerifyTotpForm } from "./VerifyTotpForm";

export const dynamic = "force-dynamic";

export default function VerifyTotpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-soft border border-hairline">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              className="text-ink"
            >
              <rect x="2" y="6" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 10h.01M12 10h.01M17 10h.01M7 14h.01M12 14h.01M17 14h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-title-lg text-ink">Verificación en dos pasos</h1>
          <p className="mt-2 text-body-sm text-muted">
            Ingresá el código de 6 dígitos de tu app de autenticación.
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-hairline bg-surface-soft p-6 shadow-sm">
          <VerifyTotpForm action={verifyTotp} />
        </div>

        <p className="text-center text-caption text-muted">
          ¿No tenés acceso a tu app?{" "}
          <a
            href="/admin/login/recovery"
            className="text-ink underline underline-offset-4 hover:opacity-70 transition-opacity"
          >
            Usá un backup code
          </a>
        </p>
      </div>
    </div>
  );
}
