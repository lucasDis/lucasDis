import Link from "next/link";

const GROUPS = [
  { value: null, label: "Todos" },
  { value: "web", label: "Web" },
  { value: "design", label: "Diseño" },
  { value: "other", label: "Otros" },
] as const;

/**
 * Pill-tabs group filter. Server component — each pill is a `<Link>`
 * that swaps the `?group=` search param. No JS needed.
 */
export function GroupFilter({
  active,
  counts,
}: {
  active: string | null;
  counts: Record<string, number>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {GROUPS.map((g) => {
        const isActive = active === g.value;
        const href = g.value
          ? `/admin/habilidades?group=${g.value}`
          : "/admin/habilidades";
        const count = g.value
          ? counts[g.value] ?? 0
          : Object.values(counts).reduce((a, b) => a + b, 0);
        return (
          <Link
            key={g.label}
            href={href}
            className={`cursor-pointer rounded-full border px-4 py-1.5 text-body-sm transition-colors ${
              isActive
                ? "border-primary bg-primary text-canvas"
                : "border-hairline bg-canvas text-ink hover:border-primary"
            }`}
          >
            {g.label}
            <span className="ml-2 text-caption opacity-70">({count})</span>
          </Link>
        );
      })}
    </div>
  );
}