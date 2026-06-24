"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { SkillModel } from "@/models/Skill";
import { skillSchema, type SkillInput } from "./schema";

/**
 * Server actions for skills CRUD. Each action:
 * 1. Verifies the caller is an authenticated admin (defense in depth,
 *    the proxy already guards /admin/*).
 * 2. Validates input with the Zod schema.
 * 3. Mutates Mongo and revalidates the relevant paths.
 *
 * Returns either `{ ok: true }` (for redirects) or `{ ok: false, error }`
 * for inline display in the form.
 */

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("No autorizado");
  }
}

export async function createSkill(input: SkillInput): Promise<ActionResult> {
  await requireAdmin();
  await dbConnect();

  const parsed = skillSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisá los campos marcados.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  try {
    // If order is missing or 0, compute max+1 (ADR-5).
    let order = parsed.data.order;
    if (!order || order === 0) {
      const last = await SkillModel.findOne()
        .sort({ order: -1 })
        .select({ order: 1 })
        .lean();
      order = (last?.order ?? 0) + 1;
    }

    const doc = await SkillModel.create({ ...parsed.data, order });
    revalidatePath("/admin/habilidades");
    revalidatePath("/habilidades");
    revalidatePath("/");
    return { ok: true, id: String(doc._id) };
  } catch {
    return { ok: false, error: "No se pudo crear la habilidad." };
  }
}

export async function updateSkill(
  id: string,
  input: SkillInput
): Promise<ActionResult> {
  await requireAdmin();
  if (!isValidObjectId(id)) {
    return { ok: false, error: "ID inválido." };
  }
  await dbConnect();

  const parsed = skillSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisá los campos marcados.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  try {
    await SkillModel.findByIdAndUpdate(id, parsed.data);
    revalidatePath("/admin/habilidades");
    revalidatePath("/admin/habilidades/[id]", "page");
    revalidatePath("/habilidades");
    revalidatePath("/");
    return { ok: true, id };
  } catch {
    return { ok: false, error: "No se pudo actualizar la habilidad." };
  }
}

export async function deleteSkill(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!isValidObjectId(id)) {
    return { ok: false, error: "ID inválido." };
  }
  await dbConnect();

  await SkillModel.findByIdAndDelete(id);
  revalidatePath("/admin/habilidades");
  revalidatePath("/habilidades");
  revalidatePath("/");
  redirect("/admin/habilidades");
}

export async function reorderSkill(
  id: string,
  direction: "up" | "down"
): Promise<ActionResult> {
  await requireAdmin();
  if (!isValidObjectId(id)) {
    return { ok: false, error: "ID inválido." };
  }
  await dbConnect();

  const current = await SkillModel.findById(id).lean();
  if (!current) {
    return { ok: false, error: "La habilidad no existe." };
  }

  // Find the immediate neighbor (ADR-3: swap, not increment).
  const neighbor =
    direction === "up"
      ? await SkillModel.findOne({ order: { $lt: current.order } })
          .sort({ order: -1 })
          .lean()
      : await SkillModel.findOne({ order: { $gt: current.order } })
          .sort({ order: 1 })
          .lean();

  if (!neighbor) {
    // Already at boundary — no-op.
    return { ok: true };
  }

  await Promise.all([
    SkillModel.updateOne({ _id: current._id }, { order: neighbor.order }),
    SkillModel.updateOne({ _id: neighbor._id }, { order: current.order }),
  ]);

  revalidatePath("/admin/habilidades");
  revalidatePath("/habilidades");
  revalidatePath("/");
  return { ok: true };
}