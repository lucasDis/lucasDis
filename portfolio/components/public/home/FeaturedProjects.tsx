"use client";

/**
 * Featured Projects — client component with category filter + modal detail.
 *
 * Layout (home section):
 *   - SectionHeader + filter chips (All / Web / UX-UI / Branding / etc.)
 *   - 3-column grid of project preview cards (2 on tablet, 1 on mobile)
 *   - Click a card → modal opens with full project detail, slider and navigation
 *
 * i18n: strings are resolved server-side and passed as `labels` prop.
 *
 * Accessibility: focus-visible rings, aria-modal/role=dialog, aria-selected
 * on filter chips, aria-label on close button, navigation with Arrow keys.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/Button";
import { PROJECT_FILTER_CATEGORIES } from "@/lib/project-categories";
import { MediaRenderer } from "@/components/ui/MediaRenderer";
import { proxyMediaUrl } from "@/lib/proxy-media";

/** Duration per story segment (images). Videos use a longer default. */
const STORY_DURATION_IMAGE_MS = 5000;
const STORY_DURATION_VIDEO_MS = 8000;
const SWIPE_THRESHOLD_PX = 48;


export type FeaturedProject = {
  _id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription?: string;
  category: string;
  year: number;
  status?: "completed" | "ongoing";
  client?: string;
  role?: string;
  tools?: string[];
  media: Array<{ url: string; type: "image" | "video"; alt: string; order: number; isCover?: boolean }>;
  externalLinks?: Array<{ label: string; url: string }>;
  featured?: boolean;
  /** Controls display order among featured projects on the home page. */
  featuredOrder?: number;
};

export type FeaturedProjectsLabels = {
  eyebrow: string;
  title: string;
  subtitle: string;
  empty: string;
  closeModal: string;
  filterLabel: string;
  client: string;
  role: string;
  tools: string;
  categories: Record<string, string>;
  /** i18next template string, e.g. "Ver detalles de {{title}}" */
  openDetailsTemplate: string;
  viewAll?: string;
  statusCompleted?: string;
  statusOngoing?: string;
  searchPlaceholder?: string;
  allYears?: string;
  readMore?: string;
  showLess?: string;
  pauseSlideshow?: string;
  playSlideshow?: string;
  expandImage?: string;
};

interface FeaturedProjectsProps {
  projects: FeaturedProject[];
  labels: FeaturedProjectsLabels;
  showViewAll?: boolean;
  viewAllHref?: string;
  featuredOnly?: boolean;
  locale?: string;
}

const FILTER_CATEGORIES = PROJECT_FILTER_CATEGORIES;

