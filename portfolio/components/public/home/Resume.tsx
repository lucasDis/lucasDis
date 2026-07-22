"use client";

import { useState, useEffect } from "react";
import type { Locale } from "@/lib/i18n/settings";

interface ResumeProps {
  locale: Locale;
  // We specify labels explicitly to keep i18n dynamic and serializable
  labels: {
    eyebrow: string;
    title: string;
    subtitle: string;
    present: string;
    viewResume: string;
    ctaTitle: string;
    ctaSubtitle: string;
    close: string;
  };
}

export function Resume({ locale, labels }: ResumeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"es" | "en">("es");

  // Sync initial tab with current site language
  useEffect(() => {
    setActiveTab(locale === "en" ? "en" : "es");
  }, [locale]);

  // Listen to the global CustomEvent from Navbar to open this modal
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-cv-modal", handleOpen);
    return () => {
      window.removeEventListener("open-cv-modal", handleOpen);
    };
  }, []);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  // Escape key support
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  const pdfUrl = activeTab === "en" ? "/cv/cv-lucas-en.pdf" : "/cv/cv-lucas-es.pdf";

  return (
    <section
      id="cv"
      aria-label={labels.title}
      className="w-full bg-surface-soft border-y border-[#e5e5e5] text-ink select-none"
    >
      {/* Full width container, aligned matching hero layout spacing */}
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-20 flex flex-col items-center text-center">
        
        {/* Single title */}
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-[#0a0a0a] leading-none mb-2">
          Trayectoria
        </h2>

        {/* CTA Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setIsOpen(true)}
            className="inline-flex h-12 items-center justify-center px-8 bg-[#0a0a0a] text-white rounded-full hover:bg-body-strong active:scale-95 transition-all duration-300 font-semibold text-button shadow-md cursor-pointer"
          >
            {labels.viewResume}
          </button>
        </div>
      </div>

      {/* CV PDF Modal (Central Stage - Compact design with top action bar) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 bg-black/40 backdrop-blur-md"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          {/* Modal Container */}
          <div
            className="relative w-full max-w-4xl h-full md:h-[80vh] md:max-h-205 bg-canvas rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-[#e5e5e5]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header (Compact single-line with centered tabs & side buttons) */}
            <div className="relative flex flex-col items-center justify-center p-4 border-b border-[#e5e5e5] bg-surface-soft shrink-0 select-none">
              
              {/* Eyebrow */}
              <span className="text-[10px] font-bold text-brand-pink uppercase tracking-widest">
                {labels.eyebrow}
              </span>

              {/* Tabs Switcher Centered */}
              <div className="flex gap-1.5 mt-2">
                <button
                  onClick={() => setActiveTab("es")}
                  className={`px-4 py-1.5 text-[11px] font-bold rounded-full border transition-all ${
                    activeTab === "es"
                      ? "bg-surface-soft border-[#e5e5e5] text-[#0a0a0a] shadow-sm"
                      : "bg-transparent border-transparent text-[#888888] hover:text-[#0a0a0a]"
                  }`}
                >
                  ES
                </button>
                <button
                  onClick={() => setActiveTab("en")}
                  className={`px-4 py-1.5 text-[11px] font-bold rounded-full border transition-all ${
                    activeTab === "en"
                      ? "bg-surface-soft border-[#e5e5e5] text-[#0a0a0a] shadow-sm"
                      : "bg-transparent border-transparent text-[#888888] hover:text-[#0a0a0a]"
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Action Bar: Download + Close to the right */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {/* Download PDF Button */}
                <a
                  href={pdfUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                  title={activeTab === "en" ? "Download PDF" : "Descargar PDF"}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-soft/90 border border-[#e5e5e5] text-[#0a0a0a] hover:bg-surface-card transition-colors"
                >
                  <svg className="w-4 h-4 text-body" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </a>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label={labels.close}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-soft/90 border border-[#e5e5e5] text-[#0a0a0a] hover:bg-surface-card transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

            </div>

            {/* Content Area: PDF Viewer (Fills available space) */}
            <div className="grow p-4 md:p-6 bg-canvas h-full overflow-hidden flex flex-col items-center justify-center">
              <div className="w-full h-full border border-[#e5e5e5] rounded-xl overflow-hidden bg-white">
                <iframe
                  src={`${pdfUrl}#toolbar=0`}
                  className="w-full h-full border-0"
                  title="Curriculum Vitae"
                />
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}