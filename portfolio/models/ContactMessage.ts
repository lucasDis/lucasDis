import { Schema, model, models, type InferSchemaType } from "mongoose";

/**
 * ContactMessage — a single message from the public /contacto form.
 *
 * The form (Fase 8) POSTs to /api/contact which validates with Zod and
 * inserts here. The admin /mensajes page lists these and supports
 * mark-as-read / delete.
 *
 * No `updatedAt` — messages are immutable after creation.
 */

const ContactMessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type ContactMessage = InferSchemaType<typeof ContactMessageSchema> & {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
};

export const ContactMessageModel =
  models.ContactMessage || model("ContactMessage", ContactMessageSchema);
