import { Building2, Heart, ShieldCheck, Users } from "lucide-react";

const roles = [
  {
    icon: Building2,
    label: "Gemeenten",
    description:
      "Houd grip op de keten en neem onderbouwde beslissingen.",
    iconColor: "var(--cl-blue)",
    iconBg: "rgba(59,130,246,0.12)",
    highlighted: false,
  },
  {
    icon: ShieldCheck,
    label: "Zorgaanbieders",
    description:
      "Ontvang de juiste aanvragen en werk effectiever samen.",
    iconColor: "#22c55e",
    iconBg: "rgba(34,197,94,0.12)",
    highlighted: false,
  },
  {
    icon: Users,
    label: "Coördinatoren",
    description:
      "Zie wat aandacht nodig heeft en neem de volgende stap.",
    iconColor: "var(--cl-teal)",
    iconBg: "rgba(20,184,166,0.12)",
    highlighted: true,
  },
  {
    icon: Heart,
    label: "Cliënten & gezinnen",
    description:
      "Blijf betrokken en geïnformeerd over wat er gebeurt.",
    iconColor: "var(--cl-amber)",
    iconBg: "rgba(245,158,11,0.12)",
    highlighted: false,
  },
];

export function AudienceSection() {
  return (
    <section id="voor-wie" className="cl-section scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color: "var(--cl-violet-bright)" }}
          >
            VOOR WIE IS CARELANE
          </p>
          <h2
            className="text-3xl lg:text-4xl font-bold leading-tight"
            style={{ color: "var(--cl-text)" }}
          >
            Gebouwd voor iedereen die{" "}
            <em
              className="not-italic font-bold"
              style={{ color: "var(--cl-violet-bright)" }}
            >
              betere keuzes
            </em>{" "}
            wil maken in de zorgketen.
          </h2>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.label}
                className="rounded-2xl p-5 flex flex-col gap-4 transition-shadow"
                style={{
                  background: "var(--cl-surface-1)",
                  border: role.highlighted
                    ? "1px solid rgba(20,184,166,0.35)"
                    : "1px solid var(--cl-border-subtle)",
                  boxShadow: role.highlighted
                    ? "0 0 0 1px rgba(20,184,166,0.12)"
                    : "none",
                }}
              >
                {/* Icon badge */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: role.iconBg }}
                >
                  <Icon size={20} style={{ color: role.iconColor }} />
                </div>

                {/* Text */}
                <div>
                  <p
                    className="text-sm font-bold mb-1.5"
                    style={{ color: "var(--cl-text)" }}
                  >
                    {role.label}
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--cl-text-secondary)" }}
                  >
                    {role.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
