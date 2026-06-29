import { BlobsSvg } from "@/components/ui/BlobsSvg";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { HeroBand } from "@/components/public/HeroBand";

/**
 * /dev/components — visual showcase of every base component + every variant.
 *
 * Dev-only route. Not linked from public nav. Used as the canonical visual
 * reference during development. Render each component against the cream canvas
 * and against a saturated feature card to verify contrast.
 */
export default function DevComponentsPage() {
  return (
    <main className="min-h-full bg-surface-soft py-16">
      <div className="mx-auto max-w-6xl px-6 space-y-24">
        <header>
          <p className="text-caption-uppercase text-muted">Fase 1</p>
          <h1 className="mt-3 text-display-md text-ink">Component Library</h1>
          <p className="mt-3 text-body-md text-body max-w-2xl">
            Showcase de los componentes base del Design System. Cada componente
            está renderizado contra el canvas cream y contra superficies
            saturadas para verificar contraste.
          </p>
        </header>

        {/* ─────────────── Button ─────────────── */}
        <section>
          <SectionHeader as="h2" eyebrow="components/ui/Button" title="Button" />

          {/* Variants on canvas — inline, no individual boxes. */}
          <div className="mt-8 bg-canvas rounded-lg p-6 border border-hairline">
            <p className="text-caption-uppercase text-muted mb-4">
              Variants · on canvas
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="text-link">Text link</Button>
            </div>
          </div>

          {/* On-color — semantically for saturated surfaces. */}
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div className="bg-brand-pink rounded-lg p-6">
              <p className="text-caption-uppercase text-on-primary mb-4 opacity-80">
                on brand-pink
              </p>
              <Button variant="on-color">On color</Button>
            </div>
            <div className="bg-brand-teal rounded-lg p-6">
              <p className="text-caption-uppercase text-on-dark mb-4 opacity-80">
                on brand-teal
              </p>
              <Button variant="on-color">On color</Button>
            </div>
          </div>

          {/* Sizes */}
          <div className="mt-4 bg-canvas rounded-lg p-6 border border-hairline">
            <p className="text-caption-uppercase text-muted mb-4">Sizes</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="default">Default</Button>
              <Button variant="primary" size="lg">Large</Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </div>
          </div>

          {/* ButtonLink variants */}
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div className="bg-canvas rounded-lg p-6 border border-hairline">
              <p className="text-caption-uppercase text-muted mb-4">
                Links · on canvas
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <ButtonLink variant="primary" href="/proyectos">
                  Primary
                </ButtonLink>
                <ButtonLink variant="secondary" href="/contacto">
                  Secondary
                </ButtonLink>
                <ButtonLink variant="text-link" href="/">
                  Text link
                </ButtonLink>
              </div>
            </div>
            <div className="bg-brand-lavender rounded-lg p-6">
              <p className="text-caption-uppercase text-ink mb-4 opacity-80">
                Links · on brand-lavender
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <ButtonLink variant="on-color" href="/sobre-mi">
                  On color
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────── Card ─────────────── */}
        <section>
          <SectionHeader as="h2" eyebrow="components/ui/Card" title="Card" />

          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <Card padding="md">
              <h3 className="text-title-md text-ink">Testimonial style</h3>
              <p className="mt-3 text-body-md text-body">
                Card con padding md (24px). Pensado para testimonial cards y
                product mockups.
              </p>
            </Card>
            <Card padding="lg">
              <h3 className="text-title-md text-ink">Pricing tier style</h3>
              <p className="mt-3 text-body-md text-body">
                Card con padding lg (32px). Usado en pricing tiers y bloques
                más respirados.
              </p>
            </Card>
          </div>
        </section>

        {/* ─────────────── FeatureCard ─────────────── */}
        <section>
          <SectionHeader
            as="h2"
            eyebrow="components/ui/FeatureCard"
            title="FeatureCard variants"
          />

          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <FeatureCard
              variant="pink"
              title="Pink"
              description="Brand pink (#ff4d8b). Outbound / sequencer."
            />
            <FeatureCard
              variant="teal"
              title="Teal"
              description="Brand teal (#1a3a3a). Featured / enterprise."
            />
            <FeatureCard
              variant="lavender"
              title="Lavender"
              description="Brand lavender (#b8a4ed). AI agents."
            />
            <FeatureCard
              variant="peach"
              title="Peach"
              description="Brand peach (#ffb084). Warm SaaS."
            />
            <FeatureCard
              variant="ochre"
              title="Ochre"
              description="Brand ochre (#e8b94a). Community / experts."
            />
            <FeatureCard
              variant="cream"
              title="Cream"
              description="Cream card (#f5f0e0). Secondary features."
            />
          </div>

          <div className="mt-6 bg-brand-pink rounded-xl p-6">
            <Button variant="on-color">Button on pink surface</Button>
          </div>
        </section>

        {/* ─────────────── BlobsSvg ─────────────── */}
        <section>
          <SectionHeader as="h2" eyebrow="components/ui/BlobsSvg" title="BlobsSvg" />

          <div className="mt-8 bg-canvas rounded-lg p-8 border border-hairline flex items-center justify-center">
            <BlobsSvg variant="hero" />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-canvas rounded-lg p-6 border border-hairline flex items-center justify-center">
              <BlobsSvg variant="compact" />
            </div>
            <div className="bg-brand-pink rounded-lg p-6 flex items-center justify-center">
              <BlobsSvg variant="compact" />
            </div>
            <div className="bg-brand-teal rounded-lg p-6 flex items-center justify-center">
              <BlobsSvg variant="compact" />
            </div>
          </div>
        </section>

        {/* ─────────────── HeroBand ─────────────── */}
        <section>
          <SectionHeader as="h2" eyebrow="components/public/HeroBand" title="HeroBand" />

          <div className="mt-8 rounded-xl overflow-hidden border border-hairline">
            <HeroBand
              eyebrow="Portfolio · Tucumán, AR"
              title="Diseño UX/UI que se siente real."
              subtitle="Branding, producto e ilustración con foco en cómo se usa, no solo cómo se ve."
            >
              <ButtonLink variant="primary" href="/proyectos">
                Ver proyectos
              </ButtonLink>
              <ButtonLink variant="secondary" href="/contacto">
                Contactar
              </ButtonLink>
            </HeroBand>
          </div>
        </section>

        {/* ─────────────── SectionHeader ─────────────── */}
        <section>
          <SectionHeader
            as="h2"
            eyebrow="components/ui/SectionHeader"
            title="SectionHeader"
          />

          <div className="mt-8 bg-canvas rounded-lg p-8 border border-hairline space-y-12">
            <SectionHeader
              eyebrow="Servicios"
              title="Qué hago"
              subtitle="Diseño de producto end-to-end, branding e ilustración con foco en UX."
            />
            <SectionHeader
              eyebrow="Featured"
              title="Proyectos recientes"
              subtitle="Una selección curada de los últimos 12 meses."
              align="center"
            />
            <SectionHeader
              eyebrow="Contacto"
              title="¿Hablamos?"
              as="h3"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
