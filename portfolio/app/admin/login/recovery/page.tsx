import Link from "next/link";
import { recoverWithBackupCode } from "./actions";
import { RecoveryForm } from "./RecoveryForm";

export const dynamic = "force-dynamic";

export default function RecoveryPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              className="text-amber-600"
            >
              <path
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-title-lg text-ink">Recuperación de cuenta</h1>
          <p className="mt-2 text-body-sm text-muted">
            Usá uno de tus backup codes de un solo uso para ingresar.
            Después del acceso, configurá el 2FA nuevamente.
          </p>
        </div>

        {/* Warning */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-body-sm text-amber-800">
          <strong>Cada código es de uso único.</strong> Una vez ingresado,
          no podrás usarlo de nuevo.
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-hairline bg-surface-soft p-6 shadow-sm">
          <RecoveryForm action={recoverWithBackupCode} />
        </div>

        <p className="text-center text-caption text-muted">
          <Link
            href="/admin/login"
            className="text-ink underline underline-offset-4 hover:opacity-70 transition-opacity"
          >
            ← Volver al login
          </Link>
        </p>
      </div>
    </div>
  );
}
