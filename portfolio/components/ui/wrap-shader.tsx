"use client";

import { Warp } from "@paper-design/shaders-react";
import { RoleCycler } from "@/components/public/home/RoleCycler";

/**
 * WarpShaderHero
 *
 * Layout (vertical, centered):
 *   1. Eyebrow — "Portfolio 2026"
 *   2. Name    — two lines on mobile/tablet, one line on large screens:
 *                  mobile/md : "Lucas" / "Ruiz Díaz"  (each line as big as possible)
 *                  lg+       : "Lucas Ruiz Díaz"       (single line, clamp)
 *   3. RoleCycler — animated role cycling
 */
export default function WarpShaderHero({ eyebrow }: { eyebrow?: string }) {
  return (
    <section
      id="welcome"
      className="relative h-[100dvh] min-h-[100dvh] lg:h-screen lg:min-h-screen flex flex-col items-center justify-center overflow-hidden bg-primary"
    >
      {/* Shader background */}
      <div className="absolute inset-0 z-0">
        <Warp
          style={{ height: "100%", width: "100%" }}
          proportion={0.45}
          softness={1}
          distortion={0.25}
          swirl={0.8}
          swirlIterations={10}
          shape="checks"
          shapeScale={0.1}
          scale={1}
          rotation={0}
          speed={1.0}
          colors={["#1a3a3a", "#ff4d8b", "#b8a4ed", "#ffb084"]}
        />
        <div className="absolute inset-0 bg-primary/45 backdrop-blur-[1px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center gap-4 px-6 select-none w-full">

        {/* Eyebrow */}
        {eyebrow && (
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/70">
            {eyebrow}
          </p>
        )}

        {/*
          Name — two-line on mobile/tablet, one-line on lg+.
          Each span fills the available width via vw-based font size.
          lg:hidden / hidden lg:block swap between the two layouts.
        */}
        <h1 data-magnetic className="font-bold text-white leading-[0.92] tracking-tight w-full" style={{ letterSpacing: "-0.04em" }}>
          {/* Mobile / tablet — stacked */}
          <span className="block lg:hidden">
            <span
              className="block"
              style={{ fontSize: "clamp(72px, 22vw, 140px)" }}
            >
              Lucas
            </span>
            <span
              className="block"
              style={{ fontSize: "clamp(52px, 16vw, 108px)" }}
            >
              Ruiz Díaz
            </span>
          </span>

          {/* Desktop — single line */}
          <span
            className="hidden lg:block"
            style={{ fontSize: "clamp(72px, 10vw, 200px)" }}
          >
            Lucas Ruiz Díaz
          </span>
        </h1>

        {/* Role cycler */}
        <div className="text-[18px] md:text-[22px] font-light text-white/80 h-8 flex items-center">
          <RoleCycler />
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#proyectos"
        aria-label="Scroll a proyectos"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/50 hover:text-white transition-colors group cursor-pointer"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60 group-hover:text-white transition-colors">
          Scroll
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-bounce text-white/60 group-hover:text-white"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </a>
    </section>
  );
}
