"use client";

/**
 * BackgroundBlobs — ambient color blobs drifting randomly behind content.
 *
 * Each blob:
 *  - Uses one of the brand colors (pink / teal / lavender / peach / mint)
 *  - Heavy blur (55–80px) + low opacity (0.22) so they feather out softly
 *  - JS-driven RANDOM idle motion: every 3–8s picks a new target offset
 *    (±40px on x and y) and eases toward it. No predictable loops.
 *  - Scroll parallax via --scroll-offset (CSS custom property), updated
 *    by a requestAnimationFrame-bound scroll listener.
 *  - Honors prefers-reduced-motion: no idle motion, no scroll parallax.
 *
 * Stacking: position fixed, z-index 0, pointer-events none. Page sections
 * are bg-transparent so the body canvas + blobs read through; section
 * content (text, images) still paints above the blobs because the blobs
 * come earlier in document order at the same z-index.
 */

import { useEffect, useRef } from "react";

type BlobConfig = {
  id: number;
  color: string;
  size: number;
  top: string;
  left: string;
  speed: number;
  blur: number;
};

const BLOBS: BlobConfig[] = [
  {
    id: 1,
    color: "var(--color-brand-pink)",
    size: 260,
    top: "8%",
    left: "4%",
    speed: 0.12,
    blur: 70,
  },
  {
    id: 2,
    color: "var(--color-brand-teal)",
    size: 180,
    top: "32%",
    left: "78%",
    speed: 0.18,
    blur: 60,
  },
  {
    id: 3,
    color: "var(--color-brand-lavender)",
    size: 320,
    top: "62%",
    left: "10%",
    speed: 0.08,
    blur: 80,
  },
  {
    id: 4,
    color: "var(--color-brand-peach)",
    size: 150,
    top: "20%",
    left: "62%",
    speed: 0.15,
    blur: 55,
  },
  {
    id: 5,
    color: "var(--color-brand-mint)",
    size: 220,
    top: "84%",
    left: "72%",
    speed: 0.1,
    blur: 65,
  },
];

type BlobState = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  start: number;
  dur: number;
};

export function BackgroundBlobs() {
  const refs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const motionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    if (motionQuery.matches) return;

    // ── Random idle motion state per blob ─────────────────────────────
    const state: BlobState[] = BLOBS.map(() => ({
      x: 0,
      y: 0,
      tx: 0,
      ty: 0,
      start: 0,
      dur: 0,
    }));

    const pickNewTarget = (s: BlobState, now: number) => {
      s.tx = (Math.random() - 0.5) * 80;
      s.ty = (Math.random() - 0.5) * 80;
      s.start = now;
      s.dur = 3000 + Math.random() * 5000;
    };

    const t0 = performance.now();
    state.forEach((s) => pickNewTarget(s, t0));

    let motionRaf: number | null = null;
    const animateMotion = (now: number) => {
      for (let i = 0; i < state.length; i++) {
        const s = state[i];
        const el = refs.current[i];
        if (!el) continue;

        const elapsed = now - s.start;
        if (elapsed >= s.dur) {
          pickNewTarget(s, now);
        }
        const t = Math.min(elapsed / s.dur, 1);
        // ease-in-out cubic
        const eased =
          t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        s.x = s.tx * eased;
        s.y = s.ty * eased;

        el.style.setProperty("--float-x", `${s.x.toFixed(2)}px`);
        el.style.setProperty("--float-y", `${s.y.toFixed(2)}px`);
      }
      motionRaf = window.requestAnimationFrame(animateMotion);
    };
    motionRaf = window.requestAnimationFrame(animateMotion);

    // ── Scroll parallax ───────────────────────────────────────────────
    let scrollRaf: number | null = null;

    const updateScroll = () => {
      scrollRaf = null;
      const scrollY = window.scrollY;
      for (let i = 0; i < BLOBS.length; i++) {
        const el = refs.current[i];
        if (!el) continue;
        const offset = -scrollY * BLOBS[i].speed;
        el.style.setProperty("--scroll-offset", `${offset.toFixed(2)}px`);
      }
    };

    const onScroll = () => {
      if (scrollRaf !== null) return;
      scrollRaf = window.requestAnimationFrame(updateScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateScroll();

    return () => {
      if (motionRaf !== null) window.cancelAnimationFrame(motionRaf);
      if (scrollRaf !== null) window.cancelAnimationFrame(scrollRaf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div aria-hidden="true" className="bg-blobs">
      {BLOBS.map((blob, i) => (
        <div
          key={blob.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="bg-blob"
          style={{
            width: blob.size,
            height: blob.size,
            top: blob.top,
            left: blob.left,
            background: blob.color,
            filter: `blur(${blob.blur}px)`,
          }}
        />
      ))}
    </div>
  );
}