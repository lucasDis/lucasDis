import { Schema, model, models, type InferSchemaType } from "mongoose";

/**
 * SiteSettings — singleton. SEO metadata, footer text, and the canonical
 * social links used by the public site (and the JSON-LD Person schema).
 *
 * The seed script inserts (or replaces) the single document. The app
 * reads it with `SiteSettingsModel.findOne()`.
 */

const SiteSettingsSchema = new Schema(
  {
    siteTitle: { type: String, required: true, trim: true },
    siteDescription: { type: String, required: true, trim: true },
    ogImage: { type: String, trim: true },
    footerText: { type: String, default: "" },
    socialLinks: {
      linkedin: { type: String, trim: true },
      github: { type: String, trim: true },
      behance: { type: String, trim: true },
      instagram: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

export type SiteSettings = InferSchemaType<typeof SiteSettingsSchema> & {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const SiteSettingsModel =
  models.SiteSettings || model("SiteSettings", SiteSettingsSchema);
