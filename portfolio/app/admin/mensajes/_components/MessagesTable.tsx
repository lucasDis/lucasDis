"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markAsRead, deleteMessage } from "../actions";

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Collapsed-row inbox. Unread messages get a left accent border and
 * a "Nuevo" badge. Clicking a row toggles its expanded state and, if
 * it was unread, marks it as read. The expanded panel shows the full
 * message plus a `mailto:` reply link and a delete button.
 */
export function MessagesTable({ messages }: { messages: Message[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [openId, setOpenId] = useState<string | null>(null);

  if (messages.length === 0) {
    return (
      <div className="rounded-lg border border-hairline bg-surface-soft p-12 text-center">
        <p className="text-body-md text-muted">No hay mensajes todavía.</p>
      </div>
    );
  }

  function handleRowClick(id: string, isRead: boolean) {
    setOpenId((current) => (current === id ? null : id));
    if (!isRead) {
      startTransition(async () => {
        await markAsRead(id);
        router.refresh();
      });
    }
  }

  function handleDelete(id: string) {
    if (
      !confirm("¿Eliminar este mensaje? Esta acción no se puede deshacer.")
    ) {
      return;
    }
    startTransition(async () => {
      await deleteMessage(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {messages.map((m) => {
        const isOpen = openId === m.id;
        return (
          <article
            key={m.id}
            className={`rounded-lg border border-hairline bg-surface-soft ${
              m.read ? "" : "border-l-4 border-l-primary"
            }`}
          >
            <button
              type="button"
              onClick={() => handleRowClick(m.id, m.read)}
              aria-expanded={isOpen}
              className="block w-full cursor-pointer p-4 text-left"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-body-md font-medium text-ink">
                      {m.name}
                    </span>
                    {!m.read && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-caption text-on-primary">
                        Nuevo
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-body-sm text-muted">
                    {m.subject} · {m.email}
                  </p>
                </div>
                <time className="shrink-0 text-caption text-muted">
                  {formatDate(m.createdAt)}
                </time>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-hairline p-4">
                <p className="whitespace-pre-wrap text-body-md text-ink">
                  {m.message}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}
                    className="text-body-sm text-accent underline-offset-4 hover:underline"
                  >
                    Responder por email →
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(m.id)}
                    disabled={isPending}
                    className="cursor-pointer text-body-sm text-error underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPending ? "Eliminando…" : "Eliminar"}
                  </button>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}