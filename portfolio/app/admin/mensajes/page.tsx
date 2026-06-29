import { dbConnect } from "@/lib/db";
import { ContactMessageModel } from "@/models/ContactMessage";
import { MessagesTable } from "./_components/MessagesTable";

/**
 * /admin/mensajes — list contact-form submissions.
 *
 * Sorted newest-first. The table renders collapsed rows by default;
 * clicking expands the message and marks it as read. A "Responder"
 * mailto link and a delete button live in the expanded panel.
 */
export const dynamic = "force-dynamic";

export default async function MensajesPage() {
  await dbConnect();
  const messages = await ContactMessageModel.find()
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-title-lg">Mensajes</h1>
        <p className="mt-1 text-body-md text-muted">
          Mensajes recibidos desde el formulario de contacto.
        </p>
      </header>

      <MessagesTable
        messages={messages.map((m) => ({
          id: String(m._id),
          name: m.name,
          email: m.email,
          subject: m.subject,
          message: m.message,
          read: m.read,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}