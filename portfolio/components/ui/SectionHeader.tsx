import { clsx } from "clsx";

/**
 * SectionHeader — consistent section title block.
 *
 * Composition:
 *   - eyebrow (caption-uppercase, muted) — optional
 *   - title (h1/h2/h3 with display-* token)
 *   - subtitle (title-md) — optional
 *
 * Aligns left by default; pass `align="center"` for centered sections.
 */

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  className?: string;
}

const sizeByAs = {
  h1: "text-display-xl",
  h2: "text-display-lg",
  h3: "text-display-md",
} as const;

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  as = "h2",
  className,
}: SectionHeaderProps) {
  const alignClass =
    align === "center" ? "text-center mx-auto" : "text-left";

  const Heading = as;

  return (
    <header className={clsx("max-w-3xl", alignClass, className)}>
      {eyebrow && (
        <p className="text-caption-uppercase text-muted">{eyebrow}</p>
      )}
      <Heading className={clsx("mt-3", sizeByAs[as], "text-ink")}>
        {title}
      </Heading>
      {subtitle && (
        <p className="mt-4 text-title-md text-body max-w-2xl">
          {subtitle}
        </p>
      )}
    </header>
  );
}
