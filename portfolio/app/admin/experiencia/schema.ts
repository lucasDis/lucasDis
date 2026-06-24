import { z } from "zod";

/**
 * Zod schema for the Experience form. Mirrors `models/Experience.ts`
 * with friendlier error messages and HTML-input-friendly coercions.
 *
 * Built for Zod v4: uses the unified `error` parameter.
 *
 * Date strategy (ADR-4): `<input type="month">` produces YYYY-MM
 * strings. We regex-validate the format first, then coerce to Date.
 *
 * `endDate` is optional and nullable — `""` (empty) is treated as
 * `null`. The `isCurrent` toggle is a form-only concern (ADR-2):
 * it lives in the React component state, NOT in this schema. The
 * server action forces `endDate: null` when `isCurrent === true`.
 *
 * Cross-field refine runs only against schema-known fields: it
 * rejects `endDate < startDate` when `endDate` is not null. The
 * action enforces the `!isCurrent && endDate === null` edge case.
 */

const monthRegex = /^\d{4}-\d{2}$/;

const monthDateSchema = z
  .string()
  .regex(monthRegex, { error: "Formato YYYY-MM" })
  .pipe(
    z.coerce.date({ error: "Fecha inválida" })
  );

// `""` → `null`, otherwise validate YYYY-MM and coerce to Date.
const nullableMonthDateSchema = z
  .union([z.literal(""), monthDateSchema])
  .transform((val) => (val === "" ? null : val));

export const experienceSchema = z
  .object({
    company: z
      .string()
      .min(1, { error: "La empresa es obligatoria" })
      .max(120, { error: "Máximo 120 caracteres" }),
    role: z
      .string()
      .min(1, { error: "El puesto es obligatorio" })
      .max(120, { error: "Máximo 120 caracteres" }),
    startDate: monthDateSchema,
    endDate: nullableMonthDateSchema,
    description: z.string().default(""),
    order: z.coerce
      .number({ error: "Orden inválido" })
      .int({ error: "Orden inválido" })
      .min(0, { error: "Orden inválido" })
      .default(0),
  })
  .refine(
    (data) => data.endDate === null || data.endDate >= data.startDate,
    {
      error: "La fecha de fin debe ser posterior a la de inicio",
      path: ["endDate"],
    }
  );

// Form input type — strings before Zod coerces them. Drives `useForm`.
// `isCurrent` is form-only (ADR-2) and lives in the component, not here.
export type ExperienceFormValues = z.input<typeof experienceSchema>;
// Output type — what server actions receive and persist.
export type ExperienceInput = z.output<typeof experienceSchema>;

/**
 * Format a Date as YYYY-MM for `<input type="month">`. Used to
 * pre-populate the input on edit. Returns `""` when null so the
 * month input renders empty.
 */
export function formatMonthInput(d: Date | null | undefined): string {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}
