"use client";

import { Warp } from "@paper-design/shaders-react";
import type { ReactNode } from "react";

interface WarpShaderHeroProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  children?: ReactNode;
}

export default function WarpShaderHero({
  title,
  subtitle,
  eyebrow,
  children,
}: WarpShaderHeroProps) {
  return (
    <section id="welcome" className="relative h-[calc(100vh-4rem)] min-h-150 flex flex-col items-center justify-center overflow-hidden py-16 md:py-24 px-6 bg-primary">
      {/* Background Shader */}
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
        {/* Dark overlay for contrast and WCAG compliance */}
        <div className="absolute inset-0 bg-primary/45 backdrop-blur-[1px]" />
      </div>

      {/* Hero content - Centered minimal card container aligned with other sections */}
      <div className="relative z-10 max-w-7xl w-full text-center p-8 md:p-12 rounded-3xl border border-white/5 bg-surface-soft/20 backdrop-blur-md shadow-lg space-y-6 select-none">
        {eyebrow && (
          <p className="text-caption-uppercase text-white/75 tracking-widest">
            {eyebrow}
          </p>
        )}

        <h1 className="text-on-dark text-display-md md:text-display-lg lg:text-display-xl font-medium tracking-tight text-balance">
          {title}
        </h1>

        {subtitle && (
          <p className="text-white/85 text-body-md md:text-title-md font-light leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      {/* Buttons container - Rendered outside the transparent panel */}
      {children && (
        <div className="relative z-10 flex flex-col sm:flex-row gap-3 justify-center items-center pt-8">
          {children}
        </div>
      )}
    </section>
  );
}
