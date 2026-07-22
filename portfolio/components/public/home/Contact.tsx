/**
 * Contact — public home section.
 * All elements centered: Title, Form, and Cards.
 *
 * Cards layout:
 *   - Mobile: vertical column.
 *   - Desktop (lg): horizontal row below the form, matching the form width (max-w-2xl).
 *   - Info cards: Email, Phone, Location.
 *   - Social cards: LinkedIn & GitHub as strictly square cards (aspect-square), icon-only in brand-pink.
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

function EmailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 7l9 6 9-6M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9-4 9 4"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.86 19.86 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.86 19.86 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="3"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

export function Contact({ profile, t }: ContactProps) {
  const linkedinUrl = normalizeUrl(profile.linkedin);
  const githubUrl   = normalizeUrl(profile.github);
  const phoneHref   = profile.phone
    ? `tel:${profile.phone.replace(/[^\d+]/g, "")}`
    : null;

  return (
    <section
      id="contacto"
      aria-label="Contacto"
      className="bg-transparent text-ink select-none"
    >
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24 flex flex-col items-center text-center">

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

        {/* Cards — Vertical on mobile, Horizontal row on desktop (lg) matching form width (max-w-5xl) */}
        <div className="mt-8 w-full max-w-5xl flex flex-col lg:flex-row items-stretch lg:items-center justify-center gap-4">

          {/* Email card — flex-[1.25] for extra width so long email addresses never get truncated */}
          <a
            href={`mailto:${profile.email}`}
            className="group flex-[1.25] flex items-center gap-3.5 h-20 rounded-2xl border border-hairline bg-surface-card px-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-pink hover:shadow-md text-left min-w-0"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-pink/10 text-brand-pink">
              <EmailIcon />
            </span>
            <span className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted">
                {t("contact.email")}
              </span>
              <span className="text-[12px] xl:text-[13px] font-medium text-ink group-hover:text-brand-pink transition-colors break-all">
                {profile.email}
              </span>
            </span>
          </a>

          {/* Phone card */}
          {profile.phone && (
            <a
              href={phoneHref ?? "#"}
              className="group flex-1 flex items-center gap-3.5 h-20 rounded-2xl border border-hairline bg-surface-card px-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-pink hover:shadow-md text-left min-w-0"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-pink/10 text-brand-pink">
                <PhoneIcon />
              </span>
              <span className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted">
                  {t("contact.phone")}
                </span>
                <span className="text-[13px] font-medium text-ink group-hover:text-brand-pink transition-colors truncate">
                  {profile.phone}
                </span>
              </span>
            </a>
          )}

          {/* Location card */}
          <div className="flex-1 flex items-center gap-3.5 h-20 rounded-2xl border border-hairline bg-surface-card px-4 text-left min-w-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-pink/10 text-brand-pink">
              <LocationIcon />
            </span>
            <span className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted">
                {t("contact.location_label")}
              </span>
              <span className="text-[13px] font-medium text-ink truncate">
                {profile.location}
              </span>
            </span>
          </div>

          {/* Social square cards — LinkedIn & GitHub (strictly square h-20 w-20 aspect-square) */}
          {(linkedinUrl || githubUrl) && (
            <div className="flex items-center justify-center gap-4 shrink-0">
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="flex items-center justify-center w-20 h-20 aspect-square rounded-2xl border border-hairline bg-surface-card text-brand-pink transition-all duration-200 hover:-translate-y-1 hover:border-brand-pink hover:shadow-md shrink-0"
                >
                  <LinkedInIcon />
                </a>
              )}

              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="flex items-center justify-center w-20 h-20 aspect-square rounded-2xl border border-hairline bg-surface-card text-brand-pink transition-all duration-200 hover:-translate-y-1 hover:border-brand-pink hover:shadow-md shrink-0"
                >
                  <GitHubIcon />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}