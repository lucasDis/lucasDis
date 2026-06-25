"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/admin/Field";
import {
  updateProfileContent,
  updateSiteSettings,
  type ActionResult,
} from "../actions";
import {
  profileContentSchema,
  siteSettingsSchema,
  type ProfileContentFormValues,
  type ProfileContentInput,
  type SiteSettingsFormValues,
  type SiteSettingsInput,
} from "../schema";

export function SiteSettingsForm({
  initial,
}: {
  initial: SiteSettingsFormValues;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SiteSettingsFormValues, unknown, SiteSettingsInput>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: initial,
    mode: "onBlur",
  });

  const onSubmit = async (data: SiteSettingsInput) => {
    setFormError(null);
    setSuccess(false);
    const result: ActionResult = await updateSiteSettings(data);
    if (!result.ok) {
      setFormError(result.error);
      if (result.fieldErrors) {
        for (const [field, msgs] of Object.entries(result.fieldErrors)) {
          if (msgs?.length) {
            setError(field as keyof SiteSettingsFormValues, {
              message: msgs[0],
            });
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
        <p className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-body-sm text-error">
          {formError}
        </p>
      )}
      {success && (
        <p className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-body-sm text-success">
          Configuración guardada.
        </p>
      )}

      <Field label="Título del sitio" error={errors.siteTitle?.message}>
        <input {...register("siteTitle")} className={inputClass} />
      </Field>

      <Field label="Descripción del sitio" error={errors.siteDescription?.message}>
        <textarea {...register("siteDescription")} className={textareaClass} />
      </Field>

      <Field label="Imagen OG" error={errors.ogImage?.message}>
        <input {...register("ogImage")} className={inputClass} />
      </Field>

      <Field label="Texto de footer" error={errors.footerText?.message}>
        <textarea {...register("footerText")} className={textareaClass} />
      </Field>

      <div className="grid gap-4 xl:grid-cols-2">
        <Field label="LinkedIn" error={errors.linkedin?.message}>
          <input {...register("linkedin")} className={inputClass} />
        </Field>
        <Field label="GitHub" error={errors.github?.message}>
          <input {...register("github")} className={inputClass} />
        </Field>
        <Field label="Behance" error={errors.behance?.message}>
          <input {...register("behance")} className={inputClass} />
        </Field>
        <Field label="Instagram" error={errors.instagram?.message}>
          <input {...register("instagram")} className={inputClass} />
        </Field>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : "Guardar configuración"}
        </Button>
      </div>
    </form>
  );
}

export function ProfileContentForm({
  initial,
}: {
  initial: ProfileContentFormValues;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ProfileContentFormValues, unknown, ProfileContentInput>({
    resolver: zodResolver(profileContentSchema),
    defaultValues: initial,
    mode: "onBlur",
  });

  const onSubmit = async (data: ProfileContentInput) => {
    setFormError(null);
    setSuccess(false);
    const result: ActionResult = await updateProfileContent(data);
    if (!result.ok) {
      setFormError(result.error);
      if (result.fieldErrors) {
        for (const [field, msgs] of Object.entries(result.fieldErrors)) {
          if (msgs?.length) {
            setError(field as keyof ProfileContentFormValues, {
              message: msgs[0],
            });
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
        <p className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-body-sm text-error">
          {formError}
        </p>
      )}
      {success && (
        <p className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-body-sm text-success">
          Perfil público guardado.
        </p>
      )}

      <Field label="Nombre completo" error={errors.fullName?.message}>
        <input {...register("fullName")} className={inputClass} />
      </Field>

      <Field label="Ubicación" error={errors.location?.message}>
        <input {...register("location")} className={inputClass} />
      </Field>

      <Field label="Teléfono" error={errors.phone?.message}>
        <input {...register("phone")} className={inputClass} />
      </Field>

      <Field label="Email público" error={errors.email?.message}>
        <input type="email" {...register("email")} className={inputClass} />
      </Field>

      <div className="grid gap-4 xl:grid-cols-2">
        <Field label="LinkedIn" error={errors.linkedin?.message}>
          <input {...register("linkedin")} className={inputClass} />
        </Field>
        <Field label="GitHub" error={errors.github?.message}>
          <input {...register("github")} className={inputClass} />
        </Field>
        <Field label="Behance" error={errors.behance?.message}>
          <input {...register("behance")} className={inputClass} />
        </Field>
        <Field label="Instagram" error={errors.instagram?.message}>
          <input {...register("instagram")} className={inputClass} />
        </Field>
      </div>

      <Field label="Foto de perfil (URL)" error={errors.photoUrl?.message}>
        <input {...register("photoUrl")} className={inputClass} />
      </Field>

      <Field label="Imagen hero (URL)" error={errors.heroImageUrl?.message}>
        <input {...register("heroImageUrl")} className={inputClass} />
      </Field>

      <Field
        label="Perfil profesional"
        error={errors.professionalProfile?.message}
      >
        <textarea {...register("professionalProfile")} className={textareaClass} />
      </Field>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : "Guardar perfil público"}
        </Button>
      </div>
    </form>
  );
}
