import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return new NextResponse("Falta el parámetro 'url'", { status: 400 });
  }

  try {
    const parsedUrl = new URL(targetUrl);
    // Allow only http and https protocols
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return new NextResponse("Protocolo no soportado", { status: 400 });
    }

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        // Omit the Referer or set it to the target host to mimic direct access
        "Accept": "*/*",
      },
    });

    if (!response.ok) {
      return new NextResponse(
        `Error al obtener el recurso origen: ${response.statusText}`,
        { status: response.status }
      );
    }

    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    const body = response.body;

    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    return new NextResponse(`Error de proxy: ${error.message}`, { status: 500 });
  }
}
