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
    <section id="welcome" className="relative h-[calc(100vh-4rem)] min-h-[600px] flex items-center justify-center overflow-hidden py-24 px-6 bg-primary">
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
          speed={0.4}
          colors={["#1a3a3a", "#ff4d8b", "#b8a4ed", "#ffb084"]}
        />
        {/* Dark overlay for contrast and WCAG AA accessibility compliance */}
        <div className="absolute inset-0 bg-primary/45 backdrop-blur-[1px]" />
      </div>

      {/* Hero content */}
      <div className="relative z-10 max-w-4xl w-full text-center space-y-6">
        {eyebrow && (
          <p className="text-caption-uppercase text-on-dark-soft tracking-widest">
            {eyebrow}
          </p>
        )}

        <h1 className="text-on-dark text-display-lg lg:text-display-xl font-medium tracking-tight text-balance">
          {title}
        </h1>

        {subtitle && (
          <p className="text-on-dark-soft text-title-md md:text-title-lg font-light leading-relaxed max-w-3xl mx-auto">
            {subtitle}
          </p>
        )}

        {children && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-8">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
