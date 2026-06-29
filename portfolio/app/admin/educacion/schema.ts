import { z } from "zod";

/**
 * Zod schema for the Education form. Mirrors `models/Education.ts`
 * with friendlier error messages and HTML-input-friendly coercions.
 *
 * Built for Zod v4: uses the unified `error` parameter.
 *
 * Date strategy (ADR-4): `<input type="month">` produces YYYY-MM
 * strings. We regex-validate the format first, then coerce to Date.
 * Both startDate and endDate are required (no "currently studying"
 * toggle in this section — only in Experience).
 */

const monthRegex = /^\d{4}-\d{2}$/;

const monthDateSchema = z
  .string()
  .regex(monthRegex, { error: "Formato YYYY-MM" })
  .pipe(
    z.coerce.date({ error: "Fecha inválida" })
  );

export const educationSchema = z
  .object({
    institution: z
      .string()
      .min(1, { error: "La institución es obligatoria" })
      .max(120, { error: "Máximo 120 caracteres" }),
    title: z
      .string()
      .min(1, { error: "El título es obligatorio" })
      .max(120, { error: "Máximo 120 caracteres" }),
    startDate: monthDateSchema,
    endDate: monthDateSchema,
    description: z.string().default(""),
    order: z.coerce
      .number({ error: "Orden inválido" })
      .int({ error: "Orden inválido" })
      .min(0, { error: "Orden inválido" })
      .default(0),
  })
  .refine((data) => data.endDate >= data.startDate, {
    error: "La fecha de fin debe ser posterior a la de inicio",
    path: ["endDate"],
  });

// Form input type — strings before Zod coerces them. Drives `useForm`.
export type EducationFormValues = z.input<typeof educationSchema>;
// Output type — what server actions receive and persist.
export type EducationInput = z.output<typeof educationSchema>;

/**
 * Format a Date as YYYY-MM for `<input type="month">`. Used to
 * pre-populate the input on edit.
 */
export function formatMonthInput(d: Date | null | undefined): string {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}