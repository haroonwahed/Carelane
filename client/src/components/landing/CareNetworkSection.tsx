/**
 * Care Network section — one shared case record at the centre, each organisation
 * connected to it with a clear, labelled flow.
 *
 * Desktop: a precise diagram built around a real "casus" record card (product
 * truth, not an abstract glowing orb) with clean solid connectors.
 * Mobile: role cards grid.
 */
import { Activity, BookOpen, Building2, Share2, ShieldCheck, User, Users } from "lucide-react";

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

interface NodeDef {
  id: string;
  label: string;
  sub: string;
  Icon: React.ElementType;
  accent: string; // hex (used in SVG + HTML)
  fx: number; // fractional x of the card centre (0..1)
  fy: number; // fractional y of the card centre (0..1)
  connLabel: string;
}

const nodes: NodeDef[] = [
  { id: "gemeente",    label: "Gemeente",      sub: "Regie & beoordeling",          Icon: Building2,  accent: "#3ea8ff", fx: 0.15, fy: 0.16, connLabel: "aanmelding" },
  { id: "aanbieder",   label: "Aanbieder",     sub: "Zorg & behandeling",           Icon: ShieldCheck, accent: "#9b82ff", fx: 0.85, fy: 0.16, connLabel: "reactie" },
  { id: "coordinator", label: "Coördinator",   sub: "Casemanagement & voortgang",   Icon: User,       accent: "#f5a524", fx: 0.15, fy: 0.84, connLabel: "informatie" },
  { id: "client",      label: "Cliënt & gezin", sub: "Betrokken & geïnformeerd",     Icon: Users,      accent: "#2ec8a6", fx: 0.85, fy: 0.84, connLabel: "terugkoppeling" },
];

const VB = 480;
const C = { x: VB / 2, y: VB / 2 };

/** Connector endpoints, trimmed so the line starts/ends clear of both cards. */
function edge(fx: number, fy: number) {
  const nx = fx * VB;
  const ny = fy * VB;
  const dx = nx - C.x;
  const dy = ny - C.y;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const startOff = 86; // clear the central record card
  const endOff = 60; // clear the role card
  return {
    x1: C.x + ux * startOff,
    y1: C.y + uy * startOff,
    x2: nx - ux * endOff,
    y2: ny - uy * endOff,
    mx: (C.x + nx) / 2,
    my: (C.y + ny) / 2,
  };
}

// Central record card's phase bar — Aanmelding done, Matching current.
const RECORD_PHASES = ["#3ea8ff", "#9b82ff", "#2a3650", "#2a3650", "#2a3650"];

