/**
 * Regiekamer Intelligence section — operational control demo panel.
 * Shows attention items, bottlenecks, lead time, ownership, next-best-actions.
 * All data is fictional demonstration data, clearly marked as such.
 */

const attentionItems = [
  {
    label: "Casus F",
    detail: "Wacht op aanbiederreactie · 8 dagen",
    actor: "Team Noord",
    status: "amber",
    action: "Herinner aanbieder",
  },
  {
    label: "Casus K",
    detail: "Capaciteit aanbieder onbekend · Hoog risico",
    actor: "Team Oost",
    status: "red",
    action: "Escaleer naar coordinator",
  },
  {
    label: "Casus M",
    detail: "Klaar voor matching · Urgentie hoog",
    actor: "Team Zuid",
    status: "violet",
    action: "Start matching",
  },
];

const nextActions = [
  { label: "Herinner Horizon Jeugdzorg", detail: "Reactie verwacht vóór donderdag", status: "amber" },
  { label: "Start matching voor 3 casussen", detail: "Alle gegevens compleet", status: "violet" },
  { label: "Bevestig intake Casus B", detail: "Plaatsing gereed, intake gepland", status: "teal" },
];

const statusColor = {
  amber: { dot: "bg-[var(--cl-amber)]", badge: "bg-[rgba(245,165,36,.12)] text-[var(--cl-amber)] border-[rgba(245,165,36,.22)]" },
  red: { dot: "bg-[var(--cl-red)]", badge: "bg-[rgba(239,91,98,.12)] text-[var(--cl-red)] border-[rgba(239,91,98,.22)]" },
  violet: { dot: "bg-[var(--cl-violet-bright)]", badge: "bg-[rgba(155,130,255,.12)] text-[var(--cl-violet-bright)] border-[rgba(155,130,255,.22)]" },
  teal: { dot: "bg-[var(--cl-teal)]", badge: "bg-[rgba(46,200,166,.12)] text-[var(--cl-teal)] border-[rgba(46,200,166,.22)]" },
  blue: { dot: "bg-[var(--cl-blue)]", badge: "bg-[rgba(62,168,255,.12)] text-[var(--cl-blue)] border-[rgba(62,168,255,.22)]" },
} as const;

type StatusKey = keyof typeof statusColor;

function DemoBadge() {
  return (
    <span
      className="ml-2 inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest"
      style={{
        borderColor: "var(--cl-border)",
        color: "var(--cl-text-muted)",
        background: "var(--cl-surface-2)",
      }}
      aria-label="Dit zijn demonstratiegegevens"
    >
      Demo
    </span>
  );
}

// Tiny bar chart — purely CSS, no library
const chartBars = [
  { label: "Wk 1", value: 42, highlight: false },
  { label: "Wk 2", value: 38, highlight: false },
  { label: "Wk 3", value: 51, highlight: false },
  { label: "Wk 4", value: 34, highlight: false },
  { label: "Nu", value: 29, highlight: true },
];
const maxVal = Math.max(...chartBars.map((b) => b.value));

