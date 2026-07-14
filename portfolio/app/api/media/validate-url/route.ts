import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export type MediaType = "image" | "video" | "unknown";

export interface ValidateUrlResult {
  ok: boolean;
  isRenderable: boolean;
  type: MediaType;
  mimeType: string | null;
  finalUrl: string;
  reason: string | null;
}

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif", "gif", "svg"];
const VIDEO_EXTENSIONS = ["mp4", "webm", "mov", "m4v", "avi", "mkv"];

function typeFromMime(mime: string | null): MediaType {
  if (!mime) return "unknown";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return "unknown";
}

function typeFromExtension(pathname: string): MediaType {
  const ext = pathname.split(".").pop()?.toLowerCase() ?? "";
  if (IMAGE_EXTENSIONS.includes(ext)) return "image";
  if (VIDEO_EXTENSIONS.includes(ext)) return "video";
  return "unknown";
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const targetUrl = new URL(request.url).searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json<ValidateUrlResult>({
      ok: false, isRenderable: false, type: "unknown",
      mimeType: null, finalUrl: "", reason: "Missing 'url' parameter.",
    });
  }

  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return NextResponse.json<ValidateUrlResult>({
      ok: false, isRenderable: false, type: "unknown",
      mimeType: null, finalUrl: targetUrl, reason: "Invalid URL.",
    });
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json<ValidateUrlResult>({
      ok: false, isRenderable: false, type: "unknown",
      mimeType: null, finalUrl: targetUrl, reason: "Only http/https URLs are supported.",
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  const fetchOpts = {
    signal: controller.signal,
    redirect: "follow" as const,
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; portfolio-validator/1.0)",
      Accept: "image/*,video/*,*/*;q=0.8",
    },
  };

  let response: Response | null = null;
  try {
    response = await fetch(targetUrl, { method: "HEAD", ...fetchOpts });
  } catch {
    try {
      response = await fetch(targetUrl, { method: "GET", ...fetchOpts, headers: { ...fetchOpts.headers, Range: "bytes=0-1023" } });
    } catch { /* both failed */ }
  } finally {
    clearTimeout(timeout);
  }

  if (!response) {
    return NextResponse.json<ValidateUrlResult>({
      ok: false, isRenderable: false, type: "unknown",
      mimeType: null, finalUrl: targetUrl,
      reason: "Could not reach the URL. It may be offline, blocked, or require authentication.",
    });
  }

  const finalUrl = response.url || targetUrl;
  const mimeType = response.headers.get("content-type")?.split(";")[0].trim() ?? null;

  if (!response.ok) {
    return NextResponse.json<ValidateUrlResult>({
      ok: false, isRenderable: false, type: "unknown",
      mimeType, finalUrl, reason: `Server returned HTTP ${response.status}.`,
    });
  }

  if (mimeType?.startsWith("text/html")) {
    return NextResponse.json<ValidateUrlResult>({
      ok: false, isRenderable: false, type: "unknown", mimeType, finalUrl,
      reason: "The URL returned an HTML page instead of a media file. Use a direct file URL ending in .jpg, .png, .mp4, etc.",
    });
  }

  const resolved = typeFromMime(mimeType) !== "unknown"
    ? typeFromMime(mimeType)
    : typeFromExtension(new URL(finalUrl).pathname);

  if (resolved === "unknown") {
    return NextResponse.json<ValidateUrlResult>({
      ok: true, isRenderable: false, type: "unknown",
      mimeType, finalUrl, reason: `Unsupported content type: '${mimeType ?? "unknown"}'.`,
    });
  }

  return NextResponse.json<ValidateUrlResult>({
    ok: true, isRenderable: true, type: resolved,
    mimeType, finalUrl, reason: null,
  });
}
