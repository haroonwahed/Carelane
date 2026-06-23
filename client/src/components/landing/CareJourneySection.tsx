/**
 * Care Journey Route — five connected phases in the canonical order:
 * Aanmelding → Matching → Aanbiederreactie → Plaatsing → Intake
 * No Framer Motion. lucide-react icons.
 */
import { UserPlus, Search, Mail, CheckCircle, Calendar } from "lucide-react";

const phases = [
  {
    name: "Aanmelding",
    role: "Gemeente",
    text: "De zorgvraag wordt aangemaakt, gecontroleerd en compleet gemaakt.",
    friction: "Onvolledige informatie vertraagt de keten",
    frictionColor: "var(--cl-blue)",
    frictionBg: "rgba(62,168,255,.12)",
    color: "var(--cl-blue)",
    bg: "rgba(62,168,255,.12)",
    border: "rgba(62,168,255,.25)",
    step: "01",
    Icon: UserPlus,
  },
  {
    name: "Matching",
    role: "Carelane",
    text: "Carelane vergelijkt passende aanbieders en maakt afwegingen zichtbaar.",
    friction: "Wacht op reactie van aanbieder",
    frictionColor: "var(--cl-violet-bright)",
    frictionBg: "rgba(155,130,255,.12)",
    color: "var(--cl-violet-bright)",
    bg: "rgba(155,130,255,.12)",
    border: "rgba(155,130,255,.28)",
    step: "02",
    Icon: Search,
  },
  {
    name: "Aanbiederreactie",
    role: "Zorgaanbieder",
    text: "De aanbieder accepteert, wijst af of vraagt aanvullende informatie.",
    friction: "Capaciteit of beschikbaarheid is beperkt",
    frictionColor: "var(--cl-amber)",
    frictionBg: "rgba(245,165,36,.12)",
    color: "var(--cl-amber)",
    bg: "rgba(245,165,36,.12)",
    border: "rgba(245,165,36,.25)",
    step: "03",
    Icon: Mail,
  },
  {
    name: "Plaatsing",
    role: "Gemeente + Aanbieder",
    text: "De plaatsing wordt bevestigd en zorgvuldig voorbereid.",
    friction: "Overdracht met volledige context",
    frictionColor: "var(--cl-teal)",
    frictionBg: "rgba(46,200,166,.12)",
    color: "var(--cl-teal)",
    bg: "rgba(46,200,166,.12)",
    border: "rgba(46,200,166,.25)",
    step: "04",
    Icon: CheckCircle,
  },
  {
    name: "Intake",
    role: "Zorgaanbieder",
    text: "De intake wordt gepland en de overdracht wordt afgerond.",
    friction: "Intake nog niet ingepland",
    frictionColor: "var(--cl-teal)",
    frictionBg: "rgba(46,200,166,.12)",
    color: "var(--cl-teal)",
    bg: "rgba(46,200,166,.12)",
    border: "rgba(46,200,166,.25)",
    step: "05",
    Icon: Calendar,
  },
];

