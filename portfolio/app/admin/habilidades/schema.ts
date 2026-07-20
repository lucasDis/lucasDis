import { z } from "zod";

/**
 * Zod schema for the Skill form. Mirrors `models/Skill.ts` with
 * friendlier error messages and HTML-input-friendly coercions
 * (`order` comes as a string from `<input type="number">`).
 *
 * Built for Zod v4: uses the unified `error` parameter instead of
 * `errorMap` / `invalid_type_error` / `required_error`.
 */

export const skillSchema = z.object({
  name: z
    .string()
    .min(1, { error: "El nombre es obligatorio" })
    .max(80, { error: "Máximo 80 caracteres" }),
  group: z.enum(["web", "design", "other"], {
    error: "Grupo inválido",
  }),
  order: z.coerce
    .number({ error: "Orden inválido" })
    .int({ error: "Orden inválido" })
    .min(0, { error: "Orden inválido" })
    .default(0),
  yearsOfExperience: z.coerce
    .number({ error: "Valor inválido" })
    .int({ error: "Debe ser un número entero" })
    .min(0, { error: "No puede ser negativo" })
    .optional(),
});

// Form input type — strings before Zod coerces them. Drives `useForm`.
export type SkillFormValues = z.input<typeof skillSchema>;
// Output type — what server actions receive and persist.
export type SkillInput = z.output<typeof skillSchema>;