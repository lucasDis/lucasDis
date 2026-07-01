import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/auth";
import { auth } from "@/auth";
import "@/app/globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/**
 * Admin layout — sidebar + header + content area.
 *
 * Auth is enforced by `middleware.ts`; this layout assumes the user
 * is signed in. `auth()` is a cheap JWT decode so calling it here
 * is fine.
 */

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/proyectos", label: "Proyectos" },
  { href: "/admin/experiencia", label: "Experiencia" },
  { href: "/admin/educacion", label: "Educación" },
  { href: "/admin/habilidades", label: "Habilidades" },
  { href: "/admin/configuracion", label: "Configuración" },
  { href: "/admin/perfil", label: "Perfil" },
  { href: "/admin/mensajes", label: "Mensajes" },
];

async function logoutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  const userName = session?.user?.name ?? "Admin";

  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-canvas text-ink font-body" suppressHydrationWarning>
        <div className="flex min-h-screen bg-canvas">
      <aside className="hidden w-64 shrink-0 border-r border-hairline bg-surface-soft p-6 md:flex md:flex-col">
        <div className="mb-8">
          <p className="text-caption-uppercase text-muted">Admin</p>
          <h2 className="mt-1 text-title-md">Portfolio</h2>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-body-md text-ink transition-colors hover:bg-canvas"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-8">
          <Link
            href="/"
            className="block px-3 py-2 text-caption text-muted hover:text-ink"
          >
            ← Volver al sitio
          </Link>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-hairline bg-surface-soft px-6 py-3">
          <p className="text-caption text-muted">Sesión iniciada</p>
          <div className="flex items-center gap-4">
            <span className="text-body-sm text-ink">{userName}</span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="cursor-pointer text-body-sm text-muted underline-offset-4 hover:text-ink hover:underline"
              >
                Salir
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
        </div>
      </body>
    </html>
  );
}
