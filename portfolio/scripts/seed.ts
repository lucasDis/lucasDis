/**
 * scripts/seed.ts — initial database seed.
 *
 * Idempotent: drops the seeded collections and re-inserts from PROMPT.md §4
 * plus a small set of sample projects (so the home has something to render
 * in Fase 5). Safe to re-run. Does NOT touch ContactMessages (user-generated).
 *
 * Run with:
 *   npm run db:seed
 * (which calls `tsx --env-file=.env.local scripts/seed.ts`)
 */

import { dbConnect } from "../lib/db";
import { UserModel } from "../models/User";
import { ProfileModel } from "../models/Profile";
import { ExperienceModel } from "../models/Experience";
import { EducationModel } from "../models/Education";
import { SkillModel } from "../models/Skill";
import { SiteSettingsModel } from "../models/SiteSettings";
import { ProjectModel } from "../models/Project";

const PROFILE = {
  fullName: "Lucas Gonzalo Ruiz Díaz",
  birthLocation: "Corrientes, Argentina",
  location: "Tucumán, Argentina",
  phone: "+54 3773 461508",
  email: "lg_ruizdiaz@hotmail.com",
  linkedin: "linkedin.com/in/Lucas-Gonzalo-Ruiz-Diaz",
  github: "github.com/lucasDis",
  professionalProfile: `Diseñador Gráfico y Desarrollador Frontend con formación universitaria en Diseño Gráfico y Multimedia. Experiencia en desarrollo de plataformas web institucionales, sistemas de identidad visual y gestión de entornos WordPress en organismos públicos y empresas privadas. Especializado en diseño responsive, optimización SEO, estándares de accesibilidad (WCAG) y experiencia de usuario (UX/UI). Orientado a la eficiencia funcional, coherencia visual y mejora continua de procesos digitales.`,
};

const EXPERIENCES = [
  {
    company: "Municipalidad de Mercedes",
    role: "Encargado Diseñador Gráfico",
    startDate: new Date("2023-01-01"),
    endDate: new Date("2026-02-01"),
    order: 0,
    description: `- Implementación y gestión de WordPress institucional con estándares WCAG y mobile-first.
- SEO técnico, optimización y configuración avanzada de plugins.
- Diseño y producción de comunicación visual institucional.`,
  },
  {
    company: "Easy Life Marketing",
    role: "Diseñador Web y Gráfico",
    startDate: new Date("2022-10-01"),
    endDate: new Date("2023-01-01"),
    order: 1,
    description: `- Desarrollo y maquetación de sitios web responsive (Elementor, Divi, Breakdance).
- Personalización técnica, SEO on-page y optimización de rendimiento.
- Diseño de identidad visual y piezas gráficas para marketing digital.`,
  },
  {
    company: "SynergIT",
    role: "Diseñador UX/UI",
    startDate: new Date("2022-01-01"),
    endDate: new Date("2022-08-01"),
    order: 2,
    description: `- Diseño de wireframes y prototipos de alta fidelidad con enfoque centrado en el usuario.
- Coordinación con desarrollo para implementación y control visual UI.
- Optimización de experiencia y arquitectura de interfaces digitales.`,
  },
  {
    company: "Freelance",
    role: "Diseñador",
    startDate: new Date("2021-06-01"),
    endDate: new Date("2022-01-01"),
    order: 3,
    description: `- Diseño de interfaces y sistemas visuales digitales.
- Maquetación web responsive (HTML, CSS, frameworks modernos).
- Control de calidad visual y optimización UX.
- Modelado y renderizado 3D (Blender).`,
  },
];

const EDUCATION = [
  {
    title: "Licenciatura en Diseño Gráfico y Multimedia",
    institution: "Universidad de la Cuenca del Plata",
    startDate: new Date("2018-03-01"),
    endDate: new Date("2021-12-01"),
    order: 0,
    description: "",
  },
  {
    title: "Desarrollador Frontend",
    institution: "Coderhouse",
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-12-01"),
    order: 1,
    description: "",
  },
];

