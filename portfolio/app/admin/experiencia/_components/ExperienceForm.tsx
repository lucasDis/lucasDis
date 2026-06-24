"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/admin/Field";
import {
  createExperience,
  updateExperience,
  type ActionResult,
} from "../actions";
import {
  experienceSchema,
  type ExperienceFormValues,
  type ExperienceInput,
} from "../schema";

/**
 * Experience form — create/edit. Uses RHF + Zod v4 resolver.
 *
 * `isCurrent` is a form-only toggle (ADR-2): it lives in this
 * component's `useState`, NOT in the schema. When checked, the
 * `endDate` input is disabled and the action forces `endDate: null`
 * on the server. When unchecked, the schema requires `endDate` to be
 * either null (still possible from the form's empty input) or a
 * valid date ≥ startDate. The action also rejects the combination
 * `!isCurrent && endDate === null` with an inline field error.
 */
export function ExperienceForm({
  mode,
  id,
  initial,
  isCurrentInitially = false,
}: {
  mode: "create" | "edit";
  id?: string;
  initial?: Partial<ExperienceFormValues>;
  isCurrentInitially?: boolean;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [isCurrent, setIsCurrent] = useState<boolean>(isCurrentInitially);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ExperienceFormValues, unknown, ExperienceInput>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      company: initial?.company ?? "",
      role: initial?.role ?? "",
      startDate: initial?.startDate ?? "",
      endDate: initial?.endDate ?? "",
      description: initial?.description ?? "",
      order: initial?.order ?? 0,
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: ExperienceInput) => {
    setFormError(null);
    const result: ActionResult =
      mode === "create"
        ? await createExperience(data, isCurrent)
        : await updateExperience(id!, data, isCurrent);

    if (!result.ok) {
      setFormError(result.error);
      if (result.fieldErrors) {
        for (const [field, msgs] of Object.entries(result.fieldErrors)) {
          if (msgs && msgs.length > 0) {
            setError(field as keyof ExperienceFormValues, {
              message: msgs[0],
            });
          }
        }
      }
      return;
    }
    router.push("/admin/experiencia");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {formError && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-body-sm text-error"
        >
          {formError}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Empresa" error={errors.company?.message}>
          <input
            {...register("company")}
            className={inputClass}
            placeholder="Globant, MercadoLibre, etc."
          />
        </Field>
        <Field label="Puesto" error={errors.role?.message}>
          <input
            {...register("role")}
            className={inputClass}
            placeholder="Frontend Developer"
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
        <Field
          label="Fecha de fin"
          error={errors.endDate?.message}
          hint="Dejar en blanco indica 'Actualidad'."
        >
          <input
            type="month"
            {...register("endDate")}
            disabled={isCurrent}
            className={inputClass}
          />
        </Field>
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isCurrent}
          onChange={(e) => setIsCurrent(e.target.checked)}
          className="h-5 w-5 cursor-pointer rounded border border-hairline bg-canvas accent-primary"
        />
        <span className="text-body-md text-ink">
          Trabajo actual (la fecha de fin se ignora)
        </span>
      </label>

      <Field
        label="Descripción"
        error={errors.description?.message}
        hint="Opcional. Contá brevemente qué hiciste en el puesto."
      >
        <textarea
          {...register("description")}
          className={textareaClass}
          rows={4}
        />
      </Field>

      <Field
        label="Orden"
        error={errors.order?.message}
        hint="Si queda en 0, se calcula al final."
      >
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
          onClick={() => router.push("/admin/experiencia")}
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
