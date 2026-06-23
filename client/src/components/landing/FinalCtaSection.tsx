/**
 * Final CTA section.
 * Headline: "Breng regie terug in de zorgketen."
 * Primary: Plan een demo
 * Secondary: Bekijk de werkwijze
 */

const DEMO_EMAIL = "contact@carelane.nl";

const assurances = [
  { label: "Korte kennismaking", detail: "Afgestemd op uw organisatie en bestaand proces." },
  { label: "Geen verplichtingen", detail: "Verkenning op basis van uw specifieke vraag." },
  { label: "Startklaar voor een pilot", detail: "Begin klein met één gemeente en een beperkte keten." },
];

export function FinalCtaSection() {
  const handleDemoClick = () => {
    window.location.href = `mailto:${DEMO_EMAIL}?subject=Demo aanvragen – Carelane`;
  };

  return (
    <section
      className="cl-section relative overflow-hidden"
      aria-labelledby="final-cta-heading"
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 50% 60%, rgba(91,62,230,.18), transparent 60%)",
        }}
      />

      <div className="cl-container relative z-10">
        <div
          className="rounded-[var(--cl-radius-xl)] border px-8 py-12 text-center sm:px-12 sm:py-16"
          style={{
            background:
              "linear-gradient(180deg, rgba(17,30,52,.94), rgba(9,18,34,.96))",
            borderColor: "var(--cl-border-subtle)",
            boxShadow: "var(--cl-shadow-elevated)",
          }}
        >
          <p className="cl-eyebrow mx-auto">Aan de slag</p>
          <h2
            id="final-cta-heading"
            className="mx-auto mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-tight text-[var(--cl-text)] sm:text-4xl"
            style={{ lineHeight: 1.1 }}
          >
            Breng regie terug in de zorgketen.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[var(--cl-text-secondary)]">
            Ontdek hoe Carelane uw organisatie helpt om sneller, beter en met meer vertrouwen
            beslissingen te nemen.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleDemoClick}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-xl px-6 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cl-violet-bright)]"
              style={{
                background: "linear-gradient(135deg, var(--cl-violet), var(--cl-violet-deep))",
                boxShadow: "0 10px 30px rgba(91,62,230,.30)",
              }}
            >
              Plan een demo
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <a
              href="#werkwijze"
              className="inline-flex min-h-[48px] items-center rounded-xl border px-6 text-sm font-medium text-[var(--cl-text-secondary)] transition-all duration-200 hover:border-[var(--cl-border-focus)] hover:text-[var(--cl-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cl-violet-bright)]"
              style={{ borderColor: "var(--cl-border)" }}
            >
              Bekijk de werkwijze
            </a>
          </div>

          {/* Assurances */}
          <div className="mt-10 flex flex-wrap items-start justify-center gap-4 sm:gap-8">
            {assurances.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1 max-w-[160px] text-center">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full mb-1"
                  style={{ background: "rgba(46,200,166,.15)", color: "var(--cl-teal)" }}
                  aria-hidden="true"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l2.5 3L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <p className="text-xs font-semibold text-[var(--cl-text)]">{item.label}</p>
                <p className="text-xs text-[var(--cl-text-muted)]">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
