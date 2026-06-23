import { AlertCircle, ArrowRight, Clock, User } from "lucide-react";

const bullets = [
  "Real-time bottlenecks zichtbaar",
  "Duidelijk eigenaarschap per casus",
  "Uitlegbare audittrail",
  "Volgende beste actie direct beschikbaar",
];

const attentionItems = [
  { label: "Casus onvolledig", count: 16, color: "var(--cl-text-secondary)", severity: "normal" },
  { label: "Wacht op aanbiederreactie", count: 10, color: "var(--cl-amber)", severity: "amber" },
  { label: "Reactie overschreden", count: 4, color: "#ef5b62", severity: "red" },
  { label: "Intake te plannen", count: 5, color: "var(--cl-violet-bright)", severity: "violet" },
];

// SVG sparkline points — declining trend then recovery
const sparkPoints = [
  [0, 28], [16, 22], [32, 30], [48, 16], [64, 24], [80, 18], [96, 10],
];

function toPolyline(pts: number[][]): string {
  return pts.map(([x, y]) => `${x},${y}`).join(" ");
}

export function RegiekamerSection() {
  return (
    <section
      id="platform"
      className="cl-section scroll-mt-20"
      aria-labelledby="regiekamer-heading"
      style={{ position: "relative" }}
    >
      {/* Radial glow behind right panel */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: -1,
          background: "radial-gradient(ellipse at 80% 50%, rgba(91,62,230,0.08), transparent 65%)",
        }}
      />

      <div className="cl-container">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16 lg:items-center">

          {/* LEFT COLUMN */}
          <div className="w-full lg:w-[40%] flex-shrink-0">
            <p className="cl-eyebrow">REGIEKAMER</p>
            <h2 id="regiekamer-heading" className="cl-heading">
              Zicht op het geheel. Grip op wat nu nodig is.
            </h2>
            <p className="cl-lead">
              De Regiekamer geeft coördinatoren en gemeenten één overzicht van alle lopende
              casussen, knelpunten en acties — zonder te zoeken, zonder te schakelen.
            </p>

            <ul className="mt-7 space-y-3">
              {bullets.map((bullet) => (
                <li key={bullet} className="flex items-center gap-3">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: "var(--cl-violet-bright)" }}
                    aria-hidden="true"
                  />
                  <span className="text-sm" style={{ color: "var(--cl-text-secondary)" }}>{bullet}</span>
                </li>
              ))}
            </ul>

            <a
              href="#"
              className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ color: "var(--cl-violet-bright)" }}
            >
              Bekijk Regiekamer
              <ArrowRight size={14} strokeWidth={2.5} />
            </a>
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-full lg:w-[60%]">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "var(--cl-bg-deep)",
                border: "1px solid var(--cl-border)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.40), 0 0 0 1px rgba(155,130,255,0.08)",
              }}
            >
              {/* Violet top-edge accent line */}
              <div
                aria-hidden="true"
                style={{
                  height: 1,
                  background: "linear-gradient(90deg, rgba(155,130,255,0.30), transparent)",
                }}
              />
              <div className="p-6 space-y-4">
              {/* Top two panels */}
              <div className="grid grid-cols-2 gap-3">

                {/* Aandacht vandaag */}
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: "var(--cl-surface-1)",
                    border: "1px solid var(--cl-border-subtle)",
                  }}
                >
                  <p className="text-xs font-semibold mb-3" style={{ color: "var(--cl-text-secondary)" }}>
                    Aandacht vandaag <span style={{ color: "var(--cl-amber)" }}>⚡</span>
                  </p>
                  <ul className="space-y-2.5">
                    {attentionItems.map((item) => (
                      <li
                        key={item.label}
                        className="flex items-center justify-between gap-2 pl-2 rounded-sm"
                        style={{
                          borderLeft: `2px solid ${item.severity !== "normal" ? item.color : "transparent"}`,
                        }}
                      >
                        {item.severity === "red" && (
                          <AlertCircle
                            size={11}
                            className="shrink-0"
                            style={{ color: "#ef5b62" }}
                            aria-hidden="true"
                          />
                        )}
                        <span
                          className="text-xs leading-tight flex-1 min-w-0"
                          style={{ color: item.severity !== "normal" ? item.color : "var(--cl-text-secondary)" }}
                        >
                          {item.label}
                        </span>
                        <span
                          className="text-xs font-bold tabular-nums flex-shrink-0 rounded-md px-1.5 py-0.5"
                          style={{
                            fontSize: item.severity === "red" ? 13 : undefined,
                            color: item.severity !== "normal" ? item.color : "var(--cl-text)",
                            background: item.severity === "red"
                              ? "rgba(239,91,98,0.12)"
                              : item.severity === "amber"
                              ? "rgba(245,165,36,0.12)"
                              : item.severity === "violet"
                              ? "rgba(155,130,255,0.12)"
                              : "transparent",
                          }}
                        >
                          {item.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Doorlooptijd */}
                <div
                  className="rounded-xl p-4 flex flex-col"
                  style={{
                    background: "var(--cl-surface-1)",
                    border: "1px solid var(--cl-border-subtle)",
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold" style={{ color: "var(--cl-text-secondary)" }}>
                      Doorlooptijd (gem.)
                    </p>
                    <Clock size={12} style={{ color: "var(--cl-teal)" }} aria-hidden="true" />
                  </div>
                  <div>
                    <span className="text-4xl font-bold tabular-nums leading-none" style={{ color: "var(--cl-text)" }}>
                      4.2
                    </span>
                    <span className="ml-1.5 text-xs" style={{ color: "var(--cl-text-muted)" }}>dagen</span>
                  </div>
                  <p className="mt-1 text-[10px]" style={{ color: "var(--cl-teal)" }}>↓ 0.6 t.o.v. vorige week</p>

                  {/* SVG sparkline */}
                  <div className="mt-3 flex-1 flex items-end">
                    <svg viewBox="0 0 96 32" style={{ width: "100%", height: 40, overflow: "visible" }} aria-hidden="true">
                      <defs>
                        <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="rgba(46,200,166,0.3)" />
                          <stop offset="100%" stopColor="var(--cl-teal)" />
                        </linearGradient>
                      </defs>
                      {/* Area fill */}
                      <polygon
                        points={`0,32 ${toPolyline(sparkPoints)} 96,32`}
                        fill="rgba(46,200,166,0.07)"
                      />
                      {/* Line */}
                      <polyline
                        points={toPolyline(sparkPoints)}
                        fill="none"
                        stroke="url(#sparkGrad)"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Last dot */}
                      <circle
                        cx={sparkPoints[sparkPoints.length - 1][0]}
                        cy={sparkPoints[sparkPoints.length - 1][1]}
                        r="3"
                        fill="var(--cl-teal)"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Volgende beste actie — visually dominant */}
              <div
                className="rounded-xl p-4"
                style={{
                  background: "rgba(155,130,255,0.10)",
                  border: "1px solid rgba(155,130,255,0.28)",
                  boxShadow: "0 0 24px rgba(155,130,255,0.08)",
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[9px] font-bold uppercase tracking-[0.12em] mb-1.5"
                      style={{ color: "var(--cl-text-muted)" }}
                    >
                      Volgende beste actie
                    </p>
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-sm font-bold" style={{ color: "var(--cl-text)" }}>
                        Casus #C-24796
                      </span>
                      <span className="text-sm" style={{ color: "var(--cl-text-secondary)" }}>
                        — Maak casus compleet
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5" style={{ color: "var(--cl-text-muted)" }}>
                      <User size={11} aria-hidden="true" />
                      <span className="text-xs">Eigenaar: Gemeente Rotterdam</span>
                    </div>
                  </div>
                  <a
                    href="#"
                    className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold flex-shrink-0 transition-opacity hover:opacity-90"
                    style={{
                      background: "var(--cl-violet-bright)",
                      color: "#fff",
                      boxShadow: "0 4px 16px rgba(155,130,255,0.28)",
                    }}
                  >
                    Open casus
                    <ArrowRight size={12} strokeWidth={2.5} />
                  </a>
                </div>
              </div>
            </div>{/* end p-6 space-y-4 */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
