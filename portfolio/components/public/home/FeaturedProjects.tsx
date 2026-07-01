"use client";

/**
 * Featured Projects — client component with category filter + modal detail.
 *
 * Layout (home section):
 *   - SectionHeader + filter chips (All / Web / UX-UI / Branding / etc.)
 *   - 3-column grid of project preview cards (2 on tablet, 1 on mobile)
 *   - Click a card → modal opens with full project detail + scroll effect
 *
 * i18n: strings are resolved server-side and passed as `labels` prop.
 * This keeps the Client Component free from i18next dependency.
 *
 * Accessibility: focus-visible rings, aria-modal/role=dialog, aria-selected
 * on filter chips, aria-label on close button.
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
  media: Array<{ url: string; type: "image" | "video"; alt: string; order: number }>;
  externalLinks?: Array<{ label: string; url: string }>;
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
  /** i18n labels resolved server-side — no functions allowed in Client Components */
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

  const filteredProjects =
    filter === "all" ? projects : projects.filter((p) => p.category === filter);

  const openModal = useCallback((project: FeaturedProject) => {
    setActiveProject(project);
  }, []);

  const closeModal = useCallback(() => {
    setActiveProject(null);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!activeProject) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [activeProject]);

  // Escape key closes modal
  useEffect(() => {
    if (!activeProject) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeProject, closeModal]);

  return (
    <section
      id="proyectos"
      aria-label={labels.title}
      className="bg-transparent text-ink"
    >
      <div className="mx-auto max-w-7xl px-6 pt-24 pb-12 lg:pt-32 lg:pb-16">
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

      <div className="mx-auto max-w-7xl px-6 pb-24 lg:pb-32">
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
  const cover = project.media[0];

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

function ProjectMediaItem({ url, type, alt }: { url: string; type: "image" | "video"; alt: string }) {
  if (type === "video") {
    const embedUrl = getEmbedUrl(url);
    if (embedUrl) {
      return (
        <div className="relative w-full aspect-video overflow-hidden rounded-lg border border-hairline bg-surface-soft shadow-sm">
          <iframe
            src={embedUrl}
            title={alt}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    return (
      <div className="overflow-hidden rounded-lg border border-hairline bg-surface-soft shadow-sm">
        <video
          src={url}
          controls
          className="w-full h-auto max-h-[60vh] object-contain mx-auto"
          aria-label={alt}
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-hairline bg-surface-soft shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        className="w-full h-auto object-contain max-h-[80vh] mx-auto"
        loading="lazy"
      />
    </div>
  );
}

function ProjectModal({
  project,
  onClose,
  labels,
}: {
  project: FeaturedProject;
  onClose: () => void;
  labels: FeaturedProjectsLabels;
}) {
  const coverImage = project.media.find((m) => m.type === "image") || project.media[0];
  const categoryLabel = labels.categories[project.category] ?? project.category;

  return (
    <div
      className="project-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`modal-${project.slug}-title`}
    >
      <div className="project-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="project-modal-close"
          aria-label={labels.closeModal}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 5L15 15M15 5L5 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="project-modal-scroll">
          <figure className="project-modal-image">
            {coverImage && (
              coverImage.type === "video" ? (
                <video
                  src={coverImage.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverImage.url}
                  alt={coverImage.alt || project.title}
                  loading="eager"
                  decoding="async"
                />
              )
            )}
          </figure>

          <article className="project-modal-content">
            <div className="flex items-center justify-between text-caption-uppercase text-muted">
              <span>{categoryLabel}</span>
              <span>{project.year}</span>
            </div>

            <h2
              id={`modal-${project.slug}-title`}
              className="mt-3 text-display-md text-ink"
            >
              {project.title}
            </h2>

            {(project.client || project.role) && (
              <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-body-sm">
                {project.client && (
                  <>
                    <dt className="text-muted">{labels.client}</dt>
                    <dd className="text-ink">{project.client}</dd>
                  </>
                )}
                {project.role && (
                  <>
                    <dt className="text-muted">{labels.role}</dt>
                    <dd className="text-ink">{project.role}</dd>
                  </>
                )}
              </dl>
            )}

            <p className="mt-6 text-body-md text-body">{project.shortDescription}</p>

            {project.longDescription && (
              <div className="mt-6 whitespace-pre-line text-body-md text-body">
                {project.longDescription}
              </div>
            )}

            {project.tools && project.tools.length > 0 && (
              <>
                <h3 className="mt-8 text-caption-uppercase text-muted">
                  {labels.tools}
                </h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {project.tools.map((tool) => (
                    <li
                      key={tool}
                      className="rounded-pill bg-surface-card px-3 py-1 text-caption text-ink"
                    >
                      {tool}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {project.externalLinks && project.externalLinks.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {project.externalLinks.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-body-sm font-medium text-brand-pink underline-offset-4 hover:underline"
                  >
                    {link.label}
                    <span aria-hidden="true">→</span>
                  </a>
                ))}
              </div>
            )}

            {/* Project Gallery / Media Items */}
            {project.media && project.media.length > 0 && (
              <div className="mt-12 space-y-6 border-t border-hairline pt-10">
                <h3 className="text-caption-uppercase text-muted">
                  Galería del proyecto
                </h3>
                <div className="flex flex-col gap-6">
                  {project.media.map((item, idx) => (
                    <ProjectMediaItem
                      key={idx}
                      url={item.url}
                      type={item.type as "image" | "video"}
                      alt={item.alt || `${project.title} - ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}