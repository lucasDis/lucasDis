"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";

/**
 * Server action for the login form.
 *
 * Uses `redirect: false` so signIn doesn't throw NEXT_REDIRECT
 * internally. We then call `redirect()` explicitly. This avoids a
 * known cookie race in NextAuth v5 where the session cookie set
 * during signIn isn't visible to the proxy on the very next request
 * — explicit redirect after the await lets the cookies API flush.
 *
 * On auth failure, AuthError is caught and serialized to a
 * `{ error }` state for useActionState. NEXT_REDIRECT is re-thrown
 * unchanged.
 */

export type LoginState = { error: string } | undefined;

export async function authenticate(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email o contraseña incorrectos." };
        default:
          return { error: "No se pudo iniciar sesión. Intentá de nuevo." };
      }
    }
    throw error;
  }

  // signIn succeeded — cookie is set, now redirect.
  redirect("/admin");
}
