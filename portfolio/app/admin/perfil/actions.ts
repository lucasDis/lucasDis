"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { UserModel } from "@/models/User";
import {
  profileSchema,
  passwordSchema,
  type ProfileInput,
  type PasswordInput,
} from "./schema";

/**
 * Server actions for the admin's own profile.
 *
 * The admin is identified via the session (`auth().user.id`). There's
 * exactly one admin in production, but we still scope updates by id
 * to defend against stale sessions pointing at a deleted user.
 *
 * Password change verifies the CURRENT password with bcrypt before
 * hashing the new one (cost 12, matching the seed).
 */

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("No autorizado");
  }
}

export async function updateProfile(input: ProfileInput): Promise<ActionResult> {
  await requireAdmin();

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisá los campos marcados.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await dbConnect();
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Sesión inválida." };

  try {
    await UserModel.findByIdAndUpdate(userId, parsed.data);
    revalidatePath("/admin/perfil");
    return { ok: true };
  } catch (err) {
    if (err instanceof Error && err.message.includes("E11000")) {
      return { ok: false, error: "Ya existe una cuenta con ese email." };
    }
    return { ok: false, error: "No se pudo actualizar el perfil." };
  }
}

export async function changePassword(input: PasswordInput): Promise<ActionResult> {
  await requireAdmin();

  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisá los campos marcados.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await dbConnect();
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Sesión inválida." };

  const user = await UserModel.findById(userId);
  if (!user) return { ok: false, error: "Usuario no encontrado." };

  const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!ok) {
    return {
      ok: false,
      error: "La contraseña actual es incorrecta.",
      fieldErrors: { currentPassword: ["Contraseña incorrecta"] },
    };
  }

  user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await user.save();

  return { ok: true };
}