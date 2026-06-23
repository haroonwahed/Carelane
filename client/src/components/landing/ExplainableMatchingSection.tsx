/**
 * Explainable Matching section.
 * Static three-column layout: left copy · centre provider cards (A/B/C) · right why-panel.
 * Card B (Aanbieder B) is permanently highlighted as the recommended match.
 * No interactive state — pure visual composition. No Framer Motion.
 */
import { CheckCircle2 } from "lucide-react";

interface ProviderData {
  letter: string;
  name: string;
  matchPct: number;
  beschikbaarheid: string;
  locatie: string;
  recommended: boolean;
  dimmed: boolean;
}

const providers: ProviderData[] = [
  {
    letter: "A",
    name: "Aanbieder A",
    matchPct: 74,
    beschikbaarheid: "5 dagen",
    locatie: "12 km",
    recommended: false,
    dimmed: false,
  },
  {
    letter: "B",
    name: "Aanbieder B",
    matchPct: 92,
    beschikbaarheid: "2 dagen",
    locatie: "6 km",
    recommended: true,
    dimmed: false,
  },
  {
    letter: "C",
    name: "Aanbieder C",
    matchPct: 58,
    beschikbaarheid: "Wachtlijst",
    locatie: "18 km",
    recommended: false,
    dimmed: true,
  },
];

const whyItems = [
  "Specialisatie sluit aan op de hulpvraag",
  "Beschikbaar binnen gewenste termijn",
  "Vertrouwde samenwerkingspartner",
  "Realistisch aanbod",
];

function ProviderBadge({
  letter,
  recommended,
  dimmed,
}: {
  letter: string;
  recommended: boolean;
  dimmed: boolean;
}) {
  const bg = recommended
    ? "rgba(29,158,117,0.18)"
    : dimmed
    ? "rgba(136,135,128,0.18)"
    : "rgba(62,168,255,0.15)";
  const color = recommended
    ? "var(--cl-teal)"
    : dimmed
    ? "var(--cl-text-muted)"
    : "var(--cl-blue)";

  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
      style={{ background: bg, color }}
      aria-hidden="true"
    >
      {letter}
    </div>
  );
}

