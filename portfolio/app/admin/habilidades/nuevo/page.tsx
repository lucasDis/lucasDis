import Link from "next/link";
import { SkillForm } from "../_components/SkillForm";

export const dynamic = "force-dynamic";

export default function NuevaHabilidadPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link
          href="/admin/habilidades"
          className="text-body-sm text-muted underline-offset-4 hover:underline"
        >
          ← Volver a habilidades
        </Link>
        <h1 className="mt-2 text-display-md text-ink">Nueva habilidad</h1>
        <p className="text-body-md text-muted">
          Completá los campos para agregar una habilidad.
        </p>
      </header>

      <SkillForm mode="create" />
    </div>
  );
}