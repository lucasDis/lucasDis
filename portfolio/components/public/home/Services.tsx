"use client";

import { useEffect, useRef } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  HoverSlider,
  HoverSliderImage,
  HoverSliderImageWrap,
  TextStaggerHover,
  HoverSliderDescription,
  HoverSliderTitle,
  HoverSliderFeatures,
  useHoverActiveSlide,
} from "@/components/ui/animated-slideshow";

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  features: string[];
}

interface ServicesProps {
  eyebrow?: string; // "Servicios" in locales/es/common.json
  title: string; // "Lo que hago" in locales/es/common.json
  items: ServiceItem[];
}

/**
 * ScrollSliderObserver — listens to window scroll inside the parent container
 * to dynamically change the active slide when on mobile or tablet screen.
 */
function ScrollSliderObserver({
  containerRef,
  itemsCount,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  itemsCount: number;
}) {
  const { changeSlide } = useHoverActiveSlide();

  useEffect(() => {
    const handleScroll = () => {
      // Avoid scroll observation on desktop
      if (window.innerWidth >= 1024) return;

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const containerHeight = rect.height;
      const viewportHeight = window.innerHeight;

      // Calculate intersection boundaries
      const totalScrollable = containerHeight - viewportHeight;
      const currentScroll = -rect.top;

      if (rect.top <= 0 && rect.bottom >= viewportHeight) {
        const percentage = Math.min(Math.max(currentScroll / totalScrollable, 0), 0.99);
        const index = Math.floor(percentage * itemsCount);
        changeSlide(index);
      } else if (rect.top > 0) {
        changeSlide(0);
      } else if (rect.bottom < viewportHeight) {
        changeSlide(itemsCount - 1);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once on load/resize to set initial state
    handleScroll();

    const handleResize = () => {
      handleScroll();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [changeSlide, itemsCount, containerRef]);

  return null;
}

/**
 * ServicesContent — Internal component wrapped inside HoverSlider context
 * to consume state and render the responsive layout.
 */
function ServicesContent({ eyebrow, items }: { eyebrow?: string; title?: string; items: ServiceItem[] }) {
  const { activeSlide } = useHoverActiveSlide();
  const containerRef = useRef<HTMLDivElement>(null);

  const titles = items.map((item) => item.title);
  const descriptions = items.map((item) => item.description);
  const features = items.map((item) => item.features || []);

  return (
    <section
      id="servicios"
      ref={containerRef}
      className="relative h-[280vh] lg:h-auto bg-transparent select-none"
    >
      <div className="mx-auto max-w-7xl px-6 h-full py-0 lg:py-24">
        <ScrollSliderObserver containerRef={containerRef} itemsCount={items.length} />

        {/* Sticky Grid on Mobile, normal relative grid on Desktop */}
        <div className="sticky top-20 md:top-24 h-[calc(100vh-140px)] flex flex-col gap-4 py-6 lg:relative lg:top-0 lg:h-auto lg:grid lg:gap-9 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch lg:py-0 overflow-hidden lg:overflow-visible">
          
          {/* Columna Izquierda: Encabezado y títulos */}
          <div className="flex flex-col h-fit lg:h-full lg:justify-between gap-2 lg:gap-0">
            <div>
              <SectionHeader
                eyebrow={eyebrow}
                title=""
                align="left"
                className="mb-4"
              />

              {/* Mobile/Tablet: Render only the active service title (fixed position) */}
              <div className="flex lg:hidden overflow-visible h-14 items-center">
                <TextStaggerHover
                  key={`mobile-${activeSlide}`}
                  index={activeSlide}
                  text={titles[activeSlide] || ""}
                  className="service-item-trigger w-fit text-2xl xs:text-3xl sm:text-4xl font-semibold uppercase leading-none tracking-tight text-brand-pink whitespace-nowrap"
                />
              </div>

              {/* Desktop: Render the complete list of vertical titles */}
              <div className="hidden lg:flex flex-col overflow-visible">
                {items.map((service, index) => (
                  <TextStaggerHover
                    key={service.id}
                    index={index}
                    text={service.title}
                    className="service-item-trigger w-fit cursor-pointer lg:text-[2.6rem] xl:text-[3rem] font-medium uppercase leading-none tracking-tight text-ink outline-none transition-colors hover:text-brand-pink focus-visible:ring-2 focus-visible:ring-brand-pink/30 whitespace-nowrap py-2"
                  />
                ))}
              </div>
            </div>

            {/* Pagination dots — mobile/tablet only */}
            <div className="flex lg:hidden items-center gap-2 py-1" role="tablist" aria-label="Services navigation">
              {items.map((item, idx) => (
                <span
                  key={item.id}
                  role="tab"
                  aria-selected={activeSlide === idx}
                  aria-label={item.title}
                  className={`block rounded-full transition-all duration-300 ${
                    activeSlide === idx
                      ? "w-5 h-2 bg-brand-pink"
                      : "w-2 h-2 bg-[#cccccc]"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Columna Derecha: Card Bento Unificada (Imagen + Textos) */}
          <div className="flex flex-col flex-1 lg:flex-none lg:h-full lg:sticky lg:top-24 overflow-hidden">
            <div className="flex flex-col flex-1 rounded-xl border border-hairline bg-surface-soft overflow-hidden shadow-sm h-full">
              
              {/* Imagen superior de la card */}
              <HoverSliderImageWrap className="aspect-16/10 w-full overflow-hidden border-b border-hairline bg-surface-soft shrink-0">
                {items.map((service, index) => (
                  <HoverSliderImage
                    key={service.id}
                    index={index}
                    imageUrl={service.imageUrl}
                    alt={service.title}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                ))}
              </HoverSliderImageWrap>

              {/* Descripción y viñetas de la card */}
              <article className="p-4 lg:p-6 flex flex-col justify-start grow gap-4 overflow-y-auto lg:overflow-visible">
                <div>
                  <HoverSliderTitle
                    titles={titles}
                    className="text-title-sm font-semibold uppercase tracking-wide text-ink transition-colors duration-300"
                  />
                  <HoverSliderDescription
                    descriptions={descriptions}
                    className="mt-2 lg:mt-3 text-body-sm leading-relaxed text-body transition-opacity duration-300"
                  />
                </div>

                <div className="pt-4 border-t border-hairline/60 shrink-0">
                  <HoverSliderFeatures
                    features={features}
                    className="space-y-2 lg:space-y-2.5"
                  />
                </div>
              </article>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export function Services({ eyebrow, title, items }: ServicesProps) {
  return (
    <HoverSlider>
      <ServicesContent eyebrow={eyebrow} title={title} items={items} />
    </HoverSlider>
  );
}