export function ExplainableMatchingSection() {
  return (
    <section className="cl-section" aria-labelledby="matching-heading">
      <div className="cl-container">
        <div
          className="grid gap-6 items-start"
          style={{ gridTemplateColumns: "22fr 48fr 30fr" }}
        >
          {/* ── Left column: copy ──────────────────────────────────────────── */}
          <div className="flex flex-col gap-5 pr-2 pt-1">
            <p
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{ color: "var(--cl-violet-bright)" }}
            >
              VERKLAARBARE MATCHING
            </p>

            <h2
              id="matching-heading"
              className="text-2xl font-bold leading-snug"
              style={{ color: "var(--cl-text)" }}
            >
              De juiste match.{" "}
              <span style={{ color: "var(--cl-violet-bright)" }}>
                Uitlegbaar
              </span>{" "}
              én onderbouwd.
            </h2>

            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--cl-text-secondary)" }}
            >
              Carelane adviseert op basis van zorgbehoefte, expertise,
              beschikbaarheid, regio en beperkingen. De professional houdt de
              regie.
            </p>

            <div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-[var(--cl-radius-md)] border px-4 py-2 text-sm font-medium transition-colors duration-150"
                style={{
                  borderColor: "var(--cl-teal)",
                  color: "var(--cl-teal)",
                  background: "transparent",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(29,158,117,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                }}
              >
                Start matching →
              </button>
            </div>
          </div>

          {/* ── Centre column: three equal provider cards ───────────────────── */}
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
          >
            {providers.map((p) => (
              <div
                key={p.letter}
                className="flex flex-col gap-3 rounded-[var(--cl-radius-lg)] border p-4"
                style={{
                  background: p.recommended
                    ? "rgba(29,158,117,0.06)"
                    : "var(--cl-surface-1)",
                  borderColor: p.recommended
                    ? "rgba(29,158,117,0.40)"
                    : "var(--cl-border-subtle)",
                  boxShadow: p.recommended
                    ? "0 0 0 1px rgba(29,158,117,0.12)"
                    : "none",
                  opacity: p.dimmed ? 0.62 : 1,
                }}
                aria-label={
                  p.recommended ? `${p.name} — aanbevolen match` : p.name
                }
              >
                {/* Recommended badge — height-reserved on all cards so rows align */}
                {p.recommended ? (
                  <span
                    className="self-start rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide"
                    style={{
                      background: "rgba(29,158,117,0.18)",
                      color: "var(--cl-teal)",
                    }}
                  >
                    Aanbevolen match
                  </span>
                ) : (
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] select-none"
                    style={{ visibility: "hidden" }}
                    aria-hidden="true"
                  >
                    &nbsp;
                  </span>
                )}

                {/* Icon badge + provider name */}
                <div className="flex flex-col items-start gap-2">
                  <ProviderBadge
                    letter={p.letter}
                    recommended={p.recommended}
                    dimmed={p.dimmed}
                  />
                  <p
                    className="text-sm font-bold leading-tight"
                    style={{
                      color: p.dimmed ? "var(--cl-text-muted)" : "var(--cl-text)",
                    }}
                  >
                    {p.name}
                  </p>
                </div>

                <hr style={{ borderColor: "var(--cl-border-subtle)" }} />

                {/* Stats */}
                <dl className="flex flex-col gap-2.5">
                  <div>
                    <dt
                      className="text-[10px] font-medium uppercase tracking-wide"
                      style={{ color: "var(--cl-text-muted)" }}
                    >
                      Match%:
                    </dt>
                    <dd
                      className="mt-0.5 text-3xl font-bold leading-none"
                      style={{
                        color: p.recommended
                          ? "var(--cl-teal)"
                          : p.dimmed
                          ? "var(--cl-text-muted)"
                          : "var(--cl-text-secondary)",
                      }}
                    >
                      {p.matchPct}
                      <span className="text-base font-semibold">%</span>
                    </dd>
                  </div>

                  <div>
                    <dt
                      className="text-[10px] font-medium uppercase tracking-wide"
                      style={{ color: "var(--cl-text-muted)" }}
                    >
                      Beschikbaarheid:
                    </dt>
                    <dd
                      className="mt-0.5 text-sm font-semibold"
                      style={{
                        color:
                          p.beschikbaarheid === "Wachtlijst"
                            ? "var(--cl-amber)"
                            : "var(--cl-text-secondary)",
                      }}
                    >
                      {p.beschikbaarheid}
                    </dd>
                  </div>

                  <div>
                    <dt
                      className="text-[10px] font-medium uppercase tracking-wide"
                      style={{ color: "var(--cl-text-muted)" }}
                    >
                      Locatie:
                    </dt>
                    <dd
                      className="mt-0.5 text-sm font-semibold"
                      style={{ color: "var(--cl-text-secondary)" }}
                    >
                      {p.locatie}
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>

          {/* ── Right column: why-panel ─────────────────────────────────────── */}
          <div
            className="flex flex-col gap-4 rounded-[var(--cl-radius-lg)] border p-5"
            style={{
              background: "var(--cl-surface-1)",
              borderColor: "var(--cl-border-subtle)",
              boxShadow: "var(--cl-shadow-card)",
            }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <p
                className="text-sm font-bold"
                style={{ color: "var(--cl-text)" }}
              >
                Waarom deze match?
              </p>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background: "rgba(29,158,117,0.15)",
                  color: "var(--cl-teal)",
                }}
              >
                Aanbieder B
              </span>
            </div>

            <ul className="flex flex-col gap-2.5" role="list">
              {whyItems.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-xs leading-snug"
                  style={{ color: "var(--cl-text-secondary)" }}
                >
                  <CheckCircle2
                    size={14}
                    className="mt-0.5 shrink-0"
                    style={{ color: "var(--cl-teal)" }}
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>

            <hr style={{ borderColor: "var(--cl-border-subtle)" }} />

            <p
              className="text-[10px] leading-relaxed"
              style={{ color: "var(--cl-text-muted)" }}
            >
              Matching is adviserend. De professional neemt de eindbeslissing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
