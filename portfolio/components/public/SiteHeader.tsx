"use client";

import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";
import type { Locale } from "@/lib/i18n/settings";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

/**
 * SiteHeader — top navigation for public pages.
 *
 * Desktop: sticky cream bar with logo + anchor nav + locale switcher + CTA.
 * Mobile : logo + hamburger button → slide-down panel with all nav items.
 *
 * Section order on home (kept in sync with page.tsx):
 *   #welcome → #proyectos → #sobre-mi → #servicios → #habilidades → #cv → #contacto
 */

interface SiteHeaderProps {
  locale: Locale;
  labels: {
    projects: string;
    about: string;
    services: string;
    skills: string;
    cv: string;
    hire: string;
  };
}

export function SiteHeader({ locale, labels }: SiteHeaderProps) {
  const base = `/${locale}`;
  const [isOpen, setIsOpen] = useState(false);

  const NAV_LINKS = [
    { href: `${base}/#proyectos`, label: labels.projects },
    { href: `${base}/#sobre-mi`, label: labels.about },
    { href: `${base}/#servicios`, label: labels.services },
    { href: `${base}/#habilidades`, label: labels.skills },
    { href: `${base}/#cv`, label: labels.cv },
  ];

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const handleNavClick = useCallback(
    (href: string, e: React.MouseEvent) => {
      if (href.endsWith("/#cv")) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("open-cv-modal"));
      }
      setIsOpen(false);
    },
    []
  );

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full",
          "bg-canvas/85 backdrop-blur supports-backdrop-filter:bg-canvas/70",
          "border-b border-hairline"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link
            href={`${base}/#welcome`}
            className="text-title-md text-ink hover:opacity-80 transition-opacity"
            onClick={() => setIsOpen(false)}
          >
            Lucas Ruiz Díaz
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(link.href, e)}
                className="px-3 py-2 text-nav-link text-body hover:text-ink transition-colors rounded-sm"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side: locale switcher + CTA + hamburger */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <LocaleSwitcher currentLocale={locale} />
            </div>
            <AnimatePresence>
              {!isOpen && (
                <motion.div
                  key="hire-cta"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="hidden sm:block"
                >
                  <ButtonLink
                    href={`${base}/#contacto`}
                    variant="primary"
                    size="sm"
                  >
                    {labels.hire}
                  </ButtonLink>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hamburger — mobile only */}
            <button
              type="button"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              onClick={() => setIsOpen((v) => !v)}
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-[5px] rounded-sm hover:bg-surface-soft transition-colors focus-visible:outline-2 focus-visible:outline-brand-pink"
            >
              <motion.span
                className="block h-px w-5 bg-ink origin-center"
                animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
              <motion.span
                className="block h-px w-5 bg-ink"
                animate={
                  isOpen
                    ? { opacity: 0, scaleX: 0 }
                    : { opacity: 1, scaleX: 1 }
                }
                transition={{ duration: 0.15 }}
              />
              <motion.span
                className="block h-px w-5 bg-ink origin-center"
                animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mobile-backdrop"
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-30 bg-ink/20 backdrop-blur-sm md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              key="mobile-menu"
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed top-16 left-0 right-0 z-40 md:hidden bg-canvas border-b border-hairline shadow-md"
            >
              <div className="mx-auto max-w-7xl px-6 pt-4 pb-8 flex flex-col">

                {/* Nav links */}
                <nav aria-label="Mobile navigation">
                  {NAV_LINKS.map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.04 + i * 0.05,
                        duration: 0.26,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                    >
                      <Link
                        href={link.href}
                        onClick={(e) => handleNavClick(link.href, e)}
                        className="group flex items-center justify-between py-4 border-b border-hairline-soft hover:text-brand-pink transition-colors duration-200"
                        style={{
                          fontSize: "clamp(20px, 5.5vw, 30px)",
                          fontWeight: 500,
                          letterSpacing: "-0.5px",
                          color: "var(--color-ink)",
                        }}
                      >
                        {link.label}
                        <span
                          className="text-muted-soft text-xl group-hover:text-brand-pink transition-all duration-200 group-hover:translate-x-1"
                          aria-hidden="true"
                        >
                          →
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {/* Bottom row: locale switcher + hire CTA */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.32, duration: 0.28 }}
                  className="flex items-center justify-between pt-6"
                >
                  <LocaleSwitcher currentLocale={locale} />
                  <ButtonLink
                    href={`${base}/#contacto`}
                    variant="primary"
                    size="default"
                    onClick={() => setIsOpen(false)}
                  >
                    {labels.hire}
                  </ButtonLink>
                </motion.div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}