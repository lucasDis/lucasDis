"use client";

import Link from "next/link";
import { useTransition } from "react";
import { reorderEducation } from "../actions";
import { DeleteEducationButton } from "./DeleteEducationButton";

type Row = {
  _id: string;
  institution: string;
  title: string;
  startDate: string;
  endDate: string;
  order: number;
};

/** Format YYYY-MM (or ISO date string) as "MMM YYYY" es-AR. */
function formatMonthYear(input: string): string {
  if (!input) return "—";
  // Accept YYYY-MM or ISO. Treat as UTC to avoid TZ off-by-one.
  const match = /^(\d{4})-(\d{2})/.exec(input);
  const year = match ? Number(match[1]) : new Date(input).getUTCFullYear();
  const month =
    match ? Number(match[2]) - 1 : new Date(input).getUTCMonth();
  if (Number.isNaN(year) || Number.isNaN(month)) return input;
  const date = new Date(Date.UTC(year, month, 1));
  return date.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function EducationsTable({ rows }: { rows: Row[] }) {
  const [isPending, startTransition] = useTransition();
  const minOrder = rows.length > 0 ? rows[0].order : 0;
  const maxOrder = rows.length > 0 ? rows[rows.length - 1].order : 0;

  function handleReorder(id: string, direction: "up" | "down") {
    startTransition(async () => {
      await reorderEducation(id, direction);
    });
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-hairline p-12 text-center">
        <p className="text-body-md text-muted">
          No hay entradas de educación todavía.
        </p>
        <Link
          href="/admin/educacion/nuevo"
          className="mt-3 inline-block text-body-sm text-primary underline-offset-4 hover:underline"
        >
          Crear la primera →
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-hairline">
      <table className="w-full text-body-sm">
        <thead className="bg-surface-soft text-caption uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-3 text-left">Título</th>
            <th className="px-4 py-3 text-left">Institución</th>
            <th className="px-4 py-3 text-left">Período</th>
            <th className="px-4 py-3 text-center">Mover</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row._id}
              className="border-t border-hairline bg-canvas hover:bg-surface-soft"
            >
              <td className="px-4 py-3 font-medium text-ink">{row.title}</td>
              <td className="px-4 py-3 text-body-sm text-body">
                {row.institution}
              </td>
              <td className="px-4 py-3 text-body-sm text-body">
                {formatMonthYear(row.startDate)} →{" "}
                {formatMonthYear(row.endDate)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleReorder(row._id, "up")}
                    disabled={isPending || row.order === minOrder}
                    aria-label="Subir"
                    className="h-8 w-8 cursor-pointer rounded-md border border-hairline bg-canvas text-body-md text-ink transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReorder(row._id, "down")}
                    disabled={isPending || row.order === maxOrder}
                    aria-label="Bajar"
                    className="h-8 w-8 cursor-pointer rounded-md border border-hairline bg-canvas text-body-md text-ink transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ↓
                  </button>
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-3">
                  <Link
                    href={`/admin/educacion/${row._id}`}
                    className="text-body-sm text-primary underline-offset-4 hover:underline"
                  >
                    Editar
                  </Link>
                  <DeleteEducationButton
                    id={row._id}
                    title={row.title}
                    institution={row.institution}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}