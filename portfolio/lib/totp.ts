import { authenticator } from "otplib";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { dbConnect } from "./db";
import { UserModel } from "@/models/User";

/**
 * TOTP utility functions.
 *
 * - generateTotpSecret       → generates a new Base32 secret
 * - getTotpUri               → builds the otpauth:// URI for QR generation
 * - verifyTotpCode           → validates a 6-digit code against DB secret
 * - generateBackupCodes      → creates 8 random plain-text codes
 * - hashBackupCodes          → bcrypt-hashes an array of plain codes
 * - verifyAndConsumeBackupCode → validates + marks a backup code as used
 */

// otplib default: 30-second window, SHA1, 6 digits (matches Authy/Google Auth)
authenticator.options = { window: 1 };

/** Generate a new TOTP secret (Base32). */
export function generateTotpSecret(): string {
  return authenticator.generateSecret(20);
}

/** Build the otpauth:// URI used to generate the QR code. */
export function getTotpUri(secret: string, email: string): string {
  return authenticator.keyuri(email, "Lucas Portfolio Admin", secret);
}

/**
 * Verify a 6-digit code against an in-memory secret (used during setup
 * confirmation, before the secret is marked as enabled in the DB).
 */
export function verifyTotpCodeWithSecret(code: string, secret: string): boolean {
  try {
    return authenticator.verify({ token: code, secret });
  } catch {
    return false;
  }
}

/**
 * Verify a 6-digit TOTP code against the secret stored in the DB.
 * Returns true if valid.
 */
export async function verifyTotpCode(
  userId: string,
  code: string
): Promise<boolean> {
  await dbConnect();
  const user =
    (await UserModel.findById(userId).select("totpSecret totpEnabled").lean()) ||
    (await UserModel.findOne({ role: "admin" }).select("totpSecret totpEnabled").lean());
  if (!user || !user.totpEnabled || !user.totpSecret) return false;
  try {
    return authenticator.verify({ token: code, secret: user.totpSecret });
  } catch {
    return false;
  }
}

/** Generate 8 random plain-text backup codes (10 chars each, uppercase alphanumeric). */
export function generateBackupCodes(): string[] {
  return Array.from({ length: 8 }, () =>
    crypto.randomBytes(6).toString("hex").toUpperCase().slice(0, 10)
  );
}

/** bcrypt-hash an array of plain backup codes. */
export async function hashBackupCodes(
  codes: string[]
): Promise<{ codeHash: string; used: boolean }[]> {
  const hashed = await Promise.all(
    codes.map(async (code) => ({
      codeHash: await bcrypt.hash(code, 10),
      used: false,
    }))
  );
  return hashed;
}

/**
 * Validate a plain backup code against the hashed codes stored in the DB.
 * If valid, marks it as used (one-time). Returns true if consumed.
 */
export async function verifyAndConsumeBackupCode(
  userId: string,
  plainCode: string
): Promise<boolean> {
  await dbConnect();
  const user =
    (await UserModel.findById(userId).select("backupCodes")) ||
    (await UserModel.findOne({ role: "admin" }).select("backupCodes"));

  if (!user || !user.backupCodes?.length) return false;

  // Find first unused code that matches
  let matchIndex = -1;
  for (let i = 0; i < user.backupCodes.length; i++) {
    const entry = user.backupCodes[i];
    if (!entry.used) {
      const ok = await bcrypt.compare(plainCode.trim().toUpperCase(), entry.codeHash);
      if (ok) {
        matchIndex = i;
        break;
      }
    }
  }

  if (matchIndex === -1) return false;

  // Mark as used
  await UserModel.findByIdAndUpdate(user._id, {
    $set: { [`backupCodes.${matchIndex}.used`]: true },
  });

  return true;
}
