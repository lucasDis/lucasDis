import { z } from "zod";

/**
 * Zod schema for the public contact form. Mirrors `models/ContactMessage.ts`.
 * Shared between the client form (react-hook-form resolver) and the
 * server action, so validation rules only live in one place.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .min(1, { error: "El nombre es obligatorio" })
    .max(120, { error: "Máximo 120 caracteres" }),
  email: z
    .string()
    .min(1, { error: "El email es obligatorio" })
    .email({ error: "Email inválido" })
    .toLowerCase()
    .trim(),
  subject: z
    .string()
    .min(1, { error: "El asunto es obligatorio" })
    .max(150, { error: "Máximo 150 caracteres" }),
  message: z
    .string()
    .min(1, { error: "El mensaje es obligatorio" })
    .max(2000, { error: "Máximo 2000 caracteres" }),
});

export type ContactFormValues = z.input<typeof contactSchema>;
export type ContactInput = z.output<typeof contactSchema>;
