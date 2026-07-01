/**
 * Root layout — minimal shell required by Next.js App Router.
 *
 * The actual html/body/lang/metadata is handled by app/[locale]/layout.tsx.
 * This file only exists to satisfy Next.js's requirement for a root layout.
 * It renders no html element itself — [locale]/layout.tsx owns that.
 */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
