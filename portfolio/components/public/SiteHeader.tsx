"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";
import type { Locale } from "@/lib/i18n/settings";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

/**
 * SiteHeader — top navigation.
 *
 * Supports two visual variants & positioning modes:
 *   - variant="light" (default) : white text, white icons, white button (for dark shader hero)
 *   - variant="dark"            : dark text, dark icons, dark button (for light canvas pages like project details)
 *   - position="absolute" (default) : floats over hero
 *   - position="relative"           : sits in document flow to prevent layout overlap
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
  github?: string;
  linkedin?: string;
  variant?: "light" | "dark";
  position?: "absolute" | "relative";
}

export function SiteHeader({
  locale,
  labels,
  github,
  linkedin,
  variant = "light",
  position = "absolute",
}: SiteHeaderProps) {
  const base = `/${locale}`;
  const [isOpen, setIsOpen] = useState(false);

  const NAV_LINKS = [
    { href: `${base}/#proyectos`, label: labels.projects },
    { href: `${base}/#sobre-mi`, label: labels.about },
    { href: `${base}/#servicios`, label: labels.services },
    { href: `${base}/#habilidades`, label: labels.skills },
    { href: `${base}/#cv`, label: labels.cv },
  ];

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const handleNavClick = useCallback((href: string, e: React.MouseEvent) => {
    if (href.endsWith("/#cv")) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("open-cv-modal"));
    }
    setIsOpen(false);
  }, []);

  const githubUrl  = github   ?? "https://github.com/lucasruizdiaz";
  const linkedinUrl = linkedin ?? "https://linkedin.com/in/lucasruizdiaz";

  const isDarkVariant = variant === "dark";

  // Variant color classes
  const btnClass = isDarkVariant
    ? "border border-ink/80 text-ink hover:border-ink hover:bg-ink hover:text-canvas"
    : "border border-white/70 text-white/90 hover:border-white hover:text-white hover:bg-white/10";

  const iconClass = isDarkVariant
    ? "text-ink/80 hover:text-ink hover:bg-ink/5"
    : "text-white/80 hover:text-white hover:bg-white/10";

  const burgerBtnClass = isDarkVariant
    ? "hover:bg-ink/5 focus-visible:outline-ink/50"
    : "hover:bg-white/10 focus-visible:outline-white/50";

  const burgerLineClass = isDarkVariant ? "bg-ink" : "bg-white";

  return (
    <>
      <header
        data-header-dark={isDarkVariant ? "true" : undefined}
        className={cn(
          position === "relative"
            ? "relative z-40 w-full bg-transparent"
            : "absolute top-0 left-0 right-0 z-40 w-full bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

          {/* LEFT — Contactar CTA */}
          <AnimatePresence>
            {!isOpen && (
              <motion.div
                key="hire-cta"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Link
                  href={`${base}/#contacto`}
                  data-cursor-outlined
                  data-magnetic
                  className={cn(
                    "inline-flex h-9 items-center justify-center px-4 rounded-md text-[13px] font-semibold transition-all duration-200",
                    btnClass
                  )}
                >
                  {labels.hire}
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {isOpen && <div />}

          {/* RIGHT — GitHub · LinkedIn · Hamburger */}
          <div className="flex items-center gap-1">

            {/* GitHub */}
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              data-magnetic
              className={cn(
                "flex items-center justify-center w-9 h-9 rounded-sm transition-colors",
                iconClass
              )}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden>
                <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.021C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              data-magnetic
              className={cn(
                "flex items-center justify-center w-9 h-9 rounded-sm transition-colors",
                iconClass
              )}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden>
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68zm1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </a>

            {/* Hamburger */}
            <button
              type="button"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              aria-controls="nav-menu"
              data-magnetic
              onClick={() => setIsOpen((v) => !v)}
              className={cn(
                "flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-sm transition-colors focus-visible:outline-2 ml-1",
                burgerBtnClass
              )}
            >
              <motion.span
                className={cn("block h-px w-5 origin-center", burgerLineClass)}
                animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
              <motion.span
                className={cn("block h-px w-5", burgerLineClass)}
                animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.15 }}
              />
              <motion.span
                className={cn("block h-px w-5 origin-center", burgerLineClass)}
                animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            </button>
          </div>
        </div>
      </header>

      {/* ── Menu Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="menu-backdrop"
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-30 bg-ink/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              key="nav-menu"
              id="nav-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed top-16 left-0 right-0 z-40 bg-canvas border-b border-hairline shadow-md"
            >
              <div className="mx-auto max-w-7xl px-6 pt-4 pb-8 flex flex-col">
                <nav aria-label="Navigation">
                  {NAV_LINKS.map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 + i * 0.05, duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                      <Link
                        href={link.href}
                        onClick={(e) => handleNavClick(link.href, e)}
                        className="group flex items-center justify-between py-4 border-b border-hairline-soft hover:text-brand-pink transition-colors duration-200"
                        style={{ fontSize: "clamp(20px, 5.5vw, 30px)", fontWeight: 500, letterSpacing: "-0.5px", color: "var(--color-ink)" }}
                      >
                        {link.label}
                        <span className="text-muted-soft text-xl group-hover:text-brand-pink transition-all duration-200 group-hover:translate-x-1" aria-hidden="true">→</span>
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.32, duration: 0.28 }}
                  className="flex items-center justify-between pt-6"
                >
                  <LocaleSwitcher currentLocale={locale} />
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}