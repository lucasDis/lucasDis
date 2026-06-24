import { useId } from "react";

/**
 * BlobsSvg — animated organic shapes that replace Clay's 3D claymation
 * illustrations (assets not available, see PROMPT §13.5).
 *
 * 4 organic SVG paths with brand-color gradients. Floats gently via
 * `.float-slow` / `.float-medium` / `.float-fast` (keyframes in globals.css).
 *
 * Use:
 *   - variant="hero"   → 480px square, full hero band illustration
 *   - variant="compact" → 200px square, inline accents in feature cards / CTA
 *
 * `useId()` keeps gradient IDs unique across multiple instances on the same
 * page (SSR-safe, React 18+).
 */

export type BlobsVariant = "hero" | "compact";

interface BlobsSvgProps {
  variant?: BlobsVariant;
  className?: string;
}

export function BlobsSvg({
  variant = "hero",
  className = "",
}: BlobsSvgProps) {
  const size = variant === "hero" ? 480 : 200;
  const reactId = useId();
  const g1 = `${reactId}-g1`;
  const g2 = `${reactId}-g2`;
  const g3 = `${reactId}-g3`;
  const g4 = `${reactId}-g4`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id={g1} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff4d8b" />
          <stop offset="100%" stopColor="#ff6b5a" />
        </linearGradient>
        <linearGradient id={g2} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b8a4ed" />
          <stop offset="100%" stopColor="#ffb084" />
        </linearGradient>
        <linearGradient id={g3} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e8b94a" />
          <stop offset="100%" stopColor="#a4d4c5" />
        </linearGradient>
        <linearGradient id={g4} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a4d4c5" />
          <stop offset="100%" stopColor="#1a3a3a" />
        </linearGradient>
      </defs>

      {/* Blob 1 — large pink/coral, top-right */}
      <path
        d="M 250,40 C 320,40 370,100 380,170 C 390,240 340,300 260,310 C 180,320 120,260 130,200 C 140,140 180,40 250,40 Z"
        fill={`url(#${g1})`}
        className="float-slow"
      />

      {/* Blob 2 — medium lavender/peach, mid-left */}
      <path
        d="M 130,140 C 90,160 80,230 130,270 C 180,310 240,290 260,240 C 280,190 250,140 200,120 C 170,110 150,130 130,140 Z"
        fill={`url(#${g2})`}
        className="float-medium"
      />

      {/* Blob 3 — medium ochre/mint, bottom-right */}
      <path
        d="M 280,230 C 330,220 360,260 350,310 C 340,360 290,380 240,360 C 190,340 180,290 220,250 C 240,230 260,235 280,230 Z"
        fill={`url(#${g3})`}
        className="float-fast"
      />

      {/* Blob 4 — small mint accent, bottom-left */}
      <path
        d="M 80,290 C 100,280 130,290 130,310 C 130,330 110,340 90,330 C 70,320 60,300 80,290 Z"
        fill={`url(#${g4})`}
        className="float-slow"
      />
    </svg>
  );
}
