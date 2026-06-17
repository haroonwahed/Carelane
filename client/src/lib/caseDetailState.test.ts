import { describe, expect, it } from "vitest";
import type { DecisionEvaluation } from "./decisionEvaluation";
import { resolveCaseDetailState, type ResolveCaseDetailStateInput } from "./caseDetailState";

function makeEvaluation(overrides: Partial<DecisionEvaluation> = {}): DecisionEvaluation {
  return {
    case_id: "C-1",
    current_state: "DRAFT_CASE",
    phase: "casus",
    next_best_action: null,
    blockers: [],
    risks: [],
    alerts: [],
    allowed_actions: [],
    blocked_actions: [],
    decision_context: {
      required_data_complete: false,
      has_summary: false,
      has_matching_result: false,
      latest_match_confidence: null,
      provider_review_status: "NONE",
      provider_rejection_count: 0,
      latest_rejection_reason: "",
      placement_confirmed: false,
      intake_started: false,
      case_age_hours: 1,
      hours_in_current_state: 1,
      urgency: "normal",
      capacity_signals: [],
      selected_provider_id: null,
      selected_provider_name: null,
    },
    timeline_signals: { latest_event_type: "", latest_event_at: "", recent_events: [] },
    ...overrides,
  };
}

function baseInput(over: Partial<ResolveCaseDetailStateInput> = {}): ResolveCaseDetailStateInput {
  return {
    evaluation: makeEvaluation(),
    workflowPhase: "aanmelding",
    resolvedState: "DRAFT_CASE",
    missingFieldsCount: 0,
    summaryNeedsCaseCompletion: false,
    phaseBadgeLabel: "Aanmelding",
    phaseSubStatusLabel: null,
    canStartMatching: false,
    matchingBlockedReason: "Matching is nog niet beschikbaar.",
    municipalityOwnerLabel: "Gemeente Utrecht",
    stepOwner: "Aanmelder",
    selectedProviderName: null,
    selectedProviderId: null,
    downstreamActionHolderLabel: "Gemeente Utrecht",
    downstreamWaitingOnLabel: "Wacht op doorstroming",
    nbaImperativeLabel: null,
    nbaReason: "reden",
    hasNextBestAction: false,
    externalInfoNeeded: false,
    decisionLoading: false,
    actionPending: false,
    canViewArrangement: true,
    ...over,
  };
}

