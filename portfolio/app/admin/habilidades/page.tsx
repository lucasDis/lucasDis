import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { SkillModel } from "@/models/Skill";
import { GroupFilter } from "./_components/GroupFilter";
import { SkillsTable } from "./_components/SkillsTable";

export const dynamic = "force-dynamic";

const VALID_GROUPS = ["web", "design", "other"] as const;
type SkillGroup = (typeof VALID_GROUPS)[number];

type PageProps = {
  searchParams: Promise<{ group?: string }>;
};

export default async function HabilidadesPage({ searchParams }: PageProps) {
  const { group } = await searchParams;
  const active: SkillGroup | null = (VALID_GROUPS as readonly string[]).includes(
    group ?? ""
  )
    ? (group as SkillGroup)
    : null;

  await dbConnect();
  const [allSkills, byGroup] = await Promise.all([
    SkillModel.find(active ? { group: active } : {})
      .sort({ order: 1, name: 1 })
      .lean(),
    SkillModel.aggregate<{ _id: SkillGroup; count: number }>([
      { $group: { _id: "$group", count: { $sum: 1 } } },
    ]),
  ]);

  const counts: Record<string, number> = {};
  for (const row of byGroup) {
    counts[row._id] = row.count;
  }

  // Serialize for the client/table component
  const rows = allSkills.map((s) => ({
    _id: String(s._id),
    name: s.name,
    group: s.group,
    order: s.order,
  }));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-md text-ink">Habilidades</h1>
          <p className="text-body-md text-muted">
            {rows.length} habilidad{rows.length === 1 ? "" : "es"} en esta vista.
          </p>
        </div>
        <Link
          href="/admin/habilidades/nuevo"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-body-md font-medium text-canvas transition-colors hover:bg-primary-hover"
        >
          + Nueva habilidad
        </Link>
      </header>

      <GroupFilter active={active} counts={counts} />

      <SkillsTable rows={rows} />
    </div>
  );
}