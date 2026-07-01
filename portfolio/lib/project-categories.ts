/**
 * Project category constants — shared between Server Components (page.tsx)
 * and Client Components (FeaturedProjects.tsx).
 *
 * This file must NOT have "use client" so it can be safely imported in
 * Server Components without Turbopack proxy issues.
 */

export const PROJECT_FILTER_CATEGORIES = [
  "all",
  "web",
  "ux-ui",
  "branding",
  "graphic-design",
  "3d",
] as const;

export type ProjectCategory = (typeof PROJECT_FILTER_CATEGORIES)[number];
