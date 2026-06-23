/**
 * Regiekamer product preview — hero right panel.
 * Pure HTML/CSS device frame with Regiekamer UI inside.
 * No Framer Motion. No external images.
 *
 * All data is clearly fictional demonstration data.
 */

const PHASES = [
  { name: "Aanmelding",       count: 6,  color: "#3ea8ff", short: "Aanm." },
  { name: "Matching",         count: 4,  color: "#9b82ff", short: "Match" },
  { name: "Aanbiederreactie", count: 7,  color: "#f5a524", short: "React." },
  { name: "Plaatsing",        count: 4,  color: "#2ec8a6", short: "Plaat." },
  { name: "Intake",           count: 2,  color: "#2ec8a6", short: "Intake" },
];

const PHASE_TOTAL = PHASES.reduce((s, p) => s + p.count, 0);

const KPIS = [
  { label: "Actieve casussen",  value: "124", color: "#f6f8fc" },
  { label: "Wacht op reactie",  value: "53",  color: "#f5a524" },
  { label: "Klaar voor matching", value: "38", color: "#9b82ff" },
  { label: "Gem. doorlooptijd", value: "19d", color: "#2ec8a6" },
];

const STATUS_COLOR: Record<string, string> = {
  amber:  "#f5a524",
  red:    "#ef5b62",
  violet: "#9b82ff",
  teal:   "#2ec8a6",
};

export function CarelaneHeroOrchestrationVisual() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none hidden w-full max-w-[600px] lg:block lg:justify-self-end lg:self-center"
    >
      {/* Violet glow behind device */}
      <div
        style={{
          position: "relative",
          zIndex: 0,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "-24px",
            borderRadius: 40,
            background: "radial-gradient(circle at 50% 40%, rgba(91,62,230,.26), transparent 65%)",
            filter: "blur(32px)",
            zIndex: -1,
            pointerEvents: "none",
          }}
        />

        {/* Device frame */}
        <div
          style={{
            borderRadius: 22,
            border: "1.5px solid rgba(171,188,218,.14)",
            background: "#0d172a",
            boxShadow: "0 24px 80px rgba(0,0,0,.50)",
            overflow: "hidden",
          }}
        >
          {/* Header bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "10px 16px",
              borderBottom: "1px solid rgba(171,188,218,.13)",
              background: "#111e34",
            }}
          >
            {/* Left: brand + nav tabs */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#9b82ff",
                  }}
                />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#f6f8fc", letterSpacing: "-0.01em" }}>
                  Regiekamer
                </span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {["Casussen", "Aanbieders", "Rapportage"].map((tab, i) => (
                  <span
                    key={tab}
                    style={{
                      fontSize: 9,
                      fontWeight: i === 0 ? 700 : 500,
                      color: i === 0 ? "#9b82ff" : "#8f9aaf",
                      padding: "2px 7px",
                      borderRadius: 6,
                      background: i === 0 ? "rgba(155,130,255,.12)" : "transparent",
                      border: i === 0 ? "1px solid rgba(155,130,255,.22)" : "1px solid transparent",
                    }}
                  >
                    {tab}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: tenant indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2ec8a6" }} />
              <span style={{ fontSize: 10, color: "#8f9aaf" }}>Gemeente Demo</span>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>

            {/* KPI row — 4 columns */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
              {KPIS.map((kpi) => (
                <div
                  key={kpi.label}
                  style={{
                    borderRadius: 10,
                    border: "1px solid rgba(171,188,218,.12)",
                    background: "#17243a",
                    padding: "8px 10px",
                  }}
                >
                  <p style={{ fontSize: 8, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#8f9aaf", marginBottom: 2 }}>
                    {kpi.label}
                  </p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: kpi.color, lineHeight: 1 }}>
                    {kpi.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Phase distribution bar */}
            <div
              style={{
                borderRadius: 10,
                border: "1px solid rgba(171,188,218,.12)",
                background: "#111e34",
                padding: "10px 12px",
              }}
            >
              <p style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#8f9aaf", marginBottom: 8 }}>
                Casussen per fase
              </p>
              {/* Segmented bar */}
              <div style={{ display: "flex", borderRadius: 4, overflow: "hidden", height: 8, gap: 1 }}>
                {PHASES.map((p) => (
                  <div
                    key={p.name}
                    title={`${p.name}: ${p.count}`}
                    style={{
                      flex: p.count / PHASE_TOTAL,
                      background: p.color,
                      opacity: 0.82,
                    }}
                  />
                ))}
              </div>
              {/* Phase labels below bar */}
              <div style={{ display: "flex", marginTop: 6, gap: 1 }}>
                {PHASES.map((p) => (
                  <div
                    key={p.name}
                    style={{
                      flex: p.count / PHASE_TOTAL,
                      display: "flex",
                      flexDirection: "column" as const,
                      alignItems: "center",
                      gap: 2,
                      minWidth: 0,
                      overflow: "hidden",
                    }}
                  >
                    <span style={{ fontSize: 7.5, color: p.color, fontWeight: 700 }}>{p.count}</span>
                    <span
                      style={{
                        fontSize: 7,
                        color: "#8f9aaf",
                        whiteSpace: "nowrap" as const,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                      }}
                    >
                      {p.short}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next action row */}
            <div
              style={{
                borderRadius: 10,
                border: "1px solid rgba(155,130,255,.22)",
                background: "rgba(155,130,255,.07)",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 12 }}>⚡</span>
              <span style={{ fontSize: 11, color: "#c4ccda", lineHeight: 1.4 }}>
                <span style={{ color: "#9b82ff", fontWeight: 600 }}>Volgende actie:</span>
                {" "}Herinner Horizon Jeugdzorg — reactie verwacht vóór donderdag
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
