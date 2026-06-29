import { Schema, model, models } from "mongoose";

/**
 * RateLimitHit — one document per request attempt against a rate-limited
 * action. `key` scopes the bucket (e.g. `contact:<ip>`); `createdAt` has a
 * TTL index so old hits self-clean, no cron needed.
 *
 * Mongo-backed (not in-memory) because server actions run on serverless
 * functions with no shared process memory across invocations.
 */
const RateLimitHitSchema = new Schema({
  key: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 },
});

export const RateLimitHitModel =
  models.RateLimitHit || model("RateLimitHit", RateLimitHitSchema);
