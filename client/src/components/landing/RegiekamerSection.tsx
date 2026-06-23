import { ArrowRight, User } from "lucide-react";

const bullets = [
  "Real-time bottlenecks",
  "Duidelijk eigenaarschap",
  "Uitlegbare audittrail",
  "Volgende beste actie",
];

const attentionItems = [
  { label: "Casus onvolledig", count: 16 },
  { label: "Wacht op aanbiederreactie", count: 10 },
  { label: "Reactie overschreden", count: 4 },
  { label: "Intake te plannen", count: 5 },
];

const sparklineHeights = [40, 55, 45, 70, 60, 80, 65];

export function RegiekamerSection() {
  return (
    <section id="platform" className="cl-section scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          {/* LEFT COLUMN — 45% */}
          <div className="w-full lg:w-[45%] flex-shrink-0">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-4"
              style={{ color: "var(--cl-violet-bright)" }}
            >
              REGIEKAMER
            </p>
            <h2
              className="text-3xl lg:text-4xl font-bold leading-tight mb-5"
              style={{ color: "var(--cl-text)" }}
            >
              Zicht op het geheel. Grip op wat nu nodig is.
            </h2>
            <p
              className="text-base leading-relaxed mb-8"
              style={{ color: "var(--cl-text-secondary)" }}
            >
              De Regiekamer geeft coördinatoren en gemeenten één overzicht van
              alle lopende casussen, knelpunten en acties — zonder te zoeken,
              zonder te schakelen.
            </p>

            <ul className="space-y-3 mb-8">
              {bullets.map((bullet) => (
                <li key={bullet} className="flex items-center gap-3">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: "var(--cl-violet-bright)" }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--cl-text)" }}
                  >
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>

            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ color: "var(--cl-violet-bright)" }}
            >
              Bekijk Regiekamer
              <ArrowRight size={15} strokeWidth={2.5} />
            </a>
          </div>

          {/* RIGHT COLUMN — 55% */}
          <div className="w-full lg:w-[55%]">
            <div
              className="rounded-2xl p-5 space-y-4"
              style={{
                background: "var(--cl-bg-deep)",
                border: "1px solid var(--cl-border)",
              }}
            >
              {/* TOP ROW: two panels */}
              <div className="grid grid-cols-2 gap-4">
                {/* Aandacht vandaag */}
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: "var(--cl-surface-1)",
                    border: "1px solid var(--cl-border-subtle)",
                  }}
                >
                  <p
                    className="text-xs font-semibold mb-3"
                    style={{ color: "var(--cl-text-secondary)" }}
                  >
                    Aandacht vandaag{" "}
                    <span style={{ color: "var(--cl-amber)" }}>⚡</span>
                  </p>
                  <ul className="space-y-2.5">
                    {attentionItems.map((item) => (
                      <li
                        key={item.label}
                        className="flex items-center justify-between gap-2"
                      >
                        <span
                          className="text-xs leading-tight"
                          style={{ color: "var(--cl-text-secondary)" }}
                        >
                          {item.label}
                        </span>
                        <span
                          className="text-xs font-bold tabular-nums flex-shrink-0"
                          style={{ color: "var(--cl-text)" }}
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
                  <p
                    className="text-xs font-semibold mb-3"
                    style={{ color: "var(--cl-text-secondary)" }}
                  >
                    Doorlooptijd (gem.){" "}
                    <span style={{ color: "var(--cl-teal)" }}>▶</span>
                  </p>
                  <div className="flex-1 flex flex-col items-start justify-center">
                    <span
                      className="text-4xl font-bold leading-none tabular-nums"
                      style={{ color: "var(--cl-text)" }}
                    >
                      4.2
                    </span>
                    <span
                      className="text-xs mt-1.5"
                      style={{ color: "var(--cl-text-muted)" }}
                    >
                      dagen
                    </span>
                  </div>

                  {/* Sparkline */}
                  <div className="mt-4 flex items-end gap-1 h-8">
                    {sparklineHeights.map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm transition-all"
                        style={{
                          height: `${h}%`,
                          background:
                            i === sparklineHeights.length - 1
                              ? "var(--cl-teal)"
                              : "var(--cl-border)",
                          opacity: i === sparklineHeights.length - 1 ? 1 : 0.5,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: Volgende beste actie */}
              <div
                className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                style={{
                  background: "var(--cl-surface-1)",
                  border: "1px solid var(--cl-border-subtle)",
                }}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: "var(--cl-text-muted)" }}
                  >
                    Volgende beste actie
                  </p>
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span
                      className="text-sm font-bold"
                      style={{ color: "var(--cl-text)" }}
                    >
                      Casus #C-24796
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: "var(--cl-text-secondary)" }}
                    >
                      Maak casus compleet
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-1.5 mt-1"
                    style={{ color: "var(--cl-text-muted)" }}
                  >
                    <User size={11} />
                    <span className="text-xs">
                      Eigenaar: Gemeente Rotterdam
                    </span>
                  </div>
                </div>
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold flex-shrink-0 transition-opacity hover:opacity-90"
                  style={{
                    background: "var(--cl-violet-bright)",
                    color: "#fff",
                  }}
                >
                  Open casus
                  <ArrowRight size={13} strokeWidth={2.5} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
