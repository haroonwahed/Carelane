import type { CoordinationDecisionOverviewItem } from "./coordinationDecisionOverview";
import { normalizeApiPhaseId } from "./decisionPhaseUi";

/**
 * SLA-grenzen per fase — spiegelt DECISION_ENGINE_THRESHOLDS in
 * contracts/decision_engine.py, zodat de UI-aftelling en de backend-breach
 * exact dezelfde grenzen hanteren.
 */
export const SLA_TARGET_HOURS = {
  aanmelding: 24, // aanmelding_sla_hours — Aanmelding (casus + samenvatting)
  urgentIdle: 48, // urgent_idle_hours — HIGH/CRISIS in elke fase
  providerResponse: 72, // provider_response_sla_hours — Aanbiederreactie
  intakeStart: 120, // intake_start_sla_days (5d) — Plaatsing/Intake
} as const;

export type SlaStatus = "breached" | "soon" | "ok" | "none";

export const SLA_STATUS_RANK: Record<SlaStatus, number> = { breached: 0, soon: 1, ok: 2, none: 3 };

/**
 * Phase-label voor SLA-doeleinden, ontkoppeld van de phase-badge styler
 * (getPhaseStyleInfo). Spiegelt dezelfde fase-mapping: casus/samenvatting ->
 * Aanmelding, matching/gemeente_validatie/wacht_op_validatie -> Matching,
 * aanbieder_beoordeling -> Aanbiederreactie, plaatsing -> Plaatsing,
 * intake -> Intake.
 */
function slaPhaseLabel(phase: string): string {
  const normalized = normalizeApiPhaseId(phase) as string;
  const map: Record<string, string> = {
    casus: "Aanmelding",
    samenvatting: "Aanmelding",
    matching: "Matching",
    gemeente_validatie: "Matching",
    wacht_op_validatie: "Matching",
    aanbieder_beoordeling: "Aanbiederreactie",
    plaatsing: "Plaatsing",
    intake: "Intake",
  };
  return map[normalized] ?? normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function getSlaTarget(item: CoordinationDecisionOverviewItem): { hours: number; basis: string } | null {
  const isUrgent = item.urgency === "high" || item.urgency === "critical";
  const phaseLabel = slaPhaseLabel(item.phase);
  const candidates: Array<{ hours: number; basis: string }> = [];
  if (isUrgent) candidates.push({ hours: SLA_TARGET_HOURS.urgentIdle, basis: "Urgentie" });
  if (phaseLabel === "Aanmelding") candidates.push({ hours: SLA_TARGET_HOURS.aanmelding, basis: "Aanmelding" });
  if (phaseLabel === "Aanbiederreactie") candidates.push({ hours: SLA_TARGET_HOURS.providerResponse, basis: "Aanbiederreactie" });
  if (phaseLabel === "Plaatsing" || phaseLabel === "Intake") candidates.push({ hours: SLA_TARGET_HOURS.intakeStart, basis: "Intake-start" });
  if (candidates.length === 0) return null;
  return candidates.reduce((a, b) => (a.hours <= b.hours ? a : b));
}

export function formatDurationShort(hours: number): string {
  const h = Math.abs(hours);
  if (h < 1) return "<1u";
  if (h < 24) return `${Math.round(h)}u`;
  const days = Math.floor(h / 24);
  const rem = Math.round(h % 24);
  if (days >= 3 || rem === 0) return `${days}d`;
  return `${days}d ${rem}u`;
}

export interface SlaCountdown {
  hasSla: boolean;
  status: SlaStatus;
  remainingHours: number;
  label: string;
  sublabel: string;
  className: string;
}

export function getSlaCountdown(item: CoordinationDecisionOverviewItem): SlaCountdown {
  const elapsed = item.hours_in_current_state ?? item.age_hours ?? 0;
  const phaseLabel = slaPhaseLabel(item.phase);
  const target = getSlaTarget(item);

  if (!target) {
    return {
      hasSla: false,
      status: "none",
      remainingHours: Number.POSITIVE_INFINITY,
      label: formatDurationShort(elapsed),
      sublabel: `in ${phaseLabel}`,
      className: "text-muted-foreground",
    };
  }

  const remaining = target.hours - elapsed;
  const soonThreshold = Math.max(8, target.hours * 0.2);

  if (remaining <= 0) {
    return {
      hasSla: true,
      status: "breached",
      remainingHours: remaining,
      label: `${formatDurationShort(remaining)} te laat`,
      sublabel: `SLA ${target.hours}u`,
      className: "font-semibold text-care-urgent-solid",
    };
  }
  if (remaining <= soonThreshold) {
    return {
      hasSla: true,
      status: "soon",
      remainingHours: remaining,
      label: `nog ${formatDurationShort(remaining)}`,
      sublabel: `SLA ${target.hours}u`,
      className: "font-medium text-care-warning-solid",
    };
  }
  return {
    hasSla: true,
    status: "ok",
    remainingHours: remaining,
    label: `nog ${formatDurationShort(remaining)}`,
    sublabel: `SLA ${target.hours}u`,
    className: "text-care-success-solid",
  };
}
