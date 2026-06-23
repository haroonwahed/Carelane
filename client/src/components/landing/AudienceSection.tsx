/**
 * Built for each role — four audience groups with connected layout.
 * Uses a tab/switcher pattern to avoid four identical cards.
 */
import { useState } from "react";

const audiences = [
  {
    id: "gemeente",
    label: "Gemeente",
    eyebrow: "Financiering & regie",
    title: "Regie over de keten, niet alleen over het budget.",
    desc: "De gemeente bewaakt arrangementen, valideert aanvragen en houdt grip op doorlooptijd — vanuit één gedeeld operationeel beeld met duidelijke volgende stap.",
    points: [
      "Eén overzicht van alle actieve casussen",
      "Directe zichtbaarheid op knelpunten en vertraging",
      "Auditabele validatie per aanvraag",
      "Rolzuivere samenwerking met aanbieders",
    ],
    color: "var(--cl-blue)",
    bg: "rgba(62,168,255,.10)",
    border: "rgba(62,168,255,.25)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M3 17V8l7-6 7 6v9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <rect x="7" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.25"/>
      </svg>
    ),
  },
  {
    id: "aanbieder",
    label: "Zorgaanbieder",
    eyebrow: "Capaciteit & beoordeling",
    title: "Precies de context die nodig is voor een goede reactie.",
    desc: "De aanbieder ziet uitsluitend de aanvragen die relevant zijn na een gekoppelde plaatsingsverzoek — met de informatie die nodig is om goed te kunnen reageren.",
    points: [
      "Begrensde toegang: alleen relevante casuscontext",
      "Duidelijke reactiestatus per aanvraag",
      "Eenduidige opvolging na acceptatie of afwijzing",
      "Geen toegang tot andere gemeentelijke data",
    ],
    color: "var(--cl-amber)",
    bg: "rgba(245,165,36,.10)",
    border: "rgba(245,165,36,.25)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M4 9V7a6 6 0 0 1 12 0v2" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="2.5" y="9" width="15" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 13v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="10" cy="13" r=".75" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: "coordinator",
    label: "Coordinator",
    eyebrow: "Procesregie",
    title: "Procesregie zonder te verdwalen in losse communicatie.",
    desc: "De coordinator bewaakt voortgang, bewaakt eigenaarschap en zorgt dat de volgende stap altijd duidelijk is — voor alle betrokken partijen.",
    points: [
      "Volledig zicht op procesvoortgang per casus",
      "Signalering bij dreigend knelpunt of vertraging",
      "Eén werkplek voor coördinatie en opvolging",
      "Duidelijk wie aan zet is op elk moment",
    ],
    color: "var(--cl-violet-bright)",
    bg: "rgba(155,130,255,.10)",
    border: "rgba(155,130,255,.25)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 7.5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="5" cy="15" r="2" stroke="currentColor" strokeWidth="1.25"/>
        <circle cx="15" cy="15" r="2" stroke="currentColor" strokeWidth="1.25"/>
        <path d="M10 12.5 5.5 14M10 12.5l4.5 1.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "client",
    label: "Cliënt & gezin",
    eyebrow: "Zorgvraag & betrokkenheid",
    title: "Helderheid over de voortgang van de eigen zorgvraag.",
    desc: "De cliënt en het gezin staan centraal in het proces. Carelane zorgt dat informatie niet verloren gaat bij overdrachten en dat voortgang zichtbaar blijft.",
    points: [
      "Zorgvraag blijft herkenbaar door het hele traject",
      "Geen verlies van context bij wisseling van actor",
      "Duidelijke statusoverzichten per fase",
      "Privacy gewaarborgd door rolgebaseerde toegang",
    ],
    color: "var(--cl-teal)",
    bg: "rgba(46,200,166,.10)",
    border: "rgba(46,200,166,.25)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 17c0-3.31 2.69-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="14" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.25"/>
        <path d="M10.5 17c0-1.93 1.57-3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export function AudienceSection() {
  const [active, setActive] = useState("gemeente");
  const current = audiences.find((a) => a.id === active) ?? audiences[0];

  return (
    <section
      id="voor-wie"
      className="cl-section scroll-mt-20"
      aria-labelledby="audience-heading"
    >
      <div className="cl-container">
        <div className="mb-10 max-w-2xl">
          <p className="cl-eyebrow">Gebouwd voor iedere rol</p>
          <h2 id="audience-heading" className="cl-heading">
            Eén systeem. Vier rollen.
          </h2>
          <p className="cl-lead">
            Carelane past zich aan de context van de gebruiker aan. Elke rol ziet wat nodig is,
            zonder overbodige informatie uit andere domeinen.
          </p>
        </div>

        {/* Tab strip */}
        <div
          className="mb-6 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Doelgroepen"
        >
          {audiences.map((a) => (
            <button
              key={a.id}
              type="button"
              role="tab"
              aria-selected={active === a.id}
              aria-controls={`audience-panel-${a.id}`}
              id={`audience-tab-${a.id}`}
              onClick={() => setActive(a.id)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cl-violet-bright)]"
              style={{
                background: active === a.id ? a.bg : "var(--cl-surface-1)",
                borderColor: active === a.id ? a.border : "var(--cl-border-subtle)",
                color: active === a.id ? a.color : "var(--cl-text-secondary)",
              }}
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-lg shrink-0"
                style={{
                  background: active === a.id ? a.bg : "var(--cl-surface-2)",
                  color: active === a.id ? a.color : "var(--cl-text-muted)",
                }}
                aria-hidden="true"
              >
                {a.icon}
              </span>
              {a.label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div
          id={`audience-panel-${current.id}`}
          role="tabpanel"
          aria-labelledby={`audience-tab-${current.id}`}
          className="grid gap-6 lg:grid-cols-2 lg:items-center"
        >
          <div
            className="rounded-[var(--cl-radius-xl)] border p-6 transition-all duration-300"
            style={{
              background: "var(--cl-surface-1)",
              borderColor: current.border,
            }}
          >
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border"
              style={{ background: current.bg, borderColor: current.border, color: current.color }}
              aria-hidden="true"
            >
              {current.icon}
            </div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: current.color }}
            >
              {current.eyebrow}
            </p>
            <h3 className="text-xl font-semibold text-[var(--cl-text)] leading-snug">
              {current.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--cl-text-secondary)]">
              {current.desc}
            </p>
          </div>

          <ul className="space-y-2.5">
            {current.points.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 rounded-[var(--cl-radius-md)] border p-3.5"
                style={{ background: "var(--cl-surface-1)", borderColor: "var(--cl-border-subtle)" }}
              >
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                  style={{ background: current.bg, color: current.color }}
                  aria-hidden="true"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="text-sm text-[var(--cl-text-secondary)]">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
