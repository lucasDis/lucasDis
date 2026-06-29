"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { updateProfile, type ActionResult } from "../actions";
import {
  profileSchema,
  type ProfileFormValues,
  type ProfileInput,
} from "../schema";

/**
 * Edit name + email. The header in the layout reads the session, so
 * we trigger a refresh after a successful save to show the new name.
 */
export function ProfileForm({
  initial,
}: {
  initial: { name: string; email: string };
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ProfileFormValues, unknown, ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: initial,
    mode: "onBlur",
  });

  const onSubmit = async (data: ProfileInput) => {
    setFormError(null);
    setSuccess(false);
    const result: ActionResult = await updateProfile(data);
    if (!result.ok) {
      setFormError(result.error);
      if (result.fieldErrors) {
        for (const [field, msgs] of Object.entries(result.fieldErrors)) {
          if (msgs && msgs.length > 0) {
            setError(field as keyof ProfileFormValues, { message: msgs[0] });
          }
        }
      }
      return;
    }
    setSuccess(true);
    router.refresh();
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
          Perfil actualizado.
        </p>
      )}

      <Field label="Nombre" error={errors.name?.message}>
        <input
          {...register("name")}
          className={inputClass}
          autoComplete="name"
        />
      </Field>
      <Field label="Email" error={errors.email?.message}>
        <input
          type="email"
          {...register("email")}
          className={inputClass}
          autoComplete="email"
        />
      </Field>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}