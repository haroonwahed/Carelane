import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock3,
  ClipboardList,
  GitBranch,
  MapPin,
  Plus,
  Zap,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  CareDominantStatus,
  CareFlowBoard,
  CareFlowStepCard,
  CareMetaChip,
  CareOperationalQueueHeader,
  CarePageScaffold,
  CareFilterTabButton,
  CareFilterTabGroup,
  CarePrimaryList,
  CareOperationalSelect,
  CareSearchFiltersBar,
  CareWorkListCard,
  CareWorkRow,
  CARE_RHYTHM,
  EmptyState,
  ErrorState,
  LoadingState,
  normalizeBoardColumnToPhaseId,
} from "./CareDesignPrimitives";
import { cn } from "../ui/utils";
import { CoordinationRailToggleButton } from "./CoordinationRailControls";
import { useRailCollapsed } from "../../hooks/useRailCollapsed";
import { useCases } from "../../hooks/useCases";
import { useProviders } from "../../hooks/useProviders";
import { consumeCasussenPreferredFocus } from "../../lib/casussenNavigation";
import { tokens } from "../../design/tokens";
import { getShortReasonLabel } from "../../lib/uxCopy";
import {
  buildWorkflowCases,
  getCaseDecisionState,
  type CaseDecisionRole,
  type CaseDecisionState,
  type WorkflowBoardColumn,
  type WorkflowCaseView,
} from "../../lib/workflowUi";
import { classifyCasusWorkboardState, type CasusWorkboardClassification } from "./casusWorkboardClassification";
import {
  deriveOperatieveWachtrijGroep,
  emptyQueueGroupTotals,
  operatieveGroepSortIndex,
  OPERATIEVE_WACHTLIJN_LABELS,
  OPERATIEVE_WACHTLIJN_VOLGORDE,
  type OperatieveWachtrijGroepKey,
} from "./casusOperatieveWachtrijGroep";
import { InlineHelpChip } from "../guidance";
import {
  DECISION_UI_PHASE_IDS,
  DECISION_UI_PHASE_LABELS,
  mapApiPhaseToDecisionUiPhase,
  type DecisionUiPhaseId,
} from "../../lib/decisionPhaseUi";

/** Aligns with Coordination phase-board pill tones (`SystemAwarenessPage`). */
function phasePillClasses(tone: "blocked" | "waiting" | "ready" | "in_progress"): string {
  switch (tone) {
    case "blocked":
      return "border-red-500/35 bg-red-500/10 text-red-100";
    case "waiting":
      return "border-amber-500/35 bg-amber-500/10 text-amber-100";
    case "ready":
      return "border-sky-500/35 bg-sky-500/10 text-sky-100";
    case "in_progress":
      return "border-emerald-500/35 bg-emerald-500/10 text-emerald-100";
    default:
      return "border-border bg-muted/30 text-foreground";
  }
}

interface WorkloadPageProps {
  onCaseClick: (caseId: string) => void;
  onCreateCase?: () => void;
  canCreateCase?: boolean;
  role?: CaseDecisionRole;
  onNavigateToWorkflow?: (page: "casussen" | "beoordelingen" | "matching" | "plaatsingen" | "intake") => void;
}

type FocusChip = "my-worklist" | "all" | "pipeline" | "critical" | "recent";
type FlowColumnFilter = "all" | "plaatsing" | "intake";
type TaxonomyFilter = "all" | string;

function casussenWerkvoorraadCountLabel(count: number): string {
  return `${count} Aanvraag${count === 1 ? "" : "en"}`;
}

function urgencyRank(urgency: WorkflowCaseView["urgency"]): number {
  switch (urgency) {
    case "critical":
      return 4;
    case "warning":
      return 3;
    case "normal":
      return 2;
    default:
      return 1;
  }
}

/** Coordination-style priority chip tones for urgency column. */
function urgencyChipShellClass(urgency: WorkflowCaseView["urgency"]): string {
  switch (urgency) {
    case "critical":
      return "border-red-500/35 bg-red-500/10 text-red-100";
    case "warning":
      return "border-amber-500/35 bg-amber-500/10 text-amber-100";
    case "normal":
      return "border-emerald-500/35 bg-emerald-500/10 text-emerald-100";
    default:
      return "border-border bg-muted/30 text-foreground";
  }
}

type StripBucketKey =
  | "casus"
  | "matching"
  | "aanbieder_beoordeling"
  | "plaatsing"
  | "intake";

const STRIP_DEF: Array<{
  key: StripBucketKey;
  label: string;
  ownerWaitLabel: string;
  countKeys: WorkflowBoardColumn[];
  filterPhase: DecisionUiPhaseId;
  statusTone: "blocked" | "waiting" | "ready" | "in_progress";
}> = [
  {
    key: "casus",
    label: "Casus",
    ownerWaitLabel: "Wacht op coördinatieactie",
    countKeys: ["casus"],
    filterPhase: "casus_gestart",
    statusTone: "ready",
  },
  {
    key: "matching",
    label: "Matching",
    ownerWaitLabel: "Wacht op matchvoorstel",
    countKeys: ["matching"],
    filterPhase: "klaar_voor_matching",
    statusTone: "in_progress",
  },
  {
    key: "aanbieder_beoordeling",
    label: "Beoordeling",
    ownerWaitLabel: "Wacht op aanbiederreactie",
    countKeys: ["aanbieder-beoordeling"],
    filterPhase: "in_beoordeling",
    statusTone: "waiting",
  },
  {
    key: "plaatsing",
    label: "Plaatsing",
    ownerWaitLabel: "Wacht op plaatsing",
    countKeys: ["plaatsing"],
    filterPhase: "plaatsing_intake",
    statusTone: "waiting",
  },
  {
    key: "intake",
    label: "Intake",
    ownerWaitLabel: "Wacht op intake-start",
    countKeys: ["intake"],
    filterPhase: "plaatsing_intake",
    statusTone: "in_progress",
  },
];

