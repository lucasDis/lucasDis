import Link from "next/link";
import { clsx } from "clsx";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

/**
 * Button + ButtonLink — Clay design system.
 *
 * Variants map to DESIGN.md components:
 *   - primary    → button-primary     (filled dark, white text — main CTA)
 *   - secondary  → button-secondary   (cream + hairline — alt CTA on canvas)
 *   - on-color   → button-on-color    (filled dark — semantically for use over
 *                                       saturated brand surfaces like
 *                                       feature-card-pink / feature-card-teal)
 *   - text-link  → button-text-link   (inline link, transparent)
 *
 * Note: `on-color` is intentionally visually identical to `primary`. The
 * distinction is semantic — `on-color` is the variant you reach for when
 * the button sits over a saturated feature card or dark hero band, so the
 * visual reads as "dark CTA over color" instead of "main page CTA".
 *
 * Size "default" = 44px height (WCAG AAA touch target).
 */

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "on-color"
  | "text-link";

export type ButtonSize = "default" | "sm" | "lg";

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-active disabled:bg-primary-disabled disabled:text-muted",
  secondary:
    "bg-canvas text-ink border border-hairline hover:bg-surface-soft disabled:opacity-50",
  "on-color":
    "bg-primary text-on-primary hover:bg-primary-active disabled:bg-primary-disabled disabled:text-muted",
  "text-link":
    "bg-transparent text-ink hover:underline underline-offset-4 disabled:opacity-50",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-11 px-5 text-button",
  sm: "h-9 px-3 text-button",
  lg: "h-12 px-6 text-button",
};

const baseClass =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold cursor-pointer transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:hover:bg-inherit";

export function Button({
  variant = "primary",
  size = "default",
  className,
  children,
  type = "button",
  ...rest
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={clsx(
        baseClass,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

interface ButtonLinkProps extends BaseProps {
  href: string;
}

export function ButtonLink({
  variant = "primary",
  size = "default",
  className,
  href,
  children,
  ...rest
}: ButtonLinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <Link
      href={href}
      className={clsx(
        baseClass,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...rest}
    >
      {children}
    </Link>
  );
}
