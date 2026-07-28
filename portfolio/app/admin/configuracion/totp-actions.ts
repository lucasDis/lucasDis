"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { UserModel } from "@/models/User";
import {
  generateTotpSecret,
  getTotpUri,
  verifyTotpCodeWithSecret,
  verifyTotpCode,
  generateBackupCodes,
  hashBackupCodes,
} from "@/lib/totp";

export type TotpActionResult =
  | { ok: true; data?: Record<string, unknown> }
  | { ok: false; error: string };

/**
 * Get the current admin user document.
 * Tries `findById` using session ID first, falling back to `findOne({ role: "admin" })`
 * in case the DB was re-seeded while a session was active in dev.
 */
async function getAdminUser() {
  const session = await auth();
  if (session?.user?.role !== "admin") throw new Error("No autorizado");
  await dbConnect();
  const userId = session.user.id;
  const user = (await UserModel.findById(userId)) || (await UserModel.findOne({ role: "admin" }));
  if (!user) throw new Error("Usuario admin no encontrado");
  return user;
}

/**
 * Begin TOTP setup: generate a new secret and return the otpauth URI.
 * Stores the pending secret in DB.
 */
export async function beginTotpSetup(): Promise<TotpActionResult> {
  const user = await getAdminUser();

  if (user.totpEnabled) return { ok: false, error: "El 2FA ya está activo." };

  const secret = generateTotpSecret();
  const uri = getTotpUri(secret, user.email as string);

  user.totpSecret = secret;
  await user.save();

  return { ok: true, data: { uri, secret } };
}

/**
 * Confirm TOTP setup: validate the first code and activate 2FA.
 * Also generates and returns 8 plain-text backup codes (shown once).
 */
export async function confirmTotpSetup(code: string): Promise<TotpActionResult> {
  const user = await getAdminUser();

  if (!user.totpSecret) {
    return { ok: false, error: "Iniciá el proceso de configuración primero." };
  }
  if (user.totpEnabled) {
    return { ok: false, error: "El 2FA ya está activo." };
  }

  // Validate code against the pending secret
  const valid = verifyTotpCodeWithSecret(code, user.totpSecret);

  if (!valid) {
    return { ok: false, error: "Código incorrecto. Escaneá el QR de nuevo y reintentá." };
  }

  // Generate backup codes
  const plainCodes = generateBackupCodes();
  const hashedCodes = await hashBackupCodes(plainCodes);

  user.totpEnabled = true;
  user.backupCodes = hashedCodes;
  await user.save();

  revalidatePath("/admin/configuracion");
  return { ok: true, data: { backupCodes: plainCodes } };
}

/**
 * Disable TOTP: requires a valid TOTP code as confirmation.
 */
export async function disableTotp(code: string): Promise<TotpActionResult> {
  const user = await getAdminUser();

  const valid = await verifyTotpCode(user._id.toString(), code);
  if (!valid) {
    return { ok: false, error: "Código incorrecto. El 2FA no fue desactivado." };
  }

  user.totpEnabled = false;
  user.totpSecret = undefined;
  user.backupCodes = [];
  await user.save();

  revalidatePath("/admin/configuracion");
  return { ok: true };
}

/**
 * Regenerate backup codes: requires a valid TOTP code.
 * Returns new plain-text codes (shown once).
 */
export async function regenerateBackupCodes(code: string): Promise<TotpActionResult> {
  const user = await getAdminUser();

  const valid = await verifyTotpCode(user._id.toString(), code);
  if (!valid) {
    return { ok: false, error: "Código incorrecto. Los backup codes no fueron regenerados." };
  }

  const plainCodes = generateBackupCodes();
  const hashedCodes = await hashBackupCodes(plainCodes);

  user.backupCodes = hashedCodes;
  await user.save();

  revalidatePath("/admin/configuracion");
  return { ok: true, data: { backupCodes: plainCodes } };
}

/**
 * Get current TOTP status (enabled/disabled + how many backup codes remain).
 */
export async function getTotpStatus(): Promise<
  TotpActionResult & { data?: { enabled: boolean; backupCodesLeft: number } }
> {
  const user = await getAdminUser();
  const backupCodesLeft = (user.backupCodes ?? []).filter((c: any) => !c.used).length;

  return {
    ok: true,
    data: {
      enabled: user.totpEnabled ?? false,
      backupCodesLeft,
    },
  };
}
