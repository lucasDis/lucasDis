import { FeatureCard } from "@/components/ui/FeatureCard";
import { SectionHeader } from "@/components/ui/SectionHeader";

/**
 * Services — three saturated feature cards describing the three areas of
 * specialty: UX/UI, Frontend web, and 3D modeling.
 *
 * Static content (not in DB yet — these are well-defined specializations
 * from the CV and unlikely to change frequently). When Lucas's services
 * evolve, this becomes a DB-backed list.
 */

const SERVICES = [
  {
    title: "Diseño UX/UI",
    description:
      "Diseño de interfaces accesibles, research con usuarios y prototipado de alta fidelidad en Figma.",
    variant: "peach" as const,
  },
  {
    title: "Desarrollo Web Frontend",
    description:
      "Sitios responsive, accesibles (WCAG AA) y rápidos con React, Next.js y Tailwind CSS.",
    variant: "ochre" as const,
  },
  {
    title: "Modelado y Renderizado 3D",
    description:
      "Renders fotorrealistas en Blender para portfolio inmobiliario, producto y visualizaciones.",
    variant: "cream" as const,
  },
];

export function Services() {
  return (
    <section
      id="servicios"
      aria-label="Servicios"
      className="bg-transparent py-24 px-6 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Servicios"
          title="Lo que hago"
          subtitle="Tres áreas de especialidad que se cruzan en cada proyecto."
        />

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {SERVICES.map((service) => (
            <FeatureCard
              key={service.title}
              variant={service.variant}
              title={service.title}
              description={service.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}