/**
 * Care Network section — one case at the centre with surrounding organisations.
 * Desktop: CSS-absolute node cards + SVG dashed lines, no Framer Motion.
 * Mobile: role cards grid.
 */
import type { CSSProperties } from "react";
import { Share2, BookOpen, Activity, Building2, ShieldCheck, User, Users } from "lucide-react";

const bullets = [
  {
    Icon: Share2,
    label: "Informatie delen",
    desc: "Elke partij ziet precies wat nodig is voor de eigen rol — niet meer, niet minder.",
  },
  {
    Icon: BookOpen,
    label: "Beslissingen vastleggen",
    desc: "Elk besluit is herleidbaar tot een actor, rol en moment.",
  },
  {
    Icon: Activity,
    label: "Voortgang bewaken",
    desc: "Carelane bewaakt de informatiestroom en houdt eigenaarschap expliciet.",
  },
];

// svgX/svgY = where the dashed line should end in the 480×480 SVG coordinate space
const nodes = [
  {
    id: "gemeente",
    label: "Gemeente",
    sub: "Regievoering & samenwerking",
    Icon: Building2,
    color: "var(--cl-blue)",
    bg: "rgba(62,168,255,.12)",
    border: "rgba(62,168,255,.28)",
    svgX: 80,
    svgY: 78,
    pos: { top: "3%", left: "1%" } as CSSProperties,
  },
  {
    id: "aanbieder",
    label: "Aanbieder",
    sub: "Zorg & behandeling",
    Icon: ShieldCheck,
    color: "var(--cl-violet-bright)",
    bg: "rgba(155,130,255,.12)",
    border: "rgba(155,130,255,.28)",
    svgX: 400,
    svgY: 78,
    pos: { top: "3%", right: "1%" } as CSSProperties,
  },
  {
    id: "coordinator",
    label: "Coördinator",
    sub: "Casemanagement & voortgang",
    Icon: User,
    color: "var(--cl-amber)",
    bg: "rgba(245,165,36,.12)",
    border: "rgba(245,165,36,.28)",
    svgX: 80,
    svgY: 400,
    pos: { bottom: "3%", left: "1%" } as CSSProperties,
  },
  {
    id: "client",
    label: "Cliënt & gezin",
    sub: "Betrokken & geïnformeerd",
    Icon: Users,
    color: "var(--cl-teal)",
    bg: "rgba(46,200,166,.12)",
    border: "rgba(46,200,166,.28)",
    svgX: 400,
    svgY: 400,
    pos: { bottom: "3%", right: "1%" } as CSSProperties,
  },
];

export function CareNetworkSection() {
  return (
    <section
      className="cl-section"
      aria-labelledby="network-heading"
      style={{ background: "var(--cl-bg-deep)" }}
    >
      <div className="cl-container">
        <div className="grid gap-12 lg:grid-cols-[40%_60%] lg:items-center">

          {/* LEFT: text column */}
          <div>
            <p className="cl-eyebrow">ÉÉN CASUS, MEERDERE ORGANISATIES</p>
            <h2 id="network-heading" className="cl-heading">
              Samenwerken rondom de jongere.
            </h2>
            <p className="cl-lead">
              Gemeenten, aanbieders, coördinatoren en gezin werken in een gedeelde omgeving.
            </p>

            <ul className="mt-8 space-y-5">
              {bullets.map(({ Icon, label, desc }) => (
                <li key={label} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: "rgba(155,130,255,.12)",
                      color: "var(--cl-violet-bright)",
                      border: "1px solid rgba(155,130,255,.22)",
                    }}
                    aria-hidden="true"
                  >
                    <Icon size={16} strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--cl-text)" }}>
                      {label}
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed" style={{ color: "var(--cl-text-muted)" }}>
                      {desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT: network diagram — desktop only */}
          <div
            className="hidden lg:block"
            role="img"
            aria-label="Diagram: centrale casus omringd door gemeente, aanbieder, coördinator en cliënt & gezin"
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 480,
                aspectRatio: "1 / 1",
                margin: "0 auto",
              }}
            >
              {/* Dashed SVG connecting lines + subtle orbit ring */}
              <svg
                viewBox="0 0 480 480"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                }}
              >
                <circle
                  cx="240"
                  cy="240"
                  r="150"
                  fill="none"
                  stroke="rgba(155,130,255,.07)"
                  strokeWidth="1"
                  strokeDasharray="3 9"
                />
                {nodes.map((n) => (
                  <line
                    key={n.id}
                    x1="240"
                    y1="240"
                    x2={n.svgX}
                    y2={n.svgY}
                    stroke="rgba(155,130,255,.28)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                ))}
              </svg>

              {/* Center — CASUS circle */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle at 40% 35%, rgba(155,130,255,.30), rgba(91,62,230,.10))",
                  border: "1.5px solid rgba(155,130,255,.32)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  boxShadow: "0 0 48px rgba(155,130,255,.14)",
                }}
              >
                {/* Person silhouette */}
                <svg width="46" height="46" viewBox="0 0 46 46" aria-hidden="true" fill="none">
                  <circle cx="23" cy="15" r="8.5" fill="rgba(171,155,255,.55)" />
                  <path d="M4 42c0-10.49 8.51-19 19-19s19 8.51 19 19" fill="rgba(171,155,255,.40)" />
                </svg>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    color: "var(--cl-text-muted)",
                    textTransform: "uppercase" as const,
                  }}
                >
                  CASUS
                </span>
              </div>

              {/* 4 role node cards at corners */}
              {nodes.map(({ id, label, sub, Icon, color, bg, border, pos }) => (
                <div
                  key={id}
                  style={{
                    position: "absolute",
                    ...pos,
                    width: 112,
                    borderRadius: "var(--cl-radius-lg)",
                    background: bg,
                    border: `1.5px solid ${border}`,
                    padding: "10px 12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 5,
                    textAlign: "center" as const,
                    boxShadow: "var(--cl-shadow-card)",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: bg,
                      color,
                      border: `1px solid ${border}`,
                    }}
                    aria-hidden="true"
                  >
                    <Icon size={15} strokeWidth={1.75} />
                  </span>
                  <p style={{ fontSize: 11, fontWeight: 700, color, lineHeight: 1.2 }}>
                    {label}
                  </p>
                  <p style={{ fontSize: 9.5, color: "var(--cl-text-muted)", lineHeight: 1.3 }}>
                    {sub}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: role cards grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
            {nodes.map(({ id, label, sub, Icon, color, bg, border }) => (
              <div
                key={id}
                className="rounded-[var(--cl-radius-md)] border p-4"
                style={{ background: "var(--cl-surface-1)", borderColor: border }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: bg, color }}
                    aria-hidden="true"
                  >
                    <Icon size={14} strokeWidth={1.75} />
                  </span>
                  <p className="text-sm font-semibold" style={{ color }}>
                    {label}
                  </p>
                </div>
                <p className="text-xs" style={{ color: "var(--cl-text-muted)" }}>
                  {sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
