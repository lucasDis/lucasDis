import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { UserModel } from "@/models/User";
import { ProfileForm } from "./_components/ProfileForm";
import { PasswordForm } from "./_components/PasswordForm";

/**
 * /admin/perfil — admin's own profile settings.
 *
 * Two stacked sections: name/email and password change. Both forms
 * share the same `useForm` + Zod pattern as the CRUDs.
 */
export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  await dbConnect();
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const user = await UserModel.findById(userId).lean();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header>
        <h1 className="text-title-lg">Perfil</h1>
        <p className="mt-1 text-body-md text-muted">
          Editá tu información personal y contraseña.
        </p>
      </header>

      <section className="rounded-lg border border-hairline bg-surface-soft p-6">
        <h2 className="text-title-sm">Datos personales</h2>
        <p className="mt-1 text-body-sm text-muted">
          Nombre y email asociados a tu cuenta.
        </p>
        <div className="mt-6">
          <ProfileForm initial={{ name: user.name, email: user.email }} />
        </div>
      </section>

      <section className="rounded-lg border border-hairline bg-surface-soft p-6">
        <h2 className="text-title-sm">Cambiar contraseña</h2>
        <p className="mt-1 text-body-sm text-muted">Mínimo 8 caracteres.</p>
        <div className="mt-6">
          <PasswordForm />
        </div>
      </section>
    </div>
  );
}