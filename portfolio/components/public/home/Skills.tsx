"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Locale } from "@/lib/i18n/settings";

export type SkillItem = {
  _id: string;
  name: string;
  group: "web" | "design" | "other";
  order: number;
  yearsOfExperience?: number;
};

interface SkillsProps {
  skills: SkillItem[];
  locale?: Locale;
  labels: {
    eyebrow: string;
    title: string;
    subtitle: string;
    web: {
      label: string;
      title: string;
      eyebrow: string;
      description: string;
      unit: string;
    };
    design: {
      label: string;
      title: string;
      eyebrow: string;
      description: string;
      unit: string;
    };
    other: {
      label: string;
      title: string;
      eyebrow: string;
      description: string;
      unit: string;
    };
    unitSingle: string;
    unitPlural: string;
  };
}

const GROUP_CONFIG = {
  web: {
    dot: "var(--color-brand-pink)",
    tagBg: "rgba(255, 77, 139, 0.15)",
    tagColor: "var(--color-brand-pink)",
  },
  design: {
    dot: "var(--color-brand-teal)",
    tagBg: "rgba(26, 58, 58, 0.12)",
    tagColor: "var(--color-brand-teal)",
  },
  other: {
    dot: "var(--color-brand-lavender)",
    tagBg: "rgba(184, 164, 237, 0.28)",
    tagColor: "#5a4a8a",
  },
};

export function Skills({ skills, labels }: SkillsProps) {
  const [activeTab, setActiveTab] = useState<"web" | "design" | "other">("web");

  // Group and sort the skills from the database dynamically
  const grouped = skills.reduce<Record<string, SkillItem[]>>((acc, s) => {
    if (!acc[s.group]) acc[s.group] = [];
    acc[s.group].push(s);
    return acc;
  }, {});

  Object.values(grouped).forEach((arr) =>
    arr.sort((a, b) => a.order - b.order)
  );

  const activeSkills = grouped[activeTab] ?? [];
  const activeGroup = labels[activeTab];
  const activeStyle = GROUP_CONFIG[activeTab];
  const groupKeys = ["web", "design", "other"] as const;

  return (
    <section
      id="habilidades"
      aria-label={labels.title}
      className="bg-transparent text-ink select-none"
    >
      {/* Reduced vertical padding to py-16 lg:py-24 to make sections more compact */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        <SectionHeader
          eyebrow={labels.eyebrow}
          title={labels.title}
          subtitle={labels.subtitle}
          align="center"
        />

        {/* Tab Switcher (flotante centrado sin dots) */}
        <div
          role="tablist"
          className="mx-auto mt-12 display inline-flex gap-2 p-1.5 border border-[#e5e5e5] rounded-full bg-surface-soft w-fit relative left-1/2 -translate-x-1/2"
        >
          {groupKeys.map((key) => {
            const isActive = activeTab === key;
            const gText = labels[key];

            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(key)}
                className={`inline-flex items-center justify-center min-w-30 md:min-w-35 px-6 py-2 text-[14px] font-semibold rounded-full cursor-pointer transition-all duration-300 ${
                  isActive
                    ? "bg-[#0a0a0a] border border-[#0a0a0a] text-canvas shadow-sm"
                    : "bg-transparent border border-transparent text-body hover:text-[#0a0a0a]"
                }`}
              >
                {gText.label}
              </button>
            );
          })}
        </div>

        {/* Card Bento Unificada - Expanded to full max-w-7xl to match Services and About layout */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-[5fr_7fr] gap-10 items-start p-6 md:p-10 border border-[#e5e5e5] rounded-3xl bg-surface-card shadow-sm transition-all duration-500">
          
          {/* Lado izquierdo: Textos y Eyebrow (sin dot) */}
          <div className="flex flex-col gap-5">
            {/* Categoría Badge */}
            <div
              className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase w-fit"
              style={{
                backgroundColor: activeStyle.tagBg,
                color: activeStyle.tagColor,
              }}
            >
              {activeGroup.eyebrow}
            </div>

            {/* Título de la sección activa */}
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0a0a0a]">
              {activeGroup.title}
            </h3>

            {/* Descripción activa */}
            <p className="text-body-sm text-body leading-relaxed">
              {activeGroup.description}
            </p>

            {/* Contador de herramientas con unidad dinámica por tab */}
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-bold tracking-tight text-[#0a0a0a] leading-none">
                {activeSkills.length}
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#888888]">
                {activeGroup.unit}
              </span>
            </div>
          </div>

          {/* Lado derecho: Lista vertical de chips de habilidades (sin dot) */}
          <div className="flex flex-col gap-2.5 w-full">
            {activeSkills.map((skill) => {
              const years = skill.yearsOfExperience;
              const unitLabel = years === 1 ? labels.unitSingle : labels.unitPlural;

              return (
                <div
                  key={skill._id}
                  className="flex items-center justify-between gap-3 px-4 py-3 border border-[#e5e5e5] rounded-xl bg-canvas text-[14px] font-semibold text-[#0a0a0a] hover:border-[#cacaca] transition-colors"
                >
                  <span className="inline-flex items-center">
                    {skill.name}
                  </span>

                  {years != null && (
                    <span
                      className="inline-flex items-baseline gap-0.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide"
                      style={{
                        backgroundColor: activeStyle.tagBg,
                        color: activeStyle.tagColor,
                      }}
                    >
                      <span className="text-[12px] font-black">{years}</span>
                      {unitLabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}