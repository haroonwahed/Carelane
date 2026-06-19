/**
 * Carelane Design System V1 — JavaScript token layer
 *
 * This file re-exports semantic values from the CSS custom property layer.
 * It does NOT define a parallel color palette. One source of truth lives in
 * globals.css; these constants give TypeScript code access to the same values.
 *
 * HISTORY: `tokens.colors` and `tokens.visualContract` were two parallel palettes
 * that disagreed on background, sidebar width, topbar height, radius, and padding.
 * Both have been replaced by `tokens.visual`, which maps 1:1 to --care-* tokens.
 */

/** Canonical Carelane accent — Zorg OS primary purple. */
const ACCENT_PRIMARY = "#7C4DFF" as const;

export const tokens = {
  layout: {
    pageMaxWidth: "1536px",
    contentMeasure: "48rem",
    contentMeasureNarrow: "40rem",
    contentMeasureTight: "20rem",
    dialogMaxWidth: "34rem",
    dialogWideMaxWidth: "35rem",
    dialogNarrowMaxWidth: "32rem",
    dialogContentMaxWidth: "26rem",
    phaseBadgeMaxWidth: "11rem",
    worklistLeadingColumnWidth: "13rem",
    worklistStatusColumnWidth: "14rem",
    worklistActionColumnMinWidth: "10.5rem",
    chipMeasure: "8.75rem",
    chipMeasureWide: "12.5rem",
    rowLabelMaxWidth: "60%",
    tooltipMaxWidth: "16.25rem",
    matchingGridLeftMinWidth: "520px",
    matchingGridRightMinWidth: "680px",
    matchingWorkspaceMinHeight: "620px",
    matchingWorkspaceDesktopHeight: "calc(100vh - 170px)",
    coordinationWorkspaceMaxWidth: "96rem",
    coordinationRailMaxHeight: "calc(100dvh - 5rem)",
    timelineConnectorTop: "2.25rem",
    edgeZero: "0px",
    sectionSpacing: "24px",
    blockSpacing: "16px",
  },

  spacing: {
    pageGap: "24px",
    sectionGap: "16px",
    rowGap: "8px",
    inlineGap: "12px",
    rhythm: {
      page: "24px",
      pageMobile: "20px",
      section: "20px",
      sectionMobile: "16px",
      quiet: "20px",
      band: "16px",
      control: "12px",
      filterQueue: "12px",
      queueLead: "10px",
      queueHeader: "8px",
      empty: "16px",
      layoutRail: "24px",
    },
  },

  /**
   * Canonical visual constants — maps 1:1 to CSS custom properties in globals.css.
   * Use these only when JS access is strictly required (e.g. inline style for CSS
   * custom property injection, canvas rendering, third-party chart config).
   * For all other styling, consume the --care-* CSS tokens directly.
   */
  visual: {
    // Shell geometry (corrected: 256px sidebar, 64px topbar — validated at 1280px)
    sidebarWidthExpanded: "256px",
    sidebarWidthCollapsed: "72px",
    topbarHeight: "64px",
    pageHPadding: "24px",
    pageHPaddingWide: "32px",
    pageMaxWidth: "1536px",

    // Radius — 4 semantic values with distinct visual functions
    radiusLarge: "20px",   // page-header shell, modals, dialogs
    radiusCard: "16px",    // section cards, panels, containers
    radiusControl: "10px", // buttons, inputs, selects, tabs
    radiusPill: "9999px",  // badges, avatars, pill-tabs

    // Shadows
    shadowCard: "0 10px 28px rgba(11, 16, 32, 0.16)",
    shadowSection: "0 6px 20px rgba(11, 16, 32, 0.12)",
    shadowControl: "0 2px 8px rgba(11, 16, 32, 0.08)",
    shadowOverlay: "rgba(0, 0, 0, 0.50)",
    shadowDialog: "0 20px 60px rgba(0, 0, 0, 0.40)",

    // Brand
    primaryCta: ACCENT_PRIMARY,
    warningCta: "#F5A900",
    accent: ACCENT_PRIMARY,

    // Layout widths
    contextRailWidth: "280px",
    queueWidth: "320px",
    panelDetailWidth: "400px",
  },

  motion: {
    fast: "120ms",
    standard: "200ms",
    slow: "350ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    easingDecelerate: "cubic-bezier(0, 0, 0.2, 1)",
    easingAccelerate: "cubic-bezier(0.4, 0, 1, 1)",
  },

  zIndex: {
    base: 0,
    raised: 1,
    sticky: 20,
    topbar: 40,
    overlay: 50,
    dialog: 60,
    toast: 70,
  },

  radius: {
    sm: "8px",
    md: "12px",
  },

  searchControl: {
    rowMinHeight: "40px",
    radius: "16px",
    tabHeight: "36px",
  },

  settingsWorkspace: {
    sidebarWidth: "240px",
    contentMeasure: "40rem",
  },

  /**
   * Typography scale — closed set, two weights only (400/500).
   * Mirrors --care-text-* in globals.css. Prefer the .care-text-* CSS classes
   * in markup; use these constants only where JS access is required.
   * See docs/design/CARELANE_DESIGN_LANGUAGE.md §3.
   */
  typography: {
    display: { size: "1.625rem", weight: 500, lineHeight: 1.25 },
    title: { size: "1.3125rem", weight: 500, lineHeight: 1.25 },
    heading: { size: "1.0625rem", weight: 500, lineHeight: 1.35 },
    subheading: { size: "0.9375rem", weight: 500, lineHeight: 1.4 },
    body: { size: "0.9375rem", weight: 400, lineHeight: 1.6 },
    bodyCompact: { size: "0.8125rem", weight: 400, lineHeight: 1.5 },
    meta: { size: "0.75rem", weight: 400, lineHeight: 1.4 },
    eyebrow: { size: "0.6875rem", weight: 500, lineHeight: 1.3, tracking: "0.05em", transform: "uppercase" },
  },

  /**
   * Semantic colour intents — meaning, not chroma. Reference the CSS custom
   * properties (which peer light/dark automatically). Write `urgent`, never
   * `red`. See docs/design/CARELANE_DESIGN_LANGUAGE.md §4.
   */
  semantic: {
    urgent: { bg: "var(--care-semantic-urgent-bg)", text: "var(--care-semantic-urgent-text)", border: "var(--care-semantic-urgent-border)", solid: "var(--care-semantic-urgent-solid)" },
    warning: { bg: "var(--care-semantic-warning-bg)", text: "var(--care-semantic-warning-text)", border: "var(--care-semantic-warning-border)", solid: "var(--care-semantic-warning-solid)" },
    info: { bg: "var(--care-semantic-info-bg)", text: "var(--care-semantic-info-text)", border: "var(--care-semantic-info-border)", solid: "var(--care-semantic-info-solid)" },
    success: { bg: "var(--care-semantic-success-bg)", text: "var(--care-semantic-success-text)", border: "var(--care-semantic-success-border)", solid: "var(--care-semantic-success-solid)" },
    neutral: { bg: "var(--care-semantic-neutral-bg)", text: "var(--care-semantic-neutral-text)", border: "var(--care-semantic-neutral-border)", solid: "var(--care-semantic-neutral-solid)" },
    brand: { bg: "var(--care-semantic-brand-bg)", text: "var(--care-semantic-brand-text)", border: "var(--care-semantic-brand-border)", solid: "var(--care-semantic-brand-solid)" },
  },

  /**
   * SLA countdown thresholds — drive the colour intent of the countdown chip/ring.
   * See docs/design/CARELANE_DESIGN_LANGUAGE.md §6b.
   */
  sla: {
    /** < this many hours remaining → `urgent` intent */
    criticalHours: 4,
    /** < this many hours remaining → `warning` intent (else `neutral`) */
    warningHours: 12,
  },

  density: {
    pageHeaderMaxHeight: "96px",
    compactHeaderMaxHeight: "72px",
    metricStripHeight: "48px",
    metricItemMinWidth: "120px",
    operationalSignalHeight: "56px",
    worklistRowHeight: "64px",
    compactWorklistRowHeight: "56px",
    nextBestActionMinHeight: "112px",
    nextBestActionMaxHeight: "156px",
    processTimelineHeight: "56px",
    contextPanelSectionSpacing: "16px",
    rowHeight: "56px",
    compactRowHeight: "44px",
  },
} as const;

/**
 * Backwards-compatibility aliases for code that still references the old
 * tokens.colors or tokens.visualContract palettes. These are deprecated and
 * will be removed once all callsites migrate to tokens.visual or CSS tokens.
 *
 * @deprecated Use tokens.visual or CSS --care-* custom properties instead.
 */
export const legacyVisualContract = {
  sidebarWidth: tokens.visual.sidebarWidthExpanded,
  topbarHeight: tokens.visual.topbarHeight,
  pageHorizontalPadding: tokens.visual.pageHPadding,
  cardRadius: tokens.visual.radiusCard,
  sectionCardRadius: tokens.visual.radiusCard,
  primaryCta: tokens.visual.primaryCta,
  warningCta: tokens.visual.warningCta,
  /** @deprecated background values come from CSS --background token */
  background: "#070B18",
  surface1: "#0E1424",
  surface2: "#121A2C",
} as const;
