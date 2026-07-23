"use client";

/**
 * AnalyticsGuard — conditionally renders children only when the visitor
 * is NOT logged in as admin.
 *
 * Detection: NextAuth v5 (auth.js) stores the JWT session in a cookie named
 *   - `authjs.session-token`          (HTTP, dev / insecure origins)
 *   - `__Secure-authjs.session-token` (HTTPS, production)
 *
 * If either cookie is present the user is an authenticated admin → skip GA.
 * This runs fully client-side; no server round-trip needed.
 */

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";

interface Props {
  gaId: string;
}

function isAdminSession(): boolean {
  if (typeof document === "undefined") return false;
  const cookies = document.cookie;
  return (
    cookies.includes("authjs.session-token") ||
    cookies.includes("__Secure-authjs.session-token")
  );
}

export function AnalyticsGuard({ gaId }: Props) {
  const [shouldTrack, setShouldTrack] = useState(false);

  useEffect(() => {
    if (!isAdminSession()) {
      setShouldTrack(true);
    }
  }, []);

  if (!shouldTrack) return null;

  return <GoogleAnalytics gaId={gaId} />;
}
