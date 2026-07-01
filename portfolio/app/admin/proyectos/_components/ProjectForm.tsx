"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/ui/Field";
import {
  createProject,
  updateProject,
  type ActionResult,
} from "../actions";
import {
  projectSchema,
  slugify,
  type ProjectFormValues,
  type ProjectInput,
} from "../schema";

const CATEGORIES = [
  { value: "web", label: "Web" },
  { value: "graphic-design", label: "Diseño Gráfico" },
  { value: "ux-ui", label: "UX/UI" },
  { value: "3d", label: "3D" },
  { value: "branding", label: "Branding" },
] as const;

/**
 * Build the form's default values. The form values type (`ProjectFormValues`)
 * has `year: unknown` because of `z.coerce`. We feed it a number — the
 * resolver will accept it.
 */
function toDefaultValues(
  initial?: Partial<ProjectInput> & { tools?: string[] }
): ProjectFormValues {
  return {
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    shortDescription: initial?.shortDescription ?? "",
    longDescription: initial?.longDescription ?? "",
    category: (initial?.category ?? "web") as ProjectFormValues["category"],
    year: initial?.year ?? new Date().getFullYear(),
    client: initial?.client ?? "",
    role: initial?.role ?? "",
    toolsCsv:
      (initial as { tools?: string[] })?.tools?.join(", ") ?? "",
    media: initial?.media ?? [],
    externalLinks: initial?.externalLinks ?? [],
    featured: initial?.featured ?? false,
    published: initial?.published ?? false,
  };
}

