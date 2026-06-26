/**
 * Hero outcomes — three concrete operational outcomes, immediately below the hero.
 * States plainly what the control layer does. No invented metrics or fake quotes;
 * each card names a real operational capability and what it removes.
 */
import { LayoutGrid, UserCheck, ShieldCheck } from "lucide-react";

const OUTCOMES = [
  {
    icon: LayoutGrid,
    color: "var(--cl-violet-bright)",
    tint: "rgba(155,130,255,.10)",
    border: "rgba(155,130,255,.26)",
    title: "Zicht op de hele keten",
    body:
      "Eén overzicht van alle lopende casussen, fases en blokkades — geen losse mailboxen, spreadsheets of telefoonrondes.",
    proof: "Vervangt: versnipperd overzicht",
  },
  {
    icon: UserCheck,
    color: "#3ea8ff",
    tint: "rgba(62,168,255,.10)",
    border: "rgba(62,168,255,.24)",
    title: "Eigenaarschap per stap",
    body:
      "Bij elke casus is duidelijk wie aan zet is en wat de volgende actie is. Wachttijd en termijnrisico staan in beeld.",
    proof: "Vervangt: “wie pakt dit op?”",
  },
  {
    icon: ShieldCheck,
    color: "var(--cl-teal)",
    tint: "rgba(46,200,166,.10)",
    border: "rgba(46,200,166,.24)",
    title: "Auditbaar van begin tot eind",
    body:
      "Elke beslissing is herleidbaar en elke overdracht draagt de volledige context mee — minder schakelmomenten zonder informatie.",
    proof: "Vervangt: overdracht zonder context",
  },
];

export function HeroOutcomes() {
  return (
    <section className="cl-section" aria-labelledby="outcomes-heading">
      <div className="cl-container">
        <h2 id="outcomes-heading" className="sr-only">
          Wat Carelane operationeel oplevert
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OUTCOMES.map((o) => {
            const Icon = o.icon;
            return (
              <div
                key={o.title}
                className="flex flex-col gap-4 rounded-2xl border p-6 transition-colors duration-200"
                style={{
                  background: "var(--cl-surface-1)",
                  borderColor: "var(--cl-border-subtle)",
                  boxShadow: "var(--cl-shadow-card)",
                }}
              >
                <span
                  className="grid h-11 w-11 place-items-center rounded-xl"
                  style={{ color: o.color, background: o.tint, border: `1px solid ${o.border}` }}
                  aria-hidden="true"
                >
                  <Icon size={20} strokeWidth={2} />
                </span>
                <div className="space-y-2">
                  <h3 className="text-[17px] font-semibold tracking-[-0.01em]" style={{ color: "var(--cl-text)" }}>
                    {o.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--cl-text-secondary)" }}>
                    {o.body}
                  </p>
                </div>
                <p
                  className="mt-auto inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-medium"
                  style={{ color: "var(--cl-text-muted)", background: "rgba(171,188,218,.06)", border: "1px solid var(--cl-border-subtle)" }}
                >
                  {o.proof}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
