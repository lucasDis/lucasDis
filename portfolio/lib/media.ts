/**
 * Helper to get a proxied URL for hotlink-protected media files (like Terabox).
 * If the URL belongs to Terabox domains, it returns the local proxy API route.
 * Otherwise, it returns the URL unchanged.
 */
export function getProxiedUrl(url: string | null | undefined): string {
  if (!url) return "";

  // Check for common Terabox domains
  const isTerabox =
    /terabox/i.test(url) ||
    /1024tera/i.test(url) ||
    /nephobox/i.test(url) ||
    /dubox/i.test(url) ||
    /playterabox/i.test(url);

  if (isTerabox) {
    return `/api/proxy-media?url=${encodeURIComponent(url)}`;
  }

  return url;
}