function ownerWaitLabelForRole(stepKey: StripBucketKey, role: CaseDecisionRole): string {
  if (role === "zorgaanbieder") {
    switch (stepKey) {
      case "casus":
        return "Wacht op coördinatie-invoer";
      case "matching":
        return "Wacht op matchvoorstel";
      case "aanbieder_beoordeling":
        return "Wacht op jouw beoordeling";
      case "plaatsing":
        return "Wacht op plaatsingsactie";
      case "intake":
        return "Wacht op intake-uitvoering";
      default:
        return "Wacht op doorstroming";
    }
  }

  switch (stepKey) {
    case "casus":
      return "Wacht op coördinatieactie";
    case "matching":
      return "Wacht op matchvoorstel";
    case "aanbieder_beoordeling":
      return "Wacht op aanbiederreactie";
    case "plaatsing":
      return "Wacht op plaatsing";
    case "intake":
      return "Wacht op intake-start";
    default:
      return "Wacht op doorstroming";
  }
}

function countWorkflowStrip(items: WorkflowCaseView[]): Record<StripBucketKey, number> {
  const acc: Record<StripBucketKey, number> = {
    casus: 0,
    matching: 0,
    aanbieder_beoordeling: 0,
    plaatsing: 0,
    intake: 0,
  };
  for (const row of STRIP_DEF) {
    let n = 0;
    for (const col of row.countKeys) {
      n += items.filter((it) => it.boardColumn === col).length;
    }
    acc[row.key] = n;
  }
  return acc;
}

function buildOperationalHeadline(item: WorkflowCaseView, decision: CaseDecisionState, phaseHumanLabel: string): string {
  if (item.missingDataItems.length > 0) {
    return item.missingDataItems.join(" · ");
  }
  const blocked = decision.blockedReason?.trim();
  if (blocked) return blocked;
  const why = decision.whyHere?.trim();
  if (why) return why;
  return phaseHumanLabel;
}

function buildOperationalSubline(decision: CaseDecisionState, queueGroup: OperatieveWachtrijGroepKey): string {
  switch (queueGroup) {
    case "wacht-op-aanbieder":
      return "Wacht op reactie van de zorgaanbieder.";
    case "wacht-op-aanmelder":
      if (decision.responsibleParty === "Systeem") return "Wacht op systeem (bijv. samenvatting).";
      return "Wacht op actie van aanmelder of coördinatie.";
    case "financiele-validatie":
      return "Gemeente moet validatie afronden voordat de keten doorloopt.";
    case "klaar-voor-matching":
      return decision.primaryActionEnabled
        ? "Je kunt matching starten of het matchadvies controleren."
        : "Er ontbreekt nog een voorwaarde om matching zeker te starten.";
    case "plaatsing-intake":
      return "Plaatsing of intake vraagt coördinatie tussen coördinatie en aanbieder.";
    default:
      if (decision.requiresCurrentUserAction) return "Jouw beurt voor de volgende stap.";
      return "Geen urgente coördinatie-actie; volg op de achtergrond.";
  }
}

function buildOperationalMetaLine(item: WorkflowCaseView, decision: CaseDecisionState, phaseHumanLabel: string): string {
  const owner =
    decision.responsibleParty === "Gemeente" ? "Coördinatie" : decision.responsibleParty === "Zorgaanbieder" ? "Aanbieder" : "Systeem";
  return `${item.lastUpdatedLabel} · ${owner} · ${phaseHumanLabel}`;
}

function buildTaxonomySummaryLabel(item: WorkflowCaseView): string {
  const category = (item.zorgbehoefteCategorie ?? "").trim();
  const specific = (item.zorgbehoefteSpecifiek ?? "").trim();
  if (category && specific) {
    return `${category} · ${specific}`;
  }
  return category || specific || "";
}

function queueGroupAccentTone(queueGroup: OperatieveWachtrijGroepKey): "critical" | "warning" | "neutral" {
  switch (queueGroup) {
    case "wacht-op-aanmelder":
    case "financiele-validatie":
      return "critical";
    case "wacht-op-aanbieder":
    case "klaar-voor-matching":
      return "warning";
    default:
      return "neutral";
  }
}

