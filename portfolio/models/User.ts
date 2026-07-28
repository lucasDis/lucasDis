import { Schema, model, models, type InferSchemaType } from "mongoose";

/**
 * User — admin account. Single document in production.
 *
 * Auth (NextAuth credentials) is wired in Fase 3. The seed script in
 * Fase 2 already inserts the admin user with a placeholder hash;
 * Fase 3 replaces it with a real bcrypt hash.
 */

const BackupCodeSchema = new Schema(
  {
    codeHash: { type: String, required: true },
    used: { type: Boolean, required: true, default: false },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ["admin"], default: "admin", required: true },
    /** TOTP secret (Base32). Only present when totpEnabled is true. */
    totpSecret: { type: String },
    /** Whether TOTP 2FA is active for this account. */
    totpEnabled: { type: Boolean, required: true, default: false },
    /** One-time recovery codes (bcrypt-hashed). Up to 8. */
    backupCodes: { type: [BackupCodeSchema], default: [] },
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof UserSchema> & {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export type BackupCode = { codeHash: string; used: boolean };

// In Next.js dev mode with HMR, delete stale compiled model so schema updates take effect
if (process.env.NODE_ENV === "development" && models.User) {
  delete models.User;
}

export const UserModel = models.User || model("User", UserSchema);