export function ProjectForm({
  mode,
  id,
  initial,
}: {
  mode: "create" | "edit";
  id?: string;
  initial?: Partial<ProjectInput> & { tools?: string[] };
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  // useForm generic order: TFieldValues, TContext, TTransformedValues.
  // The schema's `z.coerce` makes the input type loose (year: unknown),
  // so we pass input → output explicitly.
  const form = useForm<ProjectFormValues, unknown, ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: toDefaultValues(initial),
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const mediaFields = useFieldArray({ control, name: "media" });
  const linkFields = useFieldArray({ control, name: "externalLinks" });

  // eslint-disable-next-line react-hooks/incompatible-library
  const title = watch("title");

  function handleGenerateSlug() {
    setValue("slug", slugify(title || ""), {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  const onSubmit = async (data: ProjectInput) => {
    setFormError(null);
    const result: ActionResult =
      mode === "create"
        ? await createProject(data)
        : await updateProject(id!, data);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    router.push("/admin/proyectos");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      {formError && (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-body-sm text-error"
        >
          {formError}
        </p>
      )}

      {/* ─── Basic info ───────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-5">
        <legend className="text-caption-uppercase text-muted">
          Información básica
        </legend>
        <Field label="Título" error={errors.title?.message}>
          <input
            {...register("title")}
            className={inputClass}
            placeholder="Nombre del proyecto"
          />
        </Field>

        <Field
          label="Slug"
          error={errors.slug?.message}
          hint="Parte de la URL: /proyectos/<slug>"
        >
          <div className="flex gap-2">
            <input
              {...register("slug")}
              className={`${inputClass} flex-1`}
              placeholder="mi-proyecto"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleGenerateSlug}
            >
              Generar
            </Button>
          </div>
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Categoría" error={errors.category?.message}>
            <select {...register("category")} className={inputClass}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Año" error={errors.year?.message}>
            <input
              type="number"
              {...register("year")}
              className={inputClass}
              min={1900}
              max={2100}
            />
          </Field>
        </div>
      </fieldset>

      {/* ─── Descriptions ─────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-5">
        <legend className="text-caption-uppercase text-muted">
          Descripciones
        </legend>
        <Field
          label="Descripción corta"
          error={errors.shortDescription?.message}
          hint="Una línea. Aparece en la card del listado."
        >
          <input
            {...register("shortDescription")}
            className={inputClass}
            placeholder="Resumen en una línea"
          />
        </Field>
        <Field
          label="Descripción larga"
          error={errors.longDescription?.message}
          hint="Texto completo. Markdown soportado (próximamente)."
        >
          <textarea
            {...register("longDescription")}
            className={textareaClass}
            rows={8}
          />
        </Field>
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className="text-caption-uppercase text-muted">Detalles</legend>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Cliente" error={errors.client?.message}>
            <input
              {...register("client")}
              className={inputClass}
              placeholder="Nombre del cliente"
            />
          </Field>
          <Field label="Rol" error={errors.role?.message}>
            <input {...register("role")} className={inputClass} placeholder="Diseñador UX/UI" />
          </Field>
        </div>
        <Field
          label="Herramientas"
          error={errors.toolsCsv?.message}
          hint="Separadas por coma. Ej: Figma, React, Blender"
        >
          <input
            {...register("toolsCsv")}
            className={inputClass}
            placeholder="Figma, React, Blender"
          />
        </Field>
      </fieldset>

      {/* ─── Media ────────────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-caption-uppercase text-muted">
          Media (URLs — upload visual llega en la próxima fase)
        </legend>
        {mediaFields.fields.length === 0 && (
          <p className="text-body-sm text-muted">
            Sin media todavía. Pegá una URL de imagen o video para empezar.
          </p>
        )}
        {mediaFields.fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-12 items-start gap-2 rounded-md border border-hairline p-3"
          >
            <div className="col-span-12 md:col-span-5">
              <Field label="URL" error={errors.media?.[index]?.url?.message}>
                <input
                  {...register(`media.${index}.url`)}
                  className={inputClass}
                  placeholder="https://…"
                />
              </Field>
            </div>
            <div className="col-span-6 md:col-span-2">
              <Field label="Tipo" error={errors.media?.[index]?.type?.message}>
                <select {...register(`media.${index}.type`)} className={inputClass}>
                  <option value="image">Imagen</option>
                  <option value="video">Video</option>
                </select>
              </Field>
            </div>
            <div className="col-span-6 md:col-span-4">
              <Field label="Alt" error={errors.media?.[index]?.alt?.message}>
                <input
                  {...register(`media.${index}.alt`)}
                  className={inputClass}
                  placeholder="Descripción para accesibilidad"
                />
              </Field>
            </div>
            <div className="col-span-12 flex items-end justify-end md:col-span-1">
              <button
                type="button"
                onClick={() => mediaFields.remove(index)}
                className="h-11 cursor-pointer text-body-sm text-error hover:underline"
                aria-label="Eliminar media"
              >
                Quitar
              </button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            mediaFields.append({
              url: "",
              type: "image",
              alt: "",
              order: mediaFields.fields.length,
            })
          }
          className="self-start"
        >
          + Agregar media
        </Button>
      </fieldset>

      {/* ─── External links ───────────────────────────────────── */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-caption-uppercase text-muted">
          Links externos
        </legend>
        {linkFields.fields.length === 0 && (
          <p className="text-body-sm text-muted">Sin links externos.</p>
        )}
        {linkFields.fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-12 items-start gap-2 rounded-md border border-hairline p-3"
          >
            <div className="col-span-12 md:col-span-5">
              <Field
                label="Etiqueta"
                error={errors.externalLinks?.[index]?.label?.message}
              >
                <input
                  {...register(`externalLinks.${index}.label`)}
                  className={inputClass}
                  placeholder="Sitio en vivo"
                />
              </Field>
            </div>
            <div className="col-span-10 md:col-span-6">
              <Field label="URL" error={errors.externalLinks?.[index]?.url?.message}>
                <input
                  {...register(`externalLinks.${index}.url`)}
                  className={inputClass}
                  placeholder="https://…"
                />
              </Field>
            </div>
            <div className="col-span-2 flex items-end justify-end">
              <button
                type="button"
                onClick={() => linkFields.remove(index)}
                className="h-11 cursor-pointer text-body-sm text-error hover:underline"
                aria-label="Quitar link"
              >
                Quitar
              </button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            linkFields.append({ label: "", url: "" })
          }
          className="self-start"
        >
          + Agregar link
        </Button>
      </fieldset>

      {/* ─── Status ───────────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-3">
        <legend className="text-caption-uppercase text-muted">Estado</legend>
        <Controller
          control={control}
          name="featured"
          render={({ field }) => (
            <label className="flex cursor-pointer items-center gap-2 text-body-md">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                onBlur={field.onBlur}
                ref={field.ref}
                className="h-4 w-4 cursor-pointer"
              />
              Destacado (aparece en el home)
            </label>
          )}
        />
        <Controller
          control={control}
          name="published"
          render={({ field }) => (
            <label className="flex cursor-pointer items-center gap-2 text-body-md">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                onBlur={field.onBlur}
                ref={field.ref}
                className="h-4 w-4 cursor-pointer"
              />
              Publicado (visible en el sitio público)
            </label>
          )}
        />
      </fieldset>

      {/* ─── Actions ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-t border-hairline pt-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Guardando…"
            : mode === "create"
              ? "Crear proyecto"
              : "Guardar cambios"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/proyectos")}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
