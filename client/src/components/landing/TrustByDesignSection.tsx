import { Eye, FileText, Lock, ShieldCheck, UserCheck } from "lucide-react";

const pillars = [
  {
    icon: UserCheck,
    title: "Rolgebaseerde toegang",
    description: "Alleen de juiste mensen zien wat ze nodig hebben.",
    iconColor: "var(--cl-violet-bright)",
    iconBg: "rgba(139,92,246,0.15)",
  },
  {
    icon: Lock,
    title: "Workflow-integriteit",
    description: "Strikte fasen en validaties. Geen omzeilen, geen skip.",
    iconColor: "var(--cl-teal)",
    iconBg: "rgba(20,184,166,0.15)",
  },
  {
    icon: FileText,
    title: "Audittrail beslissingen",
    description: "Elke actie wordt gelogd, zichtbaar voor wie mag.",
    iconColor: "var(--cl-blue)",
    iconBg: "rgba(59,130,246,0.15)",
  },
  {
    icon: ShieldCheck,
    title: "Gegevensbescherming",
    description: "AVG-compliant omgeving en veilige verwerking van data.",
    iconColor: "#22c55e",
    iconBg: "rgba(34,197,94,0.15)",
  },
  {
    icon: Eye,
    title: "Gecontroleerde zichtbaarheid",
    description: "Aanbieders zien alleen wat én wanneer het relevant is.",
    iconColor: "var(--cl-amber)",
    iconBg: "rgba(245,158,11,0.15)",
  },
];

export function TrustByDesignSection() {
  return (
    <section
      id="veiligheid"
      className="cl-section scroll-mt-20"
      style={{ background: "var(--cl-bg-deep)" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color: "var(--cl-violet-bright)" }}
          >
            TRUST BY DESIGN
          </p>
          <h2
            className="text-3xl lg:text-4xl font-bold leading-tight mb-4"
            style={{ color: "var(--cl-text)" }}
          >
            Vertrouwen is geen feature. Het is onze basis.
          </h2>
          <p
            className="text-base leading-relaxed max-w-2xl mx-auto"
            style={{ color: "var(--cl-text-secondary)" }}
          >
            Toegang, processtappen en besluiten zijn gecontroleerd, traceerbaar
            en afgestemd op de rol van de gebruiker.
          </p>
        </div>

        {/* Pillar cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="rounded-2xl p-5 flex flex-col gap-4"
                style={{
                  background: "var(--cl-surface-1)",
                  border: "1px solid var(--cl-border-subtle)",
                }}
              >
                {/* Icon badge */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: pillar.iconBg }}
                >
                  <Icon size={20} style={{ color: pillar.iconColor }} />
                </div>

                {/* Text */}
                <div>
                  <p
                    className="text-sm font-bold mb-1.5"
                    style={{ color: "var(--cl-text)" }}
                  >
                    {pillar.title}
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--cl-text-secondary)" }}
                  >
                    {pillar.description}
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
