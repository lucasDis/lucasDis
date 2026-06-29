import { notFound } from "next/navigation";
import Link from "next/link";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { SkillModel } from "@/models/Skill";
import { SkillForm } from "../_components/SkillForm";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarHabilidadPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();

  await dbConnect();
  const skill = await SkillModel.findById(id).lean();
  if (!skill) notFound();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link
          href="/admin/habilidades"
          className="text-body-sm text-muted underline-offset-4 hover:underline"
        >
          ← Volver a habilidades
        </Link>
        <h1 className="mt-2 text-display-md text-ink">Editar habilidad</h1>
        <p className="text-body-md text-muted">
          Cambios guardados al confirmar.
        </p>
      </header>

      <SkillForm
        mode="edit"
        id={id}
        initial={{
          name: skill.name,
          group: skill.group,
          order: skill.order,
        }}
      />
    </div>
  );
}