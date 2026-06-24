import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { EducationModel } from "@/models/Education";
import { EducationsTable } from "./_components/EducationsTable";

export const dynamic = "force-dynamic";

export default async function EducacionPage() {
  await dbConnect();
  const allEducation = await EducationModel.find({})
    .sort({ order: 1, startDate: -1 })
    .lean();

  // Serialize for the client/table component
  const rows = allEducation.map((e) => ({
    _id: String(e._id),
    institution: e.institution,
    title: e.title,
    startDate:
      e.startDate instanceof Date
        ? e.startDate.toISOString()
        : String(e.startDate),
    endDate:
      e.endDate instanceof Date ? e.endDate.toISOString() : String(e.endDate),
    order: e.order,
  }));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-md text-ink">Educación</h1>
          <p className="text-body-md text-muted">
            {rows.length} entrada{rows.length === 1 ? "" : "s"} de educación.
          </p>
        </div>
        <Link
          href="/admin/educacion/nuevo"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-body-md font-medium text-canvas transition-colors hover:bg-primary-hover"
        >
          + Nueva entrada
        </Link>
      </header>

      <EducationsTable rows={rows} />
    </div>
  );
}