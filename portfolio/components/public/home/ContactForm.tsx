"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import { Field, inputClass, textareaClass } from "@/components/ui/Field";
import { submitContactMessage } from "@/app/_actions/contact";
import {
  contactSchema,
  type ContactFormValues,
  type ContactInput,
} from "@/lib/validation/contact";

/**
 * ContactForm — public contact form with anti-bot protection & smooth animated submit state.
 *
 * Anti-Bot Features:
 *   1. Honeypot field (hidden 'website' input — bots fill it out automatically).
 *   2. Instant submission prevention (tracks form load timestamp).
 *   3. Rate limiting enforced on server action.
 *
 * Button Animations:
 *   - Idle / Loading: Button is on the left.
 *   - Success: Button smoothly translates/slides to the right side (via Framer Motion layout animation),
 *     turns green with checkmark.
 *   - In success state, a "Nuevo mensaje" button appears on the left so the user can send another message.
 */
export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const mountTimeRef = useRef<number>(Date.now());

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<ContactFormValues, unknown, ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "", website: "" },
    mode: "onBlur",
  });

  const handleResetForm = () => {
    reset();
    setFormError(null);
    setStatus("idle");
    mountTimeRef.current = Date.now();
  };

  const onSubmit = async (data: ContactInput) => {
    setFormError(null);

    // Client-side honeypot check
    if (data.website && data.website.trim().length > 0) {
      // Fake success for bots
      setStatus("success");
      return;
    }

    setStatus("loading");

    const payload: ContactInput = {
      ...data,
      _ts: mountTimeRef.current,
    };

    const result = await submitContactMessage(payload);

    if (!result.ok) {
      setStatus("idle");
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

    setStatus("success");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5 rounded-2xl border border-hairline bg-surface-card p-6 sm:p-8 w-full max-w-5xl mx-auto text-left shadow-sm"
    >
      {/* Honeypot field — hidden from real users, filled by automated spambots */}
      <div className="sr-only opacity-0 absolute -z-10 h-0 w-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <label htmlFor="website_hp">Website</label>
        <input
          id="website_hp"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      {formError && (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-lg border border-error/30 bg-error/10 px-4 py-2.5 text-[13px] text-error font-medium"
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
            disabled={status === "success" || status === "loading"}
          />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input
            {...register("email")}
            type="email"
            className={inputClass}
            placeholder="tu@email.com"
            autoComplete="email"
            disabled={status === "success" || status === "loading"}
          />
        </Field>
      </div>

      <Field label="Asunto" error={errors.subject?.message}>
        <input
          {...register("subject")}
          className={inputClass}
          placeholder="¿En qué te puedo ayudar?"
          disabled={status === "success" || status === "loading"}
        />
      </Field>

      <Field label="Mensaje" error={errors.message?.message}>
        <textarea
          {...register("message")}
          className={textareaClass}
          rows={5}
          placeholder="Contame sobre tu proyecto..."
          disabled={status === "success" || status === "loading"}
        />
      </Field>

      {/* Button Row Container */}
      <div className="flex items-center justify-between pt-2 min-h-12 relative w-full">
        {/* Left side: "Nuevo mensaje" button when status === "success" */}
        <AnimatePresence>
          {status === "success" && (
            <motion.button
              key="reset-btn"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              type="button"
              onClick={handleResetForm}
              className="inline-flex items-center justify-center px-4 h-11 text-xs font-semibold uppercase tracking-wider text-muted hover:text-ink hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
            >
              + Nuevo mensaje
            </motion.button>
          )}
        </AnimatePresence>

        {/* Right or Left: Submit / Status Button with Framer Motion layout animation */}
        <div className={`flex flex-1 ${status === "success" ? "justify-end" : "justify-start"}`}>
          <motion.button
            layout
            transition={{
              type: "spring",
              stiffness: 220,
              damping: 26,
              mass: 0.8,
            }}
            type={status === "success" ? "button" : "submit"}
            disabled={status === "loading"}
            onClick={status === "success" ? handleResetForm : undefined}
            className={`inline-flex items-center justify-center gap-2.5 h-11 px-6 text-[14px] font-semibold rounded-lg shadow-sm transition-colors duration-200 cursor-pointer ${
              status === "success"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : status === "loading"
                ? "bg-body-strong text-white/70 cursor-wait"
                : "bg-[#0a0a0a] hover:bg-primary-active text-white"
            }`}
          >
            {status === "loading" && (
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}

            {status === "success" && (
              <motion.svg
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            )}

            <span>
              {status === "loading"
                ? "Enviando…"
                : status === "success"
                ? "Mensaje enviado"
                : "Enviar mensaje"}
            </span>
          </motion.button>
        </div>
      </div>
    </form>
  );
}
