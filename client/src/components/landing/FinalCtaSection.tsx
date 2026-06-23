/**
 * Final CTA section.
 * Full-width section with an enhanced SVG cable-stayed bridge illustration.
 * More cinematic: brighter pylon glow, richer cables, city light dots, water reflection.
 */

export function FinalCtaSection() {
  return (
    <section
      className="relative overflow-hidden"
      aria-labelledby="final-cta-heading"
      style={{ minHeight: 520, background: "#050810" }}
    >
      {/* Enhanced Bridge SVG background */}
      <svg
        viewBox="0 0 1440 520"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      >
        <defs>
          <radialGradient id="pylonGlow2" cx="62%" cy="38%" r="28%">
            <stop offset="0%" stopColor="#7c3ef5" stopOpacity="0.75" />
            <stop offset="55%" stopColor="#5b3ee6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#050810" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="waterGlow2" cx="62%" cy="78%" r="22%">
            <stop offset="0%" stopColor="#5b3ee6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#050810" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="skyGlow2" cx="50%" cy="15%" r="65%">
            <stop offset="0%" stopColor="#0c152e" stopOpacity="1" />
            <stop offset="100%" stopColor="#050810" stopOpacity="1" />
          </radialGradient>
          <linearGradient id="deckGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10182e" />
            <stop offset="40%" stopColor="#1a2548" />
            <stop offset="62%" stopColor="#2d1e5c" />
            <stop offset="100%" stopColor="#10182e" />
          </linearGradient>
          <linearGradient id="waterMirror" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d1830" stopOpacity="0.90" />
            <stop offset="100%" stopColor="#050810" stopOpacity="1" />
          </linearGradient>
          <filter id="cableGlow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Sky */}
        <rect width="1440" height="520" fill="url(#skyGlow2)" />

        {/* Pylon ambient glow sphere */}
        <ellipse cx="900" cy="185" rx="240" ry="300" fill="url(#pylonGlow2)" />

        {/* City lights — warm amber/white dots scattered on horizon */}
        {[
          [60,296,1.6],[110,304,1.0],[170,292,1.3],[230,308,0.9],[290,298,1.5],
          [350,305,0.8],[410,295,1.2],[470,302,0.9],[530,293,1.4],[590,307,1.0],
          [650,298,1.1],[720,291,1.3],[760,305,0.8],[820,296,1.2],[990,295,1.0],
          [1060,303,0.9],[1120,293,1.4],[1180,300,1.0],[1250,295,1.2],[1310,306,0.8],
          [1370,294,1.5],[1410,301,1.0],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r}
            fill={i % 4 === 0 ? "#ffe5a0" : "#c8d8ff"}
            opacity={0.30 + (i % 5) * 0.08}
          />
        ))}

        {/* Bridge deck */}
        <rect x="0" y="340" width="1440" height="7" fill="url(#deckGrad)" />
        {/* Deck highlight line */}
        <rect x="0" y="347" width="1440" height="1.5" fill="rgba(180,140,255,0.22)" />

        {/* Pylon structure */}
        <rect x="894" y="72" width="12" height="270" fill="#1a2540" rx="3"/>
        {/* Pylon violet highlight */}
        <rect x="897" y="70" width="5" height="272" fill="rgba(155,130,255,0.35)" rx="2"/>
        {/* Pylon top glow */}
        <circle cx="900" cy="72" r="5" fill="rgba(155,130,255,0.60)" />

        {/* Left-side cables (6 pairs) */}
        {[
          [900, 85, 690, 340, 0.55],
          [900, 98, 590, 340, 0.48],
          [900, 113, 490, 340, 0.42],
          [900, 130, 390, 340, 0.36],
          [900, 150, 290, 340, 0.28],
          [900, 173, 190, 340, 0.22],
        ].map(([x1,y1,x2,y2,op], i) => (
          <g key={`lc${i}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(155,130,255,0.22)" strokeWidth="2.5" opacity={0.4} />
            <line x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(155,130,255,1)" strokeWidth="0.9" opacity={op} />
          </g>
        ))}

        {/* Right-side cables */}
        {[
          [905, 85, 1110, 340, 0.55],
          [905, 98, 1210, 340, 0.48],
          [905, 113, 1300, 340, 0.42],
          [905, 130, 1370, 340, 0.34],
          [905, 150, 1415, 340, 0.26],
        ].map(([x1,y1,x2,y2,op], i) => (
          <g key={`rc${i}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(155,130,255,0.22)" strokeWidth="2.5" opacity={0.4} />
            <line x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(155,130,255,1)" strokeWidth="0.9" opacity={op} />
          </g>
        ))}

        {/* Water */}
        <rect x="0" y="348" width="1440" height="172" fill="url(#waterMirror)" />

        {/* Water glow under pylon */}
        <ellipse cx="900" cy="380" rx="180" ry="80" fill="url(#waterGlow2)" />

        {/* Ripple lines */}
        {[358,366,376,388,402,418,436].map((y, i) => (
          <line key={`rip${i}`}
            x1={80 + i*30} y1={y} x2={1360 - i*30} y2={y}
            stroke="rgba(100,130,200,.08)" strokeWidth="1"
          />
        ))}

        {/* Pylon water reflection */}
        <rect x="894" y="349" width="12" height="90" fill="rgba(155,130,255,0.18)" rx="2" />

        {/* Cable water reflections */}
        {[
          [900,349,690,410,0.12],
          [900,349,490,440,0.08],
          [905,349,1110,410,0.12],
          [905,349,1300,440,0.08],
        ].map(([x1,y1,x2,y2,op], i) => (
          <line key={`wr${i}`}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="rgba(155,130,255,1)" strokeWidth="0.8" opacity={op}
          />
        ))}
      </svg>

      {/* Text readability overlay — stronger at top and bottom */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(5,8,16,.70) 0%, rgba(5,8,16,.35) 45%, rgba(5,8,16,.55) 80%, rgba(5,8,16,.80) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div
        className="cl-container relative z-10 flex flex-col items-center justify-center text-center"
        style={{ minHeight: 520, paddingTop: 72, paddingBottom: 72 }}
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
          Breng{" "}
          <span style={{ color: "var(--cl-violet-bright)" }}>regie</span>
          {" "}terug in de zorgketen.
        </h2>

        <p
          className="mx-auto mt-5 max-w-xl text-base leading-relaxed"
          style={{ color: "rgba(196,210,235,.80)" }}
        >
          Ontdek hoe Carelane uw organisatie helpt om sneller, beter en met meer vertrouwen
          beslissingen te nemen.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href="mailto:contact@carelane.nl?subject=Demo aanvragen – Carelane"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-xl px-7 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cl-violet-bright)]"
            style={{
              background: "var(--cl-violet-bright)",
              boxShadow: "0 12px 40px rgba(91,62,230,.45), 0 0 0 1px rgba(155,130,255,.25)",
            }}
          >
            Plan een demo →
          </a>
          <a
            href="#werkwijze"
            className="inline-flex min-h-[48px] items-center rounded-xl border px-7 text-sm font-medium transition-all duration-200 hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cl-violet-bright)]"
            style={{
              borderColor: "rgba(196,210,235,.28)",
              color: "rgba(196,210,235,.85)",
              background: "rgba(255,255,255,.04)",
            }}
          >
            Bekijk hoe het werkt
          </a>
        </div>

        <p className="mt-5 text-xs" style={{ color: "rgba(143,154,175,.60)" }}>
          Of plan direct een korte kennismaking
        </p>
      </div>
    </section>
  );
}
