import Link from "next/link";

const CATEGORIES = [
  { value: null, label: "Todos" },
  { value: "web", label: "Web" },
  { value: "graphic-design", label: "Diseño Gráfico" },
  { value: "ux-ui", label: "UX/UI" },
  { value: "3d", label: "3D" },
  { value: "branding", label: "Branding" },
] as const;

/**
 * Pill-tabs category filter. Server component — each pill is a
 * `<Link>` that swaps the `?category=` search param. No JS needed.
 */
export function CategoryFilter({
  active,
  counts,
  currentYear,
  currentSearch,
  currentStatus,
}: {
  active: string | null;
  counts: Record<string, number>;
  currentYear?: string;
  currentSearch?: string;
  currentStatus?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((c) => {
        const isActive = active === c.value;

        const params = new URLSearchParams();
        if (c.value) params.set("category", c.value);
        if (currentYear) params.set("year", currentYear);
        if (currentSearch) params.set("search", currentSearch);
        if (currentStatus) params.set("status", currentStatus);
        
        const queryString = params.toString();
        const href = queryString ? `/admin/proyectos?${queryString}` : "/admin/proyectos";
        
        const count = c.value ? counts[c.value] ?? 0 : Object.values(counts).reduce((a, b) => a + b, 0);
        return (
          <Link
            key={c.label}
            href={href}
            className={`cursor-pointer rounded-full border px-4 py-1.5 text-body-sm transition-colors ${
              isActive
                ? "border-primary bg-primary text-canvas"
                : "border-hairline bg-canvas text-ink hover:border-primary"
            }`}
          >
            {c.label}
            <span className="ml-2 text-caption opacity-70">({count})</span>
          </Link>
        );
      })}
    </div>
  );
}
