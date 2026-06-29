"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { ExperienceModel } from "@/models/Experience";
import { experienceSchema, type ExperienceInput } from "./schema";

/**
 * Server actions for experience CRUD. Each action:
 * 1. Verifies the caller is an authenticated admin (defense in depth).
 * 2. Validates input with the Zod schema.
 * 3. Mutates Mongo and revalidates the relevant paths.
 *
 * `isCurrent` is a form-only concern (ADR-2). The form passes it
 * alongside the parsed data; when `isCurrent === true`, we force
 * `endDate: null` before persisting.
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

export async function createExperience(
  input: ExperienceInput,
  isCurrent: boolean
): Promise<ActionResult> {
  await requireAdmin();
  await dbConnect();

  const parsed = experienceSchema.safeParse(input);
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

  // ADR-2: isCurrent forces endDate to null on the server too, even
  // if the client somehow sent a value.
  const endDate = isCurrent ? null : parsed.data.endDate;

  // If !isCurrent, endDate must not be null (schema refine only fires
  // when endDate is non-null).
  if (!isCurrent && endDate === null) {
    return {
      ok: false,
      error: "Indicá una fecha de fin o marcá 'Trabajo actual'.",
      fieldErrors: {
        endDate: ["La fecha de fin es obligatoria si no es trabajo actual."],
      },
    };
  }

  try {
    let order = parsed.data.order;
    if (!order || order === 0) {
      const last = await ExperienceModel.findOne()
        .sort({ order: -1 })
        .select({ order: 1 })
        .lean();
      order = (last?.order ?? 0) + 1;
    }

    const doc = await ExperienceModel.create({
      ...parsed.data,
      endDate,
      order,
    });
    revalidatePath("/admin/experiencia");
    revalidatePath("/experiencia");
    revalidatePath("/");
    return { ok: true, id: String(doc._id) };
  } catch {
    return { ok: false, error: "No se pudo crear la experiencia." };
  }
}

export async function updateExperience(
  id: string,
  input: ExperienceInput,
  isCurrent: boolean
): Promise<ActionResult> {
  await requireAdmin();
  if (!isValidObjectId(id)) {
    return { ok: false, error: "ID inválido." };
  }
  await dbConnect();

  const parsed = experienceSchema.safeParse(input);
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

  const endDate = isCurrent ? null : parsed.data.endDate;

  if (!isCurrent && endDate === null) {
    return {
      ok: false,
      error: "Indicá una fecha de fin o marcá 'Trabajo actual'.",
      fieldErrors: {
        endDate: ["La fecha de fin es obligatoria si no es trabajo actual."],
      },
    };
  }

  try {
    await ExperienceModel.findByIdAndUpdate(id, {
      ...parsed.data,
      endDate,
    });
    revalidatePath("/admin/experiencia");
    revalidatePath("/admin/experiencia/[id]", "page");
    revalidatePath("/experiencia");
    revalidatePath("/");
    return { ok: true, id };
  } catch {
    return {
      ok: false,
      error: "No se pudo actualizar la experiencia.",
    };
  }
}

export async function deleteExperience(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!isValidObjectId(id)) {
    return { ok: false, error: "ID inválido." };
  }
  await dbConnect();

  await ExperienceModel.findByIdAndDelete(id);
  revalidatePath("/admin/experiencia");
  revalidatePath("/experiencia");
  revalidatePath("/");
  redirect("/admin/experiencia");
}

export async function reorderExperience(
  id: string,
  direction: "up" | "down"
): Promise<ActionResult> {
  await requireAdmin();
  if (!isValidObjectId(id)) {
    return { ok: false, error: "ID inválido." };
  }
  await dbConnect();

  const current = await ExperienceModel.findById(id).lean();
  if (!current) {
    return { ok: false, error: "La experiencia no existe." };
  }

  // ADR-3: swap with immediate neighbor, not increment.
  const neighbor =
    direction === "up"
      ? await ExperienceModel.findOne({ order: { $lt: current.order } })
          .sort({ order: -1 })
          .lean()
      : await ExperienceModel.findOne({ order: { $gt: current.order } })
          .sort({ order: 1 })
          .lean();

  if (!neighbor) {
    return { ok: true };
  }

  await Promise.all([
    ExperienceModel.updateOne(
      { _id: current._id },
      { order: neighbor.order }
    ),
    ExperienceModel.updateOne(
      { _id: neighbor._id },
      { order: current.order }
    ),
  ]);

  revalidatePath("/admin/experiencia");
  revalidatePath("/experiencia");
  revalidatePath("/");
  return { ok: true };
}
