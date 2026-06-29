import { notFound } from "next/navigation";
import Link from "next/link";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { EducationModel } from "@/models/Education";
import { EducationForm } from "../_components/EducationForm";
import { formatMonthInput } from "../schema";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarEducacionPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();

  await dbConnect();
  const education = await EducationModel.findById(id).lean();
  if (!education) notFound();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link
          href="/admin/educacion"
          className="text-body-sm text-muted underline-offset-4 hover:underline"
        >
          ← Volver a educación
        </Link>
        <h1 className="mt-2 text-display-md text-ink">Editar educación</h1>
        <p className="text-body-md text-muted">
          Cambios guardados al confirmar.
        </p>
      </header>

      <EducationForm
        mode="edit"
        id={id}
        initial={{
          institution: education.institution,
          title: education.title,
          startDate: formatMonthInput(education.startDate),
          endDate: formatMonthInput(education.endDate),
          description: education.description ?? "",
          order: education.order,
        }}
      />
    </div>
  );
}