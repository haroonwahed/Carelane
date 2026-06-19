/**
 * Carelane page archetypes — one per route, controls layout contract (consolidation phase).
 * @see .cursor/rules/operational-design-laws.mdc
 */

export const CARE_PAGE_ARCHETYPES = [
  "command",
  "queue",
  "workspace",
  "network",
  "exception",
] as const;

export type CarePageArchetype = (typeof CARE_PAGE_ARCHETYPES)[number];

/** Routes using CarePageScaffold must declare exactly one archetype. */
export const ARCHETYPE_CONTRACT: Record<
  CarePageArchetype,
  {
    summary: string;
    allowsTelemetryStrip: boolean;
    allowsKpiCardGrid: boolean;
    dominantNbaRequired: boolean;
    primaryLayout: string;
  }
> = {
  command: {
    summary: "Operational command — triage, escalation, doorstroom telemetry",
    allowsTelemetryStrip: true,
    allowsKpiCardGrid: false,
    dominantNbaRequired: true,
    primaryLayout: "dominant action → compact telemetry → queue",
  },
  queue: {
    summary: "Workflow execution — scannable rows, filters secondary",
    allowsTelemetryStrip: false,
    allowsKpiCardGrid: false,
    dominantNbaRequired: true,
    primaryLayout: "dominant action → filters → worklist rows",
  },
  workspace: {
    summary: "Contextual judgment — single casus progression",
    allowsTelemetryStrip: false,
    allowsKpiCardGrid: false,
    dominantNbaRequired: true,
    primaryLayout: "progress → NBA → progressive disclosure",
  },
  network: {
    summary: "Ecosystem reference — providers, regio, gemeenten",
    allowsTelemetryStrip: false,
    allowsKpiCardGrid: false,
    dominantNbaRequired: true,
    primaryLayout: "context bar → directory rows / map",
  },
  exception: {
    summary: "Audit, export, access — non-orchestration surfaces",
    allowsTelemetryStrip: false,
    allowsKpiCardGrid: false,
    dominantNbaRequired: true,
    primaryLayout: "single purpose list or evidence",
  },
};
