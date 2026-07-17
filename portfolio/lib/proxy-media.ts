/**
 * Media proxy utilities.
 *
 * All project media (images) is served through /api/media so the browser
 * never makes a direct cross-origin request to external CDNs. Videos are
 * served directly because the browser's <video> media engine handles
 * cross-origin natively (no CORS enforcement) and large files can't be
 * streamed through Vercel serverless/edge functions.
 *
 * ImageKit URL transformations are applied to BOTH types to cap quality
 * and resolution, preventing bandwidth exhaustion on the free tier (which
 * causes the "one failure breaks everything" contagion effect).
 */

/** CDN hostnames (and their subdomains) that the proxy is allowed to fetch. */
export const PROXY_ALLOWED_HOSTNAMES = [
  "ik.imagekit.io",
  "ufs.sh",       // UploadThing — matches *.ufs.sh via endsWith check
  "utfs.io",      // UploadThing legacy domain
  "imagekit.io",  // ImageKit sub-accounts
];

/**
 * Returns true when `hostname` matches an allowed CDN entry.
 * A dot-prefixed match handles arbitrary subdomains (e.g. lym9dklurz.ufs.sh).
 */
export function isAllowedHostname(hostname: string): boolean {
  return PROXY_ALLOWED_HOSTNAMES.some(
    (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`)
  );
}

/**
 * Appends ImageKit URL transformation parameters to cap resolution and
 * quality for IMAGES ONLY.
 *
 * ⚠️  Video transformations are intentionally excluded. ImageKit bills
 * video transcoding (any ?tr= on a video URL) against a separate
 * "video processing units" quota (500 units/month on the free tier).
 * Each transcode of a large video can consume many units. Requesting the
 * original video URL WITHOUT ?tr= serves the file directly from storage
 * without triggering any processing.
 *
 * Images → max 1920 px wide, 80% quality (ImageKit auto-selects WebP)
 *
 * No-ops if the URL is not from ImageKit, already has a `tr` param,
 * or the mediaType is "video".
 */
function applyImageKitTransforms(
  url: string,
  mediaType?: "image" | "video" | string
): string {
  // Never transform videos — see note above
  if (mediaType === "video") return url;

  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("imagekit.io")) return url;
    if (parsed.searchParams.has("tr")) return url;

    parsed.searchParams.set("tr", "q-80,w-1920");
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Converts an external media URL into a local proxy URL for images, or
 * returns an optimized CDN URL directly for videos.
 *
 * ImageKit transformations are applied before proxying or returning so
 * that bandwidth consumption stays within free-tier limits.
 */
export function proxyMediaUrl(
  url: string,
  mediaType?: "image" | "video" | string
): string {
  if (!url) return url;

  // Apply ImageKit quality/size caps for both images and videos.
  const optimized = applyImageKitTransforms(url, mediaType);

  // Videos bypass the proxy entirely — they stream fine directly from the CDN.
  if (mediaType === "video") return optimized;

  try {
    const { hostname, protocol } = new URL(optimized);
    // Only proxy https external URLs from known CDNs
    if (protocol !== "https:" || !isAllowedHostname(hostname)) return optimized;
  } catch {
    // Relative or malformed URL — return as-is
    return optimized;
  }

  return `/api/media?url=${encodeURIComponent(optimized)}`;
}
