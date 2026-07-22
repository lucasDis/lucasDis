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
 * Public server action behind the home contact form.
 * Protected by:
 *   1. IP Rate Limiting (3 msgs / 10 min)
 *   2. Honeypot Field Check (silently drops bot submissions)
 *   3. Minimum Submission Duration Check (< 1.2s flagged as bot)
 */
export async function submitContactMessage(
  input: ContactInput
): Promise<ActionResult> {
  // 1. Check IP rate limit
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

  // 2. Validate input schema
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

  const { website, _ts, name, email, subject, message } = parsed.data;

  // 3. Honeypot check: If the hidden 'website' field was filled out, it's a bot.
  // We return ok: true so the bot thinks it succeeded without storing data in DB.
  if (website && website.trim().length > 0) {
    return { ok: true, id: "bot-blocked" };
  }

  // 4. Timestamp check: Headless bots submit forms almost instantly (< 1200ms)
  if (_ts && Date.now() - _ts < 1200) {
    return { ok: true, id: "bot-blocked" };
  }

  // Save real message
  await dbConnect();
  const created = await ContactMessageModel.create({ name, email, subject, message });

  revalidatePath("/admin");
  revalidatePath("/admin/mensajes");

  return { ok: true, id: String(created._id) };
}
