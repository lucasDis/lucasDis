"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { signIn } from "@/auth";
import { dbConnect } from "@/lib/db";
import { UserModel } from "@/models/User";
import bcrypt from "bcryptjs";

export type LoginState = { error: string } | undefined;

/**
 * Step 1 of login: validate email and password.
 *
 * If 2FA is enabled for the account:
 *   - Sets a temporary 10-minute HTTP-only cookie (`pending_2fa_user_id`).
 *   - Redirects to `/admin/login/verify-totp` (NO session is created yet).
 *
 * If 2FA is NOT enabled:
 *   - Creates the session via `signIn` and redirects to `/admin`.
 */
export async function authenticate(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = (formData.get("email") as string ?? "").toLowerCase().trim();
  const password = (formData.get("password") as string ?? "").trim();

  if (!email || !password) {
    return { error: "Ingresá tu email y contraseña." };
  }

  await dbConnect();
  const user = await UserModel.findOne({ email }).lean();
  if (!user) {
    return { error: "Email o contraseña incorrectos." };
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return { error: "Email o contraseña incorrectos." };
  }

  // Password valid! Check if 2FA is active on this account
  if (user.totpEnabled) {
    const cookieStore = await cookies();
    cookieStore.set("pending_2fa_user_id", user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });
    redirect("/admin/login/verify-totp");
  }

  // 2FA not active → proceed to sign in directly
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "No se pudo iniciar sesión. Intentá de nuevo." };
    }
    throw error;
  }

  redirect("/admin");
}
