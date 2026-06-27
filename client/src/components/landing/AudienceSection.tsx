import { Building2, Heart, ShieldCheck, Users } from "lucide-react";
import { CarelaneLogo } from "../logos/CarelaneLogo";

const roles = [
  {
    icon: Building2,
    label: "Gemeenten",
    outcome: "Grip op de keten",
    description: "Houd overzicht over alle lopende casussen en neem onderbouwde beslissingen.",
    iconColor: "var(--cl-blue)",
    iconBg: "rgba(62,168,255,0.14)",
    border: "rgba(62,168,255,0.22)",
    pos: "top-left",
  },
  {
    icon: ShieldCheck,
    label: "Zorgaanbieders",
    outcome: "Juiste aanvragen",
    description: "Ontvang passende aanvragen en reageer efficiënt binnen de gestelde termijn.",
    iconColor: "#22c55e",
    iconBg: "rgba(34,197,94,0.14)",
    border: "rgba(34,197,94,0.22)",
    pos: "top-right",
  },
  {
    icon: Users,
    label: "Coördinatoren",
    outcome: "Volgende stap helder",
    description: "Zie wat aandacht nodig heeft en neem direct actie zonder te zoeken.",
    iconColor: "var(--cl-teal)",
    iconBg: "rgba(46,200,166,0.14)",
    border: "rgba(46,200,166,0.30)",
    pos: "bottom-left",
  },
  {
    icon: Heart,
    label: "Cliënten & gezinnen",
    outcome: "Betrokken & geïnformeerd",
    description: "Blijf op de hoogte van de voortgang en het proces rondom de zorgvraag.",
    iconColor: "var(--cl-amber)",
    iconBg: "rgba(245,158,11,0.14)",
    border: "rgba(245,158,11,0.22)",
    pos: "bottom-right",
  },
];

export function AudienceSection() {
  return (
    <section id="voor-wie" className="cl-section scroll-mt-20" aria-labelledby="audience-heading">
      <div className="cl-container">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="cl-eyebrow">VOOR WIE IS CARELANE</p>
          <h2 id="audience-heading" className="cl-heading">
            Gebouwd voor iedereen die{" "}
            <em className="not-italic font-bold" style={{ color: "var(--cl-violet-bright)" }}>
              betere keuzes
            </em>{" "}
            wil maken in de zorgketen.
          </h2>
        </div>

        {/* Desktop: 2+center+2 composition */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center gap-6" style={{ position: "relative" }}>

          {/* Connection lines SVG — desktop only */}
          <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true"
            style={{ position: "absolute", inset: 0, zIndex: 1 }}>
            <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
              <defs>
                <linearGradient id="aud-line-left" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(155,130,255,0)" />
                  <stop offset="100%" stopColor="rgba(155,130,255,0.35)" />
                </linearGradient>
                <linearGradient id="aud-line-right" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(155,130,255,0.35)" />
                  <stop offset="100%" stopColor="rgba(155,130,255,0)" />
                </linearGradient>
              </defs>
              {/* Left connection line — center of hub to right edge of left column */}
              <line x1="33%" y1="50%" x2="43%" y2="50%"
                stroke="url(#aud-line-left)" strokeWidth="1.5" strokeDasharray="4 4" />
              {/* Right connection line — left edge of right column to center of hub */}
              <line x1="57%" y1="50%" x2="67%" y2="50%"
                stroke="url(#aud-line-right)" strokeWidth="1.5" strokeDasharray="4 4" />
            </svg>
          </div>

          {/* Left column: 2 roles */}
          <div className="flex flex-col gap-4">
            {roles.slice(0, 2).map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.label}
                  className="rounded-2xl border p-5 flex flex-col gap-3"
                  style={{
                    background: "var(--cl-surface-1)",
                    borderColor: role.border,
                    boxShadow: `0 0 0 1px ${role.iconBg}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: role.iconBg }}
                      aria-hidden="true"
                    >
                      <Icon size={18} style={{ color: role.iconColor }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "var(--cl-text)" }}>{role.label}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: role.iconColor }}>{role.outcome}</p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--cl-text-secondary)" }}>
                    {role.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Center: Carelane hub */}
          <div className="flex flex-col items-center justify-center px-6">
            <div
              className="flex flex-col items-center justify-center rounded-2xl border p-5 text-center"
              style={{
                width: 156,
                background: "rgba(155,130,255,0.10)",
                borderColor: "rgba(155,130,255,0.32)",
                boxShadow: "0 0 0 1px rgba(155,130,255,0.20), 0 0 48px rgba(155,130,255,0.18), 0 16px 40px rgba(0,0,0,0.30)",
              }}
            >
              {/* Carelane brand mark */}
              <CarelaneLogo mark decorative className="w-11" />
              <p className="mt-2.5 text-sm font-bold" style={{ color: "var(--cl-violet-bright)" }}>Carelane</p>
              <p className="mt-1 text-[10px] leading-snug" style={{ color: "var(--cl-text-muted)" }}>
                Één gedeelde omgeving
              </p>
            </div>
          </div>

          {/* Right column: 2 roles */}
          <div className="flex flex-col gap-4">
            {roles.slice(2, 4).map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.label}
                  className="rounded-2xl border p-5 flex flex-col gap-3"
                  style={{
                    background: "var(--cl-surface-1)",
                    borderColor: role.border,
                    boxShadow: `0 0 0 1px ${role.iconBg}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: role.iconBg }}
                      aria-hidden="true"
                    >
                      <Icon size={18} style={{ color: role.iconColor }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "var(--cl-text)" }}>{role.label}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: role.iconColor }}>{role.outcome}</p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--cl-text-secondary)" }}>
                    {role.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: 2×2 grid */}
        <div className="grid grid-cols-2 gap-4 lg:hidden">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.label}
                className="rounded-2xl border p-4 flex flex-col gap-3"
                style={{
                  background: "var(--cl-surface-1)",
                  borderColor: role.border,
                }}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: role.iconBg }}
                  aria-hidden="true"
                >
                  <Icon size={18} style={{ color: role.iconColor }} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--cl-text)" }}>{role.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed" style={{ color: "var(--cl-text-secondary)" }}>{role.description}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
