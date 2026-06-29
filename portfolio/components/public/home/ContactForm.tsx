"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/ui/Field";
import { submitContactMessage } from "@/app/_actions/contact";
import {
  contactSchema,
  type ContactFormValues,
  type ContactInput,
} from "@/lib/validation/contact";

/**
 * ContactForm — public contact form embedded in the home `Contact` section.
 * RHF + Zod resolver mirrors the admin form pattern (see EducationForm),
 * but posts to the public `submitContactMessage` action (no auth).
 */
export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ContactFormValues, unknown, ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
    mode: "onBlur",
  });

  const onSubmit = async (data: ContactInput) => {
    setFormError(null);
    const result = await submitContactMessage(data);

    if (!result.ok) {
      setFormError(result.error);
      if (result.fieldErrors) {
        for (const [field, msgs] of Object.entries(result.fieldErrors)) {
          if (msgs && msgs.length > 0) {
            setError(field as keyof ContactFormValues, { message: msgs[0] });
          }
        }
      }
      return;
    }

    reset();
    setStatus("success");
  };

  if (status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center gap-3 rounded-xl border border-hairline bg-surface-card p-8 text-center"
      >
        <span
          aria-hidden="true"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15 text-success"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <p className="text-title-sm text-ink">¡Mensaje enviado!</p>
        <p className="text-body-sm text-muted">
          Gracias por escribir. Te voy a responder a la brevedad.
        </p>
        <Button variant="secondary" onClick={() => setStatus("idle")}>
          Enviar otro mensaje
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5 rounded-xl border border-hairline bg-surface-card p-8"
    >
      {formError && (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-body-sm text-error"
        >
          {formError}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre" error={errors.name?.message}>
          <input
            {...register("name")}
            className={inputClass}
            placeholder="Tu nombre"
            autoComplete="name"
          />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input
            {...register("email")}
            type="email"
            className={inputClass}
            placeholder="tu@email.com"
            autoComplete="email"
          />
        </Field>
      </div>

      <Field label="Asunto" error={errors.subject?.message}>
        <input
          {...register("subject")}
          className={inputClass}
          placeholder="¿En qué te puedo ayudar?"
        />
      </Field>

      <Field label="Mensaje" error={errors.message?.message}>
        <textarea
          {...register("message")}
          className={textareaClass}
          rows={5}
          placeholder="Contame sobre tu proyecto..."
        />
      </Field>

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? "Enviando…" : "Enviar mensaje"}
      </Button>
    </form>
  );
}
