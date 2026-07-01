import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { type NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale, isSupportedLocale } from "@/lib/i18n/settings";

/**
 * Edge proxy — two responsibilities:
 *
 * 1. i18n locale detection for public routes.
 *    If the path doesn't start with a supported locale, detect it from
 *    the NEXT_LOCALE cookie or Accept-Language header, then redirect.
 *
 * 2. Auth guard for /admin/* routes (via NextAuth).
 *    Unauthenticated requests to /admin/* are redirected to /admin/login.
 *
 * (Renamed from `middleware.ts` to `proxy.ts` per Next 16 convention.)
 */

const LOCALE_COOKIE = "NEXT_LOCALE";

/** Extract best matching supported locale from the Accept-Language header. */
function getLocaleFromAcceptLanguage(header: string | null): string {
  if (!header) return defaultLocale;
  const preferred = header
    .split(",")
    .map((part) => {
      const [lang, q = "1"] = part.trim().split(";q=");
      return { lang: lang.split("-")[0].toLowerCase(), q: parseFloat(q) };
    })
    .sort((a, b) => b.q - a.q)
    .map((x) => x.lang);
  for (const lang of preferred) {
    if (isSupportedLocale(lang)) return lang;
  }
  return defaultLocale;
}

// NextAuth proxy — used only for /admin/* routes.
const { auth: nextAuthMiddleware } = NextAuth(authConfig);

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin routes: delegate to NextAuth ───────────────────────────────────
  if (pathname.startsWith("/admin")) {
    return (nextAuthMiddleware as any)(request);
  }

  // ── Skip static assets and Next.js internals ────────────────────────────
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    /\.(.+)$/.test(pathname) // files with extension
  ) {
    return NextResponse.next();
  }

  // ── i18n: locale detection and redirect for public routes ───────────────
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  if (pathnameLocale) return NextResponse.next();

  // Detect locale: cookie → Accept-Language → default
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale =
    cookieLocale && isSupportedLocale(cookieLocale)
      ? cookieLocale
      : getLocaleFromAcceptLanguage(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     *   - /_next/static, /_next/image — Next.js internals
     *   - /favicon.ico, /robots.txt, etc. — static files with extensions
     */
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)",
  ],
};
