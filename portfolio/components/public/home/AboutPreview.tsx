/**
 * AboutPreview — public home "Sobre mí" section.
 *
 * Expanded CV-style layout (per Exo reference): full professional profile
 * on the left, personal info card on the right. Anchored at #sobre-mi for
 * the SiteHeader nav.
 *
 * Server component — data flows down from page.tsx.
 */

interface AboutPreviewProps {
  profile: {
    fullName: string;
    birthLocation?: string;
    location: string;
    professionalProfile: string;
  };
}

export function AboutPreview({ profile }: AboutPreviewProps) {
  return (
    <section
      id="sobre-mi"
      aria-label="Sobre mí"
      className="bg-transparent text-ink"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <p className="text-caption-uppercase text-muted">Sobre mí</p>
            <h2 className="mt-3 text-display-md text-ink lg:text-display-lg">
              Diseño con propósito y código limpio
            </h2>
            <p className="mt-8 whitespace-pre-line text-body-md leading-relaxed text-body">
              {profile.professionalProfile}
            </p>
          </div>

          <aside className="lg:col-span-5">
            <div className="rounded-xl border border-hairline bg-surface-card p-8">
              <h3 className="text-title-md text-ink">Datos personales</h3>
              <dl className="mt-6 space-y-5">
                <div>
                  <dt className="text-caption-uppercase text-muted">Nombre</dt>
                  <dd className="mt-1 text-body-md text-ink">
                    {profile.fullName}
                  </dd>
                </div>
                <div>
                  <dt className="text-caption-uppercase text-muted">
                    Ubicación
                  </dt>
                  <dd className="mt-1 text-body-md text-ink">
                    {profile.location}
                  </dd>
                </div>
                {profile.birthLocation && (
                  <div>
                    <dt className="text-caption-uppercase text-muted">
                      Origen
                    </dt>
                    <dd className="mt-1 text-body-md text-ink">
                      {profile.birthLocation}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-caption-uppercase text-muted">Rol</dt>
                  <dd className="mt-1 text-body-md text-ink">
                    Diseñador Gráfico &amp; Desarrollador Frontend
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}