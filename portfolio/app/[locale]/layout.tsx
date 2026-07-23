import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AnalyticsGuard } from "@/components/ui/AnalyticsGuard";
import "../globals.css";
import { getTranslation } from "@/lib/i18n/server";
import { locales, isSupportedLocale, defaultLocale } from "@/lib/i18n/settings";
import { CustomCursor } from "@/components/ui/CustomCursor";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/**
 * Generate static params for all supported locales.
 * Tells Next.js which [locale] values to pre-render at build time.
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Props = {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale = isSupportedLocale(locale) ? locale : defaultLocale;
  const { t } = await getTranslation(resolvedLocale);

  return {
    title: {
      default: t("meta.title"),
      template: t("meta.titleTemplate"),
    },
    description: t("meta.description"),
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
    ),
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  const resolvedLocale = isSupportedLocale(locale) ? locale : defaultLocale;

  return (
    <html lang={resolvedLocale} className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-canvas text-ink font-body cursor-none" suppressHydrationWarning>
        <CustomCursor />
        {children}
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <AnalyticsGuard gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}
