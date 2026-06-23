/**
 * Explainable Matching section.
 * Shows three provider options with scores, fit rationale and trade-offs.
 * The recommended option is highlighted.
 * Includes a "Waarom deze match?" panel.
 * All data is fictional demonstration data.
 */
import { useState } from "react";

const providers = [
  {
    id: "horizon",
    name: "Horizon Jeugdzorg",
    type: "Ambulant & residentieel",
    region: "Utrecht (12 km)",
    score: 87,
    scoreLabel: "Sterke match",
    scoreColor: "var(--cl-teal)",
    scoreBg: "rgba(46,200,166,.12)",
    scoreBorder: "rgba(46,200,166,.25)",
    recommended: true,
    available: true,
    availableLabel: "3 plekken beschikbaar",
    specialisation: "Trauma, GGZ, meervoudige problematiek",
    experience: "9 jaar regiodekking, 94% intakegraad",
    constraints: "Wachttijd: gem. 4 dagen",
    fit: [
      { label: "Zorgbehoefte", value: 92 },
      { label: "Regio & afstand", value: 88 },
      { label: "Beschikbaarheid", value: 78 },
      { label: "Ervaring", value: 91 },
    ],
    whyMatch: "Horizon heeft aantoonbare expertise in meervoudige problematiek en werkt al samen met gemeente Utrecht. Beschikbare capaciteit sluit aan bij de urgentie van deze casus.",
    tradeOff: "Iets hogere gemiddelde wachttijd dan alternatief B, maar sterkere specialisatiefit.",
  },
  {
    id: "kompas",
    name: "Kompas Zorg",
    type: "Ambulant",
    region: "Rotterdam (38 km)",
    score: 72,
    scoreLabel: "Goede match",
    scoreColor: "var(--cl-blue)",
    scoreBg: "rgba(62,168,255,.12)",
    scoreBorder: "rgba(62,168,255,.25)",
    recommended: false,
    available: true,
    availableLabel: "Direct beschikbaar",
    specialisation: "Ambulante jeugdhulp, gezinsbegeleiding",
    experience: "12 jaar regionaal netwerk",
    constraints: "Afstand iets groter",
    fit: [
      { label: "Zorgbehoefte", value: 74 },
      { label: "Regio & afstand", value: 61 },
      { label: "Beschikbaarheid", value: 96 },
      { label: "Ervaring", value: 88 },
    ],
    whyMatch: "Kompas heeft directe beschikbaarheid en sterke ambulante track record. Minder specialisatie in meervoudige GGZ, maar snellere doorlooptijd mogelijk.",
    tradeOff: "Minder gespecialiseerd in de specifieke zorgbehoefte, maar gunstigste beschikbaarheid.",
  },
  {
    id: "groei",
    name: "Groei & Co",
    type: "Dagbehandeling",
    region: "Amsterdam (54 km)",
    score: 58,
    scoreLabel: "Beperkte match",
    scoreColor: "var(--cl-amber)",
    scoreBg: "rgba(245,165,36,.12)",
    scoreBorder: "rgba(245,165,36,.25)",
    recommended: false,
    available: false,
    availableLabel: "Wachtlijst actief",
    specialisation: "Dagbehandeling, gedragsondersteuning",
    experience: "Beperkte regionale overlap",
    constraints: "Wachtlijst, geen directe capaciteit",
    fit: [
      { label: "Zorgbehoefte", value: 60 },
      { label: "Regio & afstand", value: 42 },
      { label: "Beschikbaarheid", value: 30 },
      { label: "Ervaring", value: 68 },
    ],
    whyMatch: "Groei & Co heeft relevante specialisatie in dagbehandeling, maar de regio en wachtlijstsituatie maken directe plaatsing complex.",
    tradeOff: "Regionaal niet optimaal en geen directe capaciteit. Inzetbaar als alternatief na wachtlijstbeoordeling.",
  },
];

function FitBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-28 shrink-0 text-[var(--cl-text-muted)]">{label}</span>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--cl-surface-3)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: value >= 80 ? "var(--cl-teal)" : value >= 60 ? "var(--cl-blue)" : "var(--cl-amber)" }}
        />
      </div>
      <span className="w-8 text-right font-medium text-[var(--cl-text-secondary)]">{value}</span>
    </div>
  );
}

