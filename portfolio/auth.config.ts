import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible NextAuth config.
 *
 * This file is imported by BOTH `auth.ts` (full config with DB-touching
 * credentials authorize) and `middleware.ts` (which runs on the Edge
 * runtime — no Node APIs, no Mongoose).
 *
 * The split is required by NextAuth v5: the middleware can't load
 * Mongoose. Keep this file free of Node-only imports.
 *
 * The `authorized` callback below is what the middleware uses to decide
 * whether to allow the request or redirect to the sign-in page.
 */
export default {
  providers: [],
  pages: { signIn: "/admin/login" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname === "/admin/login";

      if (isOnLogin) {
        // Logged-in users hitting the login page go to the dashboard.
        if (isLoggedIn) {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        // Anyone can see the login page itself.
        return true;
      }

      // Everywhere else under /admin requires auth.
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
