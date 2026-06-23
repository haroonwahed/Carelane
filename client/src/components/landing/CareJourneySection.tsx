/**
 * Care Journey Route — five connected phases in canonical order.
 * Desktop: prominent route line with phase nodes, lightweight annotation blocks below.
 * Mobile: vertical connected timeline.
 */
import { Calendar, CheckCircle, Mail, Search, UserPlus } from "lucide-react";

const phases = [
  {
    name: "Aanmelding",
    role: "Gemeente",
    text: "Zorgvraag wordt aangemaakt, gecontroleerd en compleet gemaakt.",
    friction: "Onvolledige informatie vertraagt",
    frictionColor: "var(--cl-blue)",
    frictionBg: "rgba(62,168,255,.10)",
    color: "var(--cl-blue)",
    bg: "rgba(62,168,255,.12)",
    border: "rgba(62,168,255,.30)",
    step: "01",
    Icon: UserPlus,
  },
  {
    name: "Matching",
    role: "Carelane",
    text: "Passende aanbieders worden vergeleken en afwegingen zichtbaar gemaakt.",
    friction: "Wacht op aanbiederreactie",
    frictionColor: "var(--cl-violet-bright)",
    frictionBg: "rgba(155,130,255,.10)",
    color: "var(--cl-violet-bright)",
    bg: "rgba(155,130,255,.12)",
    border: "rgba(155,130,255,.30)",
    step: "02",
    Icon: Search,
  },
  {
    name: "Aanbiederreactie",
    role: "Zorgaanbieder",
    text: "Aanbieder accepteert, wijst af of vraagt aanvullende informatie.",
    friction: "Capaciteit beperkt",
    frictionColor: "var(--cl-amber)",
    frictionBg: "rgba(245,165,36,.10)",
    color: "var(--cl-amber)",
    bg: "rgba(245,165,36,.12)",
    border: "rgba(245,165,36,.28)",
    step: "03",
    Icon: Mail,
  },
  {
    name: "Plaatsing",
    role: "Gemeente + Aanbieder",
    text: "Plaatsing wordt bevestigd en zorgvuldig voorbereid met volledige context.",
    friction: "Overdracht volledig",
    frictionColor: "var(--cl-teal)",
    frictionBg: "rgba(46,200,166,.10)",
    color: "var(--cl-teal)",
    bg: "rgba(46,200,166,.12)",
    border: "rgba(46,200,166,.28)",
    step: "04",
    Icon: CheckCircle,
  },
  {
    name: "Intake",
    role: "Zorgaanbieder",
    text: "Intake wordt gepland en de overdracht volledig afgerond.",
    friction: "Intake ingepland",
    frictionColor: "var(--cl-teal)",
    frictionBg: "rgba(46,200,166,.10)",
    color: "var(--cl-teal)",
    bg: "rgba(46,200,166,.12)",
    border: "rgba(46,200,166,.28)",
    step: "05",
    Icon: Calendar,
  },
];

export function CareJourneySection() {
  return (
    <section id="werkwijze" className="cl-section scroll-mt-20" aria-labelledby="journey-heading">
      <div className="cl-container">

        {/* Header */}
        <div className="mb-10 max-w-2xl">
          <p className="cl-eyebrow">ÉÉN ZORGKETEN, ÉÉN ROUTE</p>
          <h2 id="journey-heading" className="cl-heading">Van aanmelding tot intake.</h2>
          <p className="cl-lead">
            Iedere casus volgt dezelfde herkenbare route, met ruimte voor professionele
            afwegingen en heldere verantwoordelijkheid.
          </p>
        </div>

        {/* Desktop: route + annotation blocks */}
        <div className="hidden lg:block">

          {/* Route row: gradient line + phase circles */}
          <div className="relative mb-6">
            {/* Continuous gradient route line */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "50%",
                left: "calc(10% + 28px)",
                right: "calc(10% + 28px)",
                height: 3,
                transform: "translateY(-50%)",
                background: "linear-gradient(to right, var(--cl-blue), var(--cl-violet-bright), var(--cl-amber), var(--cl-teal), var(--cl-teal))",
                borderRadius: 99,
                opacity: 0.55,
              }}
            />

            <ol
              className="relative grid grid-cols-5"
              aria-label="Zorgketen fasen"
            >
              {phases.map((phase) => (
                <li key={phase.name} className="flex flex-col items-center gap-3">
                  {/* Phase circle — visually dominant */}
                  <div
                    style={{
                      position: "relative",
                      zIndex: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: phase.bg,
                      border: `2px solid ${phase.border}`,
                      color: phase.color,
                      boxShadow: `0 0 0 6px ${phase.bg}, 0 4px 16px ${phase.bg}`,
                    }}
                  >
                    <phase.Icon size={22} strokeWidth={1.75} />
                    {/* Step badge */}
                    <span
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: phase.color,
                        color: "#060b17",
                        fontSize: 9,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {phase.step}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Annotation row: lightweight info blocks, no heavy cards */}
          <div className="grid grid-cols-5 gap-3">
            {phases.map((phase) => (
              <div key={phase.name} className="flex flex-col gap-2 px-1">
                {/* Phase name */}
                <p
                  className="text-sm font-bold"
                  style={{ color: phase.color }}
                >
                  {phase.name}
                </p>
                {/* Description */}
                <p className="text-xs leading-relaxed" style={{ color: "var(--cl-text-secondary)" }}>
                  {phase.text}
                </p>
                {/* Role + friction — minimal */}
                <div className="mt-auto pt-2 flex flex-col gap-1.5">
                  <span
                    className="text-[9px] font-bold uppercase tracking-widest"
                    style={{ color: "var(--cl-text-muted)" }}
                  >
                    {phase.role}
                  </span>
                  <span
                    className="inline-flex items-center self-start rounded-full px-2 py-0.5 text-[9px] font-medium"
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
            ))}
          </div>
        </div>

        {/* Mobile: vertical connected timeline */}
        <div className="lg:hidden">
          <ol className="relative space-y-0" aria-label="Zorgketen fasen">
            {/* Gradient line */}
            <div
              className="pointer-events-none absolute left-7 top-7 bottom-7 w-[3px] rounded-full"
              style={{
                background: "linear-gradient(to bottom, var(--cl-blue), var(--cl-violet-bright), var(--cl-amber), var(--cl-teal))",
                opacity: 0.45,
              }}
              aria-hidden="true"
            />

            {phases.map((phase) => (
              <li key={phase.name} className="relative flex gap-4 pb-5 last:pb-0">
                {/* Icon circle */}
                <div
                  className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2"
                  style={{
                    background: phase.bg,
                    borderColor: phase.border,
                    color: phase.color,
                  }}
                >
                  <phase.Icon size={20} strokeWidth={1.75} />
                  <span
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: phase.color,
                      color: "#060b17",
                      fontSize: 8,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {phase.step}
                  </span>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-sm font-bold" style={{ color: phase.color }}>{phase.name}</p>
                  <p className="mt-0.5 text-sm leading-relaxed" style={{ color: "var(--cl-text-secondary)" }}>
                    {phase.text}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs" style={{ color: "var(--cl-text-muted)" }}>{phase.role}</span>
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
