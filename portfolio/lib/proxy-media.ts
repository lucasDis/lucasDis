/**
 * Media proxy utilities.
 *
 * All project media (images and videos) is served through /api/media so the
 * browser never makes a direct cross-origin request to external CDNs. This
 * eliminates CORS and referrer-policy issues regardless of which CDN hosts
 * the asset (ImageKit, UploadThing, etc.).
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
 * Converts an external media URL into a local proxy URL.
 * Only URLs from allowed CDN hostnames are proxied; everything else is
 * returned as-is (local /public assets, data URIs, etc.).
 */
export function proxyMediaUrl(url: string): string {
  if (!url) return url;

  try {
    const { hostname, protocol } = new URL(url);
    // Only proxy https external URLs from known CDNs
    if (protocol !== "https:" || !isAllowedHostname(hostname)) return url;
  } catch {
    // Relative or malformed URL — return as-is
    return url;
  }

  return `/api/media?url=${encodeURIComponent(url)}`;
}
