"use client";

import { useEffect, useState } from "react";

const ROLES = ["Dise\u00f1ador Gr\u00e1fico", "Desarrollador Web"];
const FADE_MS = 280;   // fade-out / fade-in duration
const HOLD_MS = 5000;  // time each role is fully visible

/**
 * RoleCycler — alternates between roles with a clean fade+slide animation.
 * No dependencies beyond React. HOLD_MS between swaps, FADE_MS per transition.
 */
export function RoleCycler() {
  const [index, setIndex]     = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setVisible(false);
      // After fade-out completes, swap text and fade in
      const swap = setTimeout(() => {
        setIndex((i) => (i + 1) % ROLES.length);
        setVisible(true);
      }, FADE_MS);
      return () => clearTimeout(swap);
    }, HOLD_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <span
      aria-live="polite"
      style={{
        display: "inline-block",
        transition: `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(-6px)",
      }}
    >
      {ROLES[index]}
    </span>
  );
}
