import { z } from "zod";

/**
 * Zod schemas for the project form. Mirror `models/Project.ts` with
 * friendlier error messages and HTML-input-friendly coercions
 * (numbers come as strings from <input type="number">).
 *
 * Built for Zod v4: uses the unified `error` parameter instead of
 * `errorMap` / `invalid_type_error` / `required_error`.
 */

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const mediaItemSchema = z.object({
  url: z
    .string()
    .min(1, { error: "La URL es requerida" })
    .url({ error: "URL inválida" }),
  type: z.enum(["image", "video"]),
  alt: z.string().min(1, {
    error: "El texto alternativo es requerido (accesibilidad)",
  }),
  order: z.coerce
    .number({ error: "Orden inválido" })
    .int("Orden inválido")
    .min(0, "Orden inválido")
    .default(0),
  isCover: z.boolean().default(false),
});

export const externalLinkSchema = z.object({
  label: z.string().min(1, { error: "Etiqueta requerida" }),
  url: z
    .string()
    .min(1, { error: "URL requerida" })
    .url({ error: "URL inválida" }),
});

export const projectSchema = z.object({
  title: z
    .string()
    .min(1, { error: "El título es requerido" })
    .max(120, { error: "Máximo 120 caracteres" }),
  slug: z
    .string()
    .min(1, { error: "El slug es requerido" })
    .regex(slugRegex, {
      error: "Solo letras minúsculas, números y guiones (ej: mi-proyecto)",
    }),
  shortDescription: z
    .string()
    .min(1, { error: "La descripción corta es requerida" })
    .max(300, { error: "Máximo 300 caracteres" }),
  longDescription: z.string().default(""),
  category: z.enum(
    ["web", "graphic-design", "ux-ui", "3d", "branding"],
    { error: "Categoría inválida" }
  ),
  year: z.coerce
    .number({ error: "Año inválido" })
    .int("Año inválido")
    .min(1900, { error: "Año demasiado antiguo" })
    .max(2100, { error: "Año demasiado lejano" }),
  client: z.string().default(""),
  role: z.string().default(""),
  toolsCsv: z.string().default(""),
  media: z.array(mediaItemSchema).default([]),
  externalLinks: z.array(externalLinkSchema).default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  isPersonalProject: z.boolean().default(false),
});

// Form input type — strings before Zod coerces them. Drives `useForm`.
export type ProjectFormValues = z.input<typeof projectSchema>;
// Output type — what server actions receive and persist.
export type ProjectInput = z.output<typeof projectSchema>;

/** Split a comma-separated string into a clean, deduped tag array. */
export function parseToolsCsv(csv: string): string[] {
  return Array.from(
    new Set(
      csv
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    )
  );
}

/** Slugify a string for use as a project URL slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}