export function CareNetworkSection() {
  return (
    <section
      className="cl-section"
      aria-labelledby="network-heading"
      style={{ background: "var(--cl-bg-deep)" }}
    >
      <div className="cl-container">
        <div className="grid gap-10 lg:grid-cols-[38%_62%] lg:items-center">

          {/* LEFT text */}
          <div>
            <p className="cl-eyebrow">ÉÉN CASUS, MEERDERE ORGANISATIES</p>
            <h2 id="network-heading" className="cl-heading">
              Samenwerken rondom de jongere.
            </h2>
            <p className="cl-lead">
              Gemeenten, aanbieders, coördinatoren en gezin werken rond één gedeeld
              dossier — elk met een eigen rol en eigen zichtbaarheid.
            </p>

            <ul className="mt-7 space-y-5">
              {bullets.map(({ Icon, label, desc }) => (
                <li key={label} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: "rgba(155,130,255,.10)",
                      color: "var(--cl-violet-bright)",
                      border: "1px solid rgba(155,130,255,.20)",
                    }}
                    aria-hidden="true"
                  >
                    <Icon size={15} strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--cl-text)" }}>{label}</p>
                    <p className="mt-0.5 text-xs leading-relaxed" style={{ color: "var(--cl-text-muted)" }}>{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT — shared case record diagram (desktop) */}
          <div
            className="hidden lg:block"
            role="img"
            aria-label="Diagram: één gedeeld casusdossier verbonden met gemeente, aanbieder, coördinator en cliënt & gezin"
          >
            <div style={{ position: "relative", width: "100%", maxWidth: 500, aspectRatio: "1 / 1", margin: "0 auto" }}>
              {/* Single restrained ambient — not a glow ring */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute", inset: "22%", borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(91,62,230,.14), transparent 70%)",
                  filter: "blur(34px)",
                }}
              />

              {/* Connectors */}
              <svg viewBox={`0 0 ${VB} ${VB}`} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
                <defs>
                  {nodes.map((n) => {
                    const e = edge(n.fx, n.fy);
                    return (
                      <linearGradient key={`g-${n.id}`} id={`g-${n.id}`} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="rgba(150,165,200,0.30)" />
                        <stop offset="100%" stopColor={n.accent} />
                      </linearGradient>
                    );
                  })}
                </defs>

                {nodes.map((n) => {
                  const e = edge(n.fx, n.fy);
                  const w = n.connLabel.length * 5.3 + 16;
                  return (
                    <g key={n.id}>
                      {/* soft underglow */}
                      <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke={n.accent} strokeWidth={6} opacity={0.06} strokeLinecap="round" />
                      {/* main connector */}
                      <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke={`url(#g-${n.id})`} strokeWidth={1.6} strokeLinecap="round" opacity={0.9} />
                      {/* ports */}
                      <circle cx={e.x1} cy={e.y1} r={2} fill="rgba(150,165,200,0.55)" />
                      <circle cx={e.x2} cy={e.y2} r={3} fill={n.accent} />
                      <circle cx={e.x2} cy={e.y2} r={5.5} fill="none" stroke={n.accent} strokeWidth={1} opacity={0.4} />
                      {/* label pill */}
                      <g>
                        <rect x={e.mx - w / 2} y={e.my - 9} width={w} height={18} rx={9} fill="#0a1326" stroke={n.accent} strokeOpacity={0.32} strokeWidth={1} />
                        <text x={e.mx} y={e.my + 3.5} textAnchor="middle" style={{ fontSize: 9.5, fill: "var(--cl-text-secondary)", fontFamily: "inherit", fontWeight: 500 }}>
                          {n.connLabel}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>

              {/* Central case record card — the shared dossier */}
              <div
                style={{
                  position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
                  width: 192,
                  background: "var(--cl-surface-2)",
                  border: "1px solid var(--cl-border)",
                  borderRadius: 16,
                  padding: "14px 15px",
                  display: "flex", flexDirection: "column", gap: 10,
                  boxShadow: "0 20px 55px rgba(0,0,0,.55), inset 0 1px 0 rgba(155,130,255,.12)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2ec8a6" }} />
                    <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--cl-text-muted)" }}>Casus</span>
                  </span>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--cl-text-secondary)", fontVariantNumeric: "tabular-nums" }}>C-24871</span>
                </div>

                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--cl-text)", lineHeight: 1.25 }}>Jeugd-GGZ — ambulant</p>
                  <p style={{ fontSize: 10.5, color: "var(--cl-text-muted)", marginTop: 2 }}>Regio Rotterdam</p>
                </div>

                <div style={{ display: "flex", gap: 3, height: 5 }}>
                  {RECORD_PHASES.map((c, i) => (
                    <span key={i} style={{ flex: 1, borderRadius: 3, background: c }} />
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10 }}>
                  <span style={{ color: "var(--cl-text-muted)" }}>Huidige fase</span>
                  <span style={{ color: "var(--cl-violet-bright)", fontWeight: 600 }}>Matching</span>
                </div>
              </div>

              {/* Role cards */}
              {nodes.map(({ id, label, sub, Icon, accent, fx, fy }) => (
                <div
                  key={id}
                  style={{
                    position: "absolute",
                    left: `${fx * 100}%`,
                    top: `${fy * 100}%`,
                    transform: "translate(-50%, -50%)",
                    width: 138,
                    borderRadius: 14,
                    background: "var(--cl-surface-1)",
                    border: "1px solid var(--cl-border-subtle)",
                    borderTop: `2px solid ${accent}`,
                    padding: "12px 13px",
                    display: "flex", flexDirection: "column", gap: 7,
                    boxShadow: "0 12px 32px rgba(0,0,0,.4)",
                  }}
                >
                  <span
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 30, height: 30, borderRadius: 9,
                      background: `${accent}1f`, color: accent, border: `1px solid ${accent}40`,
                    }}
                    aria-hidden="true"
                  >
                    <Icon size={15} strokeWidth={1.9} />
                  </span>
                  <div>
                    <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--cl-text)", lineHeight: 1.2 }}>{label}</p>
                    <p style={{ fontSize: 10, color: "var(--cl-text-muted)", lineHeight: 1.3, marginTop: 2 }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: cards grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
            {nodes.map(({ id, label, sub, Icon, accent }) => (
              <div
                key={id}
                className="rounded-[var(--cl-radius-md)] border p-4"
                style={{ background: "var(--cl-surface-1)", borderColor: "var(--cl-border-subtle)", borderTop: `2px solid ${accent}` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${accent}1f`, color: accent }}
                    aria-hidden="true"
                  >
                    <Icon size={14} strokeWidth={1.85} />
                  </span>
                  <p className="text-sm font-semibold" style={{ color: "var(--cl-text)" }}>{label}</p>
                </div>
                <p className="text-xs" style={{ color: "var(--cl-text-muted)" }}>{sub}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
