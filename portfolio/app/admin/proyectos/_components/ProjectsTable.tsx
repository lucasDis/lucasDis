import Link from "next/link";
import Image from "next/image";
import { DeleteProjectButton } from "./DeleteProjectButton";
import { getProxiedUrl } from "@/lib/media";

const CATEGORY_LABEL: Record<string, string> = {
  web: "Web",
  "graphic-design": "Diseño Gráfico",
  "ux-ui": "UX/UI",
  "3d": "3D",
  branding: "Branding",
};

type Row = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  year: number;
  featured: boolean;
  published: boolean;
  media: Array<{ url: string; type: "image" | "video"; alt: string; order: number }>;
};

export function ProjectsTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-hairline p-12 text-center">
        <p className="text-body-md text-muted">
          No hay proyectos en esta categoría todavía.
        </p>
        <Link
          href="/admin/proyectos/nuevo"
          className="mt-3 inline-block text-body-sm text-primary underline-offset-4 hover:underline"
        >
          Crear el primero →
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-hairline">
      <table className="w-full text-body-sm">
        <thead className="bg-surface-soft text-caption uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-3 text-left">Imagen</th>
            <th className="px-4 py-3 text-left">Título</th>
            <th className="px-4 py-3 text-left">Categoría</th>
            <th className="px-4 py-3 text-left">Año</th>
            <th className="px-4 py-3 text-left">Estado</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const firstImage = row.media.find((m) => m.type === "image");
            return (
              <tr
                key={row._id}
                className="border-t border-hairline bg-canvas hover:bg-surface-soft"
              >
                <td className="px-4 py-3">
                  {firstImage ? (
                    <div className="relative h-12 w-16 overflow-hidden rounded-md bg-surface-soft">
                      <Image
                        src={getProxiedUrl(firstImage.url)}
                        alt={firstImage.alt}
                        fill
                        sizes="64px"
                        className="object-cover"
                        unoptimized
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-16 rounded-md bg-surface-soft" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/proyectos/${row._id}`}
                    className="font-medium text-ink hover:text-primary"
                  >
                    {row.title}
                  </Link>
                  <p className="text-caption text-muted">/{row.slug}</p>
                </td>
                <td className="px-4 py-3 text-body-sm text-body">
                  {CATEGORY_LABEL[row.category] ?? row.category}
                </td>
                <td className="px-4 py-3 text-body-sm text-body">{row.year}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {row.featured && (
                      <span className="rounded-full bg-brand-ochre/20 px-2 py-0.5 text-caption font-medium text-brand-ochre">
                        Destacado
                      </span>
                    )}
                    {row.published ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-caption font-medium text-primary">
                        Publicado
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted/20 px-2 py-0.5 text-caption text-muted">
                        Borrador
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/proyectos/${row._id}`}
                      className="text-body-sm text-primary underline-offset-4 hover:underline"
                    >
                      Editar
                    </Link>
                    <DeleteProjectButton id={row._id} title={row.title} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
