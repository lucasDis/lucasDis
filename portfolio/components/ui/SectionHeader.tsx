import { clsx } from "clsx";

/**
 * SectionHeader — consistent section title block across all public pages/sections.
 *
 * Typography tokens:
 *   - eyebrow : 12px font-semibold uppercase tracking-[0.2em] text-brand-pink
 *   - title   : 4xl / 5xl font-bold tracking-tight text-ink
 *   - subtitle: 18px font-normal leading-relaxed text-muted (unified across all sections)
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

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  as = "h2",
  className,
}: SectionHeaderProps) {
  const alignClass =
    align === "center"
      ? "text-center mx-auto flex flex-col items-center"
      : "text-left";

  const Heading = as;

  return (
    <header className={clsx("max-w-3xl w-full", alignClass, className)}>
      {eyebrow && (
        <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-brand-pink">
          {eyebrow}
        </p>
      )}
      <Heading className="mt-2 text-4xl lg:text-5xl font-bold tracking-tight text-ink">
        {title}
      </Heading>
      {subtitle && (
        <p className={clsx("mt-3 text-[18px] font-normal leading-relaxed text-muted max-w-2xl", align === "center" && "mx-auto")}>
          {subtitle}
        </p>
      )}
    </header>
  );
}
