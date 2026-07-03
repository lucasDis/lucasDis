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

import { useCallback, useEffect, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/Button";
import { PROJECT_FILTER_CATEGORIES } from "@/lib/project-categories";

export type FeaturedProject = {
  _id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription?: string;
  category: string;
  year: number;
  client?: string;
  role?: string;
  tools?: string[];
  media: Array<{ url: string; type: "image" | "video"; alt: string; order: number; isCover?: boolean }>;
  externalLinks?: Array<{ label: string; url: string }>;
  featured?: boolean;
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
};

interface FeaturedProjectsProps {
  projects: FeaturedProject[];
  labels: FeaturedProjectsLabels;
  showViewAll?: boolean;
  viewAllHref?: string;
}

const FILTER_CATEGORIES = PROJECT_FILTER_CATEGORIES;

export function FeaturedProjects({
  projects,
  labels,
  showViewAll = false,
  viewAllHref,
}: FeaturedProjectsProps) {
  const [filter, setFilter] = useState<string>("all");
  const [activeProject, setActiveProject] = useState<FeaturedProject | null>(null);

  // Filter grid to show ONLY featured projects on the homepage
  const featuredProjects = projects.filter((p) => p.featured);
  
  const filteredProjects =
    filter === "all"
      ? featuredProjects
      : featuredProjects.filter((p) => p.category === filter);

  const openModal = useCallback((project: FeaturedProject) => {
    setActiveProject(project);
  }, []);

  const closeModal = useCallback(() => {
    setActiveProject(null);
  }, []);

  // Circular navigation across ALL published projects (not just featured ones)
  const handleNextProject = useCallback(() => {
    if (!activeProject || projects.length <= 1) return;
    const currentIndex = projects.findIndex((p) => p._id === activeProject._id);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % projects.length;
    setActiveProject(projects[nextIndex]);
  }, [activeProject, projects]);

  const handlePrevProject = useCallback(() => {
    if (!activeProject || projects.length <= 1) return;
    const currentIndex = projects.findIndex((p) => p._id === activeProject._id);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
    setActiveProject(projects[prevIndex]);
  }, [activeProject, projects]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!activeProject) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [activeProject]);

  // Keyboard controls for modal (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (!activeProject) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") handleNextProject();
      if (e.key === "ArrowLeft") handlePrevProject();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeProject, closeModal, handleNextProject, handlePrevProject]);

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

        <div
          className="filter-chips mt-10"
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
                  onOpen={() => openModal(project)}
                  openDetailsLabel={labels.openDetailsTemplate.replace("{{title}}", project.title)}
                  categoryLabel={labels.categories[project.category] ?? project.category}
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

      {activeProject && (
        <ProjectModal
          project={activeProject}
          onClose={closeModal}
          onNext={handleNextProject}
          onPrev={handlePrevProject}
          labels={labels}
        />
      )}
    </section>
  );
}

function ProjectCardPreview({
  project,
  onOpen,
  openDetailsLabel,
  categoryLabel,
}: {
  project: FeaturedProject;
  onOpen: () => void;
  openDetailsLabel: string;
  categoryLabel: string;
}) {
  const cover = project.media.find((m) => m.isCover) || project.media[0];

  return (
    <button
      type="button"
      onClick={onOpen}
      className="project-card-preview group"
      aria-label={openDetailsLabel}
    >
      <div className="project-card-preview-image-wrap">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.url}
            alt={cover.alt || project.title}
            loading="lazy"
            decoding="async"
            className="project-card-preview-image"
          />
        ) : (
          <div className="project-card-preview-image bg-surface-strong" />
        )}
      </div>

      <div className="project-card-preview-body">
        <div className="flex items-center justify-between text-caption-uppercase text-muted">
          <span>{categoryLabel}</span>
          <span>{project.year}</span>
        </div>
        <h3 className="mt-2 text-title-md text-ink transition-colors group-hover:text-brand-pink">
          {project.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-body-sm text-body">
          {project.shortDescription}
        </p>
      </div>
    </button>
  );
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null;

  // YouTube regex
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  // Vimeo regex
  const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return null;
}

