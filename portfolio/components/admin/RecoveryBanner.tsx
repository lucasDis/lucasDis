"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function Banner() {
  const params = useSearchParams();
  if (params.get("recovery") !== "1") return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 flex items-start gap-4">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-amber-700">
          <path
            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-body-sm font-semibold text-amber-900">
          Ingresaste con un backup code
        </p>
        <p className="text-body-sm text-amber-800">
          Ese código ya no es válido. Te recomendamos{" "}
          <Link
            href="/admin/configuracion#seguridad"
            className="underline underline-offset-4 font-semibold hover:opacity-70 transition-opacity"
          >
            reconfigurá tu app de autenticación
          </Link>{" "}
          y regenerá los backup codes antes de cerrar sesión.
        </p>
      </div>
    </div>
  );
}

/** Wrapped in Suspense because useSearchParams() requires it in Next.js App Router. */
export function RecoveryBanner() {
  return (
    <Suspense fallback={null}>
      <Banner />
    </Suspense>
  );
}
