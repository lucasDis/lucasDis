/**
 * Edge Runtime media proxy.
 *
 * GET /api/media?url=<encoded-cdn-url>
 *
 * Fetches the asset from the CDN server-side and streams it back to the
 * browser, bypassing any client-side CORS / referrer restrictions.
 *
 * Why Edge Runtime (not Node.js Serverless)?
 *  - No 10 s timeout on Vercel Hobby — Edge functions run on Cloudflare's
 *    network with a much higher execution ceiling.
 *  - Native Web Streams API: the response body is piped without buffering
 *    the entire file in memory.
 *  - No Node.js-specific `next: { revalidate }` needed — cache is handled
 *    via standard Cache-Control response headers.
 *
 * Security:
 *  - Only https: URLs from PROXY_ALLOWED_HOSTNAMES are forwarded.
 *
 * Video:
 *  - Videos bypass this proxy entirely (see proxy-media.ts) — the browser
 *    <video> element streams directly from the CDN. This route handles
 *    images and other static assets only.
 *
 * Caching:
 *  - Cache-Control headers tell the browser (and Vercel's CDN edge) to
 *    cache the response, avoiding repeated proxy round-trips.
 */
export const runtime = "edge";

import { type NextRequest, NextResponse } from "next/server";
import { isAllowedHostname } from "@/lib/proxy-media";

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

  // --- Fetch from CDN (Edge Runtime uses the native Web Fetch API) ---
  let upstream: Response;
  try {
    upstream = await fetch(rawUrl, {
      headers: {
        // Some CDNs require a user-agent to serve assets
        "User-Agent": "Mozilla/5.0 (compatible; portfolio-proxy/1.0)",
      },
      // Edge runtime: no Next.js cache extensions — we control caching
      // via Cache-Control on the *response* headers instead.
      cache: "no-store",
    });
  } catch (err) {
    console.error("[media-proxy] fetch error:", err);
    return new NextResponse("Failed to fetch upstream resource", { status: 502 });
  }

  if (!upstream.ok && upstream.status !== 206) {
    return new NextResponse(`Upstream error: ${upstream.status}`, {
      status: upstream.status,
    });
  }

  // --- Build response headers ---
  const responseHeaders = new Headers();

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

  // Cache in the browser for 1 h; Vercel CDN edge can cache for 24 h
  responseHeaders.set(
    "cache-control",
    "public, max-age=3600, stale-while-revalidate=86400"
  );

  // Stream the body back (Edge Runtime pipes ReadableStream natively)
  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
