/**
 * Regiekamer product preview — hero right panel.
 * Pure HTML/CSS device frame with Regiekamer UI inside. No images, no Framer Motion.
 *
 * Enlarged + densified so the hero shows real product truth: KPI strip, phase
 * distribution, next best action, and a live worklist. Light hover affordances
 * make it read as a live control surface (decorative for screen readers).
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
  { label: "Actieve casussen",    value: "124", color: "#f6f8fc" },
  { label: "Wacht op reactie",    value: "53",  color: "#f5a524" },
  { label: "Klaar voor matching", value: "38",  color: "#9b82ff" },
  { label: "Gem. doorlooptijd",   value: "19d", color: "#2ec8a6" },
];

const WORKLIST = [
  { id: "C-24871", subject: "Spoed — ambulante jeugd-ggz", phase: "Aanbiederreactie", color: "#f5a524", wait: "4d", risk: "SLA" },
  { id: "C-24863", subject: "Verlengde dagbesteding",       phase: "Matching",         color: "#9b82ff", wait: "1d", risk: "" },
  { id: "C-24850", subject: "Overdracht beschermd wonen",   phase: "Plaatsing",        color: "#2ec8a6", wait: "—",  risk: "" },
];

export function CarelaneHeroOrchestrationVisual() {
  return (
    <div
      aria-hidden="true"
      className="hidden w-full max-w-[760px] lg:block lg:justify-self-end lg:self-center"
    >
      <div style={{ position: "relative", zIndex: 0 }}>
        {/* Ambient glows */}
        <div
          style={{
            position: "absolute", inset: "-28px", borderRadius: 44,
            background: "radial-gradient(circle at 50% 38%, rgba(91,62,230,.42), transparent 65%)",
            filter: "blur(36px)", zIndex: -1, pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute", inset: "-28px", borderRadius: 44,
            background: "radial-gradient(circle at 28% 18%, rgba(155,130,255,.22), transparent 46%)",
            filter: "blur(26px)", zIndex: -1, pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute", inset: 0, borderRadius: 24,
            background: "#060b17", filter: "blur(14px)", transform: "translate(5px, 8px)",
            zIndex: -1, opacity: 0.72, pointerEvents: "none",
          }}
        />

        {/* Device frame */}
        <div
          style={{
            position: "relative",
            borderRadius: 24,
            border: "1.5px solid rgba(171,188,218,.16)",
            background: "#0d172a",
            boxShadow: "0 28px 90px rgba(0,0,0,.55), inset 0 1px 0 rgba(155,130,255,.20), inset 0 0 0 1px rgba(171,188,218,.10)",
            overflow: "hidden",
          }}
        >
          {/* Top reflection + left accent */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1.5px", background: "linear-gradient(to right, rgba(155,130,255,.60), rgba(91,62,230,.30), transparent)", zIndex: 20, pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "2px", background: "linear-gradient(to bottom, rgba(155,130,255,.50), rgba(91,62,230,.20) 50%, transparent)", zIndex: 20, pointerEvents: "none" }} />

          {/* Header bar */}
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
              padding: "13px 20px", borderBottom: "1px solid rgba(171,188,218,.13)", background: "#111e34",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ position: "relative", width: 9, height: 9 }}>
                  <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#9b82ff" }} />
                  <span style={{ position: "absolute", inset: -3, borderRadius: "50%", border: "1px solid rgba(155,130,255,.45)" }} />
                </span>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#f6f8fc", letterSpacing: "-0.01em" }}>Regiekamer</span>
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                {["Casussen", "Aanbieders", "Rapportage"].map((tab, i) => (
                  <span
                    key={tab}
                    style={{
                      fontSize: 11, fontWeight: i === 0 ? 700 : 500,
                      color: i === 0 ? "#9b82ff" : "#8f9aaf",
                      padding: "3px 10px", borderRadius: 7,
                      background: i === 0 ? "rgba(155,130,255,.12)" : "transparent",
                      border: i === 0 ? "1px solid rgba(155,130,255,.22)" : "1px solid transparent",
                    }}
                  >
                    {tab}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#2ec8a6" }} />
              <span style={{ fontSize: 12, color: "#8f9aaf" }}>Gemeente Demo</span>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>

            {/* KPI row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
              {KPIS.map((kpi) => (
                <div key={kpi.label} style={{ borderRadius: 12, border: "1px solid rgba(171,188,218,.12)", background: "#17243a", padding: "11px 13px" }}>
                  <p style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.07em", color: "#8f9aaf", marginBottom: 4 }}>{kpi.label}</p>
                  <p style={{ fontSize: 27, fontWeight: 700, color: kpi.color, lineHeight: 1 }}>{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Phase distribution */}
            <div style={{ borderRadius: 12, border: "1px solid rgba(171,188,218,.12)", background: "#111e34", padding: "13px 15px" }}>
              <p style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#8f9aaf", marginBottom: 10 }}>Casussen per fase</p>
              <div style={{ display: "flex", borderRadius: 5, overflow: "hidden", height: 10, gap: 1 }}>
                {PHASES.map((p) => (
                  <div key={p.name} title={`${p.name}: ${p.count}`} style={{ flex: p.count / PHASE_TOTAL, background: p.color, opacity: 0.85 }} />
                ))}
              </div>
              <div style={{ display: "flex", marginTop: 8, gap: 1 }}>
                {PHASES.map((p) => (
                  <div key={p.name} style={{ flex: p.count / PHASE_TOTAL, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 0, overflow: "hidden" }}>
                    <span style={{ fontSize: 10, color: p.color, fontWeight: 700 }}>{p.count}</span>
                    <span style={{ fontSize: 9, color: "#8f9aaf", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{p.short}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next best action */}
            <div style={{ borderRadius: 12, border: "1px solid rgba(155,130,255,.22)", background: "rgba(155,130,255,.07)", padding: "11px 14px", display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ fontSize: 14 }}>⚡</span>
              <span style={{ fontSize: 12.5, color: "#c4ccda", lineHeight: 1.4 }}>
                <span style={{ color: "#9b82ff", fontWeight: 600 }}>Volgende actie:</span>{" "}
                Herinner Horizon Jeugdzorg — reactie verwacht vóór donderdag
              </span>
            </div>

            {/* Live worklist */}
            <div style={{ borderRadius: 12, border: "1px solid rgba(171,188,218,.12)", background: "#0f1b30", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", borderBottom: "1px solid rgba(171,188,218,.10)" }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#8f9aaf" }}>Werkvoorraad</span>
                <span style={{ fontSize: 10, color: "#8f9aaf" }}>gesorteerd op urgentie</span>
              </div>
              {WORKLIST.map((row, i) => (
                <div
                  key={row.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto auto",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    borderTop: i === 0 ? "none" : "1px solid rgba(171,188,218,.07)",
                    background: i === 0 ? "rgba(245,165,36,.05)" : "transparent",
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#c4ccda", fontVariantNumeric: "tabular-nums" }}>{row.id}</span>
                  <span style={{ fontSize: 11.5, color: "#8f9aaf", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.subject}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: row.color, padding: "2px 8px", borderRadius: 6, background: `${row.color}1f`, whiteSpace: "nowrap" }}>{row.phase}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", minWidth: 56 }}>
                    {row.risk && <span style={{ fontSize: 8.5, fontWeight: 700, color: "#ef5b62", border: "1px solid rgba(239,91,98,.4)", borderRadius: 4, padding: "1px 5px" }}>{row.risk}</span>}
                    <span style={{ fontSize: 11, color: "#8f9aaf", fontVariantNumeric: "tabular-nums" }}>{row.wait}</span>
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>{/* end device frame */}
      </div>
    </div>
  );
}
