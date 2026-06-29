"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { ProjectModel } from "@/models/Project";
import { projectSchema, type ProjectInput } from "./schema";

/**
 * Server actions for project CRUD. Each action:
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

export async function createProject(
  input: ProjectInput
): Promise<ActionResult> {
  await requireAdmin();
  await dbConnect();

  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisá los campos marcados.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const doc = await ProjectModel.create(parsed.data);
    revalidatePath("/admin/proyectos");
    revalidatePath("/proyectos");
    revalidatePath("/");
    return { ok: true, id: String(doc._id) };
  } catch (err) {
    if (err instanceof Error && err.message.includes("E11000")) {
      return {
        ok: false,
        error: `Ya existe un proyecto con el slug "${parsed.data.slug}". Elegí otro.`,
      };
    }
    return { ok: false, error: "No se pudo crear el proyecto." };
  }
}

export async function updateProject(
  id: string,
  input: ProjectInput
): Promise<ActionResult> {
  await requireAdmin();
  if (!isValidObjectId(id)) {
    return { ok: false, error: "ID inválido." };
  }
  await dbConnect();

  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisá los campos marcados.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await ProjectModel.findByIdAndUpdate(id, parsed.data);
    revalidatePath("/admin/proyectos");
    revalidatePath("/admin/proyectos/[id]", "page");
    revalidatePath("/proyectos");
    revalidatePath("/proyectos/[slug]", "page");
    revalidatePath("/");
    return { ok: true, id };
  } catch (err) {
    if (err instanceof Error && err.message.includes("E11000")) {
      return {
        ok: false,
        error: `Ya existe un proyecto con el slug "${parsed.data.slug}". Elegí otro.`,
      };
    }
    return { ok: false, error: "No se pudo actualizar el proyecto." };
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!isValidObjectId(id)) {
    return { ok: false, error: "ID inválido." };
  }
  await dbConnect();

  await ProjectModel.findByIdAndDelete(id);
  revalidatePath("/admin/proyectos");
  revalidatePath("/proyectos");
  revalidatePath("/");
  redirect("/admin/proyectos");
}