export function ExplainableMatchingSection() {
  const [selected, setSelected] = useState<string>("horizon");
  const activeProvider = providers.find((p) => p.id === selected) ?? providers[0];

  return (
    <section
      className="cl-section"
      aria-labelledby="matching-heading"
    >
      <div className="cl-container">
        <div className="mb-10 max-w-2xl">
          <p className="cl-eyebrow">Verklaarbare matching</p>
          <h2 id="matching-heading" className="cl-heading">
            De juiste match. Uitlegbaar en onderbouwd.
          </h2>
          <p className="cl-lead">
            Carelane adviseert op basis van zorgbehoefte, expertise, beschikbaarheid, regio en
            beperkingen. De professional houdt de regie.
          </p>
          <div className="mt-5">
            <a
              href="#werkwijze"
              className="inline-flex items-center gap-1.5 rounded-[var(--cl-radius-md)] border px-4 py-2 text-sm font-medium transition-colors duration-150"
              style={{
                borderColor: "var(--cl-teal)",
                color: "var(--cl-teal)",
                background: "transparent",
              }}
            >
              Bekijk hoe matching werkt →
            </a>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          {/* Provider cards */}
          <div className="space-y-3" role="list" aria-label="Aanbiederopties">
            {providers.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p.id)}
                role="listitem"
                aria-pressed={selected === p.id}
                className="group w-full text-left rounded-[var(--cl-radius-lg)] border p-4 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cl-violet-bright)]"
                style={{
                  background: selected === p.id ? "var(--cl-surface-2)" : "var(--cl-surface-1)",
                  borderColor: selected === p.id ? "var(--cl-border-focus)" : "var(--cl-border-subtle)",
                  boxShadow: selected === p.id ? "var(--cl-shadow-glow)" : "none",
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[var(--cl-text)]">{p.name}</span>
                      {p.recommended && (
                        <span
                          className="inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest"
                          style={{
                            background: "rgba(46,200,166,.12)",
                            borderColor: "rgba(46,200,166,.25)",
                            color: "var(--cl-teal)",
                          }}
                        >
                          Aanbevolen
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--cl-text-muted)]">
                      {p.type} · {p.region}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <div className="text-right">
                      <p
                        className="text-lg font-bold"
                        style={{ color: p.scoreColor }}
                        aria-label={`Matchscore: ${p.score} — ${p.scoreLabel}`}
                      >
                        {p.score}
                      </p>
                      <p className="text-[10px] uppercase tracking-wide" style={{ color: p.scoreColor }}>
                        {p.scoreLabel}
                      </p>
                    </div>
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: p.scoreBg, borderColor: p.scoreBorder, border: "1px solid" }}
                      aria-hidden="true"
                    >
                      {p.available ? (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8l3.5 3.5L13 4.5" stroke={p.scoreColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="5.5" stroke={p.scoreColor} strokeWidth="1.5"/>
                          <path d="M8 5v3.5" stroke={p.scoreColor} strokeWidth="1.5" strokeLinecap="round"/>
                          <circle cx="8" cy="11" r=".75" fill={p.scoreColor}/>
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fit bars (shown when selected) */}
                {selected === p.id && (
                  <div className="mt-4 space-y-2 border-t pt-4" style={{ borderColor: "var(--cl-border-subtle)" }}>
                    {p.fit.map((f) => (
                      <FitBar key={f.label} label={f.label} value={f.value} />
                    ))}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--cl-text-muted)]">
                      <span>
                        <span className="font-medium text-[var(--cl-text-secondary)]">Specialisatie:</span>{" "}
                        {p.specialisation}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5"
                        style={{
                          background: p.available ? "rgba(46,200,166,.10)" : "rgba(245,165,36,.10)",
                          borderColor: p.available ? "rgba(46,200,166,.20)" : "rgba(245,165,36,.20)",
                          color: p.available ? "var(--cl-teal)" : "var(--cl-amber)",
                        }}
                      >
                        {p.availableLabel}
                      </span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Why-match panel */}
          <div
            className="rounded-[var(--cl-radius-lg)] border p-5 space-y-4 lg:sticky lg:top-24 h-fit"
            style={{
              background: "var(--cl-surface-1)",
              borderColor: "var(--cl-border-subtle)",
              boxShadow: "var(--cl-shadow-card)",
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[var(--cl-text)]">Waarom deze match?</p>
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest"
                style={{
                  background: activeProvider.scoreBg,
                  borderColor: activeProvider.scoreBorder,
                  color: activeProvider.scoreColor,
                }}
              >
                {activeProvider.name.split(" ")[0]}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-[var(--cl-text-secondary)]">
              {activeProvider.whyMatch}
            </p>

            <div
              className="rounded-[var(--cl-radius-md)] border p-3"
              style={{ background: "var(--cl-surface-2)", borderColor: "var(--cl-border-subtle)" }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--cl-text-muted)] mb-1.5">
                Afweging
              </p>
              <p className="text-xs leading-relaxed text-[var(--cl-text-secondary)]">
                {activeProvider.tradeOff}
              </p>
            </div>

            <div className="space-y-2">
              {[
                { label: "Ervaring", value: activeProvider.experience },
                { label: "Beperking", value: activeProvider.constraints },
              ].map((item) => (
                <div key={item.label} className="flex gap-2 text-xs">
                  <span className="w-16 shrink-0 text-[var(--cl-text-muted)]">{item.label}</span>
                  <span className="text-[var(--cl-text-secondary)]">{item.value}</span>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-[var(--cl-text-muted)] border-t pt-3" style={{ borderColor: "var(--cl-border-subtle)" }}>
              Matching is adviserend. De professional neemt de eindbeslissing. Handmatige afwijking
              wordt geregistreerd en is altijd herleidbaar.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
