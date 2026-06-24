import { notFound } from "next/navigation";
import Link from "next/link";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { ExperienceModel } from "@/models/Experience";
import { ExperienceForm } from "../_components/ExperienceForm";
import { formatMonthInput } from "../schema";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarExperienciaPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();

  await dbConnect();
  const experience = await ExperienceModel.findById(id).lean();
  if (!experience) notFound();

  // ADR-2: isCurrent is derived from endDate === null. Pass it to the
  // form so the checkbox starts in the right state on edit.
  const isCurrent = experience.endDate === null;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link
          href="/admin/experiencia"
          className="text-body-sm text-muted underline-offset-4 hover:underline"
        >
          ← Volver a experiencia
        </Link>
        <h1 className="mt-2 text-display-md text-ink">
          Editar experiencia
        </h1>
        <p className="text-body-md text-muted">
          Cambios guardados al confirmar.
        </p>
      </header>

      <ExperienceForm
        mode="edit"
        id={id}
        isCurrentInitially={isCurrent}
        initial={{
          company: experience.company,
          role: experience.role,
          startDate: formatMonthInput(experience.startDate),
          endDate: formatMonthInput(experience.endDate),
          description: experience.description ?? "",
          order: experience.order,
        }}
      />
    </div>
  );
}
