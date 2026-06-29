"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/db";
import { ContactMessageModel } from "@/models/ContactMessage";
import { contactSchema, type ContactInput } from "@/lib/validation/contact";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { ActionResult } from "@/lib/types";

const RATE_LIMIT = 3;
const RATE_LIMIT_WINDOW_SECONDS = 600; // 10 min

/**
 * Public server action behind the home contact form. No auth required —
 * anyone can submit. Persists to `ContactMessage`, which the admin inbox
 * (`/admin/mensajes`) reads.
 *
 * Rate-limited per IP (3 / 10min) before validation, so a script hammering
 * the action can't flood the inbox or the DB.
 */
export async function submitContactMessage(
  input: ContactInput
): Promise<ActionResult> {
  const ip = getClientIp(await headers());
  const withinLimit = await checkRateLimit(
    `contact:${ip}`,
    RATE_LIMIT,
    RATE_LIMIT_WINDOW_SECONDS
  );
  if (!withinLimit) {
    return {
      ok: false,
      error: "Probaste varias veces en poco tiempo. Esperá unos minutos y volvé a intentar.",
    };
  }

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
