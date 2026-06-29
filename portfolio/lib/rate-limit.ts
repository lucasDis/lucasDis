import { dbConnect } from "./db";
import { RateLimitHitModel } from "@/models/RateLimitHit";

/**
 * Fixed-window rate limiter backed by Mongo. Returns `true` if the
 * caller is still within `limit` hits for `key` during the last
 * `windowSeconds`, recording this attempt. Returns `false` once the
 * window is exhausted (the attempt is NOT recorded, so retrying inside
 * the same window doesn't keep extending it).
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  await dbConnect();

  const windowStart = new Date(Date.now() - windowSeconds * 1000);
  const count = await RateLimitHitModel.countDocuments({
    key,
    createdAt: { $gte: windowStart },
  });

  if (count >= limit) return false;

  await RateLimitHitModel.create({ key });
  return true;
}

/** Best-effort client IP from standard proxy headers (Vercel sets these). */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
