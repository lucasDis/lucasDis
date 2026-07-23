"use client";

/**
 * ProjectDetailPage — full-page project detail view.
 *
 * Reusable client component rendered by `/[locale]/proyectos/[slug]/page.tsx`.
 * Displays the project media gallery (with story-style progress + thumbnail strip),
 * description, tools, client/role meta, and external links.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent as ReactTouchEvent,
} from "react";
import Link from "next/link";
import { MediaRenderer } from "@/components/ui/MediaRenderer";
import { proxyMediaUrl } from "@/lib/proxy-media";
import type { FeaturedProject, FeaturedProjectsLabels } from "@/components/public/home/FeaturedProjects";

const STORY_DURATION_IMAGE_MS = 5000;
const STORY_DURATION_VIDEO_MS = 8000;
const SWIPE_THRESHOLD_PX = 48;

interface ProjectDetailPageProps {
  project: FeaturedProject;
  labels: FeaturedProjectsLabels;
  locale: string;
}

function MediaThumb({ url, type, alt }: { url: string; type: "image" | "video"; alt: string }) {
  if (type === "video") {
    return (
      <>
        <video
          src={url}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          muted
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
      </>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={proxyMediaUrl(url, "image")}
      alt={alt}
      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
    />
  );
}

export function ProjectDetailPage({ project, labels, locale }: ProjectDetailPageProps) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [storyProgress, setStoryProgress] = useState(0);
  const [storyEpoch, setStoryEpoch] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const rafIdRef = useRef<number>(0);
  const storyProgressRef = useRef<number>(0);
  const thumbStripRef = useRef<HTMLDivElement>(null);

  const media = useMemo(() => {
    if (!project.media || project.media.length === 0) return [];
    const cover = project.media.find((m) => m.isCover);
    const rest = project.media.filter((m) => !m.isCover);
    return cover ? [cover, ...rest] : project.media;
  }, [project.media]);

  const activeMedia = media[activeMediaIndex] ?? null;
  const hasMultipleMedia = media.length > 1;

  const categoryLabel =
    labels.categories[project.category] ?? project.category;

  const goNextMedia = useCallback(() => {
    if (!hasMultipleMedia) return;
    setActiveMediaIndex((prev) => (prev + 1) % media.length);
    storyProgressRef.current = 0;
    setStoryProgress(0);
    setStoryEpoch((v) => v + 1);
  }, [hasMultipleMedia, media.length]);

  const goPrevMedia = useCallback(() => {
    if (!hasMultipleMedia) return;
    setActiveMediaIndex((prev) => (prev - 1 + media.length) % media.length);
    storyProgressRef.current = 0;
    setStoryProgress(0);
    setStoryEpoch((v) => v + 1);
  }, [hasMultipleMedia, media.length]);

  const goToMedia = useCallback((index: number) => {
    setActiveMediaIndex(index);
    storyProgressRef.current = 0;
    setStoryProgress(0);
    setStoryEpoch((v) => v + 1);
  }, []);

  useEffect(() => {
    const activeThumb = thumbStripRef.current?.children[activeMediaIndex] as HTMLElement | undefined;
    if (activeThumb && thumbStripRef.current) {
      activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeMediaIndex]);

  const storyDurationMs = useMemo(() => {
    if (!activeMedia) return STORY_DURATION_IMAGE_MS;
    return activeMedia.type === "video" ? STORY_DURATION_VIDEO_MS : STORY_DURATION_IMAGE_MS;
  }, [activeMedia]);

  useEffect(() => {
    if (!hasMultipleMedia || isPaused || isZoomed) return;
    let last = performance.now();
    storyProgressRef.current = 0;
    setStoryProgress(0);

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      const next = Math.min(1, storyProgressRef.current + dt / storyDurationMs);
      storyProgressRef.current = next;
      setStoryProgress(next);
      if (next >= 1) { goNextMedia(); return; }
      rafIdRef.current = requestAnimationFrame(tick);
    };
    rafIdRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafIdRef.current); rafIdRef.current = 0; };
  }, [hasMultipleMedia, isPaused, isZoomed, activeMediaIndex, storyEpoch, storyDurationMs, goNextMedia]);

  useEffect(() => {
    if (!isZoomed) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); setIsZoomed(false); }
    };
    window.addEventListener("keydown", handleEscape, true);
    return () => window.removeEventListener("keydown", handleEscape, true);
  }, [isZoomed]);

  const onTouchStart = (e: ReactTouchEvent) => {
    const t = e.changedTouches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
  };

  const onTouchEnd = (e: ReactTouchEvent) => {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) goNextMedia(); else goPrevMedia();
  };

  return (
    <div className="min-h-screen bg-canvas">
      {/* Top back navigation: Left = Inicio, Right = Proyectos */}
      <div className="mx-auto max-w-7xl px-6 pt-6 flex items-center justify-between">
        {/* Left: Inicio */}
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-[14px] font-medium text-body hover:text-ink transition-colors group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Inicio
        </Link>

        {/* Right: Proyectos */}
        <Link
          href={`/${locale}/proyectos`}
          className="inline-flex items-center gap-2 text-[14px] font-medium text-body hover:text-ink transition-colors group"
        >
          Proyectos
          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-6 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">

          {/* Media Gallery — left / top */}
          <div className="w-full lg:w-3/5 flex flex-col gap-4">
            {/* Main media */}
            <div
              className="relative rounded-2xl overflow-hidden bg-surface-strong aspect-video select-none"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {activeMedia ? (
                <div className="absolute inset-0">
                  <MediaRenderer
                    src={activeMedia.url}
                    alt={activeMedia.alt || project.title}
                    type={activeMedia.type as "image" | "video"}
                    autoPlay
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted">
                  Sin multimedia
                </div>
              )}

              {/* Story progress + controls */}
              <div className="absolute inset-x-0 top-0 z-20 flex flex-col gap-2 p-3 pointer-events-none">
                {hasMultipleMedia && (
                  <div className="flex w-full gap-1" role="group" aria-label="Media progress">
                    {media.map((item, i) => {
                      const fill = i < activeMediaIndex ? 1 : i > activeMediaIndex ? 0 : storyProgress;
                      return (
                        <div key={`${item.url}-${i}`} className="story-progress-track h-0.75 flex-1 min-w-0 rounded-full bg-white/35 overflow-hidden">
                          <div
                            className="h-full bg-white rounded-full"
                            style={{
                              width: `${fill * 100}%`,
                              transition: i === activeMediaIndex ? "none" : "width 120ms linear",
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex items-center gap-2 pointer-events-auto">
                  {hasMultipleMedia && (
                    <button
                      type="button"
                      onClick={() => setIsPaused((p) => !p)}
                      aria-label={isPaused ? (labels.playSlideshow ?? "Play") : (labels.pauseSlideshow ?? "Pause")}
                      aria-pressed={isPaused}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-white hover:bg-black/60 transition-colors"
                    >
                      {isPaused ? (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden><polygon points="6 4 20 12 6 20 6 4" /></svg>
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                          <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                      )}
                    </button>
                  )}
                  {activeMedia?.type === "image" && (
                    <button
                      type="button"
                      onClick={() => setIsZoomed(true)}
                      aria-label={labels.expandImage ?? "Expand image"}
                      className="inline-flex h-9 items-center gap-1.5 px-3 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-white hover:bg-black/60 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                      </svg>
                      <span className="text-[10px] font-semibold uppercase tracking-wider">{labels.expandImage ?? "Expand"}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Thumbnail strip */}
            {hasMultipleMedia && (
              <div ref={thumbStripRef} className="flex items-center gap-3 overflow-x-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1">
                {media.map((mediaItem, idx) => (
                  <button
                    key={`${mediaItem.url}-${idx}`}
                    type="button"
                    onClick={() => goToMedia(idx)}
                    aria-label={mediaItem.alt || `Media ${idx + 1}`}
                    aria-current={activeMediaIndex === idx ? "true" : undefined}
                    className={`relative w-20 h-14 shrink-0 rounded-lg overflow-hidden border border-hairline transition-all duration-300 ${
                      activeMediaIndex === idx
                        ? "ring-2 ring-brand-pink ring-offset-2 ring-offset-canvas opacity-100 scale-95"
                        : "opacity-50 hover:opacity-100"
                    }`}
                  >
                    <MediaThumb url={mediaItem.url} type={mediaItem.type as "image" | "video"} alt={mediaItem.alt || project.title} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Project Details — right / bottom */}
          <div className="w-full lg:w-2/5 flex flex-col gap-6">
            {/* Header */}
            <header className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-semibold text-brand-pink uppercase tracking-widest px-2 py-0.5 border border-brand-pink/30 rounded">
                  {categoryLabel}
                </span>
                <span className="text-[12px] font-semibold text-muted">
                  {project.year}
                  {project.status === "ongoing" && (
                    <> • {labels.statusOngoing ?? "En curso"}</>
                  )}
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-ink mt-1">
                {project.title}
              </h1>
            </header>

            {/* Client / Role */}
            {(project.client || project.role) && (
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-hairline">
                {project.client && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-widest">{labels.client}</span>
                    <span className="text-[14px] font-medium text-ink">{project.client}</span>
                  </div>
                )}
                {project.role && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-widest">{labels.role}</span>
                    <span className="text-[14px] font-medium text-ink">{project.role}</span>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="text-body-sm text-body leading-relaxed whitespace-pre-line">
              {project.longDescription || project.shortDescription}
            </div>

            {/* Tools */}
            {project.tools && project.tools.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-[10px] font-semibold text-muted uppercase tracking-widest">{labels.tools}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {project.tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-3 py-1.5 border border-hairline rounded-full text-[12px] text-body hover:border-brand-pink hover:text-brand-pink bg-canvas transition-colors cursor-default"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* External Links — Black circle buttons with white chain/link icon */}
            {project.externalLinks && project.externalLinks.length > 0 && (
              <div className="flex items-center gap-3 pt-4">
                {project.externalLinks.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    title={link.label}
                    aria-label={link.label}
                    className="group flex items-center justify-center w-12 h-12 rounded-full bg-[#0a0a0a] text-white hover:bg-brand-pink hover:scale-105 transition-all duration-200 shadow-md"
                  >
                    {/* Link Chain Icon */}
                    <svg className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {isZoomed && activeMedia && activeMedia.type === "image" && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 md:p-8 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all z-50"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeMedia.url}
            alt={activeMedia.alt || project.title}
            className="max-w-full max-h-full object-contain rounded shadow-2xl select-none"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </div>
  );
}
