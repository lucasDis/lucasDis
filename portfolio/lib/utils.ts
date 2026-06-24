import { clsx, type ClassValue } from "clsx";

/**
 * `cn` — className composition helper.
 *
 * Thin wrapper over `clsx`. Use anywhere you compose Tailwind classes
 * from multiple sources (base + variant + size + consumer override).
 *
 *   cn("base", condition && "extra", ["a", "b"], className)
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
