/**
 * Home ([locale]/) — public landing page.
 *
 * Server component. Fetches Profile + 3 featured projects + SiteSettings
 * + Skills + Experience + Education in parallel from MongoDB and composes
 * the home sections framed by the public SiteHeader / SiteFooter.
 *
 * The `locale` param comes from the [locale] dynamic segment and is used
 * to load the correct i18n translations via `getTranslation`.
 */

import { dbConnect } from "@/lib/db";
import { ProfileModel } from "@/models/Profile";
import { ProjectModel } from "@/models/Project";
import { SiteSettingsModel } from "@/models/SiteSettings";
import { SkillModel } from "@/models/Skill";
import { ExperienceModel } from "@/models/Experience";
import { EducationModel } from "@/models/Education";
import WarpShaderHero from "@/components/ui/wrap-shader";
import Link from "next/link";
import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import { BackgroundBlobs } from "@/components/public/BackgroundBlobs";
import { FloatingScrollNav } from "@/components/public/FloatingScrollNav";
import {
  FeaturedProjects,
  type FeaturedProject,
} from "@/components/public/home/FeaturedProjects";
import { PROJECT_FILTER_CATEGORIES } from "@/lib/project-categories";
import { AboutPreview } from "@/components/public/home/AboutPreview";
import { Services } from "@/components/public/home/Services";
import {
  Skills,
  type SkillItem,
} from "@/components/public/home/Skills";
import {
  Resume,
  type ExperienceItem,
  type EducationItem,
} from "@/components/public/home/Resume";
import { Contact } from "@/components/public/home/Contact";
import { getTranslation } from "@/lib/i18n/server";
import { isSupportedLocale, defaultLocale } from "@/lib/i18n/settings";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const resolvedLocale = isSupportedLocale(locale) ? locale : defaultLocale;
  const { t } = await getTranslation(resolvedLocale);

  await dbConnect();

  const [
    profileRaw,
    featuredRaw,
    settingsRaw,
    skillsRaw,
    experiencesRaw,
    educationRaw,
  ] = await Promise.all([
    ProfileModel.findOne().lean(),
    ProjectModel.find({ featured: true, published: true })
      .sort({ order: 1, createdAt: -1 })
      .limit(3)
      .lean(),
    SiteSettingsModel.findOne().lean(),
    SkillModel.find().sort({ order: 1 }).lean(),
    ExperienceModel.find().sort({ order: 1, startDate: -1 }).lean(),
    EducationModel.find().sort({ order: 1, startDate: -1 }).lean(),
  ]);

  if (!profileRaw || !settingsRaw) {
    throw new Error(
      "Profile or SiteSettings missing. Run `npm run db:seed` first."
    );
  }

  const profile = JSON.parse(JSON.stringify(profileRaw)) as {
    fullName: string;
    location: string;
    email: string;
    phone: string;
    birthLocation?: string;
    linkedin?: string;
    github?: string;
    behance?: string;
    instagram?: string;
    professionalProfile: string;
  };
  const featured = JSON.parse(JSON.stringify(featuredRaw)) as FeaturedProject[];
  const settings = JSON.parse(JSON.stringify(settingsRaw)) as {
    footerText: string;
    socialLinks?: {
      linkedin?: string;
      github?: string;
      behance?: string;
      instagram?: string;
    };
  };
  const skills = JSON.parse(JSON.stringify(skillsRaw)) as SkillItem[];
  const experiences = JSON.parse(JSON.stringify(experiencesRaw)) as ExperienceItem[];
  const education = JSON.parse(JSON.stringify(educationRaw)) as EducationItem[];

  return (
    <>
      <SiteHeader locale={resolvedLocale} t={t} />

      <BackgroundBlobs />

      <FloatingScrollNav />

      <main className="flex-1">
        <WarpShaderHero
          eyebrow={t("hero.eyebrow")}
          title={t("hero.title")}
          subtitle={t("hero.subtitle")}
        >
          <Link
            href={`/${resolvedLocale}/#proyectos`}
            className="inline-flex h-11 items-center justify-center px-6 bg-on-dark text-primary rounded-pill hover:scale-105 transition-transform duration-300 font-semibold text-button"
          >
            {t("hero.cta_projects")}
          </Link>
          <Link
            href={`/${resolvedLocale}/#contacto`}
            className="inline-flex h-11 items-center justify-center px-6 bg-white/15 backdrop-blur-sm border border-white/20 text-on-dark rounded-pill hover:bg-white/25 transition-all duration-300 hover:scale-105 font-semibold text-button"
          >
            {t("hero.cta_contact")}
          </Link>
        </WarpShaderHero>

        <FeaturedProjects
          projects={featured}
          showViewAll={true}
          viewAllHref={`/${resolvedLocale}/proyectos`}
          labels={{
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
            viewAll: t("projects.view_all"),
          }}
        />

        <AboutPreview
          profile={{
            fullName: profile.fullName,
            location: profile.location,
            birthLocation: profile.birthLocation,
            professionalProfile: profile.professionalProfile,
          }}
          t={t}
        />

        <Services t={t} />

        <Skills skills={skills} t={t} />

        <Resume experiences={experiences} education={education} locale={resolvedLocale} t={t} />

        <Contact
          profile={{
            fullName: profile.fullName,
            email: profile.email,
            phone: profile.phone,
            location: profile.location,
            linkedin: profile.linkedin,
            github: profile.github,
            behance: profile.behance,
            instagram: profile.instagram,
          }}
          t={t}
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
