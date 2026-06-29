"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { ProfileModel } from "@/models/Profile";
import { SiteSettingsModel } from "@/models/SiteSettings";
import {
  profileContentSchema,
  siteSettingsSchema,
  type ProfileContentInput,
  type SiteSettingsInput,
} from "./schema";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("No autorizado");
  }
}

export async function updateSiteSettings(
  input: SiteSettingsInput
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = siteSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisá los campos marcados.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await dbConnect();
  await SiteSettingsModel.findOneAndUpdate({}, parsed.data, {
    upsert: true,
  });
  revalidatePath("/admin/configuracion");
  return { ok: true };
}

export async function updateProfileContent(
  input: ProfileContentInput
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = profileContentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisá los campos marcados.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await dbConnect();
  await ProfileModel.findOneAndUpdate({}, parsed.data, {
    upsert: true,
  });
  revalidatePath("/admin/configuracion");
  return { ok: true };
}
