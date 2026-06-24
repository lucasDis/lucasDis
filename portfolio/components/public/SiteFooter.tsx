import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * SiteFooter — cream footer for public pages.
 *
 * Per design rules: NEVER dark. Always `surface-soft` background.
 * 4 columns: About excerpt, Links, Contact, Social.
 * Bottom row: copyright + optional footer text from SiteSettings.
 */

interface SiteFooterProps {
  profile: {
    fullName: string;
    location: string;
    email: string;
    phone: string;
    professionalProfile: string;
  };
  socialLinks: {
    linkedin?: string;
    github?: string;
    behance?: string;
    instagram?: string;
  };
  footerText: string;
}

const FOOTER_LINKS = [
  { href: "/proyectos", label: "Proyectos" },
  { href: "/experiencia", label: "Experiencia" },
  { href: "/educacion", label: "Educación" },
  { href: "/habilidades", label: "Habilidades" },
  { href: "/contacto", label: "Contacto" },
];

const SOCIAL_KEYS = [
  { key: "linkedin", label: "LinkedIn" },
  { key: "github", label: "GitHub" },
  { key: "behance", label: "Behance" },
  { key: "instagram", label: "Instagram" },
] as const;

export function SiteFooter({
  profile,
  socialLinks,
  footerText,
}: SiteFooterProps) {
  // First sentence of the professional profile as the "About" excerpt.
  const aboutExcerpt = profile.professionalProfile.split(". ")[0] + ".";
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface-soft border-t border-hairline">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: About */}
          <div>
            <p className="text-title-sm text-ink">{profile.fullName}</p>
            <p className="mt-3 text-body-sm text-body">{aboutExcerpt}</p>
          </div>

          {/* Column 2: Links */}
          <div>
            <p className="text-caption-uppercase text-muted">Links</p>
            <ul className="mt-4 space-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-body hover:text-ink transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <p className="text-caption-uppercase text-muted">Contacto</p>
            <ul className="mt-4 space-y-2 text-body-sm text-body">
              <li>
                <a
                  href={`mailto:${profile.email}`}
                  className="hover:text-ink transition-colors"
                >
                  {profile.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${profile.phone.replace(/\s/g, "")}`}
                  className="hover:text-ink transition-colors"
                >
                  {profile.phone}
                </a>
              </li>
              <li>{profile.location}</li>
            </ul>
          </div>

          {/* Column 4: Social */}
          <div>
            <p className="text-caption-uppercase text-muted">Redes</p>
            <ul className="mt-4 space-y-2 text-body-sm text-body">
              {SOCIAL_KEYS.map(({ key, label }) => {
                const url = socialLinks[key];
                if (!url) return null;
                return (
                  <li key={key}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-ink transition-colors"
                    >
                      {label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div
          className={cn(
            "mt-12 pt-8 border-t border-hairline",
            "flex flex-col sm:flex-row justify-between gap-4 text-caption text-muted"
          )}
        >
          <p>
            © {year} {profile.fullName}. Todos los derechos reservados.
          </p>
          {footerText && <p>{footerText}</p>}
        </div>
      </div>
    </footer>
  );
}