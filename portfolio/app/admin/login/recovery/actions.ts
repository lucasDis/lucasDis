"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { dbConnect } from "@/lib/db";
import { UserModel } from "@/models/User";
import { verifyAndConsumeBackupCode } from "@/lib/totp";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { headers } from "next/headers";

export type RecoveryState = { error: string } | undefined;

/**
 * Recovery login using a one-time backup code.
 *
 * - Finds the admin user by email
 * - Rate limits by IP
 * - Verifies the backup code (bcrypt compare, then marks it used)
 * - Signs in with a full session (no twoFactorPending)
 */
export async function recoverWithBackupCode(
  _prev: RecoveryState,
  formData: FormData
): Promise<RecoveryState> {
  const ip = getClientIp(await headers());
  const allowed = await checkRateLimit(`recovery:${ip}`, 5, 900); // 5 attempts per 15 min
  if (!allowed) {
    return { error: "Demasiados intentos. Esperá 15 minutos." };
  }

  const email = (formData.get("email") as string ?? "").toLowerCase().trim();
  const code = (formData.get("code") as string ?? "").trim().toUpperCase();

  if (!email || !code) {
    return { error: "Completá todos los campos." };
  }

  await dbConnect();
  const user = await UserModel.findOne({ email }).select("_id").lean();
  if (!user) {
    // Don't leak whether the email exists
    return { error: "Código incorrecto. Verificá tus datos." };
  }

  const consumed = await verifyAndConsumeBackupCode(user._id.toString(), code);
  if (!consumed) {
    return { error: "Código incorrecto o ya utilizado." };
  }

  // Code is valid — sign in bypassing TOTP
  try {
    await signIn("credentials", {
      _totpVerified: user._id.toString(),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "No se pudo iniciar sesión. Intentá de nuevo." };
    }
    throw error;
  }

  // Redirect with a query param so the admin can show a warning banner
  redirect("/admin?recovery=1");
}