export function FeaturedProjects({
  projects,
  labels,
  showViewAll = false,
  viewAllHref,
  featuredOnly = false,
  locale = "es",
}: FeaturedProjectsProps) {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [year, setYear] = useState<string>("");

  // Track which project IDs have broken cover images — those rows are hidden
  const [brokenIds, setBrokenIds] = useState<Set<string>>(new Set());
  const markBroken = useCallback((id: string) => {
    setBrokenIds((prev) => new Set([...prev, id]));
  }, []);

  // Extract all unique years from projects
  const years = Array.from(new Set(projects.map((p) => p.year))).sort((a, b) => b - a);

  // Filter grid to show ONLY featured projects if featuredOnly is active
  const baseProjects = featuredOnly ? projects.filter((p) => p.featured) : projects;
  
  // Filter by category, year, search query, and exclude broken images
  const filteredProjects = baseProjects.filter((p) => {
    if (brokenIds.has(p._id)) return false;
    // 1. Category Filter
    const matchesCategory = filter === "all" || p.category === filter;
    
    // 2. Year Filter
    const matchesYear = !year || p.year.toString() === year;
    
    // 3. Search Filter
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.title.toLowerCase().includes(query) ||
      p.shortDescription.toLowerCase().includes(query) ||
      (p.longDescription && p.longDescription.toLowerCase().includes(query)) ||
      (p.client && p.client.toLowerCase().includes(query)) ||
      (p.role && p.role.toLowerCase().includes(query)) ||
      (p.tools && p.tools.some((t) => t.toLowerCase().includes(query)));
      
    return matchesCategory && matchesYear && matchesSearch;
  });

  return (
    <section
      id="proyectos"
      aria-label={labels.title}
      className="bg-transparent text-ink"
    >
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-8 lg:pt-20 lg:pb-12">
        <SectionHeader
          eyebrow={labels.eyebrow}
          title={labels.title}
          subtitle={labels.subtitle}
          align="left"
        />

        <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            className="filter-chips"
            role="tablist"
            aria-label={labels.filterLabel}
          >
            {FILTER_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={filter === cat}
                data-active={filter === cat}
                onClick={() => setFilter(cat)}
                className="filter-chip"
              >
                {labels.categories[cat] ?? cat}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:max-w-md">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={labels.searchPlaceholder ?? "Buscar proyectos..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 text-body-sm bg-surface-soft border border-hairline rounded-full focus:outline-none focus:ring-1 focus:ring-brand-pink focus:border-brand-pink text-ink placeholder:text-muted"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-body-sm cursor-pointer"
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>
            {years.length > 0 && (
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="px-4 py-2 text-body-sm bg-surface-soft border border-hairline rounded-full focus:outline-none focus:ring-1 focus:ring-brand-pink focus:border-brand-pink text-ink cursor-pointer"
              >
                <option value="">{labels.allYears ?? "Todos los años"}</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-16 lg:pb-24">
        {filteredProjects.length === 0 ? (
          <p className="py-16 text-center text-body-md text-muted">
            {labels.empty}
          </p>
        ) : (
          <>
            <div className="project-grid">
              {filteredProjects.map((project) => (
                <ProjectCardPreview
                  key={project._id}
                  project={project}
                  locale={locale}
                  onMarkBroken={markBroken}
                  openDetailsLabel={labels.openDetailsTemplate ? labels.openDetailsTemplate.replace("{{title}}", project.title) : `Ver detalles de ${project.title}`}
                  categoryLabel={labels.categories[project.category] ?? project.category}
                  labels={labels}
                />
              ))}
            </div>
            {showViewAll && viewAllHref && labels.viewAll && (
              <div className="mt-12 flex justify-center">
                <ButtonLink href={viewAllHref} variant="secondary">
                  {labels.viewAll}
                </ButtonLink>
              </div>
            )}
          </>
        )}
      </div>

    </section>
  );
}

function ProjectCardPreview({
  project,
  locale = "es",
  onMarkBroken,
  openDetailsLabel,
  categoryLabel,
  labels,
}: {
  project: FeaturedProject;
  locale?: string;
  onMarkBroken?: (id: string) => void;
  openDetailsLabel: string;
  categoryLabel: string;
  labels: FeaturedProjectsLabels;
}) {
  const cover = project.media.find((m) => m.isCover) || project.media[0];
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);
  const projectHref = `/${locale}/proyectos/${project.slug}`;

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    // Measure only while collapsed (line-clamp-2)
    setCanExpand(el.scrollHeight > el.clientHeight + 1);
  }, [project.shortDescription]);

  return (
    <article
      className={`project-card-preview group ${expanded ? "is-expanded" : ""}`}
    >
      <a
        href={projectHref}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-left border-0 bg-transparent p-0 cursor-pointer"
        aria-label={openDetailsLabel}
      >
        <div className="project-card-preview-image-wrap">
          {cover ? (
            <MediaRenderer
              src={cover.url}
              alt={cover.alt || project.title}
              type={cover.type}
              aspectRatio=""
              className="project-card-preview-image"
              onError={() => onMarkBroken?.(project._id)}
            />
          ) : (
            <div className="project-card-preview-image bg-surface-strong" />
          )}
        </div>
      </a>

      {/*
        Body: position:relative so the expanded overlay can use absolute
        positioning relative to this container (covers both title + desc area).
      */}
      <div className="project-card-preview-body relative px-0.5">
        {/* Meta + title: fade when description overlay is open */}
        <div
          className={`transition-opacity duration-200 ${
            expanded ? "opacity-25" : "opacity-100"
          }`}
        >
          <a
            href={projectHref}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-left border-0 bg-transparent p-0 cursor-pointer"
          >
            <div className="flex items-center justify-between text-caption-uppercase text-muted gap-2">
              <span>{categoryLabel}</span>
              <span>
                {project.year}
                {project.status === "ongoing" && (
                  <>
                    {" • "}
                    {labels.statusOngoing ?? "En curso"}
                  </>
                )}
              </span>
            </div>
            <h3
              className={`mt-2 text-title-md text-ink transition-colors ${
                expanded ? "" : "group-hover:text-brand-pink"
              }`}
            >
              {project.title}
            </h3>
          </a>
        </div>

        {/*
          Description slot — fixed collapsed footprint so the grid never
          reflows. The "Ver más" button reveals an absolute overlay that
          covers the entire .project-card-preview-body (positioned relative
          to this parent), growing upward over the title.
        */}
        <div className="mt-2">
          {/* Invisible placeholder preserves height when overlay is open */}
          <div className={expanded ? "invisible" : ""} aria-hidden={expanded}>
            <p
              ref={descRef}
              className="line-clamp-2 text-body-sm text-body"
            >
              {project.shortDescription}
            </p>
            {canExpand && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="mt-1 text-body-sm font-medium text-brand-pink hover:underline cursor-pointer bg-transparent border-0 p-0"
              >
                {labels.readMore ?? "Ver más"}
              </button>
            )}
          </div>
        </div>

        {/*
          Overlay positioned absolute to .project-card-preview-body.
          bottom-0 anchors to the bottom of the body; the overlay grows
          upward, covering the title area. z-20 paints over siblings.
        */}
        {expanded && (
          <div className="project-card-desc-overlay absolute inset-x-0 bottom-0 z-20 flex flex-col gap-1 rounded-md border border-hairline bg-canvas/95 p-2.5 shadow-md backdrop-blur-sm">
            <p className="text-body-sm text-body">{project.shortDescription}</p>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="self-start text-body-sm font-medium text-brand-pink hover:underline cursor-pointer bg-transparent border-0 p-0"
            >
              {labels.showLess ?? "Ver menos"}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function ProjectMediaItem({
  url,
  type,
  alt,
}: {
  url: string;
  type: "image" | "video";
  alt: string;
}) {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <MediaRenderer
        src={url}
        alt={alt}
        type={type}
        aspectRatio=""
        className="w-full h-full"
      />
    </div>
  );
}

function MediaThumb({
  url,
  type,
  alt,
}: {
  url: string;
  type: "image" | "video";
  alt: string;
}) {
  // Use eager loading: lazy-loading intersection observer misses images
  // inside overflow:hidden containers (the thumbnail strip). Proxy the URL
  // so both ImageKit and UploadThing image assets bypass CORS restrictions.
  // Videos bypass the proxy — the browser media engine handles cross-origin
  // video natively and Vercel can't stream large files through serverless fns.
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
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
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
      loading="eager"
      decoding="async"
      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
    />
  );
}

export function ProjectModal({
  project,
  onClose,
  onNext,
  onPrev,
  labels,
}: {
  project: FeaturedProject;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  labels: FeaturedProjectsLabels;
}) {
  const media = useMemo(
    () =>
      [...(project.media ?? [])].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      ),
    [project.media]
  );

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [storyEpoch, setStoryEpoch] = useState(0);
  /** 0..1 fill of the active story segment (JS-driven, not CSS animationend) */
  const [storyProgress, setStoryProgress] = useState(0);
  const storyProgressRef = useRef(0);
  // Store rafId in a ref so the cleanup closure always sees the latest ID,
  // even across React Strict Mode double-invocations.
  const rafIdRef = useRef(0);
  // Ref for the thumbnail strip container — used to auto-scroll active thumb.
  const thumbStripRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const hasMultipleMedia = media.length > 1;
  const activeMedia = media[activeMediaIndex] ?? media[0];
  const categoryLabel = labels.categories[project.category] ?? project.category;
  const storyDurationMs =
    activeMedia?.type === "video"
      ? STORY_DURATION_VIDEO_MS
      : STORY_DURATION_IMAGE_MS;

  const goToMedia = useCallback((index: number) => {
    setActiveMediaIndex(index);
    setStoryEpoch((e) => e + 1);
  }, []);

  const goNextMedia = useCallback(() => {
    if (media.length <= 1) return;
    setActiveMediaIndex((i) => (i + 1) % media.length);
    setStoryEpoch((e) => e + 1);
  }, [media.length]);

  const goPrevMedia = useCallback(() => {
    if (media.length <= 1) return;
    setActiveMediaIndex((i) => (i - 1 + media.length) % media.length);
    setStoryEpoch((e) => e + 1);
  }, [media.length]);

  // Reset when project changes
  useEffect(() => {
    setActiveMediaIndex(0);
    setIsZoomed(false);
    setIsPaused(false);
    setStoryEpoch((e) => e + 1);
  }, [project._id]);

  // Prefer reduced motion: start paused (user can still play manually)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) setIsPaused(true);
  }, [project._id]);

  // Reset segment progress whenever the active slide (or epoch) changes
  useEffect(() => {
    storyProgressRef.current = 0;
    setStoryProgress(0);
  }, [activeMediaIndex, storyEpoch, storyDurationMs]);

  // Auto-scroll thumbnail strip so the active thumb is always visible and
  // the next adjacent thumb peeks into view (scroll-hint UX).
  useEffect(() => {
    const strip = thumbStripRef.current;
    if (!strip) return;
    const buttons = strip.querySelectorAll<HTMLButtonElement>("button");
    const activeBtn = buttons[activeMediaIndex];
    if (!activeBtn) return;

    const stripRect = strip.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    const PEEK_PX = 24; // how many px of the next thumbnail to show

    // Check if we need to scroll right (next thumb out of view)
    const nextBtn = buttons[activeMediaIndex + 1];
    if (nextBtn) {
      const nextRect = nextBtn.getBoundingClientRect();
      const overflowRight = nextRect.right - stripRect.right + PEEK_PX;
      if (overflowRight > 0) {
        strip.scrollBy({ left: overflowRight, behavior: "smooth" });
        return;
      }
    }

    // Check if we need to scroll left (prev thumb out of view)
    const prevBtn = buttons[activeMediaIndex - 1];
    if (prevBtn) {
      const prevRect = prevBtn.getBoundingClientRect();
      const overflowLeft = stripRect.left - prevRect.left + PEEK_PX;
      if (overflowLeft > 0) {
        strip.scrollBy({ left: -overflowLeft, behavior: "smooth" });
        return;
      }
    }

    // Active thumb itself out of view — scroll it into view
    if (btnRect.left < stripRect.left || btnRect.right > stripRect.right) {
      activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [activeMediaIndex]);

  // JS-driven auto-advance — reliable (CSS onAnimationEnd is flaky with
  // prefers-reduced-motion, remounts, and transform animations).
  // rafIdRef keeps the latest requestAnimationFrame ID so the cleanup
  // can always cancel it, regardless of closure capture timing.
  useEffect(() => {
    if (!hasMultipleMedia || isPaused || isZoomed) return;

    let last = performance.now();
    const duration = Math.max(1, storyDurationMs);

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      const next = Math.min(1, storyProgressRef.current + dt / duration);
      storyProgressRef.current = next;
      setStoryProgress(next);
      if (next >= 1) {
        goNextMedia();
        return;
      }
      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = 0;
    };
  }, [
    hasMultipleMedia,
    isPaused,
    isZoomed,
    activeMediaIndex,
    storyEpoch,
    storyDurationMs,
    goNextMedia,
  ]);

  // Keyboard escape for zoom lightbox
  useEffect(() => {
    if (!isZoomed) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setIsZoomed(false);
      }
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
    // Prefer horizontal swipe; ignore mostly-vertical scrolls
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) goNextMedia();
    else goPrevMedia();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 lg:p-6 xl:p-8 bg-[#0a0a0a]/20 backdrop-blur-md"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`modal-${project.slug}-title`}
      >
        {/* Navigation Controls (Desktop Overlay - project level) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          aria-label="Previous Project"
          className="hidden lg:flex absolute top-1/2 left-3 xl:left-6 -translate-y-1/2 z-50 w-14 h-14 items-center justify-center rounded-full bg-canvas/90 backdrop-blur-sm border border-[#e5e5e5] text-body hover:text-[#0a0a0a] hover:bg-surface-soft hover:scale-110 shadow-lg transition-all duration-300"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="Next Project"
          className="hidden lg:flex absolute top-1/2 right-3 xl:right-6 -translate-y-1/2 z-50 w-14 h-14 items-center justify-center rounded-full bg-canvas/90 backdrop-blur-sm border border-[#e5e5e5] text-body hover:text-[#0a0a0a] hover:bg-surface-soft hover:scale-110 shadow-lg transition-all duration-300"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>

        {/* Modal Container — vertical until lg; wider on desktop */}
        <div
          className="relative w-full h-full max-w-none sm:max-w-3xl sm:h-[90vh] sm:max-h-225 lg:max-w-[min(1680px,94vw)] lg:h-[85vh] lg:max-h-230 bg-canvas rounded-none sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row border-0 sm:border sm:border-[#e5e5e5]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label={labels.closeModal}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 lg:top-6 lg:right-6 z-40 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-surface-soft/90 backdrop-blur-sm border border-[#e5e5e5] text-[#0a0a0a] hover:bg-surface-card hover:scale-105 transition-all duration-300 group"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Media Gallery */}
          <div className="w-full lg:w-2/3 h-[50vh] sm:h-[48%] lg:h-full flex flex-col bg-surface-strong relative border-b lg:border-b-0 lg:border-r border-[#e5e5e5] select-none shrink-0">
            <div
              className="grow relative overflow-hidden bg-surface-strong media-container touch-pan-y"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {activeMedia ? (
                <ProjectMediaItem
                  url={activeMedia.url}
                  type={activeMedia.type as "image" | "video"}
                  alt={activeMedia.alt || project.title}
                />
              ) : (
                <div className="w-full h-full bg-surface-strong" />
              )}

              {/* Tap zones (IG-style) — mobile first, desktop too */}
              {hasMultipleMedia && (
                <>
                  <button
                    type="button"
                    aria-label="Previous media"
                    className="absolute inset-y-0 left-0 z-10 w-1/3 cursor-w-resize bg-transparent border-0 p-0"
                    onClick={goPrevMedia}
                  />
                  <button
                    type="button"
                    aria-label="Next media"
                    className="absolute inset-y-0 right-0 z-10 w-1/3 cursor-e-resize bg-transparent border-0 p-0"
                    onClick={goNextMedia}
                  />
                </>
              )}

              {/* Stories progress + controls (mobile first, always visible) */}
              <div className="absolute inset-x-0 top-0 z-20 flex flex-col gap-2 p-2.5 sm:p-3 pr-14 sm:pr-16 pointer-events-none">
                {hasMultipleMedia && (
                  <div
                    className="flex w-full gap-1"
                    role="group"
                    aria-label="Media progress"
                  >
                    {media.map((item, i) => {
                      const fill =
                        i < activeMediaIndex
                          ? 1
                          : i > activeMediaIndex
                            ? 0
                            : storyProgress;
                      return (
                        <div
                          key={`${item.url}-${i}`}
                          className="story-progress-track h-0.75 sm:h-1 flex-1 min-w-0 rounded-full bg-white/35 overflow-hidden"
                        >
                          <div
                            className="h-full bg-white rounded-full"
                            style={{
                              width: `${fill * 100}%`,
                              transition:
                                i === activeMediaIndex
                                  ? "none"
                                  : "width 120ms linear",
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
                      aria-label={
                        isPaused
                          ? (labels.playSlideshow ?? "Play")
                          : (labels.pauseSlideshow ?? "Pause")
                      }
                      aria-pressed={isPaused}
                      className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-white hover:bg-black/60 transition-colors"
                    >
                      {isPaused ? (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                          <polygon points="6 4 20 12 6 20 6 4" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                          <rect x="6" y="4" width="4" height="16" rx="1" />
                          <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                      )}
                    </button>
                  )}

                  {activeMedia?.type === "image" && (
                    <button
                      type="button"
                      onClick={() => setIsZoomed(true)}
                      aria-label={labels.expandImage ?? "Expand image"}
                      className="inline-flex h-9 sm:h-10 items-center gap-1.5 px-3 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-white hover:bg-black/60 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                      </svg>
                      <span className="text-[10px] font-semibold uppercase tracking-wider">
                        {labels.expandImage ?? "Expand"}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Thumbnail strip — real <img> so referrerPolicy applies */}
            {hasMultipleMedia && (
              <div ref={thumbStripRef} className="h-20 sm:h-24 lg:h-28 bg-surface-soft flex items-center px-3 sm:px-4 overflow-x-auto border-t border-[#e5e5e5] gap-2 sm:gap-3 shrink-0 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {media.map((mediaItem, idx) => (
                  <button
                    key={`${mediaItem.url}-${idx}`}
                    type="button"
                    onClick={() => goToMedia(idx)}
                    aria-label={mediaItem.alt || `Media ${idx + 1}`}
                    aria-current={activeMediaIndex === idx ? "true" : undefined}
                    className={`relative w-16 sm:w-20 lg:w-28 h-12 sm:h-14 lg:h-20 shrink-0 rounded-lg overflow-hidden border border-[#e5e5e5] transition-all duration-300 ${
                      activeMediaIndex === idx
                        ? "ring-2 ring-brand-pink ring-offset-2 ring-offset-canvas opacity-100 scale-95"
                        : "opacity-50 hover:opacity-100"
                    }`}
                  >
                    <MediaThumb
                      url={mediaItem.url}
                      type={mediaItem.type as "image" | "video"}
                      alt={mediaItem.alt || project.title}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Project Details — stacked until lg; 1/3 on desktop */}
          <div className="w-full lg:w-1/3 min-h-0 flex-1 lg:h-full overflow-y-auto bg-canvas flex flex-col scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative select-text">
            {/* Content Padding Wrapper */}
            <div className="p-6 lg:p-10 flex flex-col gap-6 grow pb-24 lg:pb-10">
              {/* Header Info */}
              <header className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-semibold text-brand-pink uppercase tracking-widest px-2 py-0.5 border border-brand-pink/30 rounded">
                    {categoryLabel}
                  </span>
                  <span className="text-[12px] font-semibold text-[#888888]">
                    {project.year}
                    {project.status === "ongoing" && (
                      <>
                        {" • "}
                        {labels.statusOngoing ?? "En curso"}
                      </>
                    )}
                  </span>
                </div>
                <h1
                  id={`modal-${project.slug}-title`}
                  className="text-2xl lg:text-3xl font-bold tracking-tight text-[#0a0a0a] mt-1"
                >
                  {project.title}
                </h1>
              </header>

              {/* Client / Role Meta */}
              {(project.client || project.role) && (
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#e5e5e5]">
                  {project.client && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-semibold text-[#888888] uppercase tracking-widest">
                        {labels.client}
                      </span>
                      <span className="text-[14px] font-medium text-[#0a0a0a]">
                        {project.client}
                      </span>
                    </div>
                  )}
                  {project.role && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-semibold text-[#888888] uppercase tracking-widest">
                        {labels.role}
                      </span>
                      <span className="text-[14px] font-medium text-[#0a0a0a]">
                        {project.role}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="text-body-sm text-body leading-relaxed whitespace-pre-line">
                {project.longDescription || project.shortDescription}
              </div>

              {/* Tools / Tech Stack */}
              {project.tools && project.tools.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                  <h3 className="text-[10px] font-semibold text-[#888888] uppercase tracking-widest">
                    {labels.tools}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tools.map((tool) => (
                      <span
                        key={tool}
                        className="px-3 py-1.5 border border-[#e5e5e5] rounded-full text-[12px] text-body hover:border-brand-pink hover:text-brand-pink bg-canvas transition-colors cursor-default"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Bottom Actions (mobile + tablet; hidden on desktop) */}
            <div className="sticky lg:hidden bottom-0 left-0 right-0 p-4 bg-canvas/95 backdrop-blur-md border-t border-[#e5e5e5] flex gap-3 z-30 mt-auto">
              <button
                onClick={onPrev}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded border border-[#e5e5e5] text-[14px] font-medium text-[#0a0a0a] hover:bg-surface-soft active:bg-surface-card transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Ant
              </button>
              <button
                onClick={onNext}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded bg-[#0a0a0a] text-white text-[14px] font-medium hover:bg-body-strong active:bg-black transition-all"
              >
                Sig
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>

            {/* External Links Sticky Footer (Desktop) */}
            {project.externalLinks && project.externalLinks.length > 0 && (
              <div className="hidden lg:flex p-6 border-t border-[#e5e5e5] mt-auto w-full items-center justify-between bg-canvas/85 backdrop-blur-sm sticky bottom-0">
                {project.externalLinks.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[14px] font-medium text-[#0a0a0a] hover:text-brand-pink transition-colors flex items-center gap-2 group"
                  >
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox / Zoom Overlay */}
      {isZoomed && activeMedia && activeMedia.type === "image" && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 md:p-8 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          {/* Close Zoom Button */}
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all z-50"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          {/* Zoomed Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeMedia.url}
            alt={activeMedia.alt || project.title}
            className="max-w-full max-h-full object-contain rounded shadow-2xl select-none"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FeaturedProjectsList — Canvas-3 §2a: vertical full-width list with custom cursor
// Used on the home page. Opens each project in a new tab via /[locale]/proyectos/[slug].
// ─────────────────────────────────────────────────────────────────────────────

interface FeaturedProjectsListProps {
  projects: FeaturedProject[];
  labels: {
    eyebrow: string;
    title: string;
    categories: Record<string, string>;
    viewAll?: string;
    openDetailsTemplate?: string;
  };
  viewAllHref?: string;
  locale: string;
}

export function FeaturedProjectsList({
  projects,
  labels,
  viewAllHref,
  locale,
}: FeaturedProjectsListProps) {
  // Take up to 4 featured projects, sorted by featuredOrder asc
  const displayed = [...projects]
    .filter((p) => p.featured)
    .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0))
    .slice(0, 4);

  // Track which project IDs have broken cover images — those rows are hidden
  const [brokenIds, setBrokenIds] = useState<Set<string>>(new Set());
  const markBroken = useCallback((id: string) => {
    setBrokenIds((prev) => new Set([...prev, id]));
  }, []);

  const cursorRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: -300, y: -300 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    const el = cursorRef.current;
    if (!el) return;
    el.style.top = e.clientY + "px";
    el.style.left = e.clientX + "px";
  }, []);

  const handleEnter = useCallback(() => {
    const el = cursorRef.current;
    if (!el) return;
    el.style.opacity = "1";
    el.style.transform = "scale(1)";
  }, []);

  const handleLeave = useCallback(() => {
    const el = cursorRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "scale(0.4)";
  }, []);

  useEffect(() => {
    const onWindowMouseMove = (e: MouseEvent) => {
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const onWindowScroll = () => {
      if (lastMousePos.current.x < 0) return;
      const target = document.elementFromPoint(lastMousePos.current.x, lastMousePos.current.y);
      const cursorNoneEl = target?.closest("[data-cursor-none]");
      const el = cursorRef.current;
      if (!el) return;

      if (cursorNoneEl) {
        el.style.top = lastMousePos.current.y + "px";
        el.style.left = lastMousePos.current.x + "px";
        el.style.opacity = "1";
        el.style.transform = "scale(1)";
      } else {
        el.style.opacity = "0";
        el.style.transform = "scale(0.4)";
      }
    };

    window.addEventListener("mousemove", onWindowMouseMove, { passive: true });
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onWindowMouseMove);
      window.removeEventListener("scroll", onWindowScroll);
    };
  }, []);

  return (
    <section
      id="proyectos"
      aria-label={labels.title}
      className="bg-transparent text-ink"
      onMouseMove={handleMouseMove}
      data-projects-section
    >
      {/* "Ver" cursor — mix-blend-mode: difference so it inverts content underneath */}
      <div
        ref={cursorRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 84,
          height: 84,
          marginLeft: -42,
          marginTop: -42,
          borderRadius: "50%",
          background: "#ffffff",
          color: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          pointerEvents: "none",
          zIndex: 10001,
          opacity: 0,
          transform: "scale(0.4)",
          transition: "opacity 200ms, transform 200ms",
          willChange: "transform, top, left",
          mixBlendMode: "difference",
        }}
      >
        Ver
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-8 pb-4 lg:pt-12">
        <SectionHeader
          eyebrow={labels.eyebrow}
          title={labels.title}
        />
      </div>

      {/* Vertical list */}
      <div className="mx-auto max-w-7xl">
        {displayed.map((project, index) => {
          const cover = project.media.find((m) => m.isCover) || project.media[0];
          const isEven = index % 2 === 0;
          const categoryLabel = labels.categories[project.category] ?? project.category;

          return (
            <a
              key={project._id}
              href={`/${locale}/proyectos/${project.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave}
              data-cursor-none
              style={{ cursor: "none", display: brokenIds.has(project._id) ? "none" : "block" }}
              className="group block px-6"
            >
              <div
                className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-10 lg:py-14 border-t border-hairline"
              >
                {/* Image */}
                <div
                  className={`rounded-2xl overflow-hidden bg-surface-soft aspect-4/3 lg:aspect-video ${
                    isEven ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover.url}
                      alt={cover.alt || project.title}
                      className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-[1.04]"
                      onError={() => markBroken(project._id)}
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-strong" />
                  )}
                </div>

                {/* Text */}
                <div className={isEven ? "lg:order-2" : "lg:order-1 lg:text-right"}>
                  <span className="text-[12px] font-semibold tracking-widest uppercase text-brand-pink">
                    {categoryLabel} — {project.year}
                  </span>
                  <h3 className="mt-2.5 text-3xl lg:text-[34px] font-semibold tracking-tight text-ink transition-colors duration-200 group-hover:text-brand-pink" style={{ letterSpacing: "-0.8px" }}>
                    {project.title}
                  </h3>
                  <p
                    className={`mt-3.5 text-[15px] leading-relaxed text-body max-w-120 ${
                      !isEven ? "ml-auto" : ""
                    }`}
                  >
                    {project.shortDescription}
                  </p>
                  {project.tools && project.tools.length > 0 && (
                    <div
                      className={`flex gap-2 mt-5 flex-wrap ${
                        !isEven ? "justify-end" : ""
                      }`}
                    >
                      {project.tools.slice(0, 4).map((tool) => (
                        <span
                          key={tool}
                          className="text-[12px] font-semibold px-3.5 py-1.5 rounded-full border border-hairline text-body"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </a>
          );
        })}

        {/* Bottom border after last item */}
        <div className="mx-6 border-t border-hairline" />
      </div>

      {/* View all */}
      {viewAllHref && labels.viewAll && (
        <div className="mx-auto max-w-7xl px-6 pt-12 pb-16 lg:pb-24 flex justify-center">
          <a
            href={viewAllHref}
            className="inline-flex h-11 items-center gap-2 px-6 rounded-full border border-ink text-ink text-[14px] font-semibold hover:bg-ink hover:text-canvas transition-all duration-300 group"
          >
            {labels.viewAll}
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      )}
    </section>
  );
}