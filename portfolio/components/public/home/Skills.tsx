/**
 * Skills — public home section. Grouped by `group` (web / design / other),
 * each item shown with a horizontal bar (uniform per-group proficiency for
 * now; could later become per-skill `level` in the model).
 *
 * Server component — data flows down from page.tsx (Experience / Education
 * / Skill models fetched in parallel with the rest of the home data).
 */

import { SectionHeader } from "@/components/ui/SectionHeader";

export type SkillItem = {
  _id: string;
  name: string;
  group: "web" | "design" | "other";
  order: number;
};

interface SkillsProps {
  skills: SkillItem[];
}

const GROUP_META: Record<
  string,
  { label: string; color: string; description: string; percent: number }
> = {
  web: {
    label: "Web",
    color: "var(--color-brand-pink)",
    description: "Stack frontend, CMS y maquetación.",
    percent: 88,
  },
  design: {
    label: "Diseño",
    color: "var(--color-brand-teal)",
    description: "Herramientas gráficas, motion y 3D.",
    percent: 92,
  },
  other: {
    label: "Otros",
    color: "var(--color-brand-lavender)",
    description: "Metodologías y competencias transversales.",
    percent: 80,
  },
};

export function Skills({ skills }: SkillsProps) {
  const grouped = skills.reduce<Record<string, SkillItem[]>>((acc, s) => {
    if (!acc[s.group]) acc[s.group] = [];
    acc[s.group].push(s);
    return acc;
  }, {});

  Object.values(grouped).forEach((arr) =>
    arr.sort((a, b) => a.order - b.order)
  );

  return (
    <section
      id="habilidades"
      aria-label="Habilidades"
      className="bg-transparent text-ink"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <SectionHeader
          eyebrow="Skills"
          title="Habilidades"
          subtitle="Herramientas y metodologías que uso en el día a día."
          align="center"
        />

        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
          {Object.entries(GROUP_META).map(([groupKey, meta]) => {
            const items = grouped[groupKey] ?? [];
            return (
              <div key={groupKey} className="space-y-5">
                <div className="flex items-baseline justify-between border-b border-hairline pb-3">
                  <h3 className="text-title-md text-ink">{meta.label}</h3>
                  <span className="text-caption-uppercase text-muted">
                    {items.length}
                  </span>
                </div>
                <p className="text-body-sm text-muted">{meta.description}</p>

                <ul className="space-y-3 pt-2">
                  {items.map((skill) => (
                    <li
                      key={skill._id}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="text-body-sm text-ink">{skill.name}</span>
                      <span
                        aria-hidden="true"
                        className="h-1 w-32 flex-shrink-0 overflow-hidden rounded-pill bg-surface-strong"
                      >
                        <span
                          className="block h-full rounded-pill"
                          style={{
                            width: `${meta.percent}%`,
                            background: meta.color,
                          }}
                        />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}