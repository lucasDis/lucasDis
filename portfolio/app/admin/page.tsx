import Link from "next/link";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { ProjectModel } from "@/models/Project";
import { ContactMessageModel } from "@/models/ContactMessage";
import { SkillModel } from "@/models/Skill";
import { ExperienceModel } from "@/models/Experience";
import { EducationModel } from "@/models/Education";
import { getGaOverview, type GaOverview } from "@/lib/ga4";

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
    gaOverview,
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
    getGaOverview(),
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

      <GaPanel overview={gaOverview} />

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
          highlight={unread > 0}
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

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

function GaPanel({ overview }: { overview: GaOverview | null }) {
  if (overview === null) {
    return (
      <section className="flex items-center justify-between rounded-xl bg-surface-dark px-6 py-5 text-on-dark">
        <span className="text-body-sm text-on-dark-soft">
          Google Analytics todavía no está conectado.
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-on-dark-soft" />
      </section>
    );
  }

  const metrics = [
    { label: "Usuarios activos", value: String(overview.activeUsers) },
    { label: "Vistas de página", value: String(overview.pageViews) },
    { label: "Sesiones", value: String(overview.sessions) },
    {
      label: "Duración prom.",
      value: formatDuration(overview.avgSessionDurationSeconds),
    },
  ];

  const maxViews = Math.max(1, ...overview.topPages.map((p) => p.views));

  return (
    <section className="flex flex-col gap-6 rounded-xl bg-surface-dark p-6 text-on-dark">
      <div className="flex items-center gap-2 text-caption-uppercase text-on-dark-soft">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-mint" />
        Últimos 28 días
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col gap-1">
            <span className="text-caption text-on-dark-soft">{m.label}</span>
            <span className="text-display-sm text-on-dark">{m.value}</span>
          </div>
        ))}
      </div>

      {overview.topPages.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-white/10 pt-5">
          {overview.topPages.map((p) => (
            <div key={p.path} className="relative overflow-hidden rounded-md">
              <div
                className="absolute inset-y-0 left-0 bg-brand-mint/15"
                style={{ width: `${(p.views / maxViews) * 100}%` }}
              />
              <div className="relative flex items-center justify-between px-3 py-2 text-body-sm">
                <span className="truncate text-on-dark">{p.path}</span>
                <span className="ml-3 shrink-0 text-on-dark-soft">
                  {p.views}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function StatCard({
  label,
  value,
  href,
  highlight = false,
}: {
  label: string;
  value: number;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col gap-1 rounded-lg border p-5 transition-colors ${
        highlight
          ? "border-primary bg-primary/10 hover:bg-primary/15"
          : "border-hairline bg-canvas hover:border-primary"
      }`}
    >
      <span className="text-caption-uppercase text-muted">{label}</span>
      <span
        className={`text-display-md transition-colors ${
          highlight ? "text-primary" : "text-ink group-hover:text-primary"
        }`}
      >
        {value}
      </span>
    </Link>
  );
}
