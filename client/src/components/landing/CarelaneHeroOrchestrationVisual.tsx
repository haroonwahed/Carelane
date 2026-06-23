/**
 * Regiekamer product preview — hero right panel.
 * Rebuilt from live HTML/CSS. Shows the Regiekamer with:
 * - Five correct workflow phases: Aanmelding, Matching, Aanbiederreactie, Plaatsing, Intake
 * - Headline metrics
 * - Attention items
 * - Next-best actions
 * - Small lead-time visual
 *
 * All data is clearly fictional demonstration data.
 */
import { motion } from "framer-motion";

const PHASES = [
  { name: "Aanmelding", count: 6, color: "#3ea8ff", short: "A" },
  { name: "Matching", count: 4, color: "#9b82ff", short: "M" },
  { name: "Aanbiederreactie", count: 7, color: "#f5a524", short: "Ar" },
  { name: "Plaatsing", count: 4, color: "#2ec8a6", short: "P" },
  { name: "Intake", count: 2, color: "#2ec8a6", short: "I" },
];

const ATTENTION = [
  { label: "Casus F – reactie verwacht", status: "amber", days: "8d" },
  { label: "Casus K – capaciteit onbekend", status: "red", days: "12d" },
  { label: "Casus M – klaar voor matching", status: "violet", days: "2d" },
];

const TREND_BARS = [32, 38, 29, 42, 36, 28, 23];

const statusDot: Record<string, string> = {
  amber: "#f5a524",
  red: "#ef5b62",
  violet: "#9b82ff",
  teal: "#2ec8a6",
};

