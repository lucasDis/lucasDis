"use client";

import { useEffect, useState } from "react";

export function FloatingScrollNav() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button only when scrolled past 300px (away from Hero)
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToHero = () => {
    const el = document.getElementById("welcome");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 md:right-6 md:bottom-6">
      {/* Scroll to Top Button */}
      <button
        onClick={scrollToHero}
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-hairline bg-canvas text-ink shadow-lg transition hover:-translate-y-1 hover:bg-surface-soft active:translate-y-0"
        aria-label="Volver al inicio"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>
    </div>
  );
}
