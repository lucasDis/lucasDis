import { notFound } from "next/navigation";
import Link from "next/link";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { ProjectModel } from "@/models/Project";
import { ProjectForm } from "../_components/ProjectForm";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarProyectoPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();

  await dbConnect();
  const project = await ProjectModel.findById(id).lean();
  if (!project) notFound();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link
          href="/admin/proyectos"
          className="text-body-sm text-muted underline-offset-4 hover:underline"
        >
          ← Volver a proyectos
        </Link>
        <h1 className="mt-2 text-display-md text-ink">Editar proyecto</h1>
        <p className="text-body-md text-muted">
          Cambios guardados al confirmar.
        </p>
      </header>

      <ProjectForm
        mode="edit"
        id={id}
        initial={{
          title: project.title,
          slug: project.slug,
          shortDescription: project.shortDescription,
          longDescription: project.longDescription ?? "",
          category: project.category,
          year: project.year,
          client: project.client ?? "",
          role: project.role ?? "",
          tools: project.tools ?? [],
          media: (project.media ?? []).map((m: { url: string; type: "image" | "video"; alt: string; order: number }) => ({
            url: m.url,
            type: m.type,
            alt: m.alt,
            order: m.order,
          })),
          externalLinks: (project.externalLinks ?? []).map((l: { label: string; url: string }) => ({
            label: l.label,
            url: l.url,
          })),
          featured: project.featured,
          published: project.published,
        }}
      />
    </div>
  );
}