function ReducedMotionFallback() {
  return (
    <div
      className="relative rounded-[22px] border bg-[#0d172a] p-4 shadow-[0_24px_80px_rgba(0,0,0,.42)]"
      style={{ borderColor: "rgba(171,188,218,.14)" }}
    >
      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between gap-3 border-b pb-3" style={{ borderColor: "rgba(171,188,218,.14)" }}>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#9b82ff]" aria-hidden="true" />
          <span className="text-[13px] font-semibold text-[#f6f8fc]">Regiekamer</span>
          <span className="rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest" style={{ borderColor: "rgba(171,188,218,.22)", color: "#8f9aaf" }}>Demo</span>
        </div>
        <span className="text-[10px] text-[#8f9aaf]">Gemeente Demo</span>
      </div>
      {/* KPIs */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {[
          { l: "Actief", v: "23", c: "#f6f8fc" },
          { l: "Aandacht", v: "7", c: "#f5a524" },
          { l: "Gem. looptijd", v: "19d", c: "#2ec8a6" },
        ].map((kpi) => (
          <div key={kpi.l} className="rounded-xl border p-2.5" style={{ borderColor: "rgba(171,188,218,.14)", background: "#111e34" }}>
            <p className="text-[9px] uppercase tracking-widest text-[#8f9aaf]">{kpi.l}</p>
            <p className="mt-0.5 text-lg font-bold" style={{ color: kpi.c }}>{kpi.v}</p>
          </div>
        ))}
      </div>
      {/* Phases */}
      <div className="mb-4 grid grid-cols-5 gap-1">
        {PHASES.map((p) => (
          <div key={p.name} className="flex flex-col items-center gap-1 rounded-lg border p-1.5" style={{ borderColor: "rgba(171,188,218,.14)", background: "#111e34" }}>
            <div className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} aria-hidden="true" />
            <p className="text-[8px] text-center text-[#8f9aaf] leading-tight">{p.short}</p>
            <p className="text-[11px] font-bold" style={{ color: p.color }}>{p.count}</p>
          </div>
        ))}
      </div>
      {/* Attention */}
      <div className="space-y-1.5">
        {ATTENTION.map((item) => (
          <div key={item.label} className="flex items-center gap-2 rounded-lg border p-2" style={{ borderColor: "rgba(171,188,218,.14)", background: "#111e34" }}>
            <div className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: statusDot[item.status] }} aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate text-[11px] text-[#c4ccda]">{item.label}</span>
            <span className="shrink-0 text-[10px]" style={{ color: statusDot[item.status] }}>{item.days}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CarelaneHeroOrchestrationVisual() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none hidden w-full max-w-[680px] lg:block lg:justify-self-end lg:self-center"
    >
      {/* Reduced-motion: no animation, same layout */}
      <div className="motion-reduce:block hidden">
        <ReducedMotionFallback />
      </div>

      {/* Animated version */}
      <motion.div
        className="motion-reduce:hidden relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
      >
        {/* Violet glow behind panel */}
        <motion.div
          className="absolute inset-0 -z-10 rounded-[28px] blur-3xl"
          style={{ background: "radial-gradient(circle at 50% 40%, rgba(91,62,230,.28), transparent 60%)" }}
          animate={{ opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        />

        {/* Main panel */}
        <div
          className="relative overflow-hidden rounded-[22px] border shadow-[0_24px_80px_rgba(0,0,0,.42)]"
          style={{ background: "#0d172a", borderColor: "rgba(171,188,218,.14)" }}
        >
          {/* Top bar */}
          <div
            className="flex items-center justify-between gap-3 border-b px-4 py-3"
            style={{ borderColor: "rgba(171,188,218,.14)", background: "#111e34" }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                className="h-2 w-2 rounded-full"
                style={{ background: "#9b82ff" }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden="true"
              />
              <span className="text-[13px] font-semibold text-[#f6f8fc]">Regiekamer</span>
              <span
                className="rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest"
                style={{ borderColor: "rgba(171,188,218,.22)", color: "#8f9aaf" }}
              >
                Demo
              </span>
            </div>
            <span className="text-[10px] text-[#8f9aaf]">Gemeente Demo</span>
          </div>

          <div className="p-4 space-y-4">
            {/* KPI row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Actieve casussen", value: "23", color: "#f6f8fc" },
                { label: "Wacht op reactie", value: "7", color: "#f5a524" },
                { label: "Gem. doorlooptijd", value: "19d", color: "#2ec8a6" },
              ].map((kpi, i) => (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="rounded-xl border p-2.5"
                  style={{ borderColor: "rgba(171,188,218,.14)", background: "#17243a" }}
                >
                  <p className="text-[9px] uppercase tracking-widest text-[#8f9aaf]">{kpi.label}</p>
                  <p className="mt-0.5 text-xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Workflow phases */}
            <div>
              <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-[#8f9aaf]">
                Fasen
              </p>
              <div className="grid grid-cols-5 gap-1">
                {PHASES.map((phase, i) => (
                  <motion.div
                    key={phase.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, delay: 0.5 + i * 0.07 }}
                    className="flex flex-col items-center gap-1 rounded-xl border p-2"
                    style={{
                      borderColor: `${phase.color}33`,
                      background: `${phase.color}0f`,
                    }}
                    title={phase.name}
                  >
                    <div
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: phase.color }}
                      aria-hidden="true"
                    />
                    <p className="text-[8px] text-center leading-tight" style={{ color: "#8f9aaf" }}>
                      {phase.short}
                    </p>
                    <p className="text-[13px] font-bold" style={{ color: phase.color }}>
                      {phase.count}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Attention items */}
            <div>
              <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-[#8f9aaf]">
                Aandacht vandaag
              </p>
              <div className="space-y-1.5">
                {ATTENTION.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.7 + i * 0.1 }}
                    className="flex items-center gap-2 rounded-lg border p-2"
                    style={{ borderColor: "rgba(171,188,218,.12)", background: "#111e34" }}
                  >
                    <div
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: statusDot[item.status] }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate text-[11px] text-[#c4ccda]">
                      {item.label}
                    </span>
                    <span className="shrink-0 text-[10px]" style={{ color: statusDot[item.status] }}>
                      {item.days}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Trend chart */}
            <div
              className="rounded-xl border p-3"
              style={{ borderColor: "rgba(171,188,218,.12)", background: "#111e34" }}
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#8f9aaf]">
                  Doorlooptijd (weken)
                </p>
                <span className="text-[10px]" style={{ color: "#2ec8a6" }}>↓ trend</span>
              </div>
              <div
                className="flex items-end gap-1 h-8"
                role="img"
                aria-label="Doorlooptijdtrend dalend over zeven weken"
              >
                {TREND_BARS.map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-t-sm"
                    style={{
                      background: i === TREND_BARS.length - 1 ? "#2ec8a6" : "rgba(155,130,255,.25)",
                      minHeight: 3,
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${(h / 42) * 100}%` }}
                    transition={{ duration: 0.5, delay: 1 + i * 0.06, ease: "easeOut" }}
                  />
                ))}
              </div>
            </div>

            {/* Next action */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="flex items-center gap-2 rounded-xl border px-3 py-2.5"
              style={{
                borderColor: "rgba(155,130,255,.25)",
                background: "rgba(155,130,255,.08)",
              }}
            >
              <motion.div
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: "#9b82ff" }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden="true"
              />
              <span className="text-[11px] text-[#c4ccda]">
                Volgende actie: herinner Horizon Jeugdzorg
              </span>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
