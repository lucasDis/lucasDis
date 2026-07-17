import { NextRequest, NextResponse } from "next/server";
import { isAllowedHostname } from "@/lib/proxy-media";

/**
 * GET /api/media?url=<encoded-cdn-url>
 *
 * Server-side media proxy. Fetches the asset from the CDN and streams it
 * back to the browser, bypassing any client-side CORS / referrer restrictions.
 *
 * Security:
 *  - Only hostnames in PROXY_ALLOWED_HOSTNAMES are forwarded.
 *  - Only https: protocol is accepted.
 *
 * Video support:
 *  - Forwards the Range header so browsers can seek videos correctly
 *    (the CDN returns 206 Partial Content; we forward that status too).
 *
 * Caching:
 *  - Sets Cache-Control so the browser and CDN edge cache the response,
 *    avoiding repeated proxy round-trips for the same asset.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawUrl = searchParams.get("url");

  // --- Validate input ---
  if (!rawUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(rawUrl);
  } catch {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  if (targetUrl.protocol !== "https:") {
    return new NextResponse("Only https URLs are allowed", { status: 403 });
  }

  if (!isAllowedHostname(targetUrl.hostname)) {
    return new NextResponse("Domain not allowed", { status: 403 });
  }

  // --- Build upstream request headers ---
  const upstreamHeaders: Record<string, string> = {
    // Identify ourselves — some CDNs require a user-agent
    "User-Agent": "Mozilla/5.0 (compatible; portfolio-proxy/1.0)",
  };

  // Forward Range for video seeking (206 Partial Content)
  const range = request.headers.get("range");
  if (range) upstreamHeaders["Range"] = range;

  // --- Fetch from CDN ---
  let upstream: Response;
  try {
    upstream = await fetch(rawUrl, {
      headers: upstreamHeaders,
      // Next.js fetch cache: revalidate after 1 h so the proxy isn't a
      // bottleneck while still being fast for repeated requests.
      next: { revalidate: 3600 },
    });
  } catch (err) {
    console.error("[media-proxy] fetch error:", err);
    return new NextResponse("Failed to fetch upstream resource", { status: 502 });
  }

  // --- Build response headers ---
  const responseHeaders = new Headers();

  // Forward content headers the browser needs
  const forward = [
    "content-type",
    "content-length",
    "content-range",
    "accept-ranges",
    "last-modified",
    "etag",
  ] as const;

  for (const header of forward) {
    const value = upstream.headers.get(header);
    if (value) responseHeaders.set(header, value);
  }

  // Cache in the browser for 1 h; allow CDN edge caching for 24 h
  responseHeaders.set(
    "cache-control",
    "public, max-age=3600, stale-while-revalidate=86400"
  );

  // Stream the body back with the correct status (200 or 206)
  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
