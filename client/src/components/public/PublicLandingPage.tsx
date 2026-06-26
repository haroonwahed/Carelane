/**
 * Carelane public landing page.
 *
 * Route: /  (public, unauthenticated)
 *
 * Section order per design kit:
 * 1. Navigation
 * 2. Hero
 * 3. Care journey route
 * 4. Regiekamer intelligence
 * 5. One case, multiple organisations
 * 6. Explainable matching
 * 7. Trust by design
 * 8. Results in practice
 * 9. Built for each role
 * 10. Final CTA
 * 11. Footer
 */
import { Fragment, useEffect } from "react";
import { LandingNav } from "../landing/LandingNav";
import { CareJourneySection } from "../landing/CareJourneySection";
import { RegiekamerSection } from "../landing/RegiekamerSection";
import { CareNetworkSection } from "../landing/CareNetworkSection";
import { ExplainableMatchingSection } from "../landing/ExplainableMatchingSection";
import { TrustByDesignSection } from "../landing/TrustByDesignSection";
import { ResultsSection } from "../landing/ResultsSection";
import { AudienceSection } from "../landing/AudienceSection";
import { FinalCtaSection } from "../landing/FinalCtaSection";
import { LandingFooter } from "../landing/LandingFooter";
import { CarelaneHeroOrchestrationVisual } from "../landing/CarelaneHeroOrchestrationVisual";
import { HeroOutcomes } from "../landing/HeroOutcomes";
import { CarelaneLogo } from "../logos/CarelaneLogo";
import { LOGIN_URL } from "../../lib/routes";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface PublicLandingPageProps {
  onThemeToggle: () => void;
}

const DEMO_EMAIL = "contact@carelane.nl";

// Canonical five-phase workflow — shown as a slim stepper at the base of the hero.
const HERO_PHASES = [
  { step: "01", name: "Aanmelding",       role: "Gemeente",            color: "#3ea8ff" },
  { step: "02", name: "Matching",         role: "Carelane",            color: "#9b82ff" },
  { step: "03", name: "Aanbiederreactie", role: "Zorgaanbieder",       color: "#f5a524" },
  { step: "04", name: "Plaatsing",        role: "Gemeente + Aanbieder", color: "#2ec8a6" },
  { step: "05", name: "Intake",           role: "Zorgaanbieder",       color: "#2ec8a6" },
];