const SKILLS: Array<{ name: string; group: "web" | "design" | "other"; order: number; yearsOfExperience: number }> = [
  // Web
  { name: "HTML5", group: "web", order: 0, yearsOfExperience: 4 },
  { name: "CSS3", group: "web", order: 1, yearsOfExperience: 4 },
  { name: "JavaScript", group: "web", order: 2, yearsOfExperience: 3 },
  { name: "React.js", group: "web", order: 3, yearsOfExperience: 2 },
  { name: "Tailwind CSS", group: "web", order: 4, yearsOfExperience: 2 },
  { name: "Bootstrap", group: "web", order: 5, yearsOfExperience: 3 },
  { name: "WordPress (Elementor, Divi, Breakdance)", group: "web", order: 6, yearsOfExperience: 3 },

  // Design
  { name: "Adobe Photoshop", group: "design", order: 0, yearsOfExperience: 7 },
  { name: "Adobe Illustrator", group: "design", order: 1, yearsOfExperience: 7 },
  { name: "Adobe InDesign", group: "design", order: 2, yearsOfExperience: 5 },
  { name: "Premiere Pro", group: "design", order: 3, yearsOfExperience: 4 },
  { name: "After Effects", group: "design", order: 4, yearsOfExperience: 3 },
  { name: "CapCut", group: "design", order: 5, yearsOfExperience: 2 },
  { name: "Figma", group: "design", order: 6, yearsOfExperience: 3 },
  { name: "CorelDRAW", group: "design", order: 7, yearsOfExperience: 6 },
  { name: "Blender 5.0", group: "design", order: 8, yearsOfExperience: 2 },
  { name: "SketchUp", group: "design", order: 9, yearsOfExperience: 2 },
  { name: "Canva", group: "design", order: 10, yearsOfExperience: 4 },

  // Other
  { name: "Diseño Responsive y Mobile-First", group: "other", order: 0, yearsOfExperience: 4 },
  { name: "UX/UI", group: "other", order: 1, yearsOfExperience: 3 },
  { name: "SEO On-Page", group: "other", order: 2, yearsOfExperience: 3 },
  { name: "Accesibilidad Web (WCAG)", group: "other", order: 3, yearsOfExperience: 3 },
  { name: "Comunicación Visual Institucional", group: "other", order: 4, yearsOfExperience: 4 },
];

/**
 * Sample projects — used in Fase 5 home previews. Thumbs come from Unsplash
 * (hotlinkable) so the seed is self-contained until UploadThing is wired
 * (Fase 4E). External links use `example.com` placeholders.
 */
