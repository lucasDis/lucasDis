"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { EducationModel } from "@/models/Education";
import { educationSchema, type EducationInput } from "./schema";

/**
 * Server actions for education CRUD. Each action:
 * 1. Verifies the caller is an authenticated admin (defense in depth).
 * 2. Validates input with the Zod schema.
 * 3. Mutates Mongo and revalidates the relevant paths.
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

export async function createEducation(
  input: EducationInput
): Promise<ActionResult> {
  await requireAdmin();
  await dbConnect();

  const parsed = educationSchema.safeParse(input);
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
    let order = parsed.data.order;
    if (!order || order === 0) {
      const last = await EducationModel.findOne()
        .sort({ order: -1 })
        .select({ order: 1 })
        .lean();
      order = (last?.order ?? 0) + 1;
    }

    const doc = await EducationModel.create({ ...parsed.data, order });
    revalidatePath("/admin/educacion");
    revalidatePath("/educacion");
    revalidatePath("/");
    return { ok: true, id: String(doc._id) };
  } catch {
    return { ok: false, error: "No se pudo crear la entrada de educación." };
  }
}

export async function updateEducation(
  id: string,
  input: EducationInput
): Promise<ActionResult> {
  await requireAdmin();
  if (!isValidObjectId(id)) {
    return { ok: false, error: "ID inválido." };
  }
  await dbConnect();

  const parsed = educationSchema.safeParse(input);
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
    await EducationModel.findByIdAndUpdate(id, parsed.data);
    revalidatePath("/admin/educacion");
    revalidatePath("/admin/educacion/[id]", "page");
    revalidatePath("/educacion");
    revalidatePath("/");
    return { ok: true, id };
  } catch {
    return {
      ok: false,
      error: "No se pudo actualizar la entrada de educación.",
    };
  }
}

export async function deleteEducation(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!isValidObjectId(id)) {
    return { ok: false, error: "ID inválido." };
  }
  await dbConnect();

  await EducationModel.findByIdAndDelete(id);
  revalidatePath("/admin/educacion");
  revalidatePath("/educacion");
  revalidatePath("/");
  redirect("/admin/educacion");
}

export async function reorderEducation(
  id: string,
  direction: "up" | "down"
): Promise<ActionResult> {
  await requireAdmin();
  if (!isValidObjectId(id)) {
    return { ok: false, error: "ID inválido." };
  }
  await dbConnect();

  const current = await EducationModel.findById(id).lean();
  if (!current) {
    return { ok: false, error: "La entrada no existe." };
  }

  // ADR-3: swap with immediate neighbor, not increment.
  const neighbor =
    direction === "up"
      ? await EducationModel.findOne({ order: { $lt: current.order } })
          .sort({ order: -1 })
          .lean()
      : await EducationModel.findOne({ order: { $gt: current.order } })
          .sort({ order: 1 })
          .lean();

  if (!neighbor) {
    return { ok: true };
  }

  await Promise.all([
    EducationModel.updateOne(
      { _id: current._id },
      { order: neighbor.order }
    ),
    EducationModel.updateOne(
      { _id: neighbor._id },
      { order: current.order }
    ),
  ]);

  revalidatePath("/admin/educacion");
  revalidatePath("/educacion");
  revalidatePath("/");
  return { ok: true };
}