/**
 * Contact — public home section. Two-column layout: contact form (left)
 * + email / phone / location cards and social links (right), pulled from
 * the Profile singleton.
 *
 * Server component — data flows down from page.tsx. The form itself is a
 * client component (`ContactForm`) that posts to the `submitContactMessage`
 * server action.
 */

import { SectionHeader } from "@/components/ui/SectionHeader";
import { ContactForm } from "./ContactForm";

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
}

function normalizeUrl(url: string | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function Contact({ profile }: ContactProps) {
  const linkedinUrl = normalizeUrl(profile.linkedin);
  const githubUrl = normalizeUrl(profile.github);
  const behanceUrl = normalizeUrl(profile.behance);
  const instagramUrl = normalizeUrl(profile.instagram);
  const phoneHref = profile.phone
    ? `tel:${profile.phone.replace(/[^\d+]/g, "")}`
    : null;

  return (
    <section
      id="contacto"
      aria-label="Contacto"
      className="bg-transparent text-ink"
    >
      <div className="mx-auto max-w-5xl px-6 py-24 lg:py-32">
        <SectionHeader
          eyebrow="Hire me"
          title="¿Trabajamos juntos?"
          subtitle="Estoy disponible para proyectos freelance, consultorías y oportunidades full-time."
          align="center"
        />

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <ContactForm />

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              {/* Email */}
              <a
                href={`mailto:${profile.email}`}
                className="group flex items-center gap-4 rounded-xl border border-hairline bg-surface-card p-5 transition hover:-translate-y-1 hover:border-brand-pink hover:shadow-md"
              >
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-pink/15 text-brand-pink"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 7l9 6 9-6M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9-4 9 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="flex flex-col">
                  <span className="text-caption-uppercase text-muted">
                    Email
                  </span>
                  <span className="break-all text-body-md font-medium text-ink group-hover:text-brand-pink">
                    {profile.email}
                  </span>
                </span>
              </a>

              {/* Phone */}
              {profile.phone && (
                <a
                  href={phoneHref ?? "#"}
                  className="group flex items-center gap-4 rounded-xl border border-hairline bg-surface-card p-5 transition hover:-translate-y-1 hover:border-brand-pink hover:shadow-md"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-pink/15 text-brand-pink"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M22 16.92v3a2 2 0 01-2.18 2 19.86 19.86 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.86 19.86 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="text-caption-uppercase text-muted">
                      Teléfono
                    </span>
                    <span className="text-body-md font-medium text-ink group-hover:text-brand-pink">
                      {profile.phone}
                    </span>
                  </span>
                </a>
              )}

              {/* Location */}
              <div className="flex items-center gap-4 rounded-xl border border-hairline bg-surface-card p-5">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-pink/15 text-brand-pink"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="10"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="flex flex-col">
                  <span className="text-caption-uppercase text-muted">
                    Ubicación
                  </span>
                  <span className="text-body-md font-medium text-ink">
                    {profile.location}
                  </span>
                </span>
              </div>
            </div>

            {/* Social links */}
            {(linkedinUrl || githubUrl || behanceUrl || instagramUrl) && (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-1">
                {linkedinUrl && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-body-sm font-medium text-ink transition hover:text-brand-pink"
                  >
                    LinkedIn
                    <span aria-hidden="true">→</span>
                  </a>
                )}
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-body-sm font-medium text-ink transition hover:text-brand-pink"
                  >
                    GitHub
                    <span aria-hidden="true">→</span>
                  </a>
                )}
                {behanceUrl && (
                  <a
                    href={behanceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-body-sm font-medium text-ink transition hover:text-brand-pink"
                  >
                    Behance
                    <span aria-hidden="true">→</span>
                  </a>
                )}
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-body-sm font-medium text-ink transition hover:text-brand-pink"
                  >
                    Instagram
                    <span aria-hidden="true">→</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}