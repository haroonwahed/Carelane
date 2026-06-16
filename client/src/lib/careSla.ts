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

/**
 * SLA-doel (uren) voor een case-status string — voor pagina's op het SpaCase /
 * WorkflowCaseView datamodel (status-strings i.p.v. coordination-phase ids).
 * Spiegelt dezelfde grenzen als `getSlaTarget`; geeft de strengste toepasselijke
 * grens, of null als er geen formele SLA voor die status geldt (bijv. matching).
 */
export function slaTargetHoursForStatus(status: string, urgency?: string): number | null {
  const s = (status || "").toLowerCase();
  // SpaCase maps "warning" -> "Hoog" (high); treat it as urgent alongside high/critical.
  const isUrgent = urgency === "high" || urgency === "critical" || urgency === "warning";
  const candidates: number[] = [];
  if (isUrgent) candidates.push(SLA_TARGET_HOURS.urgentIdle);
  if (s === "casus" || s === "samenvatting" || s === "draft" || s === "draft_case") {
    candidates.push(SLA_TARGET_HOURS.aanmelding);
  }
  if (s === "provider_beoordeling" || s === "aanbieder_beoordeling") {
    candidates.push(SLA_TARGET_HOURS.providerResponse);
  }
  if (s === "plaatsing" || s === "intake") {
    candidates.push(SLA_TARGET_HOURS.intakeStart);
  }
  return candidates.length === 0 ? null : Math.min(...candidates);
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

/**
 * Generic SLA countdown from raw hours — reusable by any care page that has an
 * elapsed duration and a target, not just coordination-overview items. Pass
 * `targetHours = null` for "no formal SLA" (shows elapsed time, muted).
 * `contextLabel` is the "in <phase>" suffix shown when there is no SLA.
 */
export function slaCountdownFromHours(
  elapsedHours: number,
  targetHours: number | null,
  contextLabel?: string,
): SlaCountdown {
  if (targetHours == null) {
    return {
      hasSla: false,
      status: "none",
      remainingHours: Number.POSITIVE_INFINITY,
      label: formatDurationShort(elapsedHours),
      sublabel: contextLabel ? `in ${contextLabel}` : "",
      className: "text-muted-foreground",
    };
  }

  const remaining = targetHours - elapsedHours;
  const soonThreshold = Math.max(8, targetHours * 0.2);

  if (remaining <= 0) {
    return {
      hasSla: true,
      status: "breached",
      remainingHours: remaining,
      label: `${formatDurationShort(remaining)} te laat`,
      sublabel: `SLA ${targetHours}u`,
      className: "font-semibold text-care-urgent-solid",
    };
  }
  if (remaining <= soonThreshold) {
    return {
      hasSla: true,
      status: "soon",
      remainingHours: remaining,
      label: `nog ${formatDurationShort(remaining)}`,
      sublabel: `SLA ${targetHours}u`,
      className: "font-medium text-care-warning-solid",
    };
  }
  return {
    hasSla: true,
    status: "ok",
    remainingHours: remaining,
    label: `nog ${formatDurationShort(remaining)}`,
    sublabel: `SLA ${targetHours}u`,
    className: "text-care-success-solid",
  };
}

export function getSlaCountdown(item: CoordinationDecisionOverviewItem): SlaCountdown {
  const elapsed = item.hours_in_current_state ?? item.age_hours ?? 0;
  const target = getSlaTarget(item);
  return slaCountdownFromHours(elapsed, target ? target.hours : null, slaPhaseLabel(item.phase));
}
