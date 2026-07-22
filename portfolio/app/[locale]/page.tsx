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
import WarpShaderHero from "@/components/ui/wrap-shader";
import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import { BackgroundBlobs } from "@/components/public/BackgroundBlobs";
import { FloatingScrollNav } from "@/components/public/FloatingScrollNav";
import {
  FeaturedProjectsList,
  type FeaturedProject,
} from "@/components/public/home/FeaturedProjects";
import { PROJECT_FILTER_CATEGORIES } from "@/lib/project-categories";
import { AboutPreview } from "@/components/public/home/AboutPreview";
import { Services } from "@/components/public/home/Services";
import {
  Skills,
  type SkillItem,
} from "@/components/public/home/Skills";
import { Resume } from "@/components/public/home/Resume";
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
  ] = await Promise.all([
    ProfileModel.findOne().lean(),
    ProjectModel.find({ published: true })
      .sort({ order: 1, createdAt: -1 })
      .lean(),
    SiteSettingsModel.findOne().lean(),
    SkillModel.find().sort({ order: 1 }).lean(),
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

      <FloatingScrollNav />

      <main className="flex-1">
        <WarpShaderHero eyebrow={t("hero.eyebrow")} />


        <FeaturedProjectsList
          projects={featured}
          locale={resolvedLocale}
          viewAllHref={`/${resolvedLocale}/proyectos`}
          labels={{
            eyebrow: t("projects.eyebrow"),
            title: t("projects.title"),
            categories: Object.fromEntries(
              PROJECT_FILTER_CATEGORIES.map((cat) => [cat, t(`projects.categories.${cat}`)])
            ),
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

        <Services
          eyebrow={t("services.eyebrow")}
          title={t("services.title")}
          items={t("services.items", { returnObjects: true }) as any[]}
        />

        <Skills
          skills={skills}
          locale={resolvedLocale}
          labels={{
            eyebrow: t("skills.eyebrow"),
            title: t("skills.title"),
            subtitle: t("skills.subtitle"),
            web: {
              label: t("skills.groups.web.label"),
              title: t("skills.groups.web.title"),
              eyebrow: t("skills.groups.web.eyebrow"),
              description: t("skills.groups.web.description"),
              unit: t("skills.groups.web.unit"),
            },
            design: {
              label: t("skills.groups.design.label"),
              title: t("skills.groups.design.title"),
              eyebrow: t("skills.groups.design.eyebrow"),
              description: t("skills.groups.design.description"),
              unit: t("skills.groups.design.unit"),
            },
            other: {
              label: t("skills.groups.other.label"),
              title: t("skills.groups.other.title"),
              eyebrow: t("skills.groups.other.eyebrow"),
              description: t("skills.groups.other.description"),
              unit: t("skills.groups.other.unit"),
            },
            unitSingle: resolvedLocale === "en" ? "yr" : "año",
            unitPlural: resolvedLocale === "en" ? "yrs" : "años",
          }}
        />

        <Resume
          locale={resolvedLocale}
          labels={{
            eyebrow: t("resume.eyebrow"),
            title: t("resume.title"),
            subtitle: t("resume.subtitle"),
            present: t("resume.present"),
            viewResume: resolvedLocale === "en" ? "View Resume" : "Ver Currículum",
            ctaTitle: resolvedLocale === "en" ? "Realize your vision" : "Hacé realidad tu visión",
            ctaSubtitle: resolvedLocale === "en"
              ? "Explore my professional timeline, education, and technical expertise in detail."
              : "Explorá mi trayectoria profesional, formación académica y competencias técnicas al detalle.",
            close: t("projects.close_modal"),
          }}
        />

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
