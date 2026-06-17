/**
 * Centrale state-resolver voor de casusdetailpagina.
 *
 * Eén bron van waarheid voor fase, operationele status, titel, toelichting,
 * CTA, actiehouder en zichtbaarheid van secties. Badges, titel, CTA, secties
 * en rechterkolom lezen allemaal uit het resultaat van `resolveCaseDetailState`,
 * zodat ze nooit tegenstrijdig kunnen zijn.
 *
 * De backend (decision-evaluation) blijft de bron van waarheid: deze resolver
 * vertaalt alleen — hij bepaalt nooit zelf of een transitie is toegestaan.
 */

import type { CasusWorkspaceStatusVariant } from "../components/care/CareDesignPrimitives";
import type {
  DecisionBlocker,
  DecisionEvaluation,
  DecisionEvaluationContext,
} from "./decisionEvaluation";
import { DECISION_UI_PHASE_LABELS, type DecisionUiPhaseId } from "./decisionPhaseUi";

/**
 * Blokkades die GEEN echte procesblokkade zijn. Ze beschrijven de interne
 * voortgang binnen de Aanmeldingsfase en mogen nooit als "Geblokkeerd" of als
 * waarschuwing worden getoond:
 *  - MISSING_SUMMARY  → casus is simpelweg nog niet compleet (State 1/2)
 *  - MATCHING_NOT_READY → "Matching is nog niet gestart" is geen probleemstatus
 */
const NON_BLOCKING_CODES = new Set(["MISSING_SUMMARY", "MATCHING_NOT_READY"]);

export function isRealBlocker(blocker: DecisionBlocker): boolean {
  return !NON_BLOCKING_CODES.has(blocker.code);
}

const BLOCKER_CODE_HEADLINES: Record<string, string> = {
  MISSING_SUMMARY: "Verplichte casusgegevens ontbreken",
  MATCHING_NOT_READY: "Matching kan nog niet starten",
  GEO_MISSING: "Locatiegegevens ontbreken",
  PROVIDER_REJECTION: "Aanbieder heeft afgewezen",
  BUDGET_BLOCKED: "Budget vereist goedkeuring",
};

export function blockerHeadline(code: string, fallbackMessage: string): string {
  if (BLOCKER_CODE_HEADLINES[code]) return BLOCKER_CODE_HEADLINES[code];
  const lower = fallbackMessage.toLowerCase();
  if (lower.includes("samenvatting") || lower.includes("aanmelding")) {
    return "Verplichte casusgegevens ontbreken";
  }
  return "Aandachtspunt";
}

export type CaseOperationalStatus =
  | "onvolledig"
  | "overzicht_nodig"
  | "verwerking"
  | "klaar_voor_matching"
  | "matching_actief"
  | "wacht_op_aanbieder"
  | "wacht_op_coordinatie"
  | "geblokkeerd"
  | "actief";

export type CaseCtaKind =
  | "complete_case"
  | "edit_summary"
  | "processing"
  | "start_matching"
  | "nba"
  | "none";

export interface CaseDetailPrimaryCta {
  label: string;
  kind: CaseCtaKind;
  disabled: boolean;
  disabledReason: string | null;
}

export interface CaseDetailViewModel {
  workflowPhase: DecisionUiPhaseId;
  /** Fase-chip label, consistent met workflowPhase (nooit "Matching" bij een onvolledige aanmelding). */
  phaseLabel: string;
  operationalStatus: CaseOperationalStatus;
  statusVariant: CasusWorkspaceStatusVariant;
  /** Korte badge-tekst zoals "Onvolledig", "Klaar voor matching", "Geblokkeerd". */
  statusBadgeLabel: string;
  /** Extra context-badge naast de hoofdbadge (alleen bij een echte blokkade). */
  statusHint: string | null;
  /** Eénregelige procesregel onder de titel. */
  statusLine: string;
  title: string | null;
  description: string;
  primaryCta: CaseDetailPrimaryCta | null;
  secondaryCtaLabel: string | null;
  actionOwner: string;
  waitingOnLabel: string;
  showArrangementAdvice: boolean;
  showMatchingContent: boolean;
  showProcessingState: boolean;
  showBlockingState: boolean;
  canTransitionToMatching: boolean;
}

