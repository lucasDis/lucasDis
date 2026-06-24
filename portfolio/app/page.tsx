/**
 * Home (/) — public landing page (Fase 5).
 *
 * Server component. Fetches Profile + 3 featured projects + SiteSettings
 * + Skills + Experience + Education in parallel from MongoDB and composes
 * the home sections framed by the public SiteHeader / SiteFooter.
 *
 * Restructured per Exo Portfolio reference: full CV + portfolio sections
 * rather than just a project showcase.
 *
 * Sections (in display order):
 *   1. Hero band         — eyebrow + h1 + lead + 2 CTAs
 *   2. Featured Projects — 3-up filtered grid + modal
 *   3. About Preview     — full bio + personal info card
 *   4. Services          — 3 feature cards (UX/UI, Frontend, 3D)
 *   5. Skills            — proficiency bars (web / design / other)
 *   6. Resume            — experience + education timeline
 *   7. Contact           — email / phone / location + socials
 *
 * `dynamic = "force-dynamic"` keeps the featured list fresh; the data is
 * also cheap to fetch (singleton + 3 + 25 + 4 + 2 docs), so static caching
 * wouldn't buy much.
 */

import { dbConnect } from "@/lib/db";
import { ProfileModel } from "@/models/Profile";
import { ProjectModel } from "@/models/Project";
import { SiteSettingsModel } from "@/models/SiteSettings";
import { SkillModel } from "@/models/Skill";
import { ExperienceModel } from "@/models/Experience";
import { EducationModel } from "@/models/Education";
import { HeroBand } from "@/components/public/HeroBand";
import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import { BackgroundBlobs } from "@/components/public/BackgroundBlobs";
import {
  FeaturedProjects,
  type FeaturedProject,
} from "@/components/public/home/FeaturedProjects";
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
import { ButtonLink } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function Home() {
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

  // Strip Mongoose metadata (ObjectIds, Date instances) to plain
  // JSON-safe objects so they pass cleanly to the (server) children.
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
      <SiteHeader />

      <BackgroundBlobs />

      <main className="flex-1">
        <HeroBand
          eyebrow="Portfolio 2026"
          title="Diseño UX/UI con propósito y código limpio"
          subtitle="Soy Lucas Ruiz Díaz, diseñador gráfico y desarrollador frontend en Tucumán, Argentina. Diseño plataformas web accesibles, sistemas de identidad y experiencias digitales con foco en detalle y rendimiento."
        >
          <ButtonLink href="/#proyectos" variant="primary" size="default">
            Ver proyectos
          </ButtonLink>
          <ButtonLink href="/#contacto" variant="secondary" size="default">
            Contactar
          </ButtonLink>
        </HeroBand>

        <FeaturedProjects projects={featured} />

        <AboutPreview
          profile={{
            fullName: profile.fullName,
            location: profile.location,
            birthLocation: profile.birthLocation,
            professionalProfile: profile.professionalProfile,
          }}
        />

        <Services />

        <Skills skills={skills} />

        <Resume experiences={experiences} education={education} />

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
      />
    </>
  );
}