/**
 * Results in Practice section.
 * Qualitative outcomes only — no invented metrics, testimonials or organisation names.
 * Placeholders clearly labelled for future verified data.
 */

const outcomes = [
  {
    title: "Minder wachttijd tussen stappen",
    desc: "Teams zien eerder wat vastloopt en wie aan zet is. Vertraging wordt zichtbaar vóórdat het een probleem wordt.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 6v4l2.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    color: "var(--cl-teal)",
    bg: "rgba(46,200,166,.10)",
  },
  {
    title: "Duidelijker eigenaarschap",
    desc: "Iedere stap heeft een benoemde verantwoordelijke en een concrete vervolgactie. Niemand wacht af zonder te weten waarop.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M3 17c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    color: "var(--cl-blue)",
    bg: "rgba(62,168,255,.10)",
  },
  {
    title: "Minder incomplete overdrachten",
    desc: "Gegevens die nodig zijn voor de volgende stap zijn geborgd vóór de overdracht. Herstelwerk achteraf neemt af.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M4 5h12M4 10h8M4 15h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="15" cy="14" r="3.5" stroke="currentColor" strokeWidth="1.25"/>
        <path d="M13.5 14l1 1 2-2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: "var(--cl-violet-bright)",
    bg: "rgba(155,130,255,.10)",
  },
  {
    title: "Beter capaciteitsinzicht",
    desc: "Beschikbaarheid van aanbieders wordt inzichtelijk op het moment dat het nodig is — niet pas na meerdere telefoontjes.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="3" y="12" width="3" height="5" rx="1" fill="currentColor" opacity=".4"/>
        <rect x="8.5" y="8" width="3" height="9" rx="1" fill="currentColor" opacity=".7"/>
        <rect x="14" y="4" width="3" height="13" rx="1" fill="currentColor"/>
      </svg>
    ),
    color: "var(--cl-amber)",
    bg: "rgba(245,165,36,.10)",
  },
  {
    title: "Snellere beslissingen met menselijke regie",
    desc: "Matching adviseert, de professional beslist. Uitlegbare afwegingen versnellen besluitvorming zonder de verantwoordelijkheid te verplaatsen.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M3.5 13.5 8 9l3 3 5.5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="15.5" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.25"/>
      </svg>
    ),
    color: "var(--cl-teal)",
    bg: "rgba(46,200,166,.10)",
  },
];

export function ResultsSection() {
  return (
    <section className="cl-section" aria-labelledby="results-heading">
      <div className="cl-container">
        <div className="mb-12 max-w-2xl">
          <p className="cl-eyebrow">Resultaten in de praktijk</p>
          <h2 id="results-heading" className="cl-heading">
            Wat werkt in de zorgketen.
          </h2>
          <p className="cl-lead">
            Carelane lost concrete knelpunten op die we herkennen uit het werk van gemeenten en
            zorgaanbieders.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {outcomes.map((outcome) => (
            <div
              key={outcome.title}
              className="rounded-[var(--cl-radius-xl)] border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--cl-shadow-card)]"
              style={{
                background: "var(--cl-surface-1)",
                borderColor: "var(--cl-border-subtle)",
              }}
            >
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: outcome.bg, color: outcome.color }}
              >
                {outcome.icon}
              </div>
              <h3 className="text-sm font-semibold text-[var(--cl-text)]">{outcome.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--cl-text-secondary)]">
                {outcome.desc}
              </p>
            </div>
          ))}

          {/* Placeholder for verified pilot data */}
          <div
            className="rounded-[var(--cl-radius-xl)] border border-dashed p-5 flex flex-col justify-center items-center text-center gap-2"
            style={{ borderColor: "var(--cl-border)", background: "var(--cl-surface-1)" }}
            aria-label="Ruimte voor geverifieerde pilotresultaten"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: "var(--cl-text-muted)" }}>
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p className="text-xs font-semibold text-[var(--cl-text-muted)]">Geverifieerde pilotcijfers</p>
            <p className="text-[11px] text-[var(--cl-text-muted)]">
              Kwantitatieve resultaten worden hier geplaatst zodra pilotdata beschikbaar is.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
