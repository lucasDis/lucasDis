"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

/**
 * CustomCursor
 *
 * Two layers:
 *   1. RING — large pink circle (brand-pink, semi-transparent), lerp-follow, div
 *   2. DOT  — small black circle (8px), snappy GSAP quickTo
 *
 * Hover over interactives → dot hides, ring grows slightly
 * Hover over data-cursor-none → both hidden (element has own cursor)
 * data-cursor-outlined → fills white/dark on hover (via CSS)
 *
 * Magnetic: data-magnetic elements shift max 2px toward cursor
 *
 * Disabled on touch + prefers-reduced-motion
 */

const DOT_SIZE    = 8;
const RING_SIZE   = 36;  // ring diameter normal
const RING_HOVER  = 48;  // ring diameter on hover over interactives
const MAGNETIC_MAX = 2;  // px — very subtle

export function CustomCursor() {
  const pathname = usePathname();
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // Disable custom cursor in admin dashboard — use default browser cursor
  if (pathname?.includes("/admin")) {
    return null;
  }

  useEffect(() => {
    const isTouch   = window.matchMedia("(pointer: coarse)").matches;
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch) return;

    const dot  = dotRef.current!;
    const ring = ringRef.current!;

    // ── GSAP quickTo for both elements ───────────────────────────────────
    const dur = isReduced ? 0 : 0.15;
    const dotX  = gsap.quickTo(dot,  "x", { duration: dur,  ease: "power3.out" });
    const dotY  = gsap.quickTo(dot,  "y", { duration: dur,  ease: "power3.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power2.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power2.out" });

    let mouseX = -300, mouseY = -300;
    let isHovering = false;

    // Ring size helpers — animate via CSS transition
    const setRingSize = (size: number) => {
      ring.style.width  = `${size}px`;
      ring.style.height = `${size}px`;
    };

    // ── Magnetic elements ─────────────────────────────────────────────────
    type MagEl = { el: HTMLElement; qx: ReturnType<typeof gsap.quickTo>; qy: ReturnType<typeof gsap.quickTo> };
    let magEls: MagEl[] = [];

    const registerMagnetics = () => {
      magEls.forEach(({ el }) => gsap.set(el, { x: 0, y: 0 }));
      magEls = [];
      document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
        const qx = gsap.quickTo(el, "x", { duration: 0.3, ease: "power2.out" });
        const qy = gsap.quickTo(el, "y", { duration: 0.3, ease: "power2.out" });
        magEls.push({ el, qx, qy });
      });
    };
    registerMagnetics();

    const mo = new MutationObserver(registerMagnetics);
    mo.observe(document.body, { childList: true, subtree: true });

    // ── Interactive selector ──────────────────────────────────────────────
    const INTERACTIVE = [
      "a[href]", "button:not([disabled])", "input", "textarea", "select",
      '[role="button"]', '[role="link"]', "summary", "[data-magnetic]",
    ].join(",");

    // ── mousemove ─────────────────────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const target = e.target as Element | null;
      const half = parseInt(ring.style.width || `${RING_SIZE}`) / 2;

      // Own-cursor zone → suppress
      if (target?.closest("[data-cursor-none]")) {
        dot.style.opacity  = "0";
        ring.style.opacity = "0";
        magEls.forEach(({ qx, qy }) => { qx(0); qy(0); });
        return;
      }
      dot.style.opacity  = "1";
      ring.style.opacity = "1";

      // Move ring (centered via negative margin offset in style)
      ringX(mouseX - half);
      ringY(mouseY - half);

      // Move dot
      dotX(mouseX - DOT_SIZE / 2);
      dotY(mouseY - DOT_SIZE / 2);

      // Interactive hover state
      const interactive = !!target?.closest(INTERACTIVE);
      if (interactive !== isHovering) {
        isHovering = interactive;
        dot.style.opacity = interactive ? "0" : "1";
        setRingSize(interactive ? RING_HOVER : RING_SIZE);
      }

      // ── Magnetic ────────────────────────────────────────────────────────
      magEls.forEach(({ el, qx, qy }) => {
        const rect = el.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const dx   = mouseX - cx;
        const dy   = mouseY - cy;
        const dist = Math.hypot(dx, dy);
        const hit  = Math.max(rect.width, rect.height) * 0.7;

        if (dist < hit && dist > 0) {
          const t  = (hit - dist) / hit;
          qx(Math.sign(dx) * Math.min(MAGNETIC_MAX, Math.abs(dx) * t * 0.15));
          qy(Math.sign(dy) * Math.min(MAGNETIC_MAX, Math.abs(dy) * t * 0.15));
        } else {
          qx(0); qy(0);
        }
      });
    };

    document.addEventListener("mousemove", onMove, { passive: true });

    const onLeave = () => {
      dot.style.opacity  = "0";
      ring.style.opacity = "0";
    };
    document.addEventListener("mouseleave", onLeave);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      mo.disconnect();
      magEls.forEach(({ el }) => gsap.set(el, { x: 0, y: 0 }));
    };
  }, []);

  return (
    <>
      {/* Small black dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0, left: 0,
          width:  DOT_SIZE,
          height: DOT_SIZE,
          borderRadius: "50%",
          background: "#0a0a0a",
          pointerEvents: "none",
          zIndex: 9999,
          opacity: 0,
          willChange: "transform",
          transition: "opacity 120ms ease",
        }}
      />
      {/* Large pink ring/circle */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0, left: 0,
          width:  RING_SIZE,
          height: RING_SIZE,
          borderRadius: "50%",
          background: "var(--color-brand-pink, #ff4d8b)",
          opacity: 0,
          pointerEvents: "none",
          zIndex: 9998,
          willChange: "transform",
          transition: "opacity 200ms ease, width 200ms cubic-bezier(.4,0,.2,1), height 200ms cubic-bezier(.4,0,.2,1)",
          mixBlendMode: "multiply",
        }}
      />
    </>
  );
}
