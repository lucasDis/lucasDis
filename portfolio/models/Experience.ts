import { Schema, model, models, type InferSchemaType } from "mongoose";

/**
 * Experience — work history. Ordered by `order` ascending, then by
 * `startDate` descending. The current role has `endDate: null`.
 *
 * `description` is markdown (bullets are plain `- item` lines).
 */

const ExperienceSchema = new Schema(
  {
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    description: { type: String, required: true, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type Experience = InferSchemaType<typeof ExperienceSchema> & {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const ExperienceModel =
  models.Experience || model("Experience", ExperienceSchema);
