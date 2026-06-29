"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/db";
import { ContactMessageModel } from "@/models/ContactMessage";
import { contactSchema, type ContactInput } from "@/lib/validation/contact";
import type { ActionResult } from "@/lib/types";

/**
 * Public server action behind the home contact form. No auth required —
 * anyone can submit. Persists to `ContactMessage`, which the admin inbox
 * (`/admin/mensajes`) reads.
 */
export async function submitContactMessage(
  input: ContactInput
): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input);
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

  await dbConnect();
  const created = await ContactMessageModel.create(parsed.data);

  revalidatePath("/admin");
  revalidatePath("/admin/mensajes");

  return { ok: true, id: String(created._id) };
}
