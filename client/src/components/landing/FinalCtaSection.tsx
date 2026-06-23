/**
 * Final CTA section.
 * Full-width section with an SVG cable-stayed bridge illustration as background.
 * No Framer Motion. No external images.
 */

export function FinalCtaSection() {
  return (
    <section
      className="relative overflow-hidden"
      aria-labelledby="final-cta-heading"
      style={{ minHeight: 520, background: "#070b14" }}
    >
      {/* Bridge SVG background — purely decorative */}
      <svg
        viewBox="0 0 1440 500"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        {/* Sky gradient */}
        <defs>
          <radialGradient id="pylonGlow" cx="62%" cy="42%" r="32%">
            <stop offset="0%" stopColor="#5b3ee6" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#070b14" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="skyGlow" cx="50%" cy="20%" r="60%">
            <stop offset="0%" stopColor="#0f1a38" stopOpacity="1" />
            <stop offset="100%" stopColor="#070b14" stopOpacity="1" />
          </radialGradient>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d1a2e" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#070b14" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="1440" height="500" fill="url(#skyGlow)" />

        {/* Scattered city-light dots */}
        {[
          [80, 290], [140, 310], [220, 280], [310, 305], [380, 295],
          [460, 285], [540, 300], [620, 288], [700, 296], [780, 283],
          [860, 305], [940, 290], [1020, 300], [1100, 287], [1180, 298],
          [1260, 292], [1340, 305], [1400, 285],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.5 : 1} fill="#c8d8ff" opacity={0.35 + (i % 4) * 0.1} />
        ))}

        {/* Pylon glow */}
        <ellipse cx="900" cy="200" rx="220" ry="280" fill="url(#pylonGlow)" />

        {/* Bridge deck — horizontal bar at y=340 */}
        <rect x="0" y="338" width="1440" height="6" fill="#1a2845" />
        <rect x="0" y="344" width="1440" height="2" fill="rgba(155,130,255,.18)" />

        {/* Pylon / mast — rising from deck at x=900 */}
        <rect x="895" y="80" width="10" height="260" fill="#1e2f50" rx="2" />
        <rect x="897" y="78" width="6" height="262" fill="rgba(155,130,255,.22)" rx="2" />

        {/* Cable-stayed cables — left side of pylon */}
        {[
          [900, 90, 680, 338],
          [900, 100, 580, 338],
          [900, 115, 480, 338],
          [900, 132, 380, 338],
          [900, 152, 280, 338],
          [900, 174, 180, 338],
        ].map(([x1, y1, x2, y2], i) => (
          <line
            key={`l${i}`}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="rgba(155,130,255,.22)"
            strokeWidth="1"
          />
        ))}

        {/* Cable-stayed cables — right side of pylon */}
        {[
          [905, 90, 1120, 338],
          [905, 100, 1220, 338],
          [905, 115, 1310, 338],
          [905, 132, 1380, 338],
          [905, 152, 1420, 338],
        ].map(([x1, y1, x2, y2], i) => (
          <line
            key={`r${i}`}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="rgba(155,130,255,.22)"
            strokeWidth="1"
          />
        ))}

        {/* Water reflection below deck */}
        <rect x="0" y="346" width="1440" height="154" fill="url(#waterGrad)" />

        {/* Water ripple lines */}
        {[354, 362, 370, 380, 392, 406, 424, 445].map((y, i) => (
          <line
            key={`w${i}`}
            x1={100 + i * 20}
            y1={y}
            x2={1340 - i * 20}
            y2={y}
            stroke="rgba(100,130,200,.10)"
            strokeWidth="1"
          />
        ))}

        {/* Pylon reflection in water */}
        <rect x="895" y="346" width="10" height="80" fill="rgba(30,47,80,.6)" rx="1" />

        {/* Cable reflections */}
        {[
          [900, 346, 680, 400],
          [900, 346, 480, 430],
          [905, 346, 1120, 400],
          [905, 346, 1310, 430],
        ].map(([x1, y1, x2, y2], i) => (
          <line
            key={`wr${i}`}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="rgba(155,130,255,.10)"
            strokeWidth="0.8"
          />
        ))}
      </svg>

      {/* Dark overlay to ensure text readability */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(7,11,20,.55) 0%, rgba(7,11,20,.40) 55%, rgba(7,11,20,.75) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Text content — centered above bridge */}
      <div
        className="cl-container relative z-10 flex flex-col items-center justify-center text-center"
        style={{ minHeight: 520, paddingTop: 80, paddingBottom: 80 }}
      >
        <p
          className="mb-3 text-xs font-bold uppercase tracking-[0.18em]"
          style={{ color: "var(--cl-violet-bright)" }}
        >
          KLAAR OM REGIE TE NEMEN?
        </p>

        <h2
          id="final-cta-heading"
          className="mx-auto max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl"
          style={{ color: "#ffffff", lineHeight: 1.08 }}
        >
          Breng regie terug in de zorgketen.
        </h2>

        <p
          className="mx-auto mt-5 max-w-xl text-base leading-relaxed"
          style={{ color: "rgba(196,210,235,.80)" }}
        >
          Ontdek hoe Carelane uw organisatie helpt om sneller, beter en met meer vertrouwen
          beslissingen te nemen.
        </p>

        {/* CTAs */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href="mailto:contact@carelane.nl?subject=Demo aanvragen – Carelane"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-xl px-7 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cl-violet-bright)]"
            style={{
              background: "var(--cl-violet-bright)",
              boxShadow: "0 12px 32px rgba(91,62,230,.38)",
            }}
          >
            Plan een demo →
          </a>
          <a
            href="#werkwijze"
            className="inline-flex min-h-[48px] items-center rounded-xl border px-7 text-sm font-medium transition-all duration-200 hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cl-violet-bright)]"
            style={{
              borderColor: "rgba(196,210,235,.30)",
              color: "rgba(196,210,235,.85)",
            }}
          >
            Bekijk hoe het werkt
          </a>
        </div>

        <p
          className="mt-5 text-xs"
          style={{ color: "rgba(143,154,175,.65)" }}
        >
          Of plan direct een korte kennismaking
        </p>
      </div>
    </section>
  );
}
