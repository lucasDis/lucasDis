import Link from "next/link";
import { ProjectForm } from "../_components/ProjectForm";

export const dynamic = "force-dynamic";

export default function NuevoProyectoPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link
          href="/admin/proyectos"
          className="text-body-sm text-muted underline-offset-4 hover:underline"
        >
          ← Volver a proyectos
        </Link>
        <h1 className="mt-2 text-display-md text-ink">Nuevo proyecto</h1>
        <p className="text-body-md text-muted">
          Completá los campos para publicar un nuevo caso.
        </p>
      </header>

      <ProjectForm mode="create" />
    </div>
  );
}
