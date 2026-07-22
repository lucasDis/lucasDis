import type { Locale } from "@/lib/i18n/settings";
import type { TFunction } from "i18next";

/**
 * SiteFooter — minimal: only centered copyright line.
 * Full footer columns removed.
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
  locale: Locale;
  t: TFunction;
}

export function SiteFooter({ profile, t }: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hairline">
      <p className="py-8 text-center text-[13px] text-muted">
        © {year} {profile.fullName}. {t("footer.rights")}
      </p>
    </footer>
  );
}