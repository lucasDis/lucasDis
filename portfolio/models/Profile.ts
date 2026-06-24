import { Schema, model, models, type InferSchemaType } from "mongoose";

/**
 * Profile — singleton. The portfolio's personal info, sourced from the CV
 * in PROMPT.md §4. Edited via the admin /perfil page.
 *
 * The seed script inserts (or replaces) the single document. The app reads
 * it with `ProfileModel.findOne()`.
 */

const ProfileSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    birthLocation: { type: String, trim: true },
    location: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    behance: { type: String, trim: true },
    instagram: { type: String, trim: true },
    photoUrl: { type: String, trim: true },
    heroImageUrl: { type: String, trim: true },
    // Markdown — rendered to HTML in the public site.
    professionalProfile: { type: String, required: true, default: "" },
  },
  { timestamps: true }
);

export type Profile = InferSchemaType<typeof ProfileSchema> & {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const ProfileModel = models.Profile || model("Profile", ProfileSchema);
