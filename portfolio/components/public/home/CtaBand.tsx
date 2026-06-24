import { ButtonLink } from "@/components/ui/Button";

/**
 * CtaBand — pre-footer call to action on `surface-soft` background.
 *
 * Single primary CTA ("Hablemos" → /contacto) plus a secondary
 * ("Ver proyectos" → /proyectos). Centered, smaller padding than the
 * major sections (80px vs 96px).
 */

export function CtaBand() {
  return (
    <section className="bg-transparent py-20 px-6 lg:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-display-md text-ink">
          ¿Tenés un proyecto en mente?
        </h2>
        <p className="mt-6 text-title-md text-body max-w-2xl mx-auto">
          Disponible para freelance y colaboraciones. Hablemos sobre cómo
          puedo ayudarte.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/contacto" variant="primary" size="lg">
            Hablemos
          </ButtonLink>
          <ButtonLink href="/proyectos" variant="secondary" size="lg">
            Ver proyectos
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}