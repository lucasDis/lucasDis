import { Schema, model, models, type InferSchemaType } from "mongoose";

/**
 * Skill — a single competency, grouped by `group`:
 *   - web     → dev tools / frameworks
 *   - design  → design / multimedia tools
 *   - other   → methodologies / soft skills
 *
 * Display order inside a group is controlled by `order` ascending.
 */

const SkillSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    group: {
      type: String,
      enum: ["web", "design", "other"],
      required: true,
      index: true,
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type Skill = InferSchemaType<typeof SkillSchema> & {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const SkillModel = models.Skill || model("Skill", SkillSchema);
