/**
 * Contact — public home section.
 * All elements centered: Title, Form, and Cards.
 *
 * Cards layout:
 *   - All cards below the form are icon-only square cards (aspect-square, w-20 h-20).
 *   - Email: Envelope icon (sobre)
 *   - Phone: WhatsApp icon
 *   - Location: Map pin icon
 *   - LinkedIn: LinkedIn icon
 *   - GitHub: GitHub icon
 *
 * Server component.
 */

import { ContactForm } from "./ContactForm";
import type { TFunction } from "i18next";

interface ContactProps {
  profile: {
    fullName: string;
    email: string;
    phone?: string;
    location: string;
    linkedin?: string;
    github?: string;
    behance?: string;
    instagram?: string;
  };
  t: TFunction;
}

function normalizeUrl(url: string | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

// ── Icons ──────────────────────────────────────────────────────────────────
function EnvelopeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.436 5.179L2 22l4.957-1.399A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.606 0-3.104-.442-4.388-1.211l-.315-.189-2.929.827.842-2.857-.207-.328A7.954 7.954 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68zm1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.021C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export function Contact({ profile }: ContactProps) {
  const linkedinUrl = normalizeUrl(profile?.linkedin);
  const githubUrl   = normalizeUrl(profile?.github);
  const phoneClean  = profile?.phone ? profile.phone.replace(/[^\d+]/g, "") : null;
  const whatsappUrl = phoneClean ? `https://wa.me/${phoneClean.replace(/\+/g, "")}` : null;

  return (
    <section
      id="contacto"
      aria-label="Contacto"
      className="bg-transparent text-ink select-none"
    >
      <div className="mx-auto max-w-6xl px-6 pt-8 pb-16 lg:pt-12 lg:pb-24 flex flex-col items-center text-center">

        {/* Title — "Hablemos" centered */}
        <h2
          className="font-bold text-ink leading-none tracking-tight mb-12 text-center"
          style={{ fontSize: "clamp(64px, 10vw, 215px)", letterSpacing: "-0.04em" }}
        >
          Hablemos
        </h2>

        {/* Form — centered */}
        <div className="w-full">
          <ContactForm />
        </div>

        {/* Square Cards Row — All contact options as icon-only square cards in brand-pink */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">

          {/* Email card — Envelope icon */}
          <a
            href={`mailto:${profile.email}`}
            title={`Email: ${profile.email}`}
            aria-label={`Email: ${profile.email}`}
            className="flex items-center justify-center w-20 h-20 aspect-square rounded-2xl border border-hairline bg-surface-card text-brand-pink transition-all duration-200 hover:-translate-y-1 hover:border-brand-pink hover:shadow-md shrink-0"
          >
            <EnvelopeIcon />
          </a>

          {/* Phone / WhatsApp card — WhatsApp icon */}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              title={`WhatsApp: ${profile.phone}`}
              aria-label={`WhatsApp: ${profile.phone}`}
              className="flex items-center justify-center w-20 h-20 aspect-square rounded-2xl border border-hairline bg-surface-card text-brand-pink transition-all duration-200 hover:-translate-y-1 hover:border-brand-pink hover:shadow-md shrink-0"
            >
              <WhatsAppIcon />
            </a>
          )}

          {/* LinkedIn card */}
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noreferrer"
              title="LinkedIn"
              aria-label="LinkedIn"
              className="flex items-center justify-center w-20 h-20 aspect-square rounded-2xl border border-hairline bg-surface-card text-brand-pink transition-all duration-200 hover:-translate-y-1 hover:border-brand-pink hover:shadow-md shrink-0"
            >
              <LinkedInIcon />
            </a>
          )}

          {/* GitHub card */}
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              title="GitHub"
              aria-label="GitHub"
              className="flex items-center justify-center w-20 h-20 aspect-square rounded-2xl border border-hairline bg-surface-card text-brand-pink transition-all duration-200 hover:-translate-y-1 hover:border-brand-pink hover:shadow-md shrink-0"
            >
              <GitHubIcon />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}