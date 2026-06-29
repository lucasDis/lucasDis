/**
 * Shared server action result shape. New server actions should import
 * this instead of redeclaring their own `ActionResult` type.
 */
export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
