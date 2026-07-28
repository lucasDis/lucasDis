import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { ProfileModel } from "@/models/Profile";
import { SiteSettingsModel } from "@/models/SiteSettings";
import { UserModel } from "@/models/User";
import { ProfileContentForm, SiteSettingsForm } from "./_components/SettingsForm";
import { TotpSetupCard } from "./_components/TotpSetupCard";
import { BackupCodesCard } from "./_components/BackupCodesCard";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  await dbConnect();
  await auth();

  const [profileRaw, settingsRaw, session] = await Promise.all([
    ProfileModel.findOne().lean(),
    SiteSettingsModel.findOne().lean(),
    auth(),
  ]);

  const userId = session?.user?.id;
  const userRaw = userId
    ? await UserModel.findById(userId).select("totpEnabled backupCodes").lean()
    : null;

  const totpEnabled = userRaw?.totpEnabled ?? false;
  const backupCodesLeft = (userRaw?.backupCodes ?? []).filter((c: any) => !c.used).length;

  if (!profileRaw || !settingsRaw) {
    return (
      <div className="rounded-lg border border-error/30 bg-error/10 p-6 text-body-md text-error">
        No se encontraron los datos de configuración. Ejecutá el seed de la DB o
        creá manualmente el documento de `Profile` y `SiteSettings`.
      </div>
    );
  }

  const profile = JSON.parse(JSON.stringify(profileRaw)) as {
    fullName: string;
    location: string;
    phone?: string;
    email: string;
    linkedin?: string;
    github?: string;
    behance?: string;
    instagram?: string;
    photoUrl?: string;
    heroImageUrl?: string;
    professionalProfile: string;
  };

  const settings = JSON.parse(JSON.stringify(settingsRaw)) as {
    siteTitle: string;
    siteDescription: string;
    ogImage?: string;
    footerText?: string;
    linkedin?: string;
    github?: string;
    behance?: string;
    instagram?: string;
  };

  return (
    <div className="space-y-10">
      <header>
        <p className="text-caption-uppercase text-muted">Configuración</p>
        <h1 className="text-display-lg text-ink">Ajustes de contenido</h1>
        <p className="mt-2 max-w-2xl text-body-md text-muted">
          Editá los metadatos del sitio y el perfil público que aparece en el
          portfolio.
        </p>
      </header>

      <section className="rounded-xl border border-hairline bg-surface-soft p-6">
        <h2 className="text-title-sm">Metadatos del sitio</h2>
        <p className="mt-1 text-body-sm text-muted">
          Estos valores controlan el título, la descripción, la imagen OG y las
          redes visibles en el pie de página.
        </p>
        <div className="mt-6">
          <SiteSettingsForm
            initial={{
              siteTitle: settings.siteTitle,
              siteDescription: settings.siteDescription,
              ogImage: settings.ogImage ?? "",
              footerText: settings.footerText ?? "",
              linkedin: settings.linkedin ?? "",
              github: settings.github ?? "",
              behance: settings.behance ?? "",
              instagram: settings.instagram ?? "",
            }}
          />
        </div>
      </section>

      <section className="rounded-xl border border-hairline bg-surface-soft p-6">
        <h2 className="text-title-sm">Perfil público</h2>
        <p className="mt-1 text-body-sm text-muted">
          Editá la información personal y la presentación que se muestra en la
          web pública.
        </p>
        <div className="mt-6">
          <ProfileContentForm
            initial={{
              fullName: profile.fullName,
              location: profile.location,
              phone: profile.phone ?? "",
              email: profile.email,
              linkedin: profile.linkedin ?? "",
              github: profile.github ?? "",
              behance: profile.behance ?? "",
              instagram: profile.instagram ?? "",
              photoUrl: profile.photoUrl ?? "",
              heroImageUrl: profile.heroImageUrl ?? "",
              professionalProfile: profile.professionalProfile,
            }}
          />
        </div>
      </section>

      {/* ── Security: 2FA ── */}
      <section className="rounded-xl border border-hairline bg-surface-soft p-6">
        <h2 className="text-title-sm">Seguridad</h2>
        <p className="mt-1 text-body-sm text-muted">
          Autenticación de dos factores (2FA). Protegé tu cuenta con un
          código temporal de tu app de autenticación.
        </p>

        <div className="mt-6 space-y-8">
          {/* TOTP Setup */}
          <div>
            <h3 className="text-body-md font-semibold text-ink mb-4">App de autenticación (TOTP)</h3>
            <TotpSetupCard
              initialEnabled={totpEnabled}
              backupCodesLeft={backupCodesLeft}
            />
          </div>

          {/* Backup Codes — only show when TOTP is active */}
          {totpEnabled && (
            <div className="border-t border-hairline pt-6">
              <h3 className="text-body-md font-semibold text-ink mb-1">Backup codes</h3>
              <p className="text-body-sm text-muted mb-4">
                Códigos de recuperación de un solo uso. Guardalos en un lugar seguro.
              </p>
              <BackupCodesCard initialLeft={backupCodesLeft} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}