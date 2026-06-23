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

            {/* Before / after flow indicator */}
            <div
              className="flex items-center gap-0 rounded-xl overflow-hidden text-xs font-medium"
              style={{ border: "1px solid var(--cl-border-subtle)" }}
            >
              <div
                className="flex-1 px-3 py-2.5 flex items-center gap-2"
                style={{ background: "rgba(239,91,98,0.06)" }}
              >
                <span style={{ color: "#ef5b62", fontSize: 16, lineHeight: 1 }}>→</span>
                <div>
                  <p style={{ color: "#ef5b62", fontWeight: 700, fontSize: 10, letterSpacing: "0.05em" }}>VOOR</p>
                  <p style={{ color: "var(--cl-text-muted)", fontSize: 11 }}>Traag, versnipperd, onduidelijk</p>
                </div>
              </div>
              <div style={{ width: 1, alignSelf: "stretch", background: "var(--cl-border-subtle)" }} />
              <div
                className="flex-1 px-3 py-2.5 flex items-center gap-2"
                style={{ background: "rgba(46,200,166,0.06)" }}
              >
                <span style={{ color: "var(--cl-teal)", fontSize: 16, lineHeight: 1 }}>→</span>
                <div>
                  <p style={{ color: "var(--cl-teal)", fontWeight: 700, fontSize: 10, letterSpacing: "0.05em" }}>NA</p>
                  <p style={{ color: "var(--cl-text-muted)", fontSize: 11 }}>Helder, verantwoord, op tijd</p>
                </div>
              </div>
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
            className="rounded-2xl border flex flex-col gap-5 overflow-hidden"
            style={{
              background: "var(--cl-surface-1)",
              borderColor: "var(--cl-border-subtle)",
              boxShadow: "var(--cl-shadow-card)",
            }}
          >
            {/* Decorative gradient top stripe */}
            <div
              style={{
                height: 2,
                background: "linear-gradient(to right, var(--cl-violet-bright), transparent)",
              }}
            />
            <div className="px-6 pb-6 flex flex-col gap-5">
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-2"
                style={{ color: "var(--cl-violet-bright)" }}
              >
                OPERATIONELE UITKOMSTEN
              </p>
              <p className="text-sm font-bold" style={{ color: "var(--cl-text)", fontSize: "0.9rem" }}>
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
      </div>
    </section>
  );
}
