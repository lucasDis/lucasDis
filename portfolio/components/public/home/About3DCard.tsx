"use client";

import { useEffect, useRef, useState } from "react";

/**
 * About3DCard — Client Component.
 *
 * Three-layer parallax stack (803x729 each):
 *   Z=0px  : fluid art background  (about-bg.png)
 *   Z=40px : card frame / trim     (about-mid.png)
 *   Z=90px : face photo            (about-front.png)
 *
 * Desktop  : mouse-tracking, instant follow, spring-back on leave.
 * Mobile   : DeviceOrientation (gyroscope).
 *   - Android / iOS ≤12 : no permission needed, works automatically.
 *   - iOS 13+           : requires one user tap; shows a subtle hint
 *                         on the card. No modal, no forced popup.
 *   If the device has no gyroscope the card stays static — no errors.
 */

// ─── helpers ────────────────────────────────────────────────────────────────

/** Clamp a value between -max and +max */
const clamp = (v: number, max: number) => Math.min(Math.max(v, -max), max);

/** Neutral transform string used for reset */
const NEUTRAL = "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";

// ─── component ──────────────────────────────────────────────────────────────

export function About3DCard({ name: _name }: { name: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  // iOS 13+ permission state
  // "unknown"  : not yet tested
  // "needed"   : requestPermission exists but not granted yet
  // "granted"  : gyro is active
  // "denied"   : user denied or not available
  const [gyroState, setGyroState] = useState<"unknown" | "needed" | "granted" | "denied">("unknown");

  // ── Gyroscope setup (mobile only) ──────────────────────────────────────
  useEffect(() => {
    // Only activate on touch devices
    if (typeof window === "undefined" || !("ontouchstart" in window)) return;
    if (!window.DeviceOrientationEvent) { setGyroState("denied"); return; }

    const applyOrientation = (e: DeviceOrientationEvent) => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      // beta  : front-back tilt  (-180..180) → rotateX
      // gamma : left-right tilt  (-90..90)   → rotateY
      const rx = clamp((e.beta  ?? 0) - 45, 20); // offset 45° so neutral feels natural
      const ry = clamp(e.gamma ?? 0, 20);
      wrap.style.transition = "none";
      wrap.style.transform = `perspective(900px) rotateX(${-rx * 0.5}deg) rotateY(${ry * 0.5}deg) scale3d(1,1,1)`;
    };

    // Android + iOS ≤12: attach directly, no permission API
    const DOEA = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof DOEA.requestPermission !== "function") {
      window.addEventListener("deviceorientation", applyOrientation, true);
      setGyroState("granted");
      return () => window.removeEventListener("deviceorientation", applyOrientation, true);
    }

    // iOS 13+: permission required — flag it, wait for user tap
    setGyroState("needed");
    return;
  }, []);

  // ── iOS 13+ tap-to-enable handler ──────────────────────────────────────
  const requestGyro = async () => {
    const DOEA = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof DOEA.requestPermission !== "function") return;
    try {
      const result = await DOEA.requestPermission();
      if (result === "granted") {
        setGyroState("granted");
        const applyOrientation = (e: DeviceOrientationEvent) => {
          const wrap = wrapRef.current;
          if (!wrap) return;
          const rx = clamp((e.beta  ?? 0) - 45, 20);
          const ry = clamp(e.gamma ?? 0, 20);
          wrap.style.transition = "none";
          wrap.style.transform = `perspective(900px) rotateX(${-rx * 0.5}deg) rotateY(${ry * 0.5}deg) scale3d(1,1,1)`;
        };
        window.addEventListener("deviceorientation", applyOrientation, true);
      } else {
        setGyroState("denied");
      }
    } catch {
      setGyroState("denied");
    }
  };

  // ── Desktop mouse handlers ──────────────────────────────────────────────
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    wrap.style.transition = "none";
    const rect = wrap.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    wrap.style.transform = `perspective(900px) rotateX(${-y * 12}deg) rotateY(${x * 12}deg) scale3d(1,1,1)`;
  };

  const handleMouseLeave = () => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    requestAnimationFrame(() => {
      wrap.style.transition = "transform 500ms cubic-bezier(.4,0,.2,1)";
      wrap.style.transform = NEUTRAL;
    });
  };

  // ── Shared layer style ──────────────────────────────────────────────────
  const layerBase: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    userSelect: "none",
    pointerEvents: "none",
  };

  return (
    <div className="flex items-center justify-center select-none w-full">
      <div style={{ width: "100%", maxWidth: 803, position: "relative" }}>

        {/* iOS 13+ tap-to-enable hint */}
        {gyroState === "needed" && (
          <button
            onClick={requestGyro}
            aria-label="Activar efecto de movimiento"
            style={{
              position: "absolute",
              bottom: 12,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 9999,
              border: "1px solid rgba(255,77,139,0.3)",
              background: "rgba(255,250,240,0.85)",
              backdropFilter: "blur(6px)",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--color-brand-pink)",
              cursor: "pointer",
              letterSpacing: "0.4px",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            Tap para activar movimiento
          </button>
        )}

        {/* Tilt container */}
        <div
          ref={wrapRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "803 / 729",
            transformStyle: "preserve-3d",
            willChange: "transform",
            cursor: "default",
            transform: NEUTRAL,
          }}
        >
          {/* Layer 1: fondo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/about/about-bg.png" alt="" aria-hidden="true" draggable={false}
            style={{ ...layerBase, transform: "translateZ(0px)" }} />

          {/* Layer 2: medio */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/about/about-mid.png" alt="" aria-hidden="true" draggable={false}
            style={{ ...layerBase, transform: "translateZ(40px)" }} />

          {/* Layer 3: adelante */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/about/about-front.png" alt="Lucas Ruiz Diaz" draggable={false}
            style={{ ...layerBase, transform: "translateZ(90px)" }} />
        </div>
      </div>
    </div>
  );
}
