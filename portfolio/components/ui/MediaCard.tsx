"use client";

import { useState } from "react";
import type { ValidateUrlResult } from "@/app/api/media/validate-url/route";

interface MediaCardProps {
  url: string;
  type: "image" | "video";
  alt: string;
}

type ValidationState =
  | { status: "idle" }
  | { status: "validating" }
  | { status: "valid"; result: ValidateUrlResult }
  | { status: "invalid"; result: ValidateUrlResult }
  | { status: "error"; message: string };

export function MediaCard({ url, type, alt }: MediaCardProps) {
  const [validation, setValidation] = useState<ValidationState>({ status: "idle" });
  const [previewError, setPreviewError] = useState(false);

  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return (
      <div className="media-card media-card--idle">
        <span className="media-card-empty-label">Enter a URL to preview</span>
      </div>
    );
  }

  async function handleValidate() {
    setValidation({ status: "validating" });
    try {
      const res = await fetch(`/api/media/validate-url?url=${encodeURIComponent(trimmedUrl)}`);
      const data: ValidateUrlResult = await res.json();
      setValidation({ status: data.isRenderable ? "valid" : "invalid", result: data });
    } catch (err) {
      setValidation({ status: "error", message: err instanceof Error ? err.message : "Unexpected error." });
    }
  }

  return (
    <div className="media-card">
      <div className="media-card-preview">
        {type === "video" ? (
          <video src={trimmedUrl} controls={false} preload="metadata"
            className="media-card-preview-media" onError={() => setPreviewError(true)} aria-label={alt || "Video preview"} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={trimmedUrl} alt={alt || "Image preview"} referrerPolicy="no-referrer"
            className="media-card-preview-media" onError={() => setPreviewError(true)} onLoad={() => setPreviewError(false)} />
        )}
        {previewError && (
          <div className="media-card-preview-error">
            <span className="media-card-preview-error-icon" aria-hidden="true">{type === "video" ? "▶" : "🖼"}</span>
            <span>Preview unavailable</span>
          </div>
        )}
      </div>

      <div className="media-card-actions">
        <button type="button" onClick={handleValidate} disabled={validation.status === "validating"} className="media-card-validate-btn">
          {validation.status === "validating" ? "Validating…" : "Validate URL"}
        </button>
        <a href={trimmedUrl} target="_blank" rel="noopener noreferrer" className="media-card-open-link">Open ↗</a>
      </div>

      {validation.status === "valid" && (
        <div className="media-card-result media-card-result--ok">
          <span aria-hidden="true">✓</span>
          <span>Renderable — <code>{validation.result.mimeType}</code></span>
        </div>
      )}
      {(validation.status === "invalid" || validation.status === "error") && (
        <div className="media-card-result media-card-result--error">
          <span aria-hidden="true">✗</span>
          <span>{validation.status === "invalid" ? validation.result.reason : validation.message}</span>
        </div>
      )}
    </div>
  );
}