export function PublicLandingPage({ onThemeToggle: _onThemeToggle }: PublicLandingPageProps) {
  // Force body/html to dark while landing page is mounted so the canvas
  // background shows correctly when content overflows the #root div.
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#060b17";
    document.documentElement.style.backgroundColor = "#060b17";
    return () => {
      document.body.style.backgroundColor = prev;
      document.documentElement.style.backgroundColor = "";
    };
  }, []);

  const handleDemoClick = () => {
    window.location.href = `mailto:${DEMO_EMAIL}?subject=Demo aanvragen – Carelane`;
  };

  return (
    <div
      className="carelane-landing min-h-screen"
      style={{
        color: "var(--cl-text)",
        background:
          "radial-gradient(ellipse at 65% 0%, rgba(91,62,230,.14), transparent 36rem), var(--cl-bg-canvas)",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* ── 1. Navigation ─────────────────────────────────────────── */}
      <LandingNav />

      <main>
        {/* ── 2. Hero ────────────────────────────────────────────────── */}
        <section
          className="relative overflow-x-clip pt-[72px]"
          aria-labelledby="hero-heading"
        >
          {/* Background elements */}
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse at 72% 28%, rgba(124,92,255,.14), transparent 40%), radial-gradient(ellipse at 20% 80%, rgba(62,168,255,.06), transparent 30%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "8rem",
                background: "linear-gradient(to top, var(--cl-bg-canvas), transparent)",
              }}
            />
          </div>

          <div
            className="cl-container relative z-10 flex flex-col"
            style={{ paddingTop: "clamp(1.25rem, 2.5vw, 2rem)", paddingBottom: "clamp(1.5rem, 3vw, 2.5rem)" }}
          >

            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-center">
              {/* Left: copy */}
              <div className="max-w-[560px] space-y-6">
                {/* Eyebrow */}
                <p
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-widest"
                  style={{
                    borderColor: "var(--cl-border)",
                    background: "rgba(155,130,255,.08)",
                    color: "var(--cl-violet-bright)",
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: "var(--cl-violet-bright)" }}
                    aria-hidden="true"
                  />
                  Operationele regie · Zorgcoördinatie
                </p>

                <h1
                  id="hero-heading"
                  className="text-balance font-semibold tracking-[-0.04em] text-[var(--cl-text)]"
                  style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.75rem)", lineHeight: 1.05 }}
                >
                  De controlelaag voor{" "}
                  <span style={{ color: "var(--cl-violet-bright)" }}>zorgcoördinatie.</span>
                </h1>

                <p
                  className="leading-relaxed"
                  style={{
                    fontSize: "clamp(1rem, 1.2vw, 1.125rem)",
                    color: "var(--cl-text-secondary)",
                    maxWidth: "50ch",
                  }}
                >
                  Carelane stuurt elke casus van aanmelding tot intake — met op elk moment zicht op
                  wat vastloopt, wie aan zet is en wat de volgende stap is. Gemeenten, zorgaanbieders
                  en coördinatoren werken in één bron, herleidbaar en op tijd.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleDemoClick}
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-xl px-6 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cl-violet-bright)]"
                    style={{
                      background: "linear-gradient(135deg, var(--cl-violet), var(--cl-violet-deep))",
                      boxShadow: "0 10px 30px rgba(91,62,230,.30)",
                    }}
                  >
                    Plan een demo
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <a
                    href="#werkwijze"
                    className="inline-flex min-h-[48px] items-center rounded-xl border px-6 text-sm font-medium transition-all duration-200 hover:border-[var(--cl-border-focus)] hover:text-[var(--cl-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cl-violet-bright)]"
                    style={{
                      borderColor: "var(--cl-border)",
                      color: "var(--cl-text-secondary)",
                    }}
                  >
                    Bekijk hoe het werkt
                  </a>
                </div>

                {/* Trust strip */}
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  {["Veilig", "AVG-bewust", "Gebouwd voor de zorg"].map((label) => (
                    <span
                      key={label}
                      className="flex items-center gap-1.5 text-xs"
                      style={{ color: "var(--cl-text-muted)" }}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M6 1L1.5 3v3c0 2.8 1.95 5.4 4.5 6 2.55-.6 4.5-3.2 4.5-6V3L6 1Z" fill="rgba(155,130,255,.25)" stroke="rgba(155,130,255,.5)" strokeWidth="1"/>
                        <path d="M3.5 6l1.5 1.5 3-3" stroke="#9b82ff" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: Regiekamer preview */}
              <CarelaneHeroOrchestrationVisual />
            </div>

            {/* Five-phase workflow strip — the spine of the product */}
            <div className="mt-12 lg:mt-16">
              <p
                className="mb-3 text-[11px] font-bold uppercase tracking-widest"
                style={{ color: "var(--cl-text-muted)" }}
              >
                Eén route — van aanmelding tot intake
              </p>
              <div
                className="flex items-center gap-2 overflow-x-auto rounded-2xl border px-4 py-4 sm:gap-3 sm:px-6"
                style={{ borderColor: "var(--cl-border-subtle)", background: "rgba(13,23,42,.45)" }}
              >
                {HERO_PHASES.map((p, i) => (
                  <Fragment key={p.step}>
                    <div className="flex shrink-0 items-center gap-3">
                      <span
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[12px] font-bold tabular-nums"
                        style={{ color: p.color, background: `${p.color}1a`, border: `1px solid ${p.color}3d` }}
                      >
                        {p.step}
                      </span>
                      <div className="min-w-0">
                        <p className="whitespace-nowrap text-[13px] font-semibold" style={{ color: "var(--cl-text)" }}>
                          {p.name}
                        </p>
                        <p className="whitespace-nowrap text-[11px]" style={{ color: "var(--cl-text-muted)" }}>
                          {p.role}
                        </p>
                      </div>
                    </div>
                    {i < HERO_PHASES.length - 1 && (
                      <div
                        className="h-px w-6 shrink-0 lg:flex-1"
                        style={{ background: "linear-gradient(to right, var(--cl-border), transparent)" }}
                        aria-hidden="true"
                      />
                    )}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 2b. Operational outcomes ─────────────────────────────── */}
        <HeroOutcomes />

        {/* ── 3. Care journey route ────────────────────────────────── */}
        <CareJourneySection />

        {/* ── 4. Regiekamer intelligence ────────────────────────────── */}
        <RegiekamerSection />

        {/* ── 5. One case, multiple organisations ─────────────────── */}
        <CareNetworkSection />

        {/* ── 6. Explainable matching ───────────────────────────────── */}
        <ExplainableMatchingSection />

        {/* ── 7. Trust by design ────────────────────────────────────── */}
        <TrustByDesignSection />

        {/* ── 8. Results in practice ────────────────────────────────── */}
        <ResultsSection />

        {/* ── 9. Built for each role ────────────────────────────────── */}
        <AudienceSection />

        {/* ── 10. Final CTA ─────────────────────────────────────────── */}
        <FinalCtaSection />
      </main>

      {/* ── 11. Footer ────────────────────────────────────────────── */}
      <LandingFooter />
    </div>
  );
}
