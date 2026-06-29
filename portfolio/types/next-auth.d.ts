import type { DefaultSession } from "next-auth";

/**
 * Augment NextAuth's session/user types with the fields we set in
 * `auth.ts` callbacks (id, role). After this, `session.user.id` and
 * `session.user.role` are strongly typed everywhere.
 */

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin";
    } & DefaultSession["user"];
  }

  interface User {
    role: "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "admin";
  }
}