export interface ResolveCaseDetailStateInput {
  evaluation: DecisionEvaluation | null;
  /** UI-fase afgeleid uit backend `phase` (resolveCaseExecutionPhasePresentation). */
  workflowPhase: DecisionUiPhaseId;
  resolvedState: string;
  missingFieldsCount: number;
  /**
   * Backend-signaal dat de aanmelding nog niet compleet is: een MISSING_SUMMARY
   * blokkade of een GENERATE_SUMMARY/COMPLETE_CASE_DATA next-best-action.
   * Dit overschrijft de grove `phase`-string (een MISSING_SUMMARY-blokkade is
   * autoritatiever dan een fase-label dat al "matching" zegt).
   */
  summaryNeedsCaseCompletion: boolean;
  /** Fase-chip onderdelen uit resolveCaseExecutionPhasePresentation. */
  phaseBadgeLabel: string;
  phaseSubStatusLabel: string | null;
  /** Mag de casus volgens de backend naar matching? (allowed_actions bevat START_MATCHING) */
  canStartMatching: boolean;
  matchingBlockedReason: string;
  /** Eigenaarslabels. */
  municipalityOwnerLabel: string;
  stepOwner: string;
  selectedProviderName: string | null;
  selectedProviderId: string | null;
  /** Actiehouder/wachtlabel voor de matching+ fasen (reeds berekend door bestaande helpers). */
  downstreamActionHolderLabel: string;
  downstreamWaitingOnLabel: string;
  /** Imperatief NBA-label + reden voor matching+ fasen. */
  nbaImperativeLabel: string | null;
  nbaReason: string;
  hasNextBestAction: boolean;
  /** Externe info nodig → toon secundaire "Vraag gegevens op". */
  externalInfoNeeded: boolean;
  /** UI-state. */
  decisionLoading: boolean;
  actionPending: boolean;
  /** Rol bepaalt of arrangementadvies überhaupt zichtbaar is. */
  canViewArrangement: boolean;
}

function isProviderReviewState(state: string): boolean {
  return state === "PROVIDER_REVIEW_PENDING" || state === "BUDGET_REVIEW_PENDING";
}

function describeMissing(count: number): string {
  if (count <= 0) {
    return "Vul de ontbrekende verplichte onderdelen aan om matching te starten.";
  }
  if (count === 1) {
    return "Nog 1 verplicht onderdeel ontbreekt — vul het aan om matching te starten.";
  }
  return `Nog ${count} verplichte onderdelen ontbreken — vul ze aan om matching te starten.`;
}

/**
 * Resolve de volledige presentatiestaat van de casusdetailpagina.
 *
 * De fase (workflowPhase) is leidend:
 *  - In `aanmelding` zijn alleen State 1 (onvolledig), State 2 (verwerking) en
 *    State 3 (klaar voor matching) mogelijk. Matching-content, arrangementadvies,
 *    "Geblokkeerd" en "Zoek zorgcapaciteit" zijn hier altijd verborgen.
 *  - Vanaf `matching` (State 4+) volgt de presentatie de backend (NBA + blokkades).
 */
