"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/admin/Field";
import { createSkill, updateSkill, type ActionResult } from "../actions";
import {
  skillSchema,
  type SkillFormValues,
  type SkillInput,
} from "../schema";

const GROUPS = [
  { value: "web", label: "Web" },
  { value: "design", label: "Diseño" },
  { value: "other", label: "Otros" },
] as const;

/**
 * Skill form — create/edit. Uses RHF + Zod v4 resolver.
 */
export function SkillForm({
  mode,
  id,
  initial,
}: {
  mode: "create" | "edit";
  id?: string;
  initial?: Partial<SkillInput>;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SkillFormValues, unknown, SkillInput>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: initial?.name ?? "",
      group: (initial?.group ?? "web") as SkillFormValues["group"],
      order: initial?.order ?? 0,
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: SkillInput) => {
    setFormError(null);
    const result: ActionResult =
      mode === "create" ? await createSkill(data) : await updateSkill(id!, data);

    if (!result.ok) {
      setFormError(result.error);
      if (result.fieldErrors) {
        for (const [field, msgs] of Object.entries(result.fieldErrors)) {
          if (msgs && msgs.length > 0) {
            setError(field as keyof SkillFormValues, { message: msgs[0] });
          }
        }
      }
      return;
    }
    router.push("/admin/habilidades");
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

      <Field label="Nombre" error={errors.name?.message}>
        <input
          {...register("name")}
          className={inputClass}
          placeholder="React, Figma, Metodologías ágiles…"
        />
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Grupo" error={errors.group?.message}>
          <select {...register("group")} className={inputClass}>
            {GROUPS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Orden" error={errors.order?.message} hint="Si queda en 0, se calcula al final.">
          <input
            type="number"
            {...register("order")}
            className={inputClass}
            min={0}
          />
        </Field>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/habilidades")}
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