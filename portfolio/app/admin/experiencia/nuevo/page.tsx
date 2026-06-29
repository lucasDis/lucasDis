import Link from "next/link";
import { ExperienceForm } from "../_components/ExperienceForm";

export const dynamic = "force-dynamic";

export default function NuevaExperienciaPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link
          href="/admin/experiencia"
          className="text-body-sm text-muted underline-offset-4 hover:underline"
        >
          ← Volver a experiencia
        </Link>
        <h1 className="mt-2 text-display-md text-ink">Nueva experiencia</h1>
        <p className="text-body-md text-muted">
          Completá los campos para registrar tu experiencia laboral.
        </p>
      </header>

      <ExperienceForm mode="create" />
    </div>
  );
}
