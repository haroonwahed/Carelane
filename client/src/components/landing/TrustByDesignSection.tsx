import { Eye, FileText, Lock, ShieldCheck, UserCheck } from "lucide-react";

const pillars = [
  {
    icon: UserCheck,
    title: "Rolgebaseerde toegang",
    description: "Alleen de juiste mensen zien wat ze nodig hebben.",
    iconColor: "var(--cl-violet-bright)",
    iconBg: "rgba(139,92,246,0.15)",
    accentBorder: "rgba(139,92,246,0.30)",
  },
  {
    icon: Lock,
    title: "Workflow-integriteit",
    description: "Strikte fasen en validaties. Geen omzeilen.",
    iconColor: "var(--cl-teal)",
    iconBg: "rgba(20,184,166,0.15)",
    accentBorder: "rgba(20,184,166,0.28)",
  },
  {
    icon: FileText,
    title: "Audittrail beslissingen",
    description: "Elke actie gelogd en herleidbaar per rol.",
    iconColor: "var(--cl-blue)",
    iconBg: "rgba(59,130,246,0.15)",
    accentBorder: "rgba(59,130,246,0.28)",
  },
  {
    icon: ShieldCheck,
    title: "Gegevensbescherming",
    description: "AVG-compliant omgeving, veilige verwerking.",
    iconColor: "#22c55e",
    iconBg: "rgba(34,197,94,0.15)",
    accentBorder: "rgba(34,197,94,0.28)",
  },
  {
    icon: Eye,
    title: "Gecontroleerde zichtbaarheid",
    description: "Aanbieders zien alleen wat én wanneer relevant.",
    iconColor: "var(--cl-amber)",
    iconBg: "rgba(245,158,11,0.15)",
    accentBorder: "rgba(245,158,11,0.28)",
  },
];

export function TrustByDesignSection() {
  return (
    <section
      id="veiligheid"
      className="cl-section scroll-mt-20"
      style={{ background: "var(--cl-bg-deep)" }}
      aria-labelledby="trust-heading"
    >
      <div className="cl-container">
        <div className="grid gap-12 lg:grid-cols-[40%_24%_36%] lg:items-center">

          {/* LEFT: heading + description */}
          <div>
            <p className="cl-eyebrow">TRUST BY DESIGN</p>
            <h2 id="trust-heading" className="cl-heading">
              Vertrouwen is geen feature.{" "}
              <span style={{ color: "var(--cl-violet-bright)" }}>Het is onze basis.</span>
            </h2>
            <p className="cl-lead">
              Toegang, processtappen en besluiten zijn gecontroleerd, traceerbaar en
              afgestemd op de rol van de gebruiker.
            </p>
            <p
              className="mt-5 text-xs leading-relaxed"
              style={{
                color: "var(--cl-text-muted)",
                borderLeft: "2px solid rgba(155,130,255,0.30)",
                paddingLeft: "0.75rem",
              }}
            >
              Carelane verwerkt persoonsgegevens conform de AVG. Toegang wordt
              per rol en context bepaald — niet op organisatieniveau.
            </p>
          </div>

          {/* CENTER: protection layers SVG diagram */}
          <div
            className="hidden lg:flex items-center justify-center"
            aria-hidden="true"
          >
            <svg viewBox="0 0 200 240" style={{ width: 200, height: 240 }}>
              {/* Outer ring */}
              <ellipse cx="100" cy="120" rx="90" ry="108"
                fill="none" stroke="rgba(155,130,255,0.12)" strokeWidth="1.5" strokeDasharray="4 6" />
              {/* Middle ring */}
              <ellipse cx="100" cy="120" rx="65" ry="80"
                fill="none" stroke="rgba(155,130,255,0.18)" strokeWidth="1.8" strokeDasharray="3 5" />
              {/* Inner ring */}
              <ellipse cx="100" cy="120" rx="40" ry="50"
                fill="rgba(155,130,255,0.06)" stroke="rgba(155,130,255,0.30)" strokeWidth="2" />
              {/* Outer glow behind center circle */}
              <circle cx="100" cy="120" r="34" fill="rgba(155,130,255,0.06)" />
              {/* Center node */}
              <circle cx="100" cy="120" r="22"
                fill="rgba(155,130,255,0.22)" stroke="rgba(155,130,255,0.45)" strokeWidth="1.5" />
              {/* Center lock icon simplified */}
              <rect x="91" y="115" width="18" height="14" rx="2" fill="rgba(155,130,255,0.90)" />
              <path d="M94 115 v-4 a6 6 0 0 1 12 0 v4" stroke="rgba(155,130,255,0.90)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              {/* Pillar dots on outer ring */}
              {[
                { angle: -90, color: "rgba(139,92,246,0.85)" },
                { angle: -18, color: "rgba(20,184,166,0.85)" },
                { angle: 54, color: "rgba(59,130,246,0.85)" },
                { angle: 126, color: "rgba(34,197,94,0.85)" },
                { angle: 198, color: "rgba(245,158,11,0.85)" },
              ].map(({ angle, color }, i) => {
                const rad = (angle * Math.PI) / 180;
                const x = 100 + 90 * Math.cos(rad);
                const y = 120 + 108 * Math.sin(rad);
                return (
                  <g key={i}>
                    <line
                      x1="100" y1="120" x2={x} y2={y}
                      stroke={color} strokeWidth="1" opacity="0.45"
                    />
                    <circle cx={x} cy={y} r="6" fill={color} opacity="0.85" />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* RIGHT: compact pillar list */}
          <div className="space-y-3">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="flex items-start gap-3 rounded-xl p-3.5"
                  style={{
                    background: "var(--cl-surface-1)",
                    border: `1px solid ${pillar.accentBorder}`,
                  }}
                >
                  <div
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: pillar.iconBg }}
                    aria-hidden="true"
                  >
                    <Icon size={16} style={{ color: pillar.iconColor }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold" style={{ color: "var(--cl-text)" }}>
                      {pillar.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-snug" style={{ color: "var(--cl-text-secondary)" }}>
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
