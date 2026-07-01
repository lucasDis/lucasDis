/**
 * Server-side i18next helper for Server Components and Server Actions.
 *
 * Creates a fresh i18next instance per call (no singleton — safe for
 * concurrent server requests). Loads translation resources from the
 * local `locales/` directory via `i18next-resources-to-backend`.
 *
 * Usage in a Server Component:
 *   const { t } = await getTranslation(locale);
 *   <h1>{t("hero.title")}</h1>
 */

import { createInstance, type i18n } from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { defaultLocale, defaultNS, type Locale } from "./settings";

async function initI18next(locale: Locale, ns: string): Promise<i18n> {
  const instance = createInstance();
  await instance
    .use(
      resourcesToBackend(
        (language: string, namespace: string) =>
          import(`@/locales/${language}/${namespace}.json`)
      )
    )
    .init({
      lng: locale,
      fallbackLng: defaultLocale,
      supportedLngs: ["es", "en"],
      defaultNS: ns,
      ns,
      interpolation: {
        escapeValue: false, // React already escapes
      },
    });
  return instance;
}

export async function getTranslation(
  locale: Locale = defaultLocale,
  ns: string = defaultNS
) {
  const i18nextInstance = await initI18next(locale, ns);
  return {
    t: i18nextInstance.getFixedT(locale, ns),
    i18n: i18nextInstance,
  };
}

export type { Locale };