export function RegiekamerSection() {
  return (
    <section
      id="platform"
      className="cl-section scroll-mt-20"
      aria-labelledby="regiekamer-heading"
    >
      <div className="cl-container">
        {/* Header */}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="cl-eyebrow">Regiekamer</p>
            <h2 id="regiekamer-heading" className="cl-heading">
              Zicht op het geheel.{" "}
              <span style={{ color: "var(--cl-violet-bright)" }}>Grip op wat nu nodig is.</span>
            </h2>
            <p className="cl-lead">
              Carelane brengt knelpunten, eigenaarschap, wachttijd en de volgende beste actie samen
              in één operationeel beeld.
            </p>
          </div>
        </div>

        {/* Demo panel */}
        <div
          className="overflow-hidden rounded-[var(--cl-radius-xl)] border"
          style={{
            background: "var(--cl-surface-1)",
            borderColor: "var(--cl-border-subtle)",
            boxShadow: "var(--cl-shadow-elevated)",
          }}
          role="img"
          aria-label="Demonstratie van de Regiekamer interface"
        >
          {/* Panel top bar */}
          <div
            className="flex items-center justify-between gap-4 border-b px-5 py-3"
            style={{ borderColor: "var(--cl-border-subtle)", background: "var(--cl-surface-2)" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[var(--cl-text)]">
                Regiekamer
              </span>
              <DemoBadge />
            </div>
            <div className="flex items-center gap-3 text-xs text-[var(--cl-text-muted)]">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1"
                style={{ borderColor: "var(--cl-border)", background: "var(--cl-surface-3)" }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--cl-teal)]" aria-hidden="true" />
                Gemeente Demo
              </span>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
            {/* Main area */}
            <div className="p-5 space-y-5">
              {/* KPI row */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Actieve casussen", value: "23", delta: "+2 deze week", color: "var(--cl-text)" },
                  { label: "Wacht op reactie", value: "7", delta: "Gem. 6 dagen", color: "var(--cl-amber)" },
                  { label: "Klaar voor matching", value: "4", delta: "Urgentie hoog", color: "var(--cl-violet-bright)" },
                  { label: "Gem. doorlooptijd", value: "19d", delta: "−3d vs vorige mnd", color: "var(--cl-teal)" },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-[var(--cl-radius-md)] border p-3"
                    style={{ background: "var(--cl-surface-2)", borderColor: "var(--cl-border-subtle)" }}
                  >
                    <p className="text-[10px] uppercase tracking-widest text-[var(--cl-text-muted)]">{kpi.label}</p>
                    <p className="mt-1 text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
                    <p className="mt-0.5 text-[10px] text-[var(--cl-text-muted)]">{kpi.delta}</p>
                  </div>
                ))}
              </div>

              {/* Attention items */}
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[var(--cl-text-muted)]">
                  Aandacht vandaag
                </p>
                <div className="space-y-2">
                  {attentionItems.map((item) => {
                    const s = statusColor[item.status as StatusKey];
                    return (
                      <div
                        key={item.label}
                        className="flex items-center justify-between gap-3 rounded-[var(--cl-radius-md)] border p-3"
                        style={{ background: "var(--cl-surface-2)", borderColor: "var(--cl-border-subtle)" }}
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${s.dot}`} aria-hidden="true" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[var(--cl-text)]">{item.label}</p>
                            <p className="truncate text-xs text-[var(--cl-text-muted)]">{item.detail}</p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="hidden text-[10px] text-[var(--cl-text-muted)] sm:block">{item.actor}</span>
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${s.badge}`}
                          >
                            {item.action}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lead-time mini chart */}
              <div
                className="rounded-[var(--cl-radius-md)] border p-4"
                style={{ background: "var(--cl-surface-2)", borderColor: "var(--cl-border-subtle)" }}
              >
                <div className="mb-3 flex items-baseline justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--cl-text-muted)]">
                    Gemiddelde doorlooptijd (dagen)
                  </p>
                  <span className="text-xs text-[var(--cl-teal)]">−3d trend ↓</span>
                </div>
                <div className="flex items-end gap-1.5 h-12" role="img" aria-label="Staafdiagram doorlooptijd per week">
                  {chartBars.map((bar) => (
                    <div key={bar.label} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-sm transition-all duration-500"
                        style={{
                          height: `${(bar.value / maxVal) * 100}%`,
                          background: bar.highlight
                            ? "var(--cl-teal)"
                            : "rgba(155,130,255,.25)",
                          minHeight: 4,
                        }}
                      />
                      <span className="text-[9px] text-[var(--cl-text-muted)]">{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column — next best actions */}
            <div
              className="border-t p-5 space-y-4 lg:border-l lg:border-t-0"
              style={{ borderColor: "var(--cl-border-subtle)", background: "var(--cl-surface-2)" }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--cl-text-muted)]">
                Volgende actie
              </p>
              <div className="space-y-2">
                {nextActions.map((action) => {
                  const s = statusColor[action.status as StatusKey];
                  return (
                    <div
                      key={action.label}
                      className="rounded-[var(--cl-radius-md)] border p-3"
                      style={{ background: "var(--cl-surface-1)", borderColor: "var(--cl-border-subtle)" }}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${s.dot}`} aria-hidden="true" />
                        <div>
                          <p className="text-sm font-medium text-[var(--cl-text)]">{action.label}</p>
                          <p className="mt-0.5 text-xs text-[var(--cl-text-muted)]">{action.detail}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Workflow phase summary */}
              <div className="mt-2">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[var(--cl-text-muted)]">
                  Casussen per fase
                </p>
                {[
                  { phase: "Aanmelding", count: 6, color: "var(--cl-blue)" },
                  { phase: "Matching", count: 4, color: "var(--cl-violet-bright)" },
                  { phase: "Aanbiederreactie", count: 7, color: "var(--cl-amber)" },
                  { phase: "Plaatsing", count: 4, color: "var(--cl-teal)" },
                  { phase: "Intake", count: 2, color: "var(--cl-teal)" },
                ].map((item) => (
                  <div key={item.phase} className="mb-1.5 flex items-center gap-2">
                    <div className="w-24 shrink-0 text-[10px] text-[var(--cl-text-muted)] truncate">{item.phase}</div>
                    <div className="flex-1 h-1.5 rounded-full bg-[var(--cl-surface-3)]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(item.count / 23) * 100}%`,
                          background: item.color,
                        }}
                      />
                    </div>
                    <span className="w-4 shrink-0 text-right text-[10px] text-[var(--cl-text-muted)]">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
