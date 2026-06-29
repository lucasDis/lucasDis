"use server";

import { revalidatePath } from "next/cache";
import { isValidObjectId } from "mongoose";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { ContactMessageModel } from "@/models/ContactMessage";

/**
 * Server actions for the messages inbox. Two operations only:
 *  - `markAsRead`  → flips `read: false` to `read: true`
 *  - `deleteMessage` → hard delete (no soft-delete for now)
 *
 * Messages are immutable otherwise — there's no edit, since the
 * sender can't be expected to update their own copy.
 */

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("No autorizado");
  }
}

export async function markAsRead(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!isValidObjectId(id)) {
    return { ok: false, error: "ID inválido." };
  }

  await dbConnect();
  await ContactMessageModel.findByIdAndUpdate(id, { read: true });
  revalidatePath("/admin/mensajes");
  return { ok: true };
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!isValidObjectId(id)) {
    return { ok: false, error: "ID inválido." };
  }

  await dbConnect();
  await ContactMessageModel.findByIdAndDelete(id);
  revalidatePath("/admin/mensajes");
  return { ok: true };
}