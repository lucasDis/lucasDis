"use client";

import { useTransition } from "react";
import { deleteProject } from "../actions";

/**
 * Delete button with a `confirm()` prompt. Server action does the
 * heavy lifting and redirects back to the list.
 */
export function DeleteProjectButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (
      !confirm(
        `¿Eliminar "${title}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      await deleteProject(id);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="cursor-pointer text-body-sm text-error underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? "Eliminando…" : "Eliminar"}
    </button>
  );
}
