"use client";

/**
 * LocaleSwitcher — language toggle button in the site header.
 *
 * Replaces the locale segment in the current URL and sets the
 * NEXT_LOCALE cookie so the middleware remembers the preference.
 *
 * Example:
 *   Current URL: /es/#sobre-mi
 *   Click EN   → navigates to /en/#sobre-mi, sets cookie NEXT_LOCALE=en
 */

import { usePathname, useRouter } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/settings";

interface LocaleSwitcherProps {
  currentLocale: Locale;
}

export function LocaleSwitcher({ currentLocale }: LocaleSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(targetLocale: Locale) {
    if (targetLocale === currentLocale) return;

    // Replace the leading /{locale} segment with the target locale
    const newPath = pathname.replace(`/${currentLocale}`, `/${targetLocale}`);

    // Persist preference in cookie for the middleware
    document.cookie = `NEXT_LOCALE=${targetLocale};path=/;max-age=31536000;samesite=lax`;

    router.push(newPath);
  }

  return (
    <div
      className="flex items-center gap-1 text-caption-uppercase text-muted"
      aria-label="Language switcher"
    >
      {locales.map((locale, idx) => (
        <span key={locale} className="flex items-center gap-1">
          {idx > 0 && <span aria-hidden="true" className="text-hairline">|</span>}
          <button
            type="button"
            onClick={() => switchLocale(locale)}
            className={[
              "px-1 py-0.5 rounded-sm transition-colors",
              locale === currentLocale
                ? "text-ink font-semibold"
                : "hover:text-ink",
            ].join(" ")}
            aria-current={locale === currentLocale ? "true" : undefined}
          >
            {locale.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}