export function resolveCaseDetailState(input: ResolveCaseDetailStateInput): CaseDetailViewModel {
  const {
    evaluation,
    workflowPhase,
    resolvedState,
    missingFieldsCount,
    summaryNeedsCaseCompletion,
    phaseBadgeLabel,
    phaseSubStatusLabel,
    canStartMatching,
    matchingBlockedReason,
    municipalityOwnerLabel,
    stepOwner,
    selectedProviderName,
    downstreamActionHolderLabel,
    downstreamWaitingOnLabel,
    nbaImperativeLabel,
    nbaReason,
    hasNextBestAction,
    externalInfoNeeded,
    decisionLoading,
    actionPending,
    canViewArrangement,
  } = input;

  const ctx: DecisionEvaluationContext | undefined = evaluation?.decision_context;
  const requiredComplete = ctx?.required_data_complete ?? false;
  const hasSummary = ctx?.has_summary ?? false;
  // De echte matchinggate (backend: workflow_summary_can_bootstrap). Wanneer deze
  // gereed is kan matching starten, ook zonder losse vrije-tekst samenvatting —
  // dan is de casus "klaar" (State 3), niet "in verwerking" (State 2).
  const matchingSummaryReady = ctx?.matching_summary_ready ?? false;
  const realBlockers = (evaluation?.blockers ?? []).filter(isRealBlocker);
  const dominantRealBlocker = realBlockers[0] ?? null;

  // De aanmelding is leidend zolang de fase `aanmelding` is óf de backend nog
  // een onvolledige aanmelding signaleert. Zo loopt de UI nooit vooruit op de
  // workflow (geen matching-content/arrangementadvies bij een onvolledige casus).
  // Vereist wél een geladen evaluatie: zonder backendsignaal claimen we geen
  // (in)complete-status — anders zou de UI tijdens het laden ten onrechte
  // matching-secties vergrendelen.
  const inAanmelding =
    evaluation != null && (workflowPhase === "aanmelding" || summaryNeedsCaseCompletion);

  // ---- Fase Aanmelding: alleen State 1/2/3 ------------------------------
  if (inAanmelding) {
    const aanmeldingPhaseLabel = DECISION_UI_PHASE_LABELS.aanmelding;
    const base = {
      workflowPhase: "aanmelding" as DecisionUiPhaseId,
      phaseLabel: aanmeldingPhaseLabel,
      showArrangementAdvice: false,
      showMatchingContent: false,
      canTransitionToMatching: canStartMatching,
      statusHint: null as string | null,
      secondaryCtaLabel: null as string | null,
    };

    // State 1 — Aanmelding onvolledig
    //  - verplichte gegevens ontbreken, OF
    //  - de backend signaleert nog een onvolledige aanmelding (MISSING_SUMMARY /
    //    GENERATE_SUMMARY) terwijl er geen actieve verwerking loopt.
    if (
      !requiredComplete
      || missingFieldsCount > 0
      || (summaryNeedsCaseCompletion && hasSummary)
    ) {
      return {
        ...base,
        operationalStatus: "onvolledig",
        statusVariant: "onvolledig",
        statusBadgeLabel: "Onvolledig",
        statusLine: "Matching nog niet gestart.",
        title: "Casus is nog niet compleet",
        description: describeMissing(missingFieldsCount),
        primaryCta: {
          label: "Maak casus compleet",
          kind: "complete_case",
          disabled: actionPending,
          disabledReason: null,
        },
        secondaryCtaLabel: externalInfoNeeded ? "Vraag gegevens op" : null,
        actionOwner: municipalityOwnerLabel,
        waitingOnLabel: "Aanmelding wordt aangevuld",
        showProcessingState: false,
        showBlockingState: false,
      };
    }

    // State 2 — Casusoverzicht ontbreekt (verplichte gegevens compleet, maar de
    // matchinggate kan niet worden opgebouwd en er is geen samenvatting).
    //
    // Er is geen achtergrondproces dat het overzicht genereert: het wordt afgeleid
    // uit de casusomschrijving. Zonder voldoende omschrijving blijft de casus dus
    // hangen. We presenteren dit daarom als een concrete menselijke actie
    // ("Vul casusomschrijving aan"), niet als een eindeloze "Verwerking bezig".
    if (!matchingSummaryReady && !hasSummary) {
      return {
        ...base,
        operationalStatus: "overzicht_nodig",
        statusVariant: "onvolledig",
        statusBadgeLabel: "Onvolledig",
        statusLine: "Matching nog niet gestart.",
        title: "Casusomschrijving ontbreekt",
        description:
          "Voeg een korte casusomschrijving toe zodat het casusoverzicht kan worden opgebouwd en matching kan starten.",
        primaryCta: {
          label: "Vul casusomschrijving aan",
          kind: "edit_summary",
          disabled: actionPending,
          disabledReason: null,
        },
        secondaryCtaLabel: externalInfoNeeded ? "Vraag gegevens op" : null,
        actionOwner: municipalityOwnerLabel || stepOwner,
        waitingOnLabel: "Casusomschrijving wordt aangevuld",
        showProcessingState: false,
        showBlockingState: false,
      };
    }

    // State 3 — Klaar voor matching
    return {
      ...base,
      operationalStatus: "klaar_voor_matching",
      statusVariant: "klaar",
      statusBadgeLabel: "Klaar voor matching",
      statusLine: "Klaar voor matching.",
      title: "Casus is klaar voor matching",
      description: "Alle vereiste gegevens zijn gecontroleerd en verwerkt.",
      primaryCta: {
        label: "Start matching",
        kind: "start_matching",
        disabled: !canStartMatching || decisionLoading || actionPending,
        disabledReason: canStartMatching ? null : matchingBlockedReason,
      },
      actionOwner: municipalityOwnerLabel || stepOwner,
      waitingOnLabel: "Wacht op start matching",
      showProcessingState: false,
      showBlockingState: false,
    };
  }

  // ---- Fase Matching en verder (State 4+) -------------------------------
  const showArrangementAdvice = canViewArrangement;
  const showMatchingContent = true;
  const downstreamPhaseLabel = phaseSubStatusLabel
    ? `${phaseBadgeLabel} · ${phaseSubStatusLabel}`
    : phaseBadgeLabel;

  // Echte blokkade → "Geblokkeerd"
  if (dominantRealBlocker) {
    const headline = blockerHeadline(dominantRealBlocker.code, dominantRealBlocker.message);
    return {
      workflowPhase,
      phaseLabel: downstreamPhaseLabel,
      operationalStatus: "geblokkeerd",
      statusVariant: "blocked",
      statusBadgeLabel: "Geblokkeerd",
      statusHint: headline,
      statusLine: "Wacht op coördinatieactie.",
      title: headline,
      description: dominantRealBlocker.message,
      primaryCta: hasNextBestAction
        ? {
            label: nbaImperativeLabel ?? "Volgende actie",
            kind: "nba",
            disabled: decisionLoading || actionPending,
            disabledReason: dominantRealBlocker.message,
          }
        : null,
      secondaryCtaLabel: null,
      actionOwner: downstreamActionHolderLabel || stepOwner,
      waitingOnLabel: downstreamWaitingOnLabel,
      showArrangementAdvice,
      showMatchingContent,
      showProcessingState: false,
      showBlockingState: true,
      canTransitionToMatching: false,
    };
  }

  // Wachtstatussen met een concrete coördinatie-/aanbiedertaak
  let operationalStatus: CaseOperationalStatus = "actief";
  let statusLine = "Stap is actief.";
  if (isProviderReviewState(resolvedState)) {
    operationalStatus = "wacht_op_aanbieder";
    statusLine = "Wacht op reactie aanbieder.";
  } else if (resolvedState === "MATCHING_READY" && !input.selectedProviderId) {
    operationalStatus = "wacht_op_coordinatie";
    statusLine = "Wacht op toetsing.";
  } else if (workflowPhase === "matching") {
    operationalStatus = "matching_actief";
    statusLine = "Matching is actief.";
  }

  return {
    workflowPhase,
    phaseLabel: downstreamPhaseLabel,
    operationalStatus,
    statusVariant: operationalStatus === "actief" || operationalStatus === "matching_actief" ? "active" : "progress",
    statusBadgeLabel: operationalStatus === "matching_actief" ? "Matching actief" : "Actief",
    statusHint: null,
    statusLine,
    title: hasNextBestAction ? (nbaImperativeLabel ?? "Volgende actie") : "Casus in behandeling",
    description: hasNextBestAction ? nbaReason : "Deze stap ondersteunt veilige doorstroming.",
    primaryCta: hasNextBestAction
      ? {
          label: nbaImperativeLabel ?? "Volgende actie",
          kind: "nba",
          disabled: decisionLoading || actionPending,
          disabledReason: null,
        }
      : null,
    secondaryCtaLabel: null,
    actionOwner: downstreamActionHolderLabel || stepOwner,
    waitingOnLabel: downstreamWaitingOnLabel,
    showArrangementAdvice,
    showMatchingContent,
    showProcessingState: false,
    showBlockingState: false,
    canTransitionToMatching: false,
  };
}
