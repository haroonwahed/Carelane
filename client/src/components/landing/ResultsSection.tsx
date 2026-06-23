/**
 * Results in Practice section.
 * Left: 4 qualitative outcome items with icons.
 * Right: evidence-oriented outcome panel (NO fake quotes, NO fictional municipalities).
 */
import { ArrowRight, CheckCircle2, Clock, TrendingDown, Users2 } from "lucide-react";

const outcomes = [
  {
    icon: Clock,
    color: "var(--cl-teal)",
    bg: "rgba(46,200,166,0.10)",
    title: "Minder vertraging tussen fasen",
    desc: "Vertragingen worden zichtbaar vóórdat ze een probleem worden.",
  },
  {
    icon: CheckCircle2,
    color: "var(--cl-blue)",
    bg: "rgba(62,168,255,0.10)",
    title: "Helderder eigenaarschap",
    desc: "Iedere stap heeft een benoemde verantwoordelijke en een concrete vervolgactie.",
  },
  {
    icon: Users2,
    color: "var(--cl-violet-bright)",
    bg: "rgba(155,130,255,0.10)",
    title: "Minder incomplete overdrachten",
    desc: "Benodigde gegevens zijn geborgd vóór elke overdracht in de keten.",
  },
  {
    icon: TrendingDown,
    color: "var(--cl-amber)",
    bg: "rgba(245,165,36,0.10)",
    title: "Betere capaciteitsinzicht",
    desc: "Beschikbaarheid van aanbieders is inzichtelijk op het moment dat het nodig is.",
  },
];

const evidencePoints = [
  "Snellere operationele beslissingen",
  "Minder schakelmomenten zonder context",
  "Sterkere samenwerking rondom één casus",
  "Volledigere informatie bij elke overdracht",
];

export function ResultsSection() {
  return (
    <section className="cl-section" aria-labelledby="results-heading">
      <div className="cl-container">
        <div className="grid gap-10 items-start lg:grid-cols-[55fr_45fr]">

          {/* Left column */}
          <div className="flex flex-col gap-7">
            <div className="flex flex-col gap-3">
              <p className="cl-eyebrow">RESULTATEN IN DE PRAKTIJK</p>
              <h2 id="results-heading" className="cl-heading">
                Minder vertraging. Meer passende zorg.{" "}
                <span style={{ color: "var(--cl-violet-bright)" }}>Samen beter.</span>
              </h2>
              <p className="cl-lead">
                Carelane lost concrete knelpunten op die we herkennen uit het werk van gemeenten
                en zorgaanbieders.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {outcomes.map(({ icon: Icon, color, bg, title, desc }) => (
                <div key={title} className="flex gap-3">
                  <div
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: bg }}
                    aria-hidden="true"
                  >
                    <Icon size={16} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--cl-text)" }}>
                      {title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed" style={{ color: "var(--cl-text-secondary)" }}>
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: evidence panel */}
          <div
            className="rounded-2xl border p-6 flex flex-col gap-5"
            style={{
              background: "var(--cl-surface-1)",
              borderColor: "var(--cl-border-subtle)",
              boxShadow: "var(--cl-shadow-card)",
            }}
          >
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-2"
                style={{ color: "var(--cl-violet-bright)" }}
              >
                OPERATIONELE UITKOMSTEN
              </p>
              <p className="text-sm font-bold" style={{ color: "var(--cl-text)" }}>
                Wat pilotpartners terugmelden
              </p>
            </div>

            <ul className="flex flex-col gap-2.5">
              {evidencePoints.map((point) => (
                <li key={point} className="flex items-start gap-2.5">
                  <CheckCircle2
                    size={15}
                    className="mt-0.5 shrink-0"
                    style={{ color: "var(--cl-teal)" }}
                    aria-hidden="true"
                  />
                  <span className="text-sm leading-snug" style={{ color: "var(--cl-text-secondary)" }}>
                    {point}
                  </span>
                </li>
              ))}
            </ul>

            <div
              className="rounded-xl border p-3.5 text-xs leading-relaxed"
              style={{
                background: "rgba(155,130,255,0.06)",
                borderColor: "rgba(155,130,255,0.18)",
                color: "var(--cl-text-muted)",
              }}
            >
              Resultaten worden per pilot gevalideerd. Kwantitatieve data volgt na
              afronding van de pilotfase.
            </div>

            <a
              href="mailto:contact@carelane.nl?subject=Pilot Carelane"
              className="inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-75"
              style={{ color: "var(--cl-violet-bright)" }}
            >
              Deelnemen aan de pilot
              <ArrowRight size={13} strokeWidth={2.5} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
