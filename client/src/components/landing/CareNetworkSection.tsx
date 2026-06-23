/**
 * Care Network section — one case at the centre with surrounding organisations.
 * Desktop: SVG node graph centred on the case.
 * Mobile: vertical role list with directional arrows.
 * Emphasises role-based visibility: not all parties see all data.
 */

const roles = [
  {
    id: "gemeente",
    label: "Gemeente",
    sub: "Financiering & regie",
    color: "var(--cl-blue)",
    bg: "rgba(62,168,255,.10)",
    border: "rgba(62,168,255,.22)",
    x: 50,
    y: 5,
    access: "Volledig zorgdossier",
    flow: "Valideert aanmelding",
  },
  {
    id: "coordinator",
    label: "Coordinator",
    sub: "Procesregie",
    color: "var(--cl-violet-bright)",
    bg: "rgba(155,130,255,.10)",
    border: "rgba(155,130,255,.22)",
    x: 90,
    y: 40,
    access: "Processen & eigenaarschap",
    flow: "Bewaakt voortgang",
  },
  {
    id: "aanbieder",
    label: "Zorgaanbieder",
    sub: "Capaciteit & beoordeling",
    color: "var(--cl-amber)",
    bg: "rgba(245,165,36,.10)",
    border: "rgba(245,165,36,.22)",
    x: 70,
    y: 82,
    access: "Beperkt na koppeling",
    flow: "Accepteert of wijst af",
  },
  {
    id: "client",
    label: "Cliënt & gezin",
    sub: "Zorgvraag",
    color: "var(--cl-teal)",
    bg: "rgba(46,200,166,.10)",
    border: "rgba(46,200,166,.22)",
    x: 15,
    y: 70,
    access: "Eigen dossier",
    flow: "Centrale zorgvraag",
  },
];

export function CareNetworkSection() {
  return (
    <section
      className="cl-section"
      aria-labelledby="network-heading"
    >
      <div className="cl-container">
        <div className="mb-12 grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="cl-eyebrow">Eén casus, meerdere organisaties</p>
            <h2 id="network-heading" className="cl-heading">
              Gecontroleerde samenwerking rondom de zorgvraag.
            </h2>
            <p className="cl-lead">
              Elke partij ziet precies wat nodig is voor de eigen rol — niet meer, niet minder.
              Carelane bewaakt de informatiestroom en houdt eigenaarschap expliciet.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                { label: "Rolgebaseerde toegang", desc: "Elke actor ziet alleen contextrelevante informatie." },
                { label: "Gecontroleerde informatiedeling", desc: "De aanbieder krijgt toegang na een goedgekeurde plaatsingsverzoek." },
                { label: "Aantoonbare beslissingen", desc: "Elk besluit is herleidbaar tot een actor, rol en moment." },
              ].map((item) => (
                <li
                  key={item.label}
                  className="flex items-start gap-3 rounded-[var(--cl-radius-md)] border p-3"
                  style={{ background: "var(--cl-surface-1)", borderColor: "var(--cl-border-subtle)" }}
                >
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                    style={{ background: "rgba(155,130,255,.15)", color: "var(--cl-violet-bright)" }}
                    aria-hidden="true"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--cl-text)]">{item.label}</p>
                    <p className="text-xs text-[var(--cl-text-muted)]">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* SVG network diagram (desktop) + role cards (mobile) */}
          <div>
            {/* Desktop: SVG orbit diagram */}
            <div
              className="hidden lg:block relative"
              aria-label="Diagram: centrale casus omringd door gemeente, coordinator, zorgaanbieder en cliënt"
              role="img"
            >
              <svg
                viewBox="0 0 400 340"
                className="w-full"
                aria-hidden="true"
              >
                {/* Connection lines */}
                {roles.map((role) => (
                  <line
                    key={role.id}
                    x1={200}
                    y1={170}
                    x2={(role.x / 100) * 400}
                    y2={(role.y / 100) * 340}
                    stroke={role.color}
                    strokeWidth="1.5"
                    strokeOpacity={0.3}
                    strokeDasharray="4 3"
                  />
                ))}

                {/* Centre — the case */}
                <g transform="translate(200,170)">
                  <circle r="44" fill="rgba(155,130,255,.08)" stroke="rgba(155,130,255,.25)" strokeWidth="1.5" />
                  <circle r="30" fill="var(--cl-surface-2)" stroke="rgba(155,130,255,.35)" strokeWidth="1" />
                  {/* Person icon */}
                  <circle cx="0" cy="-8" r="9" fill="none" stroke="var(--cl-violet-bright)" strokeWidth="1.5" />
                  <path d="M-12 14c0-6.6 5.4-12 12-12s12 5.4 12 12" fill="none" stroke="var(--cl-violet-bright)" strokeWidth="1.5" />
                  <text y="32" textAnchor="middle" fill="var(--cl-text-muted)" fontSize="9" fontFamily="Inter, sans-serif" letterSpacing="0.05em">
                    CASUS
                  </text>
                </g>

                {/* Role nodes */}
                {roles.map((role) => {
                  const cx = (role.x / 100) * 400;
                  const cy = (role.y / 100) * 340;
                  return (
                    <g key={role.id} transform={`translate(${cx},${cy})`}>
                      <circle r="36" fill={role.bg} stroke={role.border} strokeWidth="1.5" />
                      <text
                        y="4"
                        textAnchor="middle"
                        fill={role.color}
                        fontSize="8.5"
                        fontWeight="700"
                        fontFamily="Inter, sans-serif"
                      >
                        {role.label.split(" ").map((word, i) => (
                          <tspan key={i} x="0" dy={i === 0 ? 0 : 11}>{word}</tspan>
                        ))}
                      </text>
                      <text
                        y={role.label.includes(" ") ? 22 : 16}
                        textAnchor="middle"
                        fill="var(--cl-text-muted)"
                        fontSize="7.5"
                        fontFamily="Inter, sans-serif"
                      >
                        {role.flow}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Mobile: role cards */}
            <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="rounded-[var(--cl-radius-md)] border p-4"
                  style={{ background: "var(--cl-surface-1)", borderColor: role.border }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ background: role.color }}
                      aria-hidden="true"
                    />
                    <p className="text-sm font-semibold" style={{ color: role.color }}>{role.label}</p>
                  </div>
                  <p className="text-xs text-[var(--cl-text-muted)]">{role.sub}</p>
                  <p className="mt-2 text-xs text-[var(--cl-text-secondary)]">{role.access}</p>
                </div>
              ))}

              {/* Central case card */}
              <div
                className="sm:col-span-2 rounded-[var(--cl-radius-md)] border p-4 text-center"
                style={{
                  background: "rgba(155,130,255,.08)",
                  borderColor: "rgba(155,130,255,.25)",
                }}
              >
                <p className="text-sm font-semibold text-[var(--cl-violet-bright)]">De casus / zorgvraag</p>
                <p className="mt-1 text-xs text-[var(--cl-text-muted)]">
                  Alle partijen werken rondom één centrale zorgvraag
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