export function CareJourneySection() {
  return (
    <section
      id="werkwijze"
      className="cl-section scroll-mt-20"
      aria-labelledby="journey-heading"
    >
      <div className="cl-container">
        <div className="mb-12 max-w-2xl">
          <p className="cl-eyebrow">ÉÉN ZORGKETEN, ÉÉN ROUTE</p>
          <h2 id="journey-heading" className="cl-heading">
            Van aanmelding tot intake.
          </h2>
          <p className="cl-lead">
            Iedere casus volgt dezelfde herkenbare route, met ruimte voor professionele
            afwegingen en heldere verantwoordelijkheid.
          </p>
        </div>

        {/* Desktop: connected horizontal flow */}
        <div className="hidden lg:block">
          <ol className="relative grid grid-cols-5 gap-3" aria-label="Zorgketen fasen">
            {phases.map((phase, i) => (
              <li key={phase.name} className="group relative flex flex-col items-center">
                {/* Circle icon + connecting arrow row */}
                <div className="relative mb-4 flex w-full items-center justify-center">
                  {/* Arrow to the left — drawn AFTER first item so it spans from prev icon */}
                  {i > 0 && (
                    <span
                      className="absolute right-[calc(50%+28px)] top-1/2 -translate-y-1/2 flex items-center"
                      aria-hidden="true"
                      style={{ color: "var(--cl-text-muted)" }}
                    >
                      <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
                        <path d="M0 5h18M14 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}

                  {/* Circle icon */}
                  <div
                    className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border transition-all duration-200 group-hover:scale-105"
                    style={{
                      background: phase.bg,
                      borderColor: phase.border,
                      color: phase.color,
                      boxShadow: `0 0 0 4px ${phase.bg}`,
                    }}
                  >
                    <phase.Icon size={22} strokeWidth={1.75} />
                    {/* Number badge */}
                    <span
                      className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold"
                      style={{
                        background: phase.color,
                        color: "#0a0e1a",
                      }}
                    >
                      {phase.step}
                    </span>
                  </div>
                </div>

                {/* Content card */}
                <div
                  className="flex-1 w-full rounded-[var(--cl-radius-lg)] border p-4 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[var(--cl-shadow-card)]"
                  style={{
                    background: "var(--cl-surface-1)",
                    borderColor: "var(--cl-border-subtle)",
                  }}
                >
                  <h3 className="mb-1 text-sm font-semibold" style={{ color: "var(--cl-text)" }}>
                    {phase.name}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--cl-text-secondary)" }}>
                    {phase.text}
                  </p>

                  <div className="mt-3 border-t pt-2.5" style={{ borderColor: "var(--cl-border-subtle)" }}>
                    <p
                      className="mb-1.5 text-[9px] font-bold uppercase tracking-widest"
                      style={{ color: "var(--cl-text-muted)" }}
                    >
                      {phase.role}
                    </p>
                    {/* Friction pill */}
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium"
                      style={{
                        background: phase.frictionBg,
                        color: phase.frictionColor,
                        border: `1px solid ${phase.border}`,
                      }}
                    >
                      {phase.friction}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="lg:hidden">
          <ol className="relative space-y-0" aria-label="Zorgketen fasen">
            {/* Vertical line */}
            <div
              className="pointer-events-none absolute left-7 top-7 bottom-7 w-px"
              style={{
                background: "linear-gradient(to bottom, var(--cl-blue), var(--cl-violet-bright), var(--cl-amber), var(--cl-teal))",
                opacity: 0.25,
              }}
              aria-hidden="true"
            />

            {phases.map((phase) => (
              <li key={phase.name} className="relative flex gap-4 pb-6 last:pb-0">
                {/* Icon circle */}
                <div
                  className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border"
                  style={{
                    background: phase.bg,
                    borderColor: phase.border,
                    color: phase.color,
                  }}
                >
                  <phase.Icon size={20} strokeWidth={1.75} />
                  <span
                    className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold"
                    style={{ background: phase.color, color: "#0a0e1a" }}
                  >
                    {phase.step}
                  </span>
                </div>

                {/* Content */}
                <div
                  className="min-w-0 flex-1 rounded-[var(--cl-radius-md)] border p-4"
                  style={{ background: "var(--cl-surface-1)", borderColor: "var(--cl-border-subtle)" }}
                >
                  <h3 className="text-sm font-semibold" style={{ color: "var(--cl-text)" }}>
                    {phase.name}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--cl-text-secondary)" }}>
                    {phase.text}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs" style={{ color: "var(--cl-text-muted)" }}>
                      {phase.role}
                    </span>
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-medium"
                      style={{
                        background: phase.frictionBg,
                        color: phase.frictionColor,
                        border: `1px solid ${phase.border}`,
                      }}
                    >
                      {phase.friction}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
