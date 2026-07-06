/**
 * All Projects Page ([locale]/proyectos) — public page listing all projects.
 *
 * Server component. Fetches all published projects, Profile, and SiteSettings,
 * and renders them using FeaturedProjects with a full-page view configuration.
 */

import { dbConnect } from "@/lib/db";
import { ProfileModel } from "@/models/Profile";
import { ProjectModel } from "@/models/Project";
import { SiteSettingsModel } from "@/models/SiteSettings";
import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import { BackgroundBlobs } from "@/components/public/BackgroundBlobs";
import {
  FeaturedProjects,
  type FeaturedProject,
} from "@/components/public/home/FeaturedProjects";
import { PROJECT_FILTER_CATEGORIES } from "@/lib/project-categories";
import { getTranslation } from "@/lib/i18n/server";
import { isSupportedLocale, defaultLocale } from "@/lib/i18n/settings";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  const resolvedLocale = isSupportedLocale(locale) ? locale : defaultLocale;
  const { t } = await getTranslation(resolvedLocale);

  await dbConnect();

  const [profileRaw, projectsRaw, settingsRaw] = await Promise.all([
    ProfileModel.findOne().lean(),
    ProjectModel.find({ published: true })
      .sort({ order: 1, createdAt: -1 })
      .lean(),
    SiteSettingsModel.findOne().lean(),
  ]);

  if (!profileRaw || !settingsRaw) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-6 text-center">
        <p className="text-body-md text-muted">
          Cargando configuración... Ejecute el seed si es la primera vez.
        </p>
      </div>
    );
  }

  const profile = JSON.parse(JSON.stringify(profileRaw)) as {
    fullName: string;
    location: string;
    email: string;
    phone: string;
    professionalProfile: string;
  };
  const projects = JSON.parse(JSON.stringify(projectsRaw)) as FeaturedProject[];
  const settings = JSON.parse(JSON.stringify(settingsRaw)) as {
    footerText: string;
    socialLinks?: {
      linkedin?: string;
      github?: string;
      behance?: string;
      instagram?: string;
    };
  };

  return (
    <>
      <SiteHeader
        locale={resolvedLocale}
        labels={{
          projects: t("nav.projects"),
          about: t("nav.about"),
          services: t("nav.services"),
          skills: t("nav.skills"),
          cv: t("nav.cv"),
          hire: t("nav.hire"),
        }}
      />

      <BackgroundBlobs />

      <main className="flex-1">
        <FeaturedProjects
          projects={projects}
          featuredOnly={false}
          labels={{
            eyebrow: t("projects.all_eyebrow"),
            title: t("projects.all_title"),
            subtitle: t("projects.all_subtitle"),
            empty: t("projects.empty"),
            closeModal: t("projects.close_modal"),
            filterLabel: t("projects.filter_label"),
            client: t("projects.client"),
            role: t("projects.role"),
            tools: t("projects.tools"),
            categories: Object.fromEntries(
              PROJECT_FILTER_CATEGORIES.map((cat) => [cat, t(`projects.categories.${cat}`)])
            ),
            openDetailsTemplate: t("projects.open_details"),
            statusCompleted: t("projects.status.completed"),
            statusOngoing: t("projects.status.ongoing"),
            searchPlaceholder: t("projects.search_placeholder"),
            allYears: t("projects.all_years"),
          }}
        />
      </main>

      <SiteFooter
        profile={{
          fullName: profile.fullName,
          location: profile.location,
          email: profile.email,
          phone: profile.phone,
          professionalProfile: profile.professionalProfile,
        }}
        socialLinks={settings.socialLinks ?? {}}
        footerText={settings.footerText}
        locale={resolvedLocale}
        t={t}
      />
    </>
  );
}
