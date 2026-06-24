import { clsx } from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

/**
 * FeatureCard — saturated brand-color card.
 *
 * Maps to DESIGN.md components:
 *   - feature-card-pink / -teal / -lavender / -peach / -ochre / -cream.
 *
 * Text color rule from DESIGN.md:
 *   - pink + teal → on-dark (white)
 *   - lavender / peach / ochre / cream → ink (dark)
 *
 * Rounded: xl (24px). Padding: p-8 (32px). No shadow — saturated fill is
 * the visual.
 */

export type FeatureCardVariant =
  | "pink"
  | "teal"
  | "lavender"
  | "peach"
  | "ochre"
  | "cream";

interface FeatureCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: FeatureCardVariant;
  title?: string;
  description?: string;
  children?: ReactNode;
}

const variantStyles: Record<FeatureCardVariant, string> = {
  pink: "bg-brand-pink text-on-primary",
  teal: "bg-brand-teal text-on-dark",
  lavender: "bg-brand-lavender text-ink",
  peach: "bg-brand-peach text-ink",
  ochre: "bg-brand-ochre text-ink",
  cream: "bg-surface-card text-ink border border-hairline",
};

export function FeatureCard({
  variant = "cream",
  title,
  description,
  className,
  children,
  ...rest
}: FeatureCardProps) {
  const onSaturated = variant === "pink" || variant === "teal";
  // Gradient only on saturated brand colors — cream is too close to white to
  // show a highlight, so it gets grain only.
  const hasGradient = variant !== "cream";

  return (
    <div
      className={clsx(
        "relative isolate overflow-hidden rounded-xl p-8",
        variantStyles[variant],
        className
      )}
      {...rest}
    >
      {hasGradient && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.18] via-transparent to-black/[0.15]"
        />
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grain opacity-[0.08] mix-blend-overlay"
      />
      {title && <h3 className="relative text-title-md">{title}</h3>}
      {description && (
        <p
          className={clsx(
            "relative mt-3 text-body-md",
            onSaturated && "opacity-90"
          )}
        >
          {description}
        </p>
      )}
      {children && <div className="relative">{children}</div>}
    </div>
  );
}
