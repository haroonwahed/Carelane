/**
 * Trust by Design section — five governance pillars.
 * Architectural visuals, not padlock imagery.
 * No fabricated certifications.
 */

const pillars = [
  {
    id: "access",
    title: "Rolgebaseerde toegang",
    desc: "Iedere actor ziet alleen wat past bij de eigen taak en verantwoordelijkheid. Zorgaanbieders krijgen toegang uitsluitend na een goedgekeurd plaatsingsverzoek.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <circle cx="11" cy="9" r="4" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M4 19c0-3.866 3.134-7 7-7h0c3.866 0 7 3.134 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M15 6l1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="18" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.25"/>
      </svg>
    ),
    color: "var(--cl-blue)",
    bg: "rgba(62,168,255,.10)",
    border: "rgba(62,168,255,.20)",
  },
  {
    id: "integrity",
    title: "Werkstroombewaking",
    desc: "Overgangen tussen fasen worden server-side gevalideerd. Geen stap kan worden overgeslagen of geforceerd door de browser. Elke transitie vereist actor, rol en vereiste gegevens.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <rect x="3" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 6V5a4 4 0 0 1 8 0v1" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M11 11v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="11" cy="10" r=".75" fill="currentColor"/>
      </svg>
    ),
    color: "var(--cl-violet-bright)",
    bg: "rgba(155,130,255,.10)",
    border: "rgba(155,130,255,.20)",
  },
  {
    id: "audit",
    title: "Auditbare beslissingen",
    desc: "Iedere actie wordt vastgelegd: actor, rol, tijdstip, vorige toestand, nieuwe toestand en reden. Handmatige afwijkingen van de aanbeveling worden expliciet geregistreerd.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path d="M5 3h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 8h8M7 12h6M7 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    color: "var(--cl-teal)",
    bg: "rgba(46,200,166,.10)",
    border: "rgba(46,200,166,.20)",
  },
  {
    id: "data",
    title: "Gegevensbescherming",
    desc: "Zorgdata wordt verwerkt conform de AVG. Gegevens worden niet gedeeld zonder expliciete koppeling en goedkeuring. Toegang is tijdgebonden en doelgebonden.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path d="M11 2L3 6v5c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V6L11 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M8 11l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: "var(--cl-teal)",
    bg: "rgba(46,200,166,.10)",
    border: "rgba(46,200,166,.20)",
  },
  {
    id: "visibility",
    title: "Gecontroleerde zichtbaarheid",
    desc: "De frontend is geen autorisatielaag. De API handhaaft alle permissies. Cliëntgegevens zijn afgeschermd tot wat de rol en de fase vereisen.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <ellipse cx="11" cy="11" rx="9" ry="5.5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="11" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 11c3-4 14-4 18 0" stroke="currentColor" strokeWidth="0" />
      </svg>
    ),
    color: "var(--cl-amber)",
    bg: "rgba(245,165,36,.10)",
    border: "rgba(245,165,36,.20)",
  },
];

export function TrustByDesignSection() {
  return (
    <section
      id="veiligheid"
      className="cl-section scroll-mt-20"
      aria-labelledby="trust-heading"
    >
      <div className="cl-container">
        <div className="mb-12 max-w-2xl">
          <p className="cl-eyebrow">Trust by design</p>
          <h2 id="trust-heading" className="cl-heading">
            Vertrouwen is geen feature. Het is de basis.
          </h2>
          <p className="cl-lead">
            Toegang, processtappen en besluiten zijn gecontroleerd, traceerbaar en afgestemd op de
            rol van de gebruiker.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar, i) => (
            <div
              key={pillar.id}
              className={`rounded-[var(--cl-radius-xl)] border p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--cl-shadow-card)] ${
                i === 4 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
              style={{
                background: "var(--cl-surface-1)",
                borderColor: "var(--cl-border-subtle)",
              }}
            >
              <div
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border"
                style={{
                  background: pillar.bg,
                  borderColor: pillar.border,
                  color: pillar.color,
                }}
              >
                {pillar.icon}
              </div>
              <h3 className="text-base font-semibold text-[var(--cl-text)]">{pillar.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--cl-text-secondary)]">
                {pillar.desc}
              </p>
            </div>
          ))}

          {/* Architecture note */}
          <div
            className="sm:col-span-2 lg:col-span-3 rounded-[var(--cl-radius-lg)] border p-5"
            style={{
              background: "rgba(155,130,255,.06)",
              borderColor: "rgba(155,130,255,.18)",
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5"
                style={{ background: "rgba(155,130,255,.15)", color: "var(--cl-violet-bright)" }}
                aria-hidden="true"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.25"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--cl-text)]">
                  Backend is de bron van waarheid
                </p>
                <p className="mt-1 text-sm text-[var(--cl-text-muted)]">
                  De SPA is een client, geen autoriteit. Alle workflowtransities, toegangscontrole en
                  auditregistratie worden afgedwongen door de API — niet door de browser.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
