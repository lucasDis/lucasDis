import { Schema, model, models, type InferSchemaType } from "mongoose";

/**
 * Project — portfolio entry. Public at /proyectos/[slug].
 *
 * `media` is ordered by `order` (ascending). `externalLinks` are arbitrary
 * (sitio en vivo, Behance, etc.). `tools` is a flat string array of
 * tool/tech names. `featured` controls the home page ribbon.
 */

const MediaItemSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    type: { type: String, enum: ["image", "video"], required: true },
    alt: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const ExternalLinkSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const ProjectSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    longDescription: { type: String, default: "" },
    category: {
      type: String,
      enum: ["web", "graphic-design", "ux-ui", "3d", "branding"],
      required: true,
      index: true,
    },
    year: { type: Number, required: true },
    client: { type: String, trim: true },
    role: { type: String, trim: true },
    tools: { type: [String], default: [] },
    media: { type: [MediaItemSchema], default: [] },
    externalLinks: { type: [ExternalLinkSchema], default: [] },
    featured: { type: Boolean, default: false, index: true },
    published: { type: Boolean, default: false, index: true },
    isPersonalProject: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type Project = InferSchemaType<typeof ProjectSchema> & {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const ProjectModel = models.Project || model("Project", ProjectSchema);
