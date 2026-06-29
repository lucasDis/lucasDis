import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { ProjectModel } from "@/models/Project";
import { CategoryFilter } from "./_components/CategoryFilter";
import { ProjectsTable } from "./_components/ProjectsTable";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ category?: string }>;
};

const VALID_CATEGORIES = [
  "web",
  "graphic-design",
  "ux-ui",
  "3d",
  "branding",
] as const;
type ProjectCategory = (typeof VALID_CATEGORIES)[number];

export default async function ProyectosPage({ searchParams }: PageProps) {
  const { category } = await searchParams;
  const active: ProjectCategory | null = (VALID_CATEGORIES as readonly string[]).includes(
    category ?? ""
  )
    ? (category as ProjectCategory)
    : null;

  await dbConnect();
  const [allProjects, byCategory] = await Promise.all([
    ProjectModel.find(active ? { category: active } : {})
      .sort({ order: 1, year: -1, createdAt: -1 })
      .lean(),
    ProjectModel.aggregate<{ _id: ProjectCategory; count: number }>([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
  ]);

  const counts: Record<string, number> = {};
  for (const row of byCategory) {
    counts[row._id] = row.count;
  }

  // Serialize for the client/table component
  const rows = allProjects.map((p) => ({
    _id: String(p._id),
    title: p.title,
    slug: p.slug,
    category: p.category,
    year: p.year,
    featured: p.featured,
    published: p.published,
    media: (p.media ?? []).map((m: { url: string; type: "image" | "video"; alt: string; order: number }) => ({
      url: m.url,
      type: m.type,
      alt: m.alt,
      order: m.order,
    })),
  }));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-md text-ink">Proyectos</h1>
          <p className="text-body-md text-muted">
            {rows.length} proyecto{rows.length === 1 ? "" : "s"} en esta vista.
          </p>
        </div>
        <Link
          href="/admin/proyectos/nuevo"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-body-md font-medium text-canvas transition-colors hover:bg-primary-hover"
        >
          + Nuevo proyecto
        </Link>
      </header>

      <CategoryFilter active={active} counts={counts} />

      <ProjectsTable rows={rows} />
    </div>
  );
}
