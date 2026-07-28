"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { signIn } from "@/auth";
import { verifyTotpCode } from "@/lib/totp";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export type VerifyTotpState = { error: string } | undefined;

/**
 * Step 2 of login: validate the 6-digit TOTP code.
 *
 * Reads the pending user ID from the `pending_2fa_user_id` cookie set in Step 1.
 * If the 6-digit code is valid, clears the pending cookie, signs in via `signIn`,
 * and redirects to `/admin`.
 */
export async function verifyTotp(
  _prev: VerifyTotpState,
  formData: FormData
): Promise<VerifyTotpState> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("pending_2fa_user_id")?.value;

  if (!userId) {
    redirect("/admin/login");
  }

  // Rate limit: 5 attempts per 10 minutes per user
  const ip = getClientIp(await headers());
  const allowed = await checkRateLimit(`totp:${userId}:${ip}`, 5, 600);
  if (!allowed) {
    return { error: "Demasiados intentos. Esperá 10 minutos e intentá de nuevo." };
  }

  const code = (formData.get("code") as string ?? "").trim();
  if (!code || !/^\d{6}$/.test(code)) {
    return { error: "El código debe tener 6 dígitos." };
  }

  const valid = await verifyTotpCode(userId, code);
  if (!valid) {
    return { error: "Código incorrecto. Revisá tu app de autenticación." };
  }

  // TOTP code is valid — clear the pending cookie and create the full session
  cookieStore.delete("pending_2fa_user_id");

  try {
    await signIn("credentials", {
      _totpVerified: userId,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "No se pudo completar la autenticación. Intentá de nuevo." };
    }
    throw error;
  }

  redirect("/admin");
}
