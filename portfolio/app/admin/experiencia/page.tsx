import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { ExperienceModel } from "@/models/Experience";
import { ExperiencesTable } from "./_components/ExperiencesTable";

export const dynamic = "force-dynamic";

export default async function ExperienciaPage() {
  await dbConnect();
  const allExperience = await ExperienceModel.find({})
    .sort({ order: 1, startDate: -1 })
    .lean();

  // Serialize for the client/table component. endDate can be null.
  const rows = allExperience.map((e) => ({
    _id: String(e._id),
    company: e.company,
    role: e.role,
    startDate:
      e.startDate instanceof Date
        ? e.startDate.toISOString()
        : String(e.startDate),
    endDate:
      e.endDate instanceof Date
        ? e.endDate.toISOString()
        : e.endDate
          ? String(e.endDate)
          : null,
    order: e.order,
  }));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-md text-ink">Experiencia</h1>
          <p className="text-body-md text-muted">
            {rows.length} entrada{rows.length === 1 ? "" : "s"} de experiencia
            laboral.
          </p>
        </div>
        <Link
          href="/admin/experiencia/nuevo"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-body-md font-medium text-canvas transition-colors hover:bg-primary-hover"
        >
          + Nueva experiencia
        </Link>
      </header>

      <ExperiencesTable rows={rows} />
    </div>
  );
}
