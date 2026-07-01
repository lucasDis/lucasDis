/**
 * AboutPreview — public home "About" section.
 *
 * Expanded CV-style layout: full professional profile on the left,
 * personal info card on the right. Anchored at #sobre-mi for nav.
 *
 * Server component — data flows down from [locale]/page.tsx.
 */

import type { TFunction } from "i18next";

interface AboutPreviewProps {
  profile: {
    fullName: string;
    birthLocation?: string;
    location: string;
    professionalProfile: string;
  };
  t: TFunction;
}

export function AboutPreview({ profile, t }: AboutPreviewProps) {
  return (
    <section
      id="sobre-mi"
      aria-label={t("about.eyebrow")}
      className="bg-transparent text-ink"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <p className="text-caption-uppercase text-muted">{t("about.eyebrow")}</p>
            <h2 className="mt-3 text-display-md text-ink lg:text-display-lg">
              {t("about.title")}
            </h2>
            <p className="mt-8 whitespace-pre-line text-body-md leading-relaxed text-body">
              {profile.professionalProfile}
            </p>
          </div>

          <aside className="lg:col-span-5">
            <div className="rounded-xl border border-hairline bg-surface-card p-8">
              <h3 className="text-title-md text-ink">{t("about.personal_info")}</h3>
              <dl className="mt-6 space-y-5">
                <div>
                  <dt className="text-caption-uppercase text-muted">{t("about.name")}</dt>
                  <dd className="mt-1 text-body-md text-ink">{profile.fullName}</dd>
                </div>
                <div>
                  <dt className="text-caption-uppercase text-muted">
                    {t("about.location")}
                  </dt>
                  <dd className="mt-1 text-body-md text-ink">{profile.location}</dd>
                </div>
                {profile.birthLocation && (
                  <div>
                    <dt className="text-caption-uppercase text-muted">
                      {t("about.origin")}
                    </dt>
                    <dd className="mt-1 text-body-md text-ink">
                      {profile.birthLocation}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-caption-uppercase text-muted">{t("about.role_label")}</dt>
                  <dd className="mt-1 text-body-md text-ink">
                    {t("about.role_value")}
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