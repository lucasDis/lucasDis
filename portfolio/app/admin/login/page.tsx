import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Ingresar · Admin",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-caption-uppercase text-muted">Portfolio · Admin</p>
          <h1 className="mt-2 text-display-sm">Ingresar</h1>
        </div>
        <div className="rounded-xl border border-hairline bg-surface-card p-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
