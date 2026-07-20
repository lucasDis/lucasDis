"use client";

import Link from "next/link";
import { useTransition } from "react";
import { reorderSkill } from "../actions";
import { DeleteSkillButton } from "./DeleteSkillButton";

const GROUP_LABEL: Record<string, string> = {
  web: "Web",
  design: "Diseño",
  other: "Otros",
};

type Row = {
  _id: string;
  name: string;
  group: string;
  order: number;
  yearsOfExperience?: number;
};

export function SkillsTable({ rows }: { rows: Row[] }) {
  const [isPending, startTransition] = useTransition();
  const minOrder = rows.length > 0 ? rows[0].order : 0;
  const maxOrder = rows.length > 0 ? rows[rows.length - 1].order : 0;

  function handleReorder(id: string, direction: "up" | "down") {
    startTransition(async () => {
      await reorderSkill(id, direction);
    });
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-hairline p-12 text-center">
        <p className="text-body-md text-muted">
          No hay habilidades en esta categoría todavía.
        </p>
        <Link
          href="/admin/habilidades/nuevo"
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
            <th className="px-4 py-3 text-left">Nombre</th>
            <th className="px-4 py-3 text-left">Grupo</th>
            <th className="px-4 py-3 text-left">Años exp.</th>
            <th className="px-4 py-3 text-left">Orden</th>
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
              <td className="px-4 py-3 font-medium text-ink">{row.name}</td>
              <td className="px-4 py-3 text-body-sm text-body">
                {GROUP_LABEL[row.group] ?? row.group}
              </td>
              <td className="px-4 py-3 text-body-sm text-body">
                {row.yearsOfExperience != null ? `${row.yearsOfExperience} años` : “—”}
              </td>
              <td className="px-4 py-3 text-body-sm text-body">{row.order}</td>
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
                    href={`/admin/habilidades/${row._id}`}
                    className="text-body-sm text-primary underline-offset-4 hover:underline"
                  >
                    Editar
                  </Link>
                  <DeleteSkillButton id={row._id} name={row.name} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}