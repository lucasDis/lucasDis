/**
 * Project detail page — /[locale]/proyectos/[slug]
 *
 * Server component. Fetches a single project by slug from MongoDB.
 * Renders ProjectDetailPage — one reusable component for all projects,
 * no per-project code duplication.
 */

import { dbConnect } from "@/lib/db";
import { ProjectModel } from "@/models/Project";
import { ProfileModel } from "@/models/Profile";
import { SiteSettingsModel } from "@/models/SiteSettings";
import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import { BackgroundBlobs } from "@/components/public/BackgroundBlobs";
import { ProjectDetailPage } from "@/components/public/ProjectDetailPage";
import { PROJECT_FILTER_CATEGORIES } from "@/lib/project-categories";
import { getTranslation } from "@/lib/i18n/server";
import { isSupportedLocale, defaultLocale } from "@/lib/i18n/settings";
import { notFound } from "next/navigation";
import type { FeaturedProject } from "@/components/public/home/FeaturedProjects";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function ProjectSlugPage({ params }: Props) {
  const { locale, slug } = await params;
  const resolvedLocale = isSupportedLocale(locale) ? locale : defaultLocale;
  const { t } = await getTranslation(resolvedLocale);

  await dbConnect();

  const [projectRaw, profileRaw, settingsRaw] = await Promise.all([
    ProjectModel.findOne({ slug, published: true }).lean(),
    ProfileModel.findOne().lean(),
    SiteSettingsModel.findOne().lean(),
  ]);

  if (!projectRaw) notFound();
  if (!profileRaw || !settingsRaw) notFound();

  const project = JSON.parse(JSON.stringify(projectRaw)) as FeaturedProject;
  const profile = JSON.parse(JSON.stringify(profileRaw)) as {
    fullName: string;
    location: string;
    email: string;
    phone: string;
    professionalProfile: string;
  };
  const settings = JSON.parse(JSON.stringify(settingsRaw)) as {
    footerText: string;
    socialLinks?: {
      linkedin?: string;
      github?: string;
      behance?: string;
      instagram?: string;
    };
  };

  const labels = {
    eyebrow: t("projects.eyebrow"),
    title: t("projects.title"),
    subtitle: t("projects.subtitle"),
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
    readMore: t("projects.read_more"),
    showLess: t("projects.show_less"),
    pauseSlideshow: t("projects.pause_slideshow"),
    playSlideshow: t("projects.play_slideshow"),
    expandImage: t("projects.expand_image"),
  };

  return (
    <>
      <SiteHeader
        locale={resolvedLocale}
        variant="dark"
        position="relative"
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
        <ProjectDetailPage
          project={project}
          labels={labels}
          locale={resolvedLocale}
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
