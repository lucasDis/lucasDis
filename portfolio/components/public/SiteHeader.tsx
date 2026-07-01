import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";
import type { Locale } from "@/lib/i18n/settings";
import type { TFunction } from "i18next";

/**
 * SiteHeader — top navigation for public pages.
 *
 * Sticky on cream canvas with hairline border + backdrop blur. Logo on the
 * left, anchor nav links in the middle, primary CTA + locale switcher on
 * the right. Each link points to a section on the home page (single-page
 * portfolio). Mobile: nav links collapse (mobile sheet is a follow-up).
 *
 * Section order on home (kept in sync with page.tsx):
 *   #welcome → #proyectos → #sobre-mi → #servicios → #habilidades → #cv → #contacto
 */

interface SiteHeaderProps {
  locale: Locale;
  t: TFunction;
}

export function SiteHeader({ locale, t }: SiteHeaderProps) {
  const base = `/${locale}`;

  const NAV_LINKS = [
    { href: `${base}/#proyectos`, label: t("nav.projects") },
    { href: `${base}/#sobre-mi`, label: t("nav.about") },
    { href: `${base}/#servicios`, label: t("nav.services") },
    { href: `${base}/#habilidades`, label: t("nav.skills") },
    { href: `${base}/#cv`, label: t("nav.cv") },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full",
        "bg-canvas/85 backdrop-blur supports-[backdrop-filter]:bg-canvas/70",
        "border-b border-hairline"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href={`${base}/#welcome`}
          className="text-title-md text-ink hover:opacity-80 transition-opacity"
        >
          Lucas Ruiz Díaz
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-nav-link text-body hover:text-ink transition-colors rounded-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher currentLocale={locale} />
          <ButtonLink
            href={`${base}/#contacto`}
            variant="primary"
            size="sm"
            className="hidden sm:inline-flex"
          >
            {t("nav.hire")}
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}