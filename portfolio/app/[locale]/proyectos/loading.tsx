export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas p-6 text-center">
      <div className="flex flex-col items-center gap-4">
        {/* Elegant design system spinner */}
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-brand-pink border-t-transparent" />
        <p className="text-body-sm font-semibold text-muted animate-pulse tracking-wide">
          Cargando proyectos...
        </p>
      </div>
    </div>
  );
}
