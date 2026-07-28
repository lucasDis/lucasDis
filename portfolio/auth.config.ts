import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible NextAuth config.
 *
 * Imported by BOTH `auth.ts` and `proxy.ts` (Edge middleware).
 *
 * Auth flow:
 *   - Step 1 sets a temporary `pending_2fa_user_id` cookie if 2FA is active.
 *   - The user has NO session until they pass Step 2 (`/admin/login/verify-totp`).
 *   - Unauthenticated requests to `/admin/*` are automatically blocked by `authorized`.
 */

const PUBLIC_LOGIN_PATHS = [
  "/admin/login",
  "/admin/login/verify-totp",
  "/admin/login/recovery",
];

export default {
  providers: [],
  pages: { signIn: "/admin/login" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicLoginPath = PUBLIC_LOGIN_PATHS.some(
        (p) => nextUrl.pathname === p || nextUrl.pathname.startsWith(p + "/")
      );

      // Always allow public login paths
      if (isPublicLoginPath) {
        // Redirect fully authenticated users away from login to dashboard
        if (isLoggedIn) {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return true;
      }

      // Everywhere else under /admin requires full auth
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
