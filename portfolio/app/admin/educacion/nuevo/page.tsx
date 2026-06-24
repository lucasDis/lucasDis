import Link from "next/link";
import { EducationForm } from "../_components/EducationForm";

export const dynamic = "force-dynamic";

export default function NuevaEducacionPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link
          href="/admin/educacion"
          className="text-body-sm text-muted underline-offset-4 hover:underline"
        >
          ← Volver a educación
        </Link>
        <h1 className="mt-2 text-display-md text-ink">Nueva entrada</h1>
        <p className="text-body-md text-muted">
          Completá los campos para registrar tu educación formal.
        </p>
      </header>

      <EducationForm mode="create" />
    </div>
  );
}