const PROJECTS: Array<{
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  category: "web" | "graphic-design" | "ux-ui" | "3d" | "branding";
  year: number;
  client?: string;
  role: string;
  tools: string[];
  media: Array<{
    url: string;
    type: "image" | "video";
    alt: string;
    order: number;
  }>;
  externalLinks: Array<{ label: string; url: string }>;
  featured: boolean;
  published: boolean;
  order: number;
}> = [
  {
    slug: "municipalidad-mercedes-web",
    title: "Municipalidad de Mercedes — Web institucional",
    shortDescription:
      "Sitio institucional con CMS multi-rol, accesibilidad WCAG AA y SEO técnico on-page.",
    longDescription:
      "Rediseño completo del portal institucional de la Municipalidad de Mercedes sobre WordPress. Sistema multi-rol con tres perfiles editoriales, plantillas accesibles WCAG 2.1 nivel AA, optimización SEO on-page y mobile-first. Más de 15.000 visitas mensuales sostenidas con mantenimiento no técnico.",
    category: "web",
    year: 2023,
    client: "Municipalidad de Mercedes",
    role: "Diseñador + desarrollador frontend",
    tools: ["WordPress", "Elementor", "PHP", "MySQL", "WCAG", "SEO"],
    media: [
      {
        url: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1200&q=70",
        type: "image",
        alt: "Captura del sitio institucional de la Municipalidad de Mercedes",
        order: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=70",
        type: "image",
        alt: "Vista del panel de administración del CMS",
        order: 1,
      },
    ],
    externalLinks: [
      { label: "Ver sitio en vivo", url: "https://example.com/mercedes" },
    ],
    featured: true,
    published: true,
    order: 0,
  },
  {
    slug: "branding-estudio-juridico-lopez",
    title: "Estudio Jurídico López & Asoc. — Identidad visual",
    shortDescription:
      "Sistema de identidad completo: logotipo, papelería, manual de marca y aplicaciones digitales.",
    longDescription:
      "Desarrollo del sistema de identidad visual para un estudio jurídico regional. Incluye isotipo, logotipo principal y secundario, paleta cromática, tipografías, papelería institucional, manual de marca y kit de plantillas para redes sociales y piezas digitales.",
    category: "branding",
    year: 2024,
    client: "López & Asoc.",
    role: "Diseño de identidad",
    tools: ["Illustrator", "Figma", "Photoshop"],
    media: [
      {
        url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=70",
        type: "image",
        alt: "Manual de marca y aplicaciones en papelería",
        order: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1561070791-2526d30994b8?auto=format&fit=crop&w=1200&q=70",
        type: "image",
        alt: "Proceso de diseño del logotipo",
        order: 1,
      },
    ],
    externalLinks: [],
    featured: true,
    published: true,
    order: 1,
  },
  {
    slug: "app-gestion-turnos-ux-ui",
    title: "App Mobile — Gestión de Turnos Médicos",
    shortDescription:
      "Diseño UX/UI end-to-end para app de reserva de turnos con foco en accesibilidad.",
    longDescription:
      "Proyecto de diseño de experiencia completo: research con usuarios, wireframes en baja fidelidad, prototipo de alta fidelidad testeado con Maze y sistema de diseño en Figma. La app prioriza accesibilidad y legibilidad para usuarios adultos mayores, con tipografía ampliada, alto contraste y navegación simplificada.",
    category: "ux-ui",
    year: 2024,
    client: "Cliente confidencial",
    role: "UX/UI Designer",
    tools: ["Figma", "FigJam", "Maze"],
    media: [
      {
        url: "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=70",
        type: "image",
        alt: "Pantallas del prototipo de alta fidelidad en Figma",
        order: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=70",
        type: "image",
        alt: "Flujo de reserva de turnos paso a paso",
        order: 1,
      },
    ],
    externalLinks: [],
    featured: true,
    published: true,
    order: 2,
  },
  {
    slug: "render-cabana-3d-blender",
    title: "Render Cabaña de Montaña — Portfolio inmobiliario",
    shortDescription:
      "Renderizado fotorrealista en Blender 5.0 para promoción de complejo de cabañas.",
    longDescription:
      "Modelado 3D completo de cabaña estilo alpino y entorno boscoso. Iluminación natural, materiales procedurales, Cycles render con post-producción en Photoshop. Entregado en cuatro vistas: exterior frontal, exterior 3/4, interior living y atardecer.",
    category: "3d",
    year: 2023,
    role: "Modelado + render",
    tools: ["Blender 5.0", "Photoshop"],
    media: [
      {
        url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=70",
        type: "image",
        alt: "Render exterior de la cabaña en entorno boscoso",
        order: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1633409361618-c73427e4e206?auto=format&fit=crop&w=1200&q=70",
        type: "image",
        alt: "Render interior del living con iluminación cálida",
        order: 1,
      },
    ],
    externalLinks: [],
    featured: false,
    published: true,
    order: 3,
  },
  {
    slug: "campana-redes-easy-life",
    title: "Campaña Redes — Easy Life Marketing",
    shortDescription:
      "Sistema de piezas gráficas mensuales para campaña digital de marca lifestyle.",
    longDescription:
      "Diseño y producción de piezas para campañas digitales mensuales: posts para Instagram y Facebook, stories animados, banners para newsletter. Sistema de plantillas con variantes para fechas especiales y lanzamientos de producto, manteniendo coherencia visual con la marca.",
    category: "graphic-design",
    year: 2022,
    client: "Easy Life Marketing",
    role: "Diseñador gráfico",
    tools: ["Photoshop", "Illustrator", "After Effects"],
    media: [
      {
        url: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1200&q=70",
        type: "image",
        alt: "Piezas de la campaña para Instagram y stories",
        order: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?auto=format&fit=crop&w=1200&q=70",
        type: "image",
        alt: "Sistema de plantillas y variantes para fechas especiales",
        order: 1,
      },
    ],
    externalLinks: [],
    featured: false,
    published: true,
    order: 4,
  },
];

