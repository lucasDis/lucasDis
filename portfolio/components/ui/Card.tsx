import { clsx } from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

/**
 * Card — base content card.
 *
 * Maps to DESIGN.md components: testimonial-card, product-mockup-card,
 * pricing-tier-card (non-featured), expert-card — all share cream surface +
 * hairline border + rounded-lg.
 *
 * Padding tokens:
 *   - md → p-6 (24px) — testimonial / product mockup
 *   - lg → p-8 (32px) — pricing tier
 */

export type CardPadding = "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  children: ReactNode;
}

const paddingStyles: Record<CardPadding, string> = {
  md: "p-6",
  lg: "p-8",
};

export function Card({
  padding = "md",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-lg bg-surface-card text-ink border border-hairline",
        paddingStyles[padding],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
