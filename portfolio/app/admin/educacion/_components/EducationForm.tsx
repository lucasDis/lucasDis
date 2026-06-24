"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/admin/Field";
import {
  createEducation,
  updateEducation,
  type ActionResult,
} from "../actions";
import {
  educationSchema,
  type EducationFormValues,
  type EducationInput,
} from "../schema";

/**
 * Education form — create/edit. Uses RHF + Zod v4 resolver.
 *
 * Both startDate and endDate are required (no "currently studying"
 * toggle in this section). The schema's refine cross-field check
 * rejects endDate < startDate.
 */
export function EducationForm({
  mode,
  id,
  initial,
}: {
  mode: "create" | "edit";
  id?: string;
  initial?: Partial<EducationFormValues>;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<EducationFormValues, unknown, EducationInput>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      institution: initial?.institution ?? "",
      title: initial?.title ?? "",
      startDate: initial?.startDate ?? "",
      endDate: initial?.endDate ?? "",
      description: initial?.description ?? "",
      order: initial?.order ?? 0,
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: EducationInput) => {
    setFormError(null);
    const result: ActionResult =
      mode === "create"
        ? await createEducation(data)
        : await updateEducation(id!, data);

    if (!result.ok) {
      setFormError(result.error);
      if (result.fieldErrors) {
        for (const [field, msgs] of Object.entries(result.fieldErrors)) {
          if (msgs && msgs.length > 0) {
            setError(field as keyof EducationFormValues, {
              message: msgs[0],
            });
          }
        }
      }
      return;
    }
    router.push("/admin/educacion");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {formError && (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-body-sm text-error"
        >
          {formError}
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Institución" error={errors.institution?.message}>
          <input
            {...register("institution")}
            className={inputClass}
            placeholder="UBA, Cambridge, etc."
          />
        </Field>
        <Field label="Título" error={errors.title?.message}>
          <input
            {...register("title")}
            className={inputClass}
            placeholder="Ingeniería en Sistemas"
          />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Fecha de inicio" error={errors.startDate?.message}>
          <input
            type="month"
            {...register("startDate")}
            className={inputClass}
          />
        </Field>
        <Field label="Fecha de fin" error={errors.endDate?.message}>
          <input
            type="month"
            {...register("endDate")}
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        label="Descripción"
        error={errors.description?.message}
        hint="Opcional. Cuenta brevemente qué estudiaste."
      >
        <textarea
          {...register("description")}
          className={textareaClass}
          rows={4}
        />
      </Field>

      <Field label="Orden" error={errors.order?.message} hint="Si queda en 0, se calcula al final.">
        <input
          type="number"
          {...register("order")}
          className={inputClass}
          min={0}
        />
      </Field>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/educacion")}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}