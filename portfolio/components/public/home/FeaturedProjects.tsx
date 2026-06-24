"use client";

/**
 * Featured Projects — client component with category filter + modal detail.
 *
 * Layout (home section):
 *   - SectionHeader + filter chips (Todos / Web / UX-UI / Branding / etc.)
 *   - 3-column grid of project preview cards (2 on tablet, 1 on mobile)
 *   - Click a card → modal opens with full project detail + scroll effect
 *
 * Modal:
 *   - 80vw × 70vh, backdrop blur, rounded, drop shadow.
 *   - Sticky image at the top of the modal's internal scroll (45vh tall).
 *   - Cream content card (max-w-60ch) scrolls up over the image with
 *     a dark gradient fade for readability — mini version of the Pug CSS
 *     scroll technique adapted to the modal context.
 *   - Close: X button, Escape key, or backdrop click.
 *   - Body scroll locked while open.
 *
 * Accessibility: focus-visible rings, aria-modal/role=dialog, aria-selected
 * on filter chips, aria-label on close button.
 */

import { useCallback, useEffect, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";

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
  media: Array<{ url: string; alt: string; order: number }>;
  externalLinks?: Array<{ label: string; url: string }>;
};

interface FeaturedProjectsProps {
  projects: FeaturedProject[];
}

const CATEGORY_LABELS: Record<string, string> = {
  all: "Todos",
  web: "Web",
  "graphic-design": "Diseño Gráfico",
  "ux-ui": "UX/UI",
  "3d": "3D",
  branding: "Branding",
};

// Order: "Todos" first, then the categories we actually have.
const FILTER_CATEGORIES = [
  "all",
  "web",
  "ux-ui",
  "branding",
  "graphic-design",
  "3d",
] as const;

// Thin accent bar on preview cards — cycles through the three primary
// brand colors so the section ties back to the palette.
const ACCENTS = ["brand-pink", "brand-teal", "brand-lavender"] as const;

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const [filter, setFilter] = useState<string>("all");
  const [activeProject, setActiveProject] = useState<FeaturedProject | null>(
    null
  );

  const filteredProjects =
    filter === "all"
      ? projects
      : projects.filter((p) => p.category === filter);

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
      aria-label="Proyectos destacados"
      className="bg-transparent text-ink"
    >
      <div className="mx-auto max-w-7xl px-6 pt-24 pb-12 lg:pt-32 lg:pb-16">
        <SectionHeader
          eyebrow="Portfolio"
          title="Proyectos destacados"
          subtitle="Una selección de trabajos recientes en web, branding, UX/UI y 3D."
          align="left"
        />

        <div
          className="filter-chips mt-10"
          role="tablist"
          aria-label="Filtrar proyectos por categoría"
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
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-24 lg:pb-32">
        {filteredProjects.length === 0 ? (
          <p className="py-16 text-center text-body-md text-muted">
            No hay proyectos en esta categoría todavía.
          </p>
        ) : (
          <div className="project-grid">
            {filteredProjects.map((project, idx) => (
              <ProjectCardPreview
                key={project._id}
                project={project}
                accent={ACCENTS[idx % ACCENTS.length]}
                onOpen={() => openModal(project)}
              />
            ))}
          </div>
        )}
      </div>

      {activeProject && (
        <ProjectModal project={activeProject} onClose={closeModal} />
      )}
    </section>
  );
}

function ProjectCardPreview({
  project,
  accent,
  onOpen,
}: {
  project: FeaturedProject;
  accent: (typeof ACCENTS)[number];
  onOpen: () => void;
}) {
  const cover = project.media[0];
  const categoryLabel = CATEGORY_LABELS[project.category] ?? project.category;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="project-card-preview group"
      aria-label={`Ver detalles de ${project.title}`}
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
        <span
          aria-hidden="true"
          className="project-card-preview-accent"
          style={{ background: `var(--color-${accent})` }}
        />
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

function ProjectModal({
  project,
  onClose,
}: {
  project: FeaturedProject;
  onClose: () => void;
}) {
  const cover = project.media[0];
  const categoryLabel = CATEGORY_LABELS[project.category] ?? project.category;

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
          aria-label="Cerrar modal"
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
            {cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover.url}
                alt={cover.alt || project.title}
                loading="eager"
                decoding="async"
              />
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
                    <dt className="text-muted">Cliente</dt>
                    <dd className="text-ink">{project.client}</dd>
                  </>
                )}
                {project.role && (
                  <>
                    <dt className="text-muted">Rol</dt>
                    <dd className="text-ink">{project.role}</dd>
                  </>
                )}
              </dl>
            )}

            <p className="mt-6 text-body-md text-body">
              {project.shortDescription}
            </p>

            {project.longDescription && (
              <div className="mt-6 whitespace-pre-line text-body-md text-body">
                {project.longDescription}
              </div>
            )}

            {project.tools && project.tools.length > 0 && (
              <>
                <h3 className="mt-8 text-caption-uppercase text-muted">
                  Herramientas
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
          </article>
        </div>
      </div>
    </div>
  );
}