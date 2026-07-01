/**
 * Skills — public home section. Grouped by `group` (web / design / other),
 * each item shown with a horizontal bar.
 *
 * Server component — data flows down from [locale]/page.tsx.
 * Group labels and descriptions come from i18n translations.
 */

import { SectionHeader } from "@/components/ui/SectionHeader";
import type { TFunction } from "i18next";

export type SkillItem = {
  _id: string;
  name: string;
  group: "web" | "design" | "other";
  order: number;
  yearsOfExperience?: number;
};

interface SkillsProps {
  skills: SkillItem[];
  t: TFunction;
}

const GROUP_ACCENT: Record<string, string> = {
  web: "var(--color-brand-pink)",
  design: "var(--color-brand-teal)",
  other: "var(--color-brand-lavender)",
};

export function Skills({ skills, t }: SkillsProps) {
  const grouped = skills.reduce<Record<string, SkillItem[]>>((acc, s) => {
    if (!acc[s.group]) acc[s.group] = [];
    acc[s.group].push(s);
    return acc;
  }, {});

  Object.values(grouped).forEach((arr) =>
    arr.sort((a, b) => a.order - b.order)
  );

  const groupKeys = ["web", "design", "other"] as const;

  return (
    <section
      id="habilidades"
      aria-label={t("skills.title")}
      className="bg-transparent text-ink"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <SectionHeader
          eyebrow={t("skills.eyebrow")}
          title={t("skills.title")}
          subtitle={t("skills.subtitle")}
          align="center"
        />

        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
          {groupKeys.map((groupKey) => {
            const label = t(`skills.groups.${groupKey}.label`);
            const description = t(`skills.groups.${groupKey}.description`);
            const items = grouped[groupKey] ?? [];

          return (
            <div key={groupKey} className="space-y-5">
              <div className="flex items-baseline justify-between border-b border-hairline pb-3">
                <h3 className="text-title-md text-ink">{label}</h3>
                <span className="text-caption-uppercase text-muted">
                  {items.length}
                </span>
              </div>
              <p className="text-body-sm text-muted">{description}</p>

              <ul className="space-y-2 pt-2">
                {items.map((skill) => (
                  <li
                    key={skill._id}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-body-sm text-ink">{skill.name}</span>
                    {skill.yearsOfExperience != null && (
                      <span
                        className="shrink-0 rounded-pill px-2 py-0.5 text-caption font-medium"
                        style={{
                          background: `color-mix(in srgb, ${GROUP_ACCENT[groupKey]} 15%, transparent)`,
                          color: GROUP_ACCENT[groupKey],
                        }}
                      >
                        {skill.yearsOfExperience}{" "}
                        {skill.yearsOfExperience === 1 ? "año" : "años"}
                      </span>
                    )}
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