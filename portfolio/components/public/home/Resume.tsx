/**
 * Resume — public home section. Two columns (Experiencia / Educación)
 * with a vertical timeline rail. Items sorted by `order` ASC then
 * `startDate` DESC.
 *
 * Server component — data flows down from page.tsx where the
 * Experience / Education models are fetched in parallel.
 */

import { SectionHeader } from "@/components/ui/SectionHeader";

export type ExperienceItem = {
  _id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string | null;
  description: string;
  order: number;
};

export type EducationItem = {
  _id: string;
  title: string;
  institution: string;
  startDate: string;
  endDate: string;
  description: string;
  order: number;
};

interface ResumeProps {
  experiences: ExperienceItem[];
  education: EducationItem[];
}

function formatMonthYear(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "short",
  });
}

function formatRange(start: string, end: string | null): string {
  const startStr = formatMonthYear(start);
  const endStr = end ? formatMonthYear(end) : "Actualidad";
  return `${startStr} — ${endStr}`;
}

export function Resume({ experiences, education }: ResumeProps) {
  return (
    <section
      id="cv"
      aria-label="Currículum"
      className="bg-transparent text-ink"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <SectionHeader
          eyebrow="CV"
          title="Trayectoria"
          subtitle="Experiencia profesional y formación académica."
          align="center"
        />

        <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-2">
          {/* Experience column */}
          <div>
            <h3 className="text-title-md text-ink">Experiencia</h3>
            <ol className="relative mt-8 space-y-10 border-l-2 border-hairline pl-8">
              {experiences.map((exp) => (
                <li key={exp._id} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[37px] top-1 inline-block h-3 w-3 rounded-full bg-brand-pink ring-4 ring-canvas"
                  />
                  <p className="text-caption-uppercase text-muted">
                    {formatRange(exp.startDate, exp.endDate)}
                  </p>
                  <h4 className="mt-1 text-title-sm text-ink">{exp.role}</h4>
                  <p className="mt-1 text-body-sm font-medium text-brand-pink">
                    {exp.company}
                  </p>
                  {exp.description && (
                    <p className="mt-3 whitespace-pre-line text-body-sm text-body">
                      {exp.description}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </div>

          {/* Education column */}
          <div>
            <h3 className="text-title-md text-ink">Educación</h3>
            <ol className="relative mt-8 space-y-10 border-l-2 border-hairline pl-8">
              {education.map((edu) => (
                <li key={edu._id} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[37px] top-1 inline-block h-3 w-3 rounded-full bg-brand-teal ring-4 ring-canvas"
                  />
                  <p className="text-caption-uppercase text-muted">
                    {formatRange(edu.startDate, edu.endDate)}
                  </p>
                  <h4 className="mt-1 text-title-sm text-ink">{edu.title}</h4>
                  <p className="mt-1 text-body-sm font-medium text-brand-teal">
                    {edu.institution}
                  </p>
                  {edu.description && (
                    <p className="mt-3 text-body-sm text-body">
                      {edu.description}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}