import { Schema, model, models, type InferSchemaType } from "mongoose";

/**
 * Education — academic history. Ordered by `order` ascending, then by
 * `startDate` descending.
 */

const EducationSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type Education = InferSchemaType<typeof EducationSchema> & {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const EducationModel =
  models.Education || model("Education", EducationSchema);