function ProjectMediaItem({ url, type, alt, onZoom }: { url: string; type: "image" | "video"; alt: string; onZoom?: () => void }) {
  if (type === "video") {
    const embedUrl = getEmbedUrl(url);
    if (embedUrl) {
      return (
        <div className="relative w-full h-full overflow-hidden bg-surface-strong">
          <iframe
            src={embedUrl}
            title={alt}
            className="absolute inset-0 w-full h-full border-0 object-contain"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    return (
      <div className="w-full h-full bg-surface-strong flex items-center justify-center">
        <video
          src={url}
          controls
          className="w-full h-full object-contain"
          aria-label={alt}
        />
      </div>
    );
  }

  return (
    <div
      className="w-full h-full bg-surface-strong flex items-center justify-center cursor-zoom-in"
      onClick={onZoom}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        className="w-full h-full object-contain transition-transform duration-500 hover:scale-[1.02]"
        loading="eager"
      />
    </div>
  );
}

function ProjectModal({
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
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  // Reset active media and zoom when project changes
  useEffect(() => {
    setActiveMediaIndex(0);
    setIsZoomed(false);
  }, [project]);

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

  const activeMedia = project.media[activeMediaIndex] || project.media[0];
  const categoryLabel = labels.categories[project.category] ?? project.category;
  const hasMultipleMedia = project.media && project.media.length > 1;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-24 bg-[#0a0a0a]/20 backdrop-blur-md"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`modal-${project.slug}-title`}
      >
        {/* Navigation Controls (Desktop Overlay - Placed OUTSIDE the modal on the backdrop) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          aria-label="Previous Project"
          className="hidden md:flex absolute top-1/2 left-6 lg:left-10 -translate-y-1/2 z-50 w-14 h-14 items-center justify-center rounded-full bg-canvas/90 backdrop-blur-sm border border-[#e5e5e5] text-body hover:text-[#0a0a0a] hover:bg-surface-soft hover:scale-110 shadow-lg transition-all duration-300"
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
          className="hidden md:flex absolute top-1/2 right-6 lg:right-10 -translate-y-1/2 z-50 w-14 h-14 items-center justify-center rounded-full bg-canvas/90 backdrop-blur-sm border border-[#e5e5e5] text-body hover:text-[#0a0a0a] hover:bg-surface-soft hover:scale-110 shadow-lg transition-all duration-300"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>

        {/* Modal Container */}
        <div
          className="relative w-full max-w-7xl h-full md:h-[80vh] md:max-h-230 bg-canvas rounded-none md:rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row border-0 md:border md:border-[#e5e5e5]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button (Absolute Top Right) */}
          <button
            onClick={onClose}
            aria-label={labels.closeModal}
            className="absolute top-4 right-4 md:top-6 md:right-6 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-surface-soft/90 backdrop-blur-sm border border-[#e5e5e5] text-[#0a0a0a] hover:bg-surface-card hover:scale-105 transition-all duration-300 group"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Left Side: Media Gallery (2/3 width on desktop) */}
          <div className="w-full md:w-2/3 h-[50vh] md:h-full flex flex-col bg-surface-strong relative border-b md:border-b-0 md:border-r border-[#e5e5e5] select-none group">
            {/* Main Featured Image/Video Container */}
            <div className="grow relative overflow-hidden bg-surface-strong media-container">
              {activeMedia ? (
                <ProjectMediaItem
                  url={activeMedia.url}
                  type={activeMedia.type as "image" | "video"}
                  alt={activeMedia.alt || project.title}
                  onZoom={() => setIsZoomed(true)}
                />
              ) : (
                <div className="w-full h-full bg-surface-strong" />
              )}

              {/* View Fullscreen / Expand Hint */}
              {activeMedia && activeMedia.type === "image" && (
                <button
                  onClick={() => setIsZoomed(true)}
                  className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer text-white"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/90">Expand</span>
                </button>
              )}
            </div>

            {/* Thumbnail Strip */}
            {hasMultipleMedia && (
              <div className="h-24 md:h-32 bg-surface-soft flex items-center px-4 overflow-x-auto border-t border-[#e5e5e5] gap-3 shrink-0 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {project.media.map((mediaItem, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`relative w-20 md:w-28 h-14 md:h-20 shrink-0 rounded-lg overflow-hidden border border-[#e5e5e5] transition-all duration-300 ${
                      activeMediaIndex === idx
                        ? "ring-2 ring-brand-pink ring-offset-2 ring-offset-canvas opacity-100 scale-95"
                        : "opacity-50 hover:opacity-100"
                    }`}
                  >
                    {mediaItem.type === "video" ? (
                      <video
                        src={mediaItem.url}
                        className="w-full h-full object-cover pointer-events-none"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${mediaItem.url})` }}
                      />
                    )}
                    {mediaItem.type === "video" && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Project Details (1/3 width on desktop) */}
          <div className="w-full md:w-1/3 h-[50vh] md:h-full overflow-y-auto bg-canvas flex flex-col scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative select-text">
            {/* Content Padding Wrapper */}
            <div className="p-6 md:p-10 flex flex-col gap-6 grow pb-24 md:pb-10">
              {/* Header Info */}
              <header className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-semibold text-brand-pink uppercase tracking-widest px-2 py-0.5 border border-brand-pink/30 rounded">
                    {categoryLabel}
                  </span>
                  <span className="text-[12px] font-semibold text-[#888888]">
                    {project.year}
                  </span>
                </div>
                <h1
                  id={`modal-${project.slug}-title`}
                  className="text-2xl md:text-3xl font-bold tracking-tight text-[#0a0a0a] mt-1"
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

            {/* Sticky Bottom Actions on Mobile (hidden on desktop) */}
            <div className="fixed md:hidden bottom-0 left-0 right-0 p-4 bg-canvas/95 backdrop-blur-md border-t border-[#e5e5e5] flex gap-3 z-30">
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

            {/* External Links Sticky Footer (Desktop/General) */}
            {project.externalLinks && project.externalLinks.length > 0 && (
              <div className="hidden md:flex p-6 border-t border-[#e5e5e5] mt-auto w-full items-center justify-between bg-canvas/85 backdrop-blur-sm sticky bottom-0">
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
          />
        </div>
      )}
    </>
  );
}