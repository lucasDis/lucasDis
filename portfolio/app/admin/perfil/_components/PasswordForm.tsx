"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { changePassword, type ActionResult } from "../actions";
import {
  passwordSchema,
  type PasswordFormValues,
  type PasswordInput,
} from "../schema";

/**
 * Change password. Three fields with cross-field validation
 * (new == confirm, new != current). On success, clears the form so
 * a stray Enter doesn't re-submit the now-stale values.
 */
export function PasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<PasswordFormValues, unknown, PasswordInput>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: PasswordInput) => {
    setFormError(null);
    setSuccess(false);
    const result: ActionResult = await changePassword(data);
    if (!result.ok) {
      setFormError(result.error);
      if (result.fieldErrors) {
        for (const [field, msgs] of Object.entries(result.fieldErrors)) {
          if (msgs && msgs.length > 0) {
            setError(field as keyof PasswordFormValues, { message: msgs[0] });
          }
        }
      }
      return;
    }
    setSuccess(true);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {formError && (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-body-sm text-error"
        >
          {formError}
        </p>
      )}
      {success && (
        <p
          role="status"
          aria-live="polite"
          className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-body-sm text-success"
        >
          Contraseña actualizada.
        </p>
      )}

      <Field label="Contraseña actual" error={errors.currentPassword?.message}>
        <input
          type="password"
          {...register("currentPassword")}
          className={inputClass}
          autoComplete="current-password"
        />
      </Field>
      <Field label="Nueva contraseña" error={errors.newPassword?.message}>
        <input
          type="password"
          {...register("newPassword")}
          className={inputClass}
          autoComplete="new-password"
        />
      </Field>
      <Field
        label="Confirmar nueva contraseña"
        error={errors.confirmPassword?.message}
      >
        <input
          type="password"
          {...register("confirmPassword")}
          className={inputClass}
          autoComplete="new-password"
        />
      </Field>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Actualizando…" : "Cambiar contraseña"}
        </Button>
      </div>
    </form>
  );
}