function collectTaxonomyCategoryOptions(items: WorkflowCaseView[]) {
  const map = new Map<string, string>();
  for (const item of items) {
    const code = (item.zorgbehoefteCategorieCode ?? "").trim();
    const label = (item.zorgbehoefteCategorie ?? "").trim();
    if (!code || !label) {
      continue;
    }
    if (!map.has(code)) {
      map.set(code, label);
    }
  }
  return Array.from(map.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((left, right) => left.label.localeCompare(right.label, "nl"));
}

function collectTaxonomySubcategoryOptions(items: WorkflowCaseView[], categoryFilter: TaxonomyFilter) {
  const map = new Map<string, string>();
  for (const item of items) {
    const categoryCode = (item.zorgbehoefteCategorieCode ?? "").trim();
    const code = (item.zorgbehoefteSpecifiekCode ?? "").trim();
    const label = (item.zorgbehoefteSpecifiek ?? "").trim();
    if (!code || !label) {
      continue;
    }
    if (categoryFilter !== "all" && categoryCode !== categoryFilter) {
      continue;
    }
    if (!map.has(code)) {
      map.set(code, label);
    }
  }
  return Array.from(map.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((left, right) => left.label.localeCompare(right.label, "nl"));
}

function CasussenOperatieveWachtrijItem({
  item,
  decision,
  queueGroup,
  classification,
  phaseHumanLabel,
  headline,
  showPrimaryCta,
  onOpenCase,
  onWorkflowAction,
}: {
  item: WorkflowCaseView;
  decision: CaseDecisionState;
  queueGroup: OperatieveWachtrijGroepKey;
  classification: CasusWorkboardClassification;
  phaseHumanLabel: string;
  headline: string;
  showPrimaryCta: boolean;
  onOpenCase: () => void;
  onWorkflowAction: () => void;
}) {
  const ownerLabel =
    decision.responsibleParty === "Gemeente" ? "Coördinatie" : decision.responsibleParty === "Zorgaanbieder" ? "Aanbieder" : "Systeem";
  const actionLabel = decision.nextActionLabel.replace(/\s*→\s*$/u, "").trim() || decision.nextActionLabel;
  const taxonomySummary = buildTaxonomySummaryLabel(item);

  return (
    <div className="group relative">
      <CareWorkRow
        density="operational"
                leading={
                  <CareMetaChip className={cn("h-6 px-2 text-[11px] font-semibold", urgencyChipShellClass(item.urgency))}>
                    {item.placementPressureLabel ?? item.urgencyLabel}
                  </CareMetaChip>
                }
        title={item.clientLabel}
        context={
          <>
            <CareMetaChip>{item.region}</CareMetaChip>
            {taxonomySummary ? (
              <CareMetaChip className="max-w-[min(100%,16rem)] truncate text-[11px]" title={taxonomySummary}>
                {taxonomySummary}
              </CareMetaChip>
            ) : null}
            <span className="line-clamp-1 min-w-0 max-w-[min(100%,28rem)] text-[11px] text-foreground/85">{headline}</span>
          </>
        }
        status={
          <CareDominantStatus className={cn("h-7 px-2.5 text-[11px] font-semibold", phasePillClasses("waiting"))}>
            {phaseHumanLabel}
          </CareDominantStatus>
        }
        time={
          <CareMetaChip>
            <Clock3 size={12} aria-hidden />
            {item.lastUpdatedLabel}
          </CareMetaChip>
        }
        contextInfo={<CareMetaChip>{ownerLabel}</CareMetaChip>}
        actionLabel={actionLabel}
        actionVariant={showPrimaryCta ? "primary" : "ghost"}
        accentTone={queueGroupAccentTone(queueGroup)}
        onOpen={onOpenCase}
        onAction={(event) => {
          event.stopPropagation();
          onWorkflowAction();
        }}
      />
      {import.meta.env.DEV && (
        <details className="absolute right-2 top-1.5 z-10">
          <summary
            aria-label="Open debug classificatie"
            className="inline-block cursor-pointer list-none rounded-full px-1 text-[10px] text-muted-foreground opacity-0 transition-opacity hover:bg-muted/40 group-hover:opacity-100 focus-visible:opacity-100"
          >
            i
          </summary>
          <div className="mt-1 space-y-1 text-left text-[11px] text-muted-foreground md:absolute md:right-4 md:z-10 md:max-w-[280px] md:rounded-md md:border md:border-border/60 md:bg-background/95 md:p-2">
            <p>Bucket: {classification.debug.assignedBucket}</p>
            <p>Regel: {classification.debug.winningRule}</p>
            <p>isBlocked: {String(classification.debug.signals.isBlocked)}</p>
            <p>primaryActionEnabled: {String(classification.debug.signals.primaryActionEnabled)}</p>
            <p>missingDataItems: {classification.debug.signals.missingDataItems.join(", ") || "geen"}</p>
            <p>requiresCurrentUserAction: {String(classification.debug.signals.requiresCurrentUserAction)}</p>
            <p>responsibleParty: {classification.debug.signals.responsibleParty}</p>
            <p>boardColumn: {classification.debug.signals.boardColumn}</p>
            <p>providerStatusLabel: {classification.debug.signals.providerStatusLabel ?? "geen"}</p>
            <p>nextActionRoute: {classification.debug.nextActionRoute}</p>
            <p>Wachtrij (UI): {queueGroup}</p>
          </div>
        </details>
      )}
    </div>
  );
}


export function WorkloadPage({
  onCaseClick,
  onCreateCase,
  canCreateCase = false,
  role = "gemeente",
  onNavigateToWorkflow,
}: WorkloadPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedUrgency, setSelectedUrgency] = useState("all");
  const [selectedPhase, setSelectedPhase] = useState<"all" | DecisionUiPhaseId>("all");
  const [selectedFlowColumn, setSelectedFlowColumn] = useState<FlowColumnFilter>("all");
  const [selectedOwner, setSelectedOwner] = useState<"all" | "Gemeente" | "Zorgaanbieder" | "Systeem">("all");
  const [selectedTaxonomyCategory, setSelectedTaxonomyCategory] = useState<TaxonomyFilter>("all");
  const [selectedTaxonomySubcategory, setSelectedTaxonomySubcategory] = useState<TaxonomyFilter>("all");
  /** Default “Alle casussen”: volledige werklijst; gebruikers kunnen naar Mijn werkvoorraad voor focus. */
  const [focusChip, setFocusChip] = useState<FocusChip>("all");
  /** One-shot focus hand-off from Coordination NBA links (e.g. "Bekijk kritieke casussen", "Bekijk gehele stroom"). */
  useEffect(() => {
    const preferred = consumeCasussenPreferredFocus();
    if (preferred === "critical") {
      setFocusChip("critical");
    } else if (preferred === "pipeline") {
      setFocusChip("pipeline");
    }
  }, []);
  const [showSecondaryFilters, setShowSecondaryFilters] = useState(false);
  const { collapsed: railCollapsed, toggle: toggleRail, setCollapsed: setRailCollapsed } = useRailCollapsed();
  const [collapsedQueueGroups, setCollapsedQueueGroups] = useState<Partial<Record<OperatieveWachtrijGroepKey, boolean>>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    setRailCollapsed(true);
  }, [setRailCollapsed]);

  const { cases, loading, error, refetch } = useCases({ q: searchQuery });
  const { providers } = useProviders({ q: "" });

  const workflowCases = useMemo(() => buildWorkflowCases(cases, providers), [cases, providers]);
  const taxonomyCategoryOptions = useMemo(() => collectTaxonomyCategoryOptions(workflowCases), [workflowCases]);
  const taxonomySubcategoryOptions = useMemo(
    () => collectTaxonomySubcategoryOptions(workflowCases, selectedTaxonomyCategory),
    [workflowCases, selectedTaxonomyCategory],
  );

  useEffect(() => {
    if (selectedTaxonomySubcategory === "all") {
      return;
    }
    const allowed = taxonomySubcategoryOptions.some((option) => option.value === selectedTaxonomySubcategory);
    if (!allowed) {
      setSelectedTaxonomySubcategory("all");
    }
  }, [selectedTaxonomySubcategory, taxonomySubcategoryOptions]);

  const decisionItems = useMemo(() => {
    return workflowCases.map((item) => ({
      item,
      decision: getCaseDecisionState(item, role),
    }));
  }, [workflowCases, role]);

  const regions = useMemo(() => ["all", ...Array.from(new Set(decisionItems.map(({ item }) => item.region)))], [decisionItems]);

  const baseFilteredItemsWithoutPhase = useMemo(() => {
    const searchLower = searchQuery.trim().toLowerCase();

    return decisionItems
      .filter(({ item, decision }) => {
        if (searchLower.length > 0) {
          const haystack = [item.id, item.clientLabel, item.region, item.careType, item.recommendedProviderName ?? "", ...item.tags]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(searchLower)) {
            return false;
          }
        }

        if (selectedRegion !== "all" && item.region !== selectedRegion) {
          return false;
        }

        const normalizedUrgency = selectedUrgency === "stable" ? "normal" : selectedUrgency;
        if (normalizedUrgency !== "all" && item.urgency !== normalizedUrgency) {
          return false;
        }

        if (selectedOwner !== "all" && decision.responsibleParty !== selectedOwner) {
          return false;
        }

        if (selectedTaxonomyCategory !== "all" && item.zorgbehoefteCategorieCode !== selectedTaxonomyCategory) {
          return false;
        }

        if (selectedTaxonomySubcategory !== "all" && item.zorgbehoefteSpecifiekCode !== selectedTaxonomySubcategory) {
          return false;
        }

        return true;
      })
      .sort((left, right) => {
        const urgencyDiff = urgencyRank(right.item.urgency) - urgencyRank(left.item.urgency);
        if (urgencyDiff !== 0) return urgencyDiff;

        const blockedDiff = Number(right.item.isBlocked) - Number(left.item.isBlocked);
        if (blockedDiff !== 0) return blockedDiff;

        const myActionDiff = Number(right.decision.requiresCurrentUserAction) - Number(left.decision.requiresCurrentUserAction);
        if (myActionDiff !== 0) return myActionDiff;

        const waitingDiff = right.item.daysInCurrentPhase - left.item.daysInCurrentPhase;
        if (waitingDiff !== 0) return waitingDiff;

        return left.item.id.localeCompare(right.item.id);
      });
  }, [decisionItems, searchQuery, selectedRegion, selectedUrgency, selectedOwner, selectedTaxonomyCategory, selectedTaxonomySubcategory]);

  const baseFilteredItems = useMemo(() => {
    if (selectedPhase === "all") {
      if (selectedFlowColumn === "all") {
        return baseFilteredItemsWithoutPhase;
      }
      return baseFilteredItemsWithoutPhase.filter(({ item }) => item.boardColumn === selectedFlowColumn);
    }
    const phaseFiltered = baseFilteredItemsWithoutPhase.filter(({ item }) => {
      const itemDecision = mapApiPhaseToDecisionUiPhase(normalizeBoardColumnToPhaseId(item.boardColumn));
      return itemDecision === selectedPhase;
    });
    if (selectedFlowColumn === "all") {
      return phaseFiltered;
    }
    return phaseFiltered.filter(({ item }) => item.boardColumn === selectedFlowColumn);
  }, [baseFilteredItemsWithoutPhase, selectedPhase, selectedFlowColumn]);

  const tabCounts = useMemo(() => {
    let myWorklist = 0;
    let pipeline = 0;
    let critical = 0;
    for (const { item, decision } of baseFilteredItemsWithoutPhase) {
      if (decision.requiresCurrentUserAction) myWorklist++;
      const c = classifyCasusWorkboardState(item, decision);
      if (c.section === "attention" || c.section === "waiting-provider") pipeline++;
      if (item.isBlocked || item.missingDataItems.length > 0 || item.urgency === "critical") critical++;
    }
    return {
      all: baseFilteredItemsWithoutPhase.length,
      myWorklist,
      pipeline,
      critical,
      recent: baseFilteredItemsWithoutPhase.length,
    };
  }, [baseFilteredItemsWithoutPhase]);

  const stripCounts = useMemo(
    () => countWorkflowStrip(baseFilteredItemsWithoutPhase.map((r) => r.item)),
    [baseFilteredItemsWithoutPhase],
  );

  const dominantStripKey = useMemo((): StripBucketKey | null => {
    let best: StripBucketKey | null = null;
    let bestN = -1;
    for (const row of STRIP_DEF) {
      const n = stripCounts[row.key];
      if (n > bestN) {
        bestN = n;
        best = row.key;
      }
    }
    return bestN > 0 ? best : null;
  }, [stripCounts]);

  const filteredItems = useMemo(() => {
    return baseFilteredItems.filter(({ item, decision }) => {
      if (focusChip === "my-worklist") return decision.requiresCurrentUserAction;
      if (focusChip === "pipeline") {
        const c = classifyCasusWorkboardState(item, decision);
        return c.section === "attention" || c.section === "waiting-provider";
      }
      if (focusChip === "critical") {
        return item.isBlocked || item.missingDataItems.length > 0 || item.urgency === "critical";
      }
      if (focusChip === "recent") return true;
      return true;
    });
  }, [baseFilteredItems, focusChip]);

  const sortedForFocus = useMemo(() => {
    if (focusChip !== "recent") return filteredItems;
    return [...filteredItems].sort((a, b) => a.item.daysInCurrentPhase - b.item.daysInCurrentPhase);
  }, [filteredItems, focusChip]);

  const classifiedItems = useMemo(() => {
    return sortedForFocus.map(({ item, decision }) => {
      const classification = classifyCasusWorkboardState(item, decision);
      return {
        item,
        decision,
        classification,
        queueGroup: deriveOperatieveWachtrijGroep(item, decision, classification),
      };
    });
  }, [sortedForFocus]);

  const attentionCount = classifiedItems.filter(({ classification }) => classification.section === "attention").length;

  const queueGroupTotals = useMemo(() => {
    const acc = emptyQueueGroupTotals();
    for (const row of classifiedItems) {
      acc[row.queueGroup] += 1;
    }
    return acc;
  }, [classifiedItems]);

  const displayRows = useMemo(() => {
    const rows = [...classifiedItems];
    if (focusChip === "recent") {
      return rows;
    }
    rows.sort((a, b) => {
      const g = operatieveGroepSortIndex(a.queueGroup) - operatieveGroepSortIndex(b.queueGroup);
      if (g !== 0) return g;
      const u = urgencyRank(b.item.urgency) - urgencyRank(a.item.urgency);
      if (u !== 0) return u;
      return a.item.id.localeCompare(b.item.id);
    });
    return rows;
  }, [classifiedItems, focusChip]);

  const totalRows = displayRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return displayRows.slice(start, start + pageSize);
  }, [displayRows, safePage, pageSize]);

  const groupedPageSections = useMemo(() => {
    const buckets: Partial<Record<OperatieveWachtrijGroepKey, typeof pageRows>> = {};
    for (const row of pageRows) {
      const k = row.queueGroup;
      if (!buckets[k]) buckets[k] = [];
      buckets[k]!.push(row);
    }
    return OPERATIEVE_WACHTLIJN_VOLGORDE.filter((key) => (buckets[key]?.length ?? 0) > 0).map((key) => ({
      key,
      items: buckets[key]!,
    }));
  }, [pageRows]);

  useEffect(() => {
    setPage(1);
  }, [
    searchQuery,
    focusChip,
    selectedRegion,
    selectedUrgency,
    selectedPhase,
    selectedFlowColumn,
    selectedOwner,
    selectedTaxonomyCategory,
    selectedTaxonomySubcategory,
  ]);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const handleNavigate = (nav: "casussen" | "beoordelingen" | "matching" | "plaatsingen" | "intake") => {
    onNavigateToWorkflow?.(nav);
  };

  const toggleQueueGroup = (group: OperatieveWachtrijGroepKey) => {
    setCollapsedQueueGroups((current) => ({ ...current, [group]: !current[group] }));
  };

  const isQueueGroupCollapsed = (group: OperatieveWachtrijGroepKey) => collapsedQueueGroups[group] === true;

  const phaseOptions: Array<{ value: DecisionUiPhaseId; label: string }> = DECISION_UI_PHASE_IDS.map((id) => ({
    value: id,
    label: DECISION_UI_PHASE_LABELS[id],
  }));

  const phasePillLabel = (item: WorkflowCaseView): string => {
    const id = mapApiPhaseToDecisionUiPhase(normalizeBoardColumnToPhaseId(item.boardColumn));
    return DECISION_UI_PHASE_LABELS[id];
  };

  const dominantAttentionItem =
    attentionCount > 0 ? filteredItems.find(({ decision }) => decision.requiresCurrentUserAction) ?? filteredItems[0] ?? null : null;
  const dominantAttentionTitle =
    attentionCount === 1 ? "1 casus wacht op aanmelder" : `${attentionCount} casussen wachten op aanmelder`;
  const dominantAttentionCopy =
    attentionCount > 0
      ? "Los blokkades op om de doorstroom te behouden."
      : workflowCases.length === 0
        ? "Er zijn nog geen casussen in deze lijst."
        : "Pas filters aan om de eerstvolgende actie te vinden.";
  const dominantAttentionAction = dominantAttentionItem
    ? () => {
        onCaseClick(dominantAttentionItem.item.id);
      }
    : undefined;

  const headerActions = (
    <div className="flex flex-col items-start gap-1 md:pt-3 md:items-end">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {canCreateCase && onCreateCase ? (
          <Button
            type="button"
            variant="default"
            className="h-9 min-h-9 rounded-lg px-4 text-[13px] font-semibold shadow-sm"
            onClick={onCreateCase}
          >
            Nieuwe casus
          </Button>
        ) : null}
        <CoordinationRailToggleButton
          collapsed={railCollapsed}
          onToggle={toggleRail}
          testId="casussen-rail-toggle"
        />
      </div>
    </div>
  );

  const stripStepIcon = (key: StripBucketKey) => {
    switch (key) {
      case "casus":
        return ClipboardList;
      case "matching":
        return GitBranch;
      case "aanbieder_beoordeling":
        return Building2;
      case "plaatsing":
        return MapPin;
      case "intake":
        return Clock3;
      default:
        return ClipboardList;
    }
  };

  const stripStepIsActive = (step: (typeof STRIP_DEF)[number]) => {
    if (selectedPhase !== "all") {
      if (selectedFlowColumn !== "all") {
        return (step.key === "plaatsing" || step.key === "intake") && step.key === selectedFlowColumn;
      }
      if (step.key === "matching") {
        return selectedPhase === "klaar_voor_matching";
      }
      return step.filterPhase === selectedPhase;
    }
    return dominantStripKey === step.key;
  };

  const activeStripIndex = (() => {
    const fromFilter = STRIP_DEF.findIndex((step) => stripStepIsActive(step));
    if (fromFilter >= 0) return fromFilter;
    if (dominantStripKey) {
      const dominantIndex = STRIP_DEF.findIndex((step) => step.key === dominantStripKey);
      if (dominantIndex >= 0) return dominantIndex;
    }
    return 0;
  })();

  const worklistHeader = (
    <div className="flex flex-col gap-4 px-4 py-4 md:px-5 md:py-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <h2 id="casussen-werkvoorraad-heading" className="text-[30px] font-semibold tracking-tight text-foreground">
            Werkvoorraad
          </h2>
          <InlineHelpChip title="Waarom staat dit bovenaan?" triggerLabel="Prioriteit" testId="werkvoorraad-prioriteit-help">
            <p>Items worden geprioriteerd op urgentie, blokkades en benodigde actie.</p>
          </InlineHelpChip>
        </div>
        <div className="w-full lg:max-w-[31rem]">
          <CareSearchFiltersBar
            variant="workspace"
            className="px-0"
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Zoek casussen, regio's, aanbieders…"
            showSecondaryFilters={showSecondaryFilters}
            onToggleSecondaryFilters={() => setShowSecondaryFilters((current) => !current)}
            secondaryFiltersLabel="Filters"
            secondaryFilters={
              <>
                <div className="grid items-end gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                  <label className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground">
                    Werkvoorraad-weergave
                    <CareOperationalSelect
                      aria-label="Werkvoorraad-weergave"
                      value={focusChip}
                      onChange={(event) => setFocusChip(event.target.value as FocusChip)}
                    >
                      <option value="my-worklist">Mijn werkvoorraad ({tabCounts.myWorklist})</option>
                      <option value="all">Alle casussen ({tabCounts.all})</option>
                      <option value="pipeline">Wacht op actie ({tabCounts.pipeline})</option>
                      <option value="critical">Kritiek ({tabCounts.critical})</option>
                      <option value="recent">Recent bijgewerkt ({tabCounts.recent})</option>
                    </CareOperationalSelect>
                  </label>
                  <label className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground">
                    Stap
                    <CareOperationalSelect
                      aria-label="Stap in de keten"
                      value={selectedPhase}
                      onChange={(event) => {
                        setSelectedPhase(event.target.value as "all" | DecisionUiPhaseId);
                        setSelectedFlowColumn("all");
                      }}
                    >
                      <option value="all">Alle fases</option>
                      {phaseOptions.map((phase) => (
                        <option key={phase.value} value={phase.value}>
                          {phase.label}
                        </option>
                      ))}
                    </CareOperationalSelect>
                  </label>
                  <label className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground">
                    Urgentie
                    <CareOperationalSelect
                      aria-label="Urgentie"
                      value={selectedUrgency}
                      onChange={(event) => setSelectedUrgency(event.target.value)}
                    >
                      <option value="all">Alle urgentie</option>
                      <option value="critical">Kritiek</option>
                      <option value="warning">Hoog</option>
                      <option value="normal">Normaal / laag</option>
                    </CareOperationalSelect>
                  </label>
                  <label className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground">
                    Regio
                    <CareOperationalSelect
                      aria-label="Regio"
                      value={selectedRegion}
                      onChange={(event) => setSelectedRegion(event.target.value)}
                    >
                      {regions.map((region) => (
                        <option key={region} value={region}>
                          {region === "all" ? "Alle regio's" : region}
                        </option>
                      ))}
                    </CareOperationalSelect>
                  </label>
                  <label className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground">
                    Verantwoordelijke
                    <CareOperationalSelect
                      aria-label="Verantwoordelijke"
                      value={selectedOwner}
                      onChange={(event) => setSelectedOwner(event.target.value as "all" | "Gemeente" | "Zorgaanbieder" | "Systeem")}
                    >
                      <option value="all">Alle verantwoordelijken</option>
                      <option value="Gemeente">Aanmelder / gemeente</option>
                      <option value="Zorgaanbieder">Zorgaanbieder</option>
                      <option value="Systeem">Systeem</option>
                    </CareOperationalSelect>
                  </label>
                </div>
                <div className="grid items-end gap-2 md:grid-cols-2">
                  <label className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground">
                    Zorgbehoefte categorie
                    <CareOperationalSelect
                      aria-label="Zorgbehoefte categorie"
                      value={selectedTaxonomyCategory}
                      onChange={(event) => {
                        setSelectedTaxonomyCategory(event.target.value);
                        setSelectedTaxonomySubcategory("all");
                      }}
                    >
                      <option value="all">Alle categorieën</option>
                      {taxonomyCategoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </CareOperationalSelect>
                  </label>
                  <label className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground">
                    Specifieke zorgbehoefte
                    <CareOperationalSelect
                      aria-label="Specifieke zorgbehoefte"
                      value={selectedTaxonomySubcategory}
                      disabled={selectedTaxonomyCategory === "all" || taxonomySubcategoryOptions.length === 0}
                      onChange={(event) => setSelectedTaxonomySubcategory(event.target.value)}
                    >
                      <option value="all">Alle specifieke behoeften</option>
                      {taxonomySubcategoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </CareOperationalSelect>
                  </label>
                </div>
              </>
            }
          />
        </div>
      </div>

      <CareFilterTabGroup aria-label="Werkvoorraad tabbladen" className="w-fit">
        <CareFilterTabButton
          selected={focusChip === "my-worklist"}
          accentSelected
          accentHex={tokens.colors.casussenAccent}
          onClick={() => setFocusChip("my-worklist")}
        >
          {casussenWerkvoorraadCountLabel(tabCounts.myWorklist)}
        </CareFilterTabButton>
        <CareFilterTabButton
          selected={focusChip === "pipeline"}
          accentSelected
          accentHex={tokens.colors.casussenAccent}
          onClick={() => setFocusChip("pipeline")}
        >
          Wachten {tabCounts.pipeline}
        </CareFilterTabButton>
      </CareFilterTabGroup>
    </div>
  );

  const matchingFooter = (
    <section className="rounded-[22px] border border-border/60 bg-card/35 px-5 py-4 shadow-sm md:px-6 md:py-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-primary/10 bg-primary/10 text-primary">
            <Zap className="size-6" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[17px] font-semibold tracking-tight text-foreground">Meer doen in Matching</p>
            <p className="mt-1 max-w-2xl text-[13px] leading-5 text-muted-foreground">
              Bekijk de matching rail voor geselecteerde cases of open een nieuwe aanvraag.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl border-border/70 px-4 text-[14px] font-medium text-foreground"
            onClick={() => handleNavigate("matching")}
          >
            Naar Matching rail
            <ArrowUpRight className="ml-2 size-4" aria-hidden />
          </Button>
          {canCreateCase && onCreateCase ? (
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl border-border/70 px-4 text-[14px] font-medium text-foreground"
              onClick={onCreateCase}
            >
              Nieuwe aanvraag
              <Plus className="ml-2 size-4" aria-hidden />
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );

  return (
    <div className={CARE_RHYTHM.layoutWithRail}>
      <div className="care-layout-with-rail__main min-w-0 flex-1">
        <CarePageScaffold
          archetype="queue"
          className="pb-4"
          title="Casussen"
          subtitleInfoTestId="casussen-page-info"
          subtitleAriaLabel="Uitleg casussen"
          metric={
            <div className="inline-flex items-center gap-3 text-[14px] font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-slate-500" aria-hidden />
                {filteredItems.length} casus{filteredItems.length === 1 ? "" : "sen"}
              </span>
              <span className="h-4 w-px bg-border/70" aria-hidden />
              <span className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-amber-400" aria-hidden />
                {attentionCount} wacht op jouw actie
              </span>
            </div>
          }
          actions={headerActions}
          dominantAction={
            dominantAttentionItem ? (
              <section
                className={cn(
                  "rounded-[22px] border border-border/60 bg-card/35 px-5 py-4 shadow-sm md:px-6 md:py-5",
                  "border-l-2 border-l-amber-500/80",
                )}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
                      <Clock3 className="size-8" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300">Wacht op jouw actie</p>
                      <p className="mt-2 text-[24px] font-semibold tracking-tight text-foreground">{dominantAttentionTitle}</p>
                      <p className="mt-2 max-w-2xl text-[14px] leading-6 text-muted-foreground">{dominantAttentionCopy}</p>
                    </div>
                  </div>
                  {dominantAttentionAction ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 rounded-xl border-border/70 px-5 text-[14px] font-medium text-foreground"
                      onClick={dominantAttentionAction}
                    >
                      Bekijk casus
                      <ChevronRight className="ml-2 size-4" aria-hidden />
                    </Button>
                  ) : null}
                </div>
              </section>
            ) : null
          }
          insights={matchingFooter}
        >
          {loading && <LoadingState title="Casussen laden…" copy="De werkvoorraad wordt opgebouwd." />}

          {!loading && error && (
            <ErrorState
              title="Casussen laden mislukt"
              copy={getShortReasonLabel(error, 100)}
              action={
                <Button variant="outline" onClick={refetch}>
                  Opnieuw
                </Button>
              }
            />
          )}

          {!loading && !error && workflowCases.length === 0 && (
            <EmptyState
              title="Geen casussen."
              copy={canCreateCase ? "Er zijn nog geen casussen. Start een doorstroom via de knop rechtsboven." : "Pas filters aan."}
            />
          )}

          {!loading && !error && workflowCases.length > 0 && filteredItems.length === 0 && (
            <EmptyState
              title={focusChip === "my-worklist" ? "Geen open acties." : "Geen casussen."}
              copy={focusChip === "my-worklist" ? "Alles ligt bij andere partijen." : "Pas filters aan."}
            />
          )}

          {!loading && !error && filteredItems.length > 0 && (
            <div data-testid="worklist" data-density="compact" data-layout="queue" className={CARE_RHYTHM.zoneStack}>
              {groupedPageSections.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">Geen casussen op deze pagina.</p>
              ) : (
                <>
                  <CareWorkListCard
                    header={worklistHeader}
                  >
                    <div className="border-b border-border/35 px-4 py-3 md:px-5">
                      <CareOperationalQueueHeader
                        labels={["Urgentie", "Casus", "Operationeel", "Fase", "Bijgewerkt", "Volgende actie"]}
                      />
                    </div>
                    {groupedPageSections.map(({ key: groupKey, items }, groupIndex) => {
                      const totalInGroup = queueGroupTotals[groupKey];
                      const isCollapsed = isQueueGroupCollapsed(groupKey);
                      return (
                        <section key={groupKey} className={cn(groupIndex > 0 && "border-t border-border/40")}>
                          <button
                            type="button"
                            onClick={() => toggleQueueGroup(groupKey)}
                            className="flex w-full items-center justify-between gap-2 px-4 py-2 text-left md:px-5"
                          >
                            <h2 className="text-[13px] font-semibold leading-snug text-foreground">
                              {OPERATIEVE_WACHTLIJN_LABELS[groupKey]}{" "}
                              <span className="font-semibold tabular-nums text-muted-foreground">({totalInGroup})</span>
                            </h2>
                            {isCollapsed ? (
                              <ChevronDown size={16} className="shrink-0 text-muted-foreground" />
                            ) : (
                              <ChevronUp size={16} className="shrink-0 text-muted-foreground" />
                            )}
                          </button>

                          {!isCollapsed && (
                            <div className="divide-y divide-border/40">
                              <CarePrimaryList>
                                {items.map(({ item, decision, classification, queueGroup }) => {
                                  const phaseHuman = phasePillLabel(item);
                                  const headline = buildOperationalHeadline(item, decision, phaseHuman);
                                  const showPrimaryCta = Boolean(decision.requiresCurrentUserAction && decision.primaryActionEnabled);
                                  return (
                                    <CasussenOperatieveWachtrijItem
                                      key={item.id}
                                      item={item}
                                      decision={decision}
                                      queueGroup={queueGroup}
                                      classification={classification}
                                      phaseHumanLabel={phaseHuman}
                                      headline={headline}
                                      showPrimaryCta={showPrimaryCta}
                                      onOpenCase={() => onCaseClick(item.id)}
                                      onWorkflowAction={() => handleNavigate(decision.nextActionRoute)}
                                    />
                                  );
                                })}
                              </CarePrimaryList>
                            </div>
                          )}
                        </section>
                      );
                    })}
                  </CareWorkListCard>

                  <p className="text-[12px] leading-snug text-muted-foreground" data-testid="worklist-pagination-hint">
                    Paginering loopt plat over alle wachtrijen (volgorde: wachtrij → urgentie → casus). Tellingen bij elke kop zijn voor je
                    huidige filters, niet alleen voor deze pagina.
                  </p>

                  <div className="flex flex-col gap-3 border-t border-border/50 pt-3 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <p className="tabular-nums">
                      {totalRows === 0 ? "0" : `${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, totalRows)}`} van {totalRows}{" "}
                      casussen
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8"
                        disabled={safePage <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        aria-label="Vorige pagina"
                      >
                        <ChevronLeft size={16} />
                      </Button>
                      <span className="tabular-nums text-foreground">
                        Pagina {safePage} / {totalPages}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8"
                        disabled={safePage >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        aria-label="Volgende pagina"
                      >
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                    <label className="flex items-center gap-2">
                      <span className="text-[12px]">Rijen per pagina</span>
                      <CareOperationalSelect
                        value={pageSize}
                        onChange={(event) => {
                          setPageSize(Number(event.target.value));
                          setPage(1);
                        }}
                        className="care-op-select h-9 w-auto rounded-lg px-2 text-[13px]"
                      >
                        {[5, 10, 20, 50].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </CareOperationalSelect>
                    </label>
                  </div>
                </>
              )}
            </div>
          )}
        </CarePageScaffold>
      </div>
    </div>
  );
}