const SITE_SETTINGS = {
  siteTitle: "Lucas Ruiz Díaz — Diseñador UX/UI & Frontend",
  siteDescription:
    "Portfolio de Lucas Ruiz Díaz, diseñador gráfico y desarrollador frontend especializado en UX/UI, accesibilidad WCAG y diseño responsive en Tucumán, Argentina.",
  ogImage: "",
  footerText: "Diseñado y desarrollado en Tucumán, Argentina.",
  socialLinks: {
    linkedin: "https://linkedin.com/in/Lucas-Gonzalo-Ruiz-Diaz",
    github: "https://github.com/lucasDis",
  },
};

async function main() {
  await dbConnect();
  console.log("✔ Connected to MongoDB");

  // ── User (admin) ──
  // Fase 3 will replace the placeholder hash with a real bcrypt hash.
  // The seed never produces a real hash here — it only ensures the
  // document exists with a clearly invalid hash so Fase 3 fails loudly
  // if the env var is missing.
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@portfolio.local";
  const adminName = process.env.ADMIN_NAME ?? "Lucas";
  await UserModel.deleteMany({ role: "admin" });
  await UserModel.create({
    email: adminEmail,
    passwordHash: process.env.ADMIN_PASSWORD_HASH ?? "REPLACE_IN_FASE_3",
    name: adminName,
    role: "admin",
  });
  console.log(`✔ User: ${adminEmail} (password hash: ${process.env.ADMIN_PASSWORD_HASH ? "from env" : "placeholder — set ADMIN_PASSWORD_HASH"})`);

  // ── Profile (singleton) ──
  await ProfileModel.deleteMany({});
  await ProfileModel.create(PROFILE);
  console.log("✔ Profile (singleton)");

  // ── Site settings (singleton) ──
  await SiteSettingsModel.deleteMany({});
  await SiteSettingsModel.create(SITE_SETTINGS);
  console.log("✔ SiteSettings (singleton)");

  // ── Experience ──
  await ExperienceModel.deleteMany({});
  await ExperienceModel.insertMany(EXPERIENCES);
  console.log(`✔ Experience: ${EXPERIENCES.length} entries`);

  // ── Education ──
  await EducationModel.deleteMany({});
  await EducationModel.insertMany(EDUCATION);
  console.log(`✔ Education: ${EDUCATION.length} entries`);

  // ── Skills ──
  await SkillModel.deleteMany({});
  await SkillModel.insertMany(SKILLS);
  console.log(`✔ Skills: ${SKILLS.length} entries`);

  // ── Projects (sample data so the home has something to render in Fase 5) ──
  await ProjectModel.deleteMany({});
  await ProjectModel.insertMany(PROJECTS);
  console.log(`✔ Projects: ${PROJECTS.length} entries`);

  // ContactMessages are intentionally NOT seeded — user-generated.

  console.log("\n✔ Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("✘ Seed failed:");
  console.error(err);
  process.exit(1);
});
