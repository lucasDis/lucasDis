import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

import authConfig from "./auth.config";
import { dbConnect } from "./lib/db";
import { UserModel } from "./models/User";

/**
 * Full NextAuth config. Node-only — imports Mongoose and bcryptjs.
 *
 * Do NOT import this from `middleware.ts`; the edge runtime can't load
 * Mongoose. Middleware uses `auth.config.ts` directly.
 *
 * Two-step login flow when TOTP is enabled:
 *   1. `authorize` validates email + password → returns user with
 *      `twoFactorPending: true` if TOTP is active.
 *   2. The JWT callback propagates `twoFactorPending` to the token.
 *   3. The middleware (`proxy.ts`) detects `twoFactorPending` and redirects
 *      /admin/* to /admin/login/verify-totp.
 *   4. The verify-totp page calls signIn with `{ _totpVerified: userId }`
 *      which clears the pending flag and completes authentication.
 */

const credentialsSchema = z.union([
  // Step 1: normal login
  z.object({
    email: z.string().email().toLowerCase().trim(),
    password: z.string().min(1),
  }),
  // Step 2: TOTP verified — internal call from verify-totp action
  z.object({
    _totpVerified: z.string().min(1),
  }),
]);

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  session: {
    strategy: "jwt",
    maxAge: 180 * 24 * 60 * 60, // 6 months (180 days)
    updateAge: 24 * 60 * 60,    // refresh token once per day
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        _totpVerified: { label: "_totpVerified", type: "text" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;
        const data = parsed.data;

        await dbConnect();

        // ── Step 2: TOTP already verified, just load the user ──────────
        if ("_totpVerified" in data) {
          const user = await UserModel.findById(data._totpVerified).lean();
          if (!user) return null;
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            twoFactorEnabled: user.totpEnabled,
          };
        }

        // ── Step 1: validate email + password ──────────────────────────
        const { email, password } = data;
        const user = await UserModel.findOne({ email }).lean();
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // If TOTP is enabled, return a "pending" marker instead of full auth
        if (user.totpEnabled) {
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role as "admin",
            twoFactorEnabled: true,
            twoFactorPending: true,
          } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          twoFactorEnabled: false,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.twoFactorEnabled = user.twoFactorEnabled as boolean | undefined;
        token.twoFactorPending = (user as any).twoFactorPending as boolean ?? false; // eslint-disable-line @typescript-eslint/no-explicit-any
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "admin";
        session.user.twoFactorEnabled = token.twoFactorEnabled as boolean | undefined;
        (session as any).twoFactorPending = token.twoFactorPending as boolean ?? false;
      }
      return session;
    },
  },
});
