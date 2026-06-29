import type { ReactNode } from "react";
import { BlobsSvg } from "@/components/ui/BlobsSvg";

/**
 * HeroBand — Clay-style hero.
 *
 * Maps to DESIGN.md hero-band:
 *   - Cream canvas background (`bg-canvas`).
 *   - 7/5 grid: h1 + sub + CTA row on the left, illustration (BlobsSvg) on right.
 *   - Vertical padding: section rhythm (96px = py-24 lg:py-32).
 *
 * Single-column on mobile (illustration stacks below text).
 */

interface HeroBandProps {
  /** h1 — uses display-xl at desktop, display-lg on smaller screens. */
  title: string;
  /** Optional sub-headline under the h1. */
  subtitle?: string;
  /** Optional eyebrow (caption-uppercase) above the h1. */
  eyebrow?: string;
  /** Right-side illustration variant. Default "hero" (480px). */
  illustrationVariant?: "hero" | "compact" | "none";
  /** Right-side slot overrides — pass custom JSX instead of BlobsSvg. */
  illustration?: ReactNode;
  children?: ReactNode;
}

export function HeroBand({
  title,
  subtitle,
  eyebrow,
  illustrationVariant = "hero",
  illustration,
  children,
}: HeroBandProps) {
  return (
    <section id="welcome" className="bg-transparent py-24 px-6 lg:py-32">
      <div className="mx-auto max-w-7xl grid gap-12 lg:grid-cols-12 lg:gap-16 items-center">
        <div className="lg:col-span-7">
          {eyebrow && (
            <p className="text-caption-uppercase text-muted">{eyebrow}</p>
          )}
          <h1 className="mt-3 text-display-lg text-ink lg:text-display-xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-6 text-title-md text-body max-w-xl">{subtitle}</p>
          )}
          {children && <div className="mt-10 flex flex-wrap gap-3">{children}</div>}
        </div>

        <div className="lg:col-span-5 flex items-center justify-center">
          {illustration
            ? illustration
            : illustrationVariant === "none"
              ? null
              : <BlobsSvg variant={illustrationVariant} />}
        </div>
      </div>
    </section>
  );
}
