/**
 * Results in Practice section.
 * Two-column layout: left 55% qualitative outcome grid, right 45% premium quote card.
 * No Framer Motion. All data is illustrative.
 */
import { Clock, CheckCircle, Users, BarChart2 } from "lucide-react";

interface Outcome {
  Icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
  bg: string;
}

const outcomes: Outcome[] = [
  {
    Icon: Clock,
    title: "Snellere doorlooptijd",
    desc: "Vertraging wordt zichtbaar vóórdat het een probleem wordt.",
    color: "var(--cl-teal)",
    bg: "rgba(29,158,117,0.10)",
  },
  {
    Icon: CheckCircle,
    title: "Betere match",
    desc: "Iedere stap heeft een benoemde verantwoordelijke en een concrete vervolgactie.",
    color: "var(--cl-blue)",
    bg: "rgba(62,168,255,0.10)",
  },
  {
    Icon: Users,
    title: "Sterkere samenwerking",
    desc: "Gegevens die nodig zijn voor de volgende stap zijn geborgd vóór de overdracht.",
    color: "var(--cl-violet-bright)",
    bg: "rgba(155,130,255,0.10)",
  },
  {
    Icon: BarChart2,
    title: "Meer grip op capaciteit",
    desc: "Beschikbaarheid van aanbieders wordt inzichtelijk op het moment dat het nodig is.",
    color: "var(--cl-amber)",
    bg: "rgba(245,165,36,0.10)",
  },
];

export function ResultsSection() {
  return (
    <section className="cl-section" aria-labelledby="results-heading">
      <div className="cl-container">
        <div
          className="grid gap-10 items-center"
          style={{ gridTemplateColumns: "55fr 45fr" }}
        >
          {/* ── Left column: eyebrow + heading + outcome grid ────────── */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <p
                className="text-[10px] font-bold tracking-widest uppercase"
                style={{ color: "var(--cl-violet-bright)" }}
              >
                RESULTATEN IN DE PRAKTIJK
              </p>

              <h2
                id="results-heading"
                className="text-2xl font-bold leading-snug"
                style={{ color: "var(--cl-text)" }}
              >
                Minder vertraging. Meer passende zorg.{" "}
                <span style={{ color: "var(--cl-violet-bright)" }}>
                  Samen beter.
                </span>
              </h2>

              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--cl-text-secondary)" }}
              >
                Carelane lost concrete knelpunten op die we herkennen uit het
                werk van gemeenten en zorgaanbieders.
              </p>
            </div>

            {/* 2×2 outcome grid */}
            <div
              className="grid gap-5"
              style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
            >
              {outcomes.map(({ Icon, title, desc, color, bg }) => (
                <div key={title} className="flex flex-col gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--cl-radius-md)]"
                    style={{ background: bg, color }}
                    aria-hidden="true"
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <p
                      className="text-sm font-bold"
                      style={{ color: "var(--cl-text)" }}
                    >
                      {title}
                    </p>
                    <p
                      className="mt-1 text-xs leading-relaxed"
                      style={{ color: "var(--cl-text-secondary)" }}
                    >
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column: premium quote card ────────────────────── */}
          <div
            className="rounded-[var(--cl-radius-lg)] border p-7 flex flex-col gap-5"
            style={{
              background: "var(--cl-surface-2)",
              borderColor: "var(--cl-border)",
              boxShadow: "var(--cl-shadow-card)",
            }}
          >
            {/* Decorative opening quote mark */}
            <div
              aria-hidden="true"
              style={{
                fontSize: "4rem",
                lineHeight: 1,
                color: "var(--cl-violet-bright)",
                opacity: 0.55,
                fontFamily: "Georgia, serif",
                marginBottom: "-0.5rem",
              }}
            >
              &ldquo;
            </div>

            {/* Quote text */}
            <blockquote>
              <p
                className="text-base leading-relaxed italic"
                style={{ color: "var(--cl-text)" }}
              >
                CareOn geeft ons overzicht én regie. We zien precies waar we
                moeten handelen en kunnen sneller de juiste keuze maken.
              </p>
            </blockquote>

            {/* Attribution */}
            <div className="flex items-center gap-3 mt-1">
              {/* Avatar placeholder */}
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  background: "rgba(155,130,255,0.18)",
                  color: "var(--cl-violet-bright)",
                }}
                aria-hidden="true"
              >
                P
              </div>
              <div>
                <p
                  className="text-xs font-semibold"
                  style={{ color: "var(--cl-text-secondary)" }}
                >
                  Pilot deelnemer · Gemeente Utrecht
                </p>
              </div>
            </div>

            <hr style={{ borderColor: "var(--cl-border-subtle)" }} />

            {/* Story link */}
            <a
              href="#"
              className="text-xs font-medium transition-opacity duration-150 hover:opacity-70"
              style={{ color: "var(--cl-violet-bright)" }}
            >
              Lees het volledige verhaal →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