describe("resolveCaseDetailState", () => {
  it("State 1 — nieuwe onvolledige casus toont nooit matching", () => {
    const vm = resolveCaseDetailState(baseInput({ missingFieldsCount: 3 }));
    expect(vm.workflowPhase).toBe("aanmelding");
    expect(vm.operationalStatus).toBe("onvolledig");
    expect(vm.statusBadgeLabel).toBe("Onvolledig");
    expect(vm.title).toBe("Casus is nog niet compleet");
    expect(vm.primaryCta?.kind).toBe("complete_case");
    expect(vm.showArrangementAdvice).toBe(false);
    expect(vm.showMatchingContent).toBe(false);
    expect(vm.showBlockingState).toBe(false);
  });

  it("toont secundaire 'Vraag gegevens op' alleen als externe info nodig is", () => {
    expect(resolveCaseDetailState(baseInput({ missingFieldsCount: 1 })).secondaryCtaLabel).toBeNull();
    expect(
      resolveCaseDetailState(baseInput({ missingFieldsCount: 1, externalInfoNeeded: true })).secondaryCtaLabel,
    ).toBe("Vraag gegevens op");
  });

  it("State 2 — overzicht ontbreekt → concrete actie (geen eindeloze verwerking)", () => {
    const vm = resolveCaseDetailState(
      baseInput({
        evaluation: makeEvaluation({
          decision_context: {
            ...makeEvaluation().decision_context,
            required_data_complete: true,
            has_summary: false,
            matching_summary_ready: false,
          },
        }),
      }),
    );
    expect(vm.operationalStatus).toBe("overzicht_nodig");
    expect(vm.statusBadgeLabel).toBe("Onvolledig");
    expect(vm.title).toBe("Casusomschrijving ontbreekt");
    expect(vm.primaryCta?.kind).toBe("edit_summary");
    expect(vm.primaryCta?.disabled).toBe(false);
    expect(vm.showProcessingState).toBe(false);
    expect(vm.showMatchingContent).toBe(false);
  });

  it("verwerking-pad verschijnt niet meer als een uitgeschakelde spinner", () => {
    const vm = resolveCaseDetailState(
      baseInput({
        evaluation: makeEvaluation({
          decision_context: {
            ...makeEvaluation().decision_context,
            required_data_complete: true,
            has_summary: false,
            matching_summary_ready: false,
          },
        }),
      }),
    );
    expect(vm.primaryCta?.kind).not.toBe("processing");
    expect(vm.primaryCta?.disabled).toBe(false);
  });

  it("State 3 — klaar voor matching, CTA = 'Start matching' (nooit 'Zoek zorgcapaciteit')", () => {
    const vm = resolveCaseDetailState(
      baseInput({
        canStartMatching: true,
        evaluation: makeEvaluation({
          current_state: "SUMMARY_READY",
          decision_context: { ...makeEvaluation().decision_context, required_data_complete: true, has_summary: true },
        }),
      }),
    );
    expect(vm.operationalStatus).toBe("klaar_voor_matching");
    expect(vm.title).toBe("Casus is klaar voor matching");
    expect(vm.primaryCta?.label).toBe("Start matching");
    expect(vm.primaryCta?.kind).toBe("start_matching");
    expect(vm.primaryCta?.disabled).toBe(false);
    expect(vm.canTransitionToMatching).toBe(true);
    expect(vm.showMatchingContent).toBe(false);
  });

  it("State 3 — CTA disabled wanneer backend transitie nog niet toestaat", () => {
    const vm = resolveCaseDetailState(
      baseInput({
        canStartMatching: false,
        evaluation: makeEvaluation({
          decision_context: { ...makeEvaluation().decision_context, required_data_complete: true, has_summary: true },
        }),
      }),
    );
    expect(vm.primaryCta?.disabled).toBe(true);
    expect(vm.primaryCta?.disabledReason).toBe("Matching is nog niet beschikbaar.");
  });

  it("State 4 — matching gestart toont matching-content en arrangementadvies", () => {
    const vm = resolveCaseDetailState(
      baseInput({
        workflowPhase: "matching",
        resolvedState: "MATCHING_READY",
        phaseBadgeLabel: "Matching",
        hasNextBestAction: true,
        nbaImperativeLabel: "Controleer matchvoorstel",
        evaluation: makeEvaluation({
          current_state: "MATCHING_READY",
          phase: "matching",
          decision_context: {
            ...makeEvaluation().decision_context,
            required_data_complete: true,
            has_summary: true,
            has_matching_result: true,
          },
        }),
      }),
    );
    expect(vm.workflowPhase).toBe("matching");
    expect(vm.showMatchingContent).toBe(true);
    expect(vm.showArrangementAdvice).toBe(true);
    expect(vm.operationalStatus).toBe("wacht_op_coordinatie");
    expect(vm.showBlockingState).toBe(false);
  });

  it("MATCHING_NOT_READY is geen blokkade-waarschuwing in matching", () => {
    const vm = resolveCaseDetailState(
      baseInput({
        workflowPhase: "matching",
        resolvedState: "MATCHING_READY",
        selectedProviderId: "P-1",
        evaluation: makeEvaluation({
          current_state: "MATCHING_READY",
          phase: "matching",
          blockers: [
            { code: "MATCHING_NOT_READY", severity: "medium", message: "Matching is nog niet gestart.", blocking_actions: [] },
          ],
          decision_context: {
            ...makeEvaluation().decision_context,
            required_data_complete: true,
            has_summary: true,
            selected_provider_id: "P-1",
          },
        }),
      }),
    );
    expect(vm.operationalStatus).not.toBe("geblokkeerd");
    expect(vm.showBlockingState).toBe(false);
    expect(vm.statusHint).toBeNull();
  });

  it("Echte blokkade toont 'Geblokkeerd' met coördinatieregel", () => {
    const vm = resolveCaseDetailState(
      baseInput({
        workflowPhase: "aanbiederreactie",
        resolvedState: "PROVIDER_REJECTED",
        phaseBadgeLabel: "Aanbiederreactie",
        evaluation: makeEvaluation({
          current_state: "PROVIDER_REJECTED",
          phase: "aanbieder_beoordeling",
          blockers: [
            { code: "PROVIDER_REJECTION", severity: "high", message: "Aanbieder heeft afgewezen.", blocking_actions: [] },
          ],
          decision_context: { ...makeEvaluation().decision_context, required_data_complete: true, has_summary: true },
        }),
      }),
    );
    expect(vm.operationalStatus).toBe("geblokkeerd");
    expect(vm.statusBadgeLabel).toBe("Geblokkeerd");
    expect(vm.statusHint).toBe("Aanbieder heeft afgewezen");
    expect(vm.showBlockingState).toBe(true);
  });

  it("MISSING_SUMMARY-blokkade overschrijft een 'matching' fase-label naar Aanmelding", () => {
    const vm = resolveCaseDetailState(
      baseInput({
        workflowPhase: "matching",
        resolvedState: "MATCHING_READY",
        summaryNeedsCaseCompletion: true,
        phaseBadgeLabel: "Matching",
        evaluation: makeEvaluation({
          current_state: "MATCHING_READY",
          phase: "matching",
          blockers: [
            { code: "MISSING_SUMMARY", severity: "critical", message: "Samenvatting ontbreekt.", blocking_actions: ["START_MATCHING"] },
          ],
          decision_context: { ...makeEvaluation().decision_context, required_data_complete: true, has_summary: true },
        }),
      }),
    );
    expect(vm.workflowPhase).toBe("aanmelding");
    expect(vm.phaseLabel).toBe("Aanmelding");
    expect(vm.operationalStatus).toBe("onvolledig");
    expect(vm.showMatchingContent).toBe(false);
  });

  it("Geen evaluatie (laden) vergrendelt geen matching-secties", () => {
    const vm = resolveCaseDetailState(baseInput({ evaluation: null }));
    expect(vm.showMatchingContent).toBe(true);
    expect(vm.operationalStatus).not.toBe("onvolledig");
  });
});
