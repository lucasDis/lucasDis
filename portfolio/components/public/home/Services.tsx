import { FeatureCard } from "@/components/ui/FeatureCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { TFunction } from "i18next";

/**
 * Services — three saturated feature cards describing the three areas of
 * specialty: UX/UI, Frontend web, and 3D modeling.
 *
 * Content comes from i18n translations (services.items[]).
 * When Lucas's services evolve, this becomes a DB-backed list.
 */

const VARIANTS = ["peach", "ochre", "cream"] as const;

interface ServicesProps {
  t: TFunction;
}

export function Services({ t }: ServicesProps) {
  const items = t("services.items", { returnObjects: true }) as Array<{
    title: string;
    description: string;
  }>;

  return (
    <section
      id="servicios"
      aria-label={t("services.eyebrow")}
      className="bg-transparent py-24 px-6 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow={t("services.eyebrow")}
          title={t("services.title")}
          subtitle={t("services.subtitle")}
        />

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {items.map((service, idx) => (
            <FeatureCard
              key={service.title}
              variant={VARIANTS[idx % VARIANTS.length]}
              title={service.title}
              description={service.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}