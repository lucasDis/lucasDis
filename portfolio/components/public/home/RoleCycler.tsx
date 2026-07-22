"use client";

import { useEffect, useState } from "react";

const ROLES = ["Diseñador Gráfico", "Desarrollador Web", "UX/UI Designer"];
const FADE_MS = 320;   // fade-out / fade-in duration
const HOLD_MS = 2800;  // time each role is fully visible

/**
 * RoleCycler — cycles through roles with a clean fade + slight upward slide.
 * Three roles: Diseñador Gráfico / Desarrollador Web / UX/UI Designer
 */
export function RoleCycler() {
  const [index, setIndex]     = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      const swap = setTimeout(() => {
        setIndex((i) => (i + 1) % ROLES.length);
        setVisible(true);
      }, FADE_MS);
      return () => clearTimeout(swap);
    }, HOLD_MS + FADE_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <span
      aria-live="polite"
      style={{
        display: "inline-block",
        transition: `opacity ${FADE_MS}ms cubic-bezier(.4,0,.2,1), transform ${FADE_MS}ms cubic-bezier(.4,0,.2,1)`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(-8px)",
      }}
    >
      {ROLES[index]}
    </span>
  );
}
