/**
 * AboutPreview — public home "About" section.
 *
 * Two-column layout:
 *   - Left  : display title + 2 body paragraphs (server-rendered)
 *   - Right : 3D card that tilts on cursor movement (client component)
 *
 * Design tokens: Clay.com adapted system (canvas #fffaf0, accent #ff4d8b, Inter)
 * Server component — data flows from [locale]/page.tsx.
 */

import type { TFunction } from "i18next";
import { About3DCard } from "./About3DCard";
import { RoleCycler } from "./RoleCycler";

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
  const paragraphs = profile.professionalProfile
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section
      id="sobre-mi"
      aria-label={t("about.eyebrow")}
      className="bg-transparent text-ink"
    >
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        {/* Panel with dot pattern */}
        <div
          className="relative overflow-hidden rounded-xl border border-hairline bg-surface-soft p-8 lg:p-14"
          style={{
            backgroundImage: "radial-gradient(var(--color-hairline) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          <div className="relative z-10 grid gap-14 lg:grid-cols-2 lg:gap-20 lg:items-center">

            {/* ── LEFT: Text ── */}
            <div>
              <p className="text-caption-uppercase text-muted">{t("about.eyebrow")}</p>
              <h2
                className="mt-4 text-ink"
                style={{
                  fontSize: "clamp(32px, 5vw, 52px)",
                  fontWeight: 500,
                  lineHeight: 1.08,
                  letterSpacing: "-1.8px",
                }}
              >
                {t("about.title")}
              </h2>

              <div className="mt-8 space-y-5">
                {paragraphs.map((para, i) => (
                  <p key={i} className="text-body-md leading-relaxed text-body">
                    {para}
                  </p>
                ))}
              </div>

              {/* Personal info pills */}
              <dl className="mt-10 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-full border border-hairline bg-canvas px-4 py-2">
                  <dt className="text-caption-uppercase text-muted">{t("about.location")}</dt>
                  <dd className="text-body-sm font-medium text-ink">{profile.location}</dd>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-hairline bg-canvas px-4 py-2" style={{ overflow: "hidden" }}>
                  <dt className="text-caption-uppercase text-muted">{t("about.role_label")}</dt>
                  <dd className="text-body-sm font-medium text-ink">
                    <RoleCycler />
                  </dd>
                </div>
              </dl>
            </div>

            {/* ── RIGHT: 3D Tilt Card (Client Component) ── */}
            <About3DCard name={profile.fullName} />
          </div>
        </div>
      </div>
    </section>
  );
}