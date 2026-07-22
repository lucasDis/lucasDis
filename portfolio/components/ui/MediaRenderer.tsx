"use client";

import { useState, useEffect, useRef, useId } from "react";
import { proxyMediaUrl } from "@/lib/proxy-media";

export type MediaRendererProps = {
  src: string;
  alt?: string;
  title?: string;
  type?: "image" | "video" | "unknown";
  className?: string;
  aspectRatio?: string;
  onLoad?: () => void;
  onError?: () => void;
  autoPlay?: boolean;
  controls?: boolean;
};

type RenderState = "loading" | "loaded" | "error";

function getEmbedUrl(url: string): string | null {
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i
  );
  if (ytMatch?.[1]) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/i);
  if (vimeoMatch?.[1]) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
}

function Skeleton({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="media-renderer-skeleton"
      style={{ opacity: visible ? 1 : 0, pointerEvents: "none", transition: "opacity 200ms ease" }}
    />
  );
}

function Fallback({ alt, type, src }: { alt: string; type: string; src: string }) {
  return (
    <div className="media-renderer-fallback">
      <span className="media-renderer-fallback-icon" aria-hidden="true">
        {type === "video" ? "▶" : "🖼"}
      </span>
      <span className="media-renderer-fallback-label">
        {type === "video" ? "Video unavailable" : "Image unavailable"}
      </span>
      {alt && <span className="media-renderer-fallback-alt">{alt}</span>}
      {src && (
        <a href={src} target="_blank" rel="noopener noreferrer" className="media-renderer-fallback-link" onClick={(e) => e.stopPropagation()}>
          Open original ↗
        </a>
      )}
    </div>
  );
}

export function MediaRenderer({
  src,
  alt = "",
  title,
  type = "image",
  className = "",
  aspectRatio = "aspect-video",
  onLoad,
  onError,
  autoPlay,
  controls = true,
}: MediaRendererProps) {
  // Images go through the server-side proxy to bypass CORS.
  // Videos are served directly — the browser media engine handles cross-origin
  // video without the same restrictions, and large files can't be proxied
  // through Vercel serverless functions.
  const proxied = proxyMediaUrl(src, type);
  const [state, setState] = useState<RenderState>(!src ? "error" : "loading");
  const imgRef = useRef<HTMLImageElement>(null);
  const id = useId();

  const handleLoad = () => { setState("loaded"); onLoad?.(); };
  const handleError = () => { setState("error"); onError?.(); };

  useEffect(() => {
    if (type !== "image" || !src) return;
    const img = imgRef.current;
    if (!img) return;
    if (img.complete && img.naturalWidth > 0) handleLoad();
    else if (img.complete && img.naturalWidth === 0) handleError();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proxied, type]);

  const wrapClass = ["media-renderer-wrap", aspectRatio, className].filter(Boolean).join(" ");

  if (type === "video") {
    const embedUrl = getEmbedUrl(src);  // embed detection uses original URL
    if (embedUrl) {
      return (
        <div className={wrapClass}>
          <Skeleton visible={state === "loading"} />
          <iframe id={id} src={embedUrl} title={alt || "Video"} className="media-renderer-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen onLoad={handleLoad} />
        </div>
      );
    }
    return (
      <div className={wrapClass}>
        {state === "error" ? <Fallback alt={alt} type="video" src={src} /> : (
          <>
            <Skeleton visible={state === "loading"} />
            {/* Videos served directly from CDN — no proxy needed */}
            <video id={id} src={src} aria-label={alt} autoPlay={autoPlay} controls={controls} preload="metadata"
              className="media-renderer-video" onLoadedMetadata={handleLoad} onError={handleError} />
          </>
        )}
      </div>
    );
  }

  return (
    <div className={wrapClass}>
      {state === "error" ? <Fallback alt={alt} type={type} src={src} /> : (
        <>
          <Skeleton visible={state === "loading"} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={imgRef} id={id} src={proxied} alt={alt} title={title}
            loading="lazy" decoding="async"
            className="media-renderer-img" onLoad={handleLoad} onError={handleError} />
        </>
      )}
    </div>
  );
}
