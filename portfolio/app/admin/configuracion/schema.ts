import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => value || "");

export const siteSettingsSchema = z.object({
  siteTitle: z
    .string()
    .min(1, { error: "El título del sitio es requerido" })
    .max(120, { error: "Máximo 120 caracteres" }),
  siteDescription: z
    .string()
    .min(1, { error: "La descripción es requerida" })
    .max(220, { error: "Máximo 220 caracteres" }),
  ogImage: optionalUrl,
  footerText: z.string().max(160, { error: "Máximo 160 caracteres" }).optional(),
  linkedin: optionalUrl,
  github: optionalUrl,
  behance: optionalUrl,
  instagram: optionalUrl,
});

export const profileContentSchema = z.object({
  fullName: z
    .string()
    .min(1, { error: "El nombre completo es requerido" })
    .max(120, { error: "Máximo 120 caracteres" }),
  location: z
    .string()
    .min(1, { error: "La ubicación es requerida" })
    .max(120, { error: "Máximo 120 caracteres" }),
  phone: z.string().max(80, { error: "Máximo 80 caracteres" }).optional(),
  email: z
    .string()
    .min(1, { error: "El email es requerido" })
    .email({ error: "Email inválido" })
    .toLowerCase()
    .trim(),
  linkedin: optionalUrl,
  github: optionalUrl,
  behance: optionalUrl,
  instagram: optionalUrl,
  photoUrl: optionalUrl,
  heroImageUrl: optionalUrl,
  professionalProfile: z
    .string()
    .min(1, { error: "El perfil profesional es requerido" })
    .max(5000, { error: "Máximo 5000 caracteres" }),
});

export type SiteSettingsFormValues = z.input<typeof siteSettingsSchema>;
export type ProfileContentFormValues = z.input<typeof profileContentSchema>;
export type SiteSettingsInput = z.output<typeof siteSettingsSchema>;
export type ProfileContentInput = z.output<typeof profileContentSchema>;