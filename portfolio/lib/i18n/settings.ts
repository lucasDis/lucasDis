/**
 * i18n settings — shared between server helpers, middleware, and client.
 *
 * Single source of truth for supported locales and namespace config.
 * Import from here everywhere — never hardcode locales elsewhere.
 */

export const defaultLocale = "es" as const;
export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultNS = "common";
export const namespaces = ["common"] as const;

/** Returns true if the given string is a supported locale. */
export function isSupportedLocale(locale: string): locale is Locale {
  return (locales as readonly string[]).includes(locale);
}
