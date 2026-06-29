import Link from "next/link";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { ProjectModel } from "@/models/Project";
import { ContactMessageModel } from "@/models/ContactMessage";
import { SkillModel } from "@/models/Skill";
import { ExperienceModel } from "@/models/Experience";
import { EducationModel } from "@/models/Education";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth();
  const name = session?.user?.name ?? "admin";

  await dbConnect();
  const [
    total,
    published,
    draft,
    unread,
    skillCount,
    experienceCount,
    educationCount,
    recent,
  ] = await Promise.all([
    ProjectModel.countDocuments({}),
    ProjectModel.countDocuments({ published: true }),
    ProjectModel.countDocuments({ published: false }),
    ContactMessageModel.countDocuments({ read: false }),
    SkillModel.countDocuments(),
    ExperienceModel.countDocuments(),
    EducationModel.countDocuments(),
    ProjectModel.find({})
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(3)
      .lean(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <p className="text-caption-uppercase text-muted">Dashboard</p>
        <h1 className="text-display-lg text-ink">Hola, {name}.</h1>
        <p className="text-body-md text-muted">
          Resumen de la actividad de tu portfolio.
        </p>
      </header>

      {/* ─── Stats ───────────────────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Proyectos totales" value={total} href="/admin/proyectos" />
        <StatCard
          label="Publicados"
          value={published}
          href="/admin/proyectos"
        />
        <StatCard
          label="Borradores"
          value={draft}
          href="/admin/proyectos"
        />
        <StatCard
          label="Mensajes sin leer"
          value={unread}
          href="/admin/mensajes"
        />
        <StatCard
          label="Habilidades"
          value={skillCount}
          href="/admin/habilidades"
        />
        <StatCard
          label="Experiencia"
          value={experienceCount}
          href="/admin/experiencia"
        />
        <StatCard
          label="Educación"
          value={educationCount}
          href="/admin/educacion"
        />
      </section>

      {/* ─── Recent projects ─────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-display-sm text-ink">Proyectos recientes</h2>
          <Link
            href="/admin/proyectos"
            className="text-body-sm text-primary underline-offset-4 hover:underline"
          >
            Ver todos →
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="rounded-lg border border-dashed border-hairline p-8 text-center text-body-sm text-muted">
            Todavía no hay proyectos.{" "}
            <Link
              href="/admin/proyectos/nuevo"
              className="text-primary underline-offset-4 hover:underline"
            >
              Crear el primero
            </Link>
            .
          </div>
        ) : (
          <ul className="divide-y divide-hairline rounded-lg border border-hairline bg-canvas">
            {recent.map((p) => (
              <li
                key={String(p._id)}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <Link
                    href={`/admin/proyectos/${String(p._id)}`}
                    className="text-body-md font-medium text-ink hover:text-primary"
                  >
                    {p.title}
                  </Link>
                  <p className="text-caption text-muted">
                    /{p.slug} · {p.year} ·{" "}
                    {p.published ? "Publicado" : "Borrador"}
                  </p>
                </div>
                <Link
                  href={`/admin/proyectos/${String(p._id)}`}
                  className="text-body-sm text-primary underline-offset-4 hover:underline"
                >
                  Editar
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-1 rounded-lg border border-hairline bg-canvas p-5 transition-colors hover:border-primary"
    >
      <span className="text-caption-uppercase text-muted">{label}</span>
      <span className="text-display-md text-ink transition-colors group-hover:text-primary">
        {value}
      </span>
    </Link>
  );
}
