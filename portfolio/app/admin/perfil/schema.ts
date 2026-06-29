import { z } from "zod";

/**
 * Zod schemas for the admin profile page. Two concerns:
 *
 *  - `profileSchema`  → name + email (what the admin can edit about themselves)
 *  - `passwordSchema` → current + new + confirm, with cross-field refines
 *
 * Built for Zod v4 (uses the unified `error` parameter, not `errorMap`).
 */

export const profileSchema = z.object({
  name: z
    .string()
    .min(1, { error: "El nombre es requerido" })
    .max(80, { error: "Máximo 80 caracteres" }),
  email: z
    .string()
    .min(1, { error: "El email es requerido" })
    .email({ error: "Email inválido" })
    .toLowerCase()
    .trim(),
});

export const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { error: "Contraseña actual requerida" }),
    newPassword: z
      .string()
      .min(8, { error: "Mínimo 8 caracteres" })
      .max(128, { error: "Máximo 128 caracteres" }),
    confirmPassword: z
      .string()
      .min(1, { error: "Confirmá la contraseña nueva" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "La nueva contraseña debe ser distinta de la actual",
    path: ["newPassword"],
  });

export type ProfileFormValues = z.input<typeof profileSchema>;
export type ProfileInput = z.output<typeof profileSchema>;
export type PasswordFormValues = z.input<typeof passwordSchema>;
export type PasswordInput = z.output<typeof passwordSchema>;