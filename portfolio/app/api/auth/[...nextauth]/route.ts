/**
 * NextAuth catch-all route. Re-exports the GET and POST handlers
 * generated from the full `auth.ts` config.
 */
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
