import { apiClient } from "./apiClient";

export type RegiekamerPriorityBand = "critical" | "high" | "medium" | "low";
export type RegiekamerOwnershipRole = "gemeente" | "zorgaanbieder" | "regie";
export type RegiekamerIssueType = "blockers" | "risks" | "alerts" | "SLA" | "rejection" | "intake";

export interface RegiekamerOverviewAction {
  action: string;
  label: string;
  priority: RegiekamerPriorityBand;
  reason: string;
}

export interface RegiekamerOverviewIssue {
  code: string;
  severity: RegiekamerPriorityBand | "warning" | "info";
  message?: string;
  title?: string;
  recommended_action?: string;
  blocking_actions?: string[];
  evidence?: Record<string, unknown>;
}

export interface RegiekamerDecisionOverviewItem {
  case_id: number | string;
  case_reference: string;
  title: string;
  current_state: string;
  phase: string;
  urgency: string;
  urgency_applied?: boolean;
  urgency_applied_since?: string | null;
  placement_pressure_band?: string | null;
  placement_pressure_label?: string | null;
  placement_pressure_reason?: string | null;
  placement_pressure_implication?: string | null;
  assigned_provider: string;
  next_best_action: RegiekamerOverviewAction | null;
  top_blocker: RegiekamerOverviewIssue | null;
  top_risk: RegiekamerOverviewIssue | null;
  top_alert: RegiekamerOverviewIssue | null;
  blocker_count: number;
  risk_count: number;
  alert_count: number;
  priority_score: number;
  age_hours: number | null;
  hours_in_current_state: number | null;
  issue_tags?: RegiekamerIssueType[];
  responsible_role?: RegiekamerOwnershipRole;
  zorgbehoefte_categorie?: string;
  zorgbehoefte_categorie_code?: string;
  zorgbehoefte_specifiek?: string;
  zorgbehoefte_specifiek_code?: string;
  taxonomie_lijn?: string;
  taxonomie_code_lijn?: string;
}

export interface RegiekamerDecisionOverviewTotals {
  active_cases: number;
  critical_blockers: number;
  high_priority_alerts: number;
  provider_sla_breaches: number;
  repeated_rejections: number;
  intake_delays: number;
  urgency_applications_open?: number;
}

/** Operationele wachtrijen op Coördinatie — backend `governance_queues`. */
export interface RegiekamerGovernanceQueues {
  wijkteam_intakes_needing_assessment: string[];
  zorgvraag_beoordeling_open: string[];
  cases_waiting_gemeente_validation: string[];
  budget_approvals_pending: string[];
  provider_transition_requests_pending: string[];
  evaluations_upcoming: string[];
  evaluations_overdue: string[];
  active_placements_care_intensity_changed: string[];
}

export interface RegiekamerDecisionOverview {
  generated_at: string;
  totals: RegiekamerDecisionOverviewTotals;
  items: RegiekamerDecisionOverviewItem[];
  governance_queues?: RegiekamerGovernanceQueues;
}

export async function fetchRegiekamerDecisionOverview(): Promise<RegiekamerDecisionOverview> {
  return apiClient.get<RegiekamerDecisionOverview>("/care/api/regiekamer/decision-overview/");
}
