import NextAuth from "next-auth";
import authConfig from "./auth.config";

/**
 * Edge proxy — protects all `/admin/*` routes except `/admin/login`.
 *
 * (Renamed from `middleware.ts` to `proxy.ts` per Next 16 convention.)
 *
 * The redirect / allow decision lives in `authConfig.callbacks.authorized`.
 * This file just wires the proxy to the matcher.
 */

export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  // Run only on admin routes. The public site, /api, and static files
  // are not matched.
  matcher: ["/admin/:path*"],
};
