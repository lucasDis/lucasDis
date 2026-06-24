import { Schema, model, models, type InferSchemaType } from "mongoose";

/**
 * User — admin account. Single document in production.
 *
 * Auth (NextAuth credentials) is wired in Fase 3. The seed script in
 * Fase 2 already inserts the admin user with a placeholder hash;
 * Fase 3 replaces it with a real bcrypt hash.
 */

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ["admin"], default: "admin", required: true },
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof UserSchema> & {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const UserModel = models.User || model("User", UserSchema);
