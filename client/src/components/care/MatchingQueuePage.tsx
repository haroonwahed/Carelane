import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Building2,
  CheckCheck,
  ClipboardCheck,
  ExternalLink,
  MapPinned,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { cn } from "../ui/utils";
import { useCases } from "../../hooks/useCases";
import { useProviders } from "../../hooks/useProviders";
import { buildWorkflowCases } from "../../lib/workflowUi";
import type { WorkflowCaseView } from "../../lib/workflowUi";
import {
  CareDominantStatus,
  CareMetaChip,
  CarePageScaffold,
  CarePrimaryList,
  CareSectionHeader,
  CareWorkspaceSection,
  CareSearchFiltersBar,
  CareOperationalQueueHeader,
  CareWorkListCard,
  CARE_RHYTHM,
  CareWorkRow,
  EmptyState,
  ErrorState,
  FlowPhaseBadge,
  LoadingState,
  CareQueueInlineAction,
  normalizeBoardColumnToPhaseId,
} from "./CareDesignPrimitives";

interface MatchingQueuePageProps {
  onCaseClick: (caseId: string) => void;
  onNavigateToCasussen?: () => void;
}

type ListTab = "all" | "urgent" | "blocked";
type SortOption = "urgency" | "region" | "wait";

const URGENCY_KEYS = ["critical", "warning", "normal"] as const;
type UrgencyTier = (typeof URGENCY_KEYS)[number];

function urgencyRank(u: WorkflowCaseView["urgency"]): number {
  if (u === "critical") return 0;
  if (u === "warning") return 1;
  return 2;
}

function sortMatchingList(list: WorkflowCaseView[], sortBy: SortOption): WorkflowCaseView[] {
  const out = [...list];
  if (sortBy === "region") {
    out.sort((a, b) => a.region.localeCompare(b.region, "nl") || a.id.localeCompare(b.id));
    return out;
  }
  if (sortBy === "wait") {
    out.sort((a, b) => b.daysInCurrentPhase - a.daysInCurrentPhase || urgencyRank(a.urgency) - urgencyRank(b.urgency));
    return out;
  }
  out.sort((a, b) => urgencyRank(a.urgency) - urgencyRank(b.urgency) || b.daysInCurrentPhase - a.daysInCurrentPhase);
  return out;
}

function MetricChip({ icon, label }: { icon: ReactNode; label: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-foreground/90">
      <span className="inline-flex size-3 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden>
        {icon}
      </span>
      {label}
    </span>
  );
}

function ProcessStep({ index, title }: { index: number; title: string }) {
  return (
    <div className="min-w-0 flex-1 px-1 py-0">
      <div className="flex items-start gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[13px] font-semibold text-primary">
          {index}
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold tracking-tight text-foreground">{title}</p>
        </div>
      </div>
    </div>
  );
}

export function MatchingQueuePage({ onCaseClick, onNavigateToCasussen }: MatchingQueuePageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSecondaryFilters, setShowSecondaryFilters] = useState(false);
  const [listTab, setListTab] = useState<ListTab>("all");
  const [sortBy, setSortBy] = useState<SortOption>("urgency");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedUrgency, setSelectedUrgency] = useState<Record<UrgencyTier, boolean>>({
    critical: true,
    warning: true,
    normal: true,
  });

  const { cases, loading, error, refetch } = useCases({ q: searchQuery });
  const { providers } = useProviders({ q: "" });

  const pool = useMemo(() => {
    const sentinel = "9999-12-31";
    return buildWorkflowCases(cases, providers)
      .filter((item) => item.readyForMatching)
      .sort((a, b) => {
        const aBucket = a.waitlistBucket ?? 1;
        const bBucket = b.waitlistBucket ?? 1;
        if (aBucket !== bBucket) return aBucket - bBucket;
        if (aBucket === 0) {
          const aDate = a.urgencyGrantedDate ?? sentinel;
          const bDate = b.urgencyGrantedDate ?? sentinel;
          return aDate < bDate ? -1 : aDate > bDate ? 1 : 0;
        }
        const aStart = a.intakeStartDate ?? sentinel;
        const bStart = b.intakeStartDate ?? sentinel;
        return aStart < bStart ? -1 : aStart > bStart ? 1 : 0;
      });
  }, [cases, providers]);

  const counts = useMemo(() => {
    const critical = pool.filter((i) => i.urgency === "critical").length;
    const warning = pool.filter((i) => i.urgency === "warning").length;
    const blocked = pool.filter((i) => i.isBlocked).length;
    return {
      total: pool.length,
      critical,
      warning,
      blocked,
      normal: pool.filter((i) => i.urgency === "normal").length,
    };
  }, [pool]);

  const urgentCount = counts.critical + counts.warning;
  const blockedCount = counts.blocked;
  const regionOptions = useMemo(() => {
    const dynamic = Array.from(new Set(pool.map((item) => item.region))).sort((a, b) => a.localeCompare(b, "nl"));
    return ["all", ...dynamic];
  }, [pool]);

  const filteredCases = useMemo(() => {
    let list = pool;

    if (listTab === "urgent") {
      list = list.filter((item) => item.urgency === "critical" || item.urgency === "warning");
    } else if (listTab === "blocked") {
      list = list.filter((item) => item.isBlocked);
    }

    if (selectedRegion !== "all") {
      list = list.filter((item) => item.region === selectedRegion);
    }

    if (selectedUrgency.critical || selectedUrgency.warning || selectedUrgency.normal) {
      list = list.filter((item) => {
        if (item.urgency === "critical") return selectedUrgency.critical;
        if (item.urgency === "warning") return selectedUrgency.warning;
        return selectedUrgency.normal;
      });
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((item) => {
        const hay = `${item.clientLabel} ${item.title} ${item.id} ${item.region} ${item.nextBestActionLabel}`.toLowerCase();
        return hay.includes(q);
      });
    }

    return sortMatchingList(list, sortBy);
  }, [pool, listTab, selectedRegion, selectedUrgency, searchQuery, sortBy]);

  const clearSidebarFilters = () => {
    setSelectedRegion("all");
    setSelectedUrgency({ critical: true, warning: true, normal: true });
  };

  const toggleUrgency = (key: UrgencyTier) => {
    setSelectedUrgency((current) => ({ ...current, [key]: !current[key] }));
  };

  const selectTriggerClass =
    "h-10 border-border bg-card text-foreground hover:bg-muted/35 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/30";

  const isEmptyState = !loading && !error && filteredCases.length === 0;

  return (
    <CarePageScaffold
      archetype="queue"
      className="pb-2"
      title="Matching"
      actions={
      <div className="flex flex-wrap items-center gap-2">
        {onNavigateToCasussen ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl border-border/70 bg-background/20 px-4 text-[14px] font-medium text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:bg-muted/25"
              onClick={onNavigateToCasussen}
            >
              <ClipboardCheck className="mr-2 size-4 text-primary" aria-hidden />
              Naar casussen
            </Button>
          ) : null}
          <Button
            type="button"
            variant="default"
            className="h-11 rounded-xl px-5 text-[14px] font-medium shadow-lg shadow-primary/20"
            onClick={onNavigateToCasussen}
          >
            Open aanvragen
            <ArrowRight className="ml-2.5 size-4" aria-hidden />
          </Button>
        </div>
      }
      metric={
        <div className="inline-flex overflow-hidden rounded-full border border-border/60 bg-card/55 shadow-sm">
          <MetricChip icon={<span className="size-1.5 rounded-full bg-primary" aria-hidden />} label={<>{loading ? "…" : filteredCases.length} weergave</>} />
          <span className="my-2 w-px bg-border/60" aria-hidden />
          <MetricChip icon={<span className="size-1.5 rounded-full bg-slate-400" aria-hidden />} label={<>{loading ? "…" : counts.total} totaal</>} />
          <span className="my-2 w-px bg-border/60" aria-hidden />
          <MetricChip icon={<span className="size-1.5 rounded-full bg-red-400" aria-hidden />} label={<>{loading ? "…" : counts.blocked} geblokkeerd</>} />
        </div>
      }
    >
      {!loading && !error && isEmptyState ? (
        <div className="space-y-2">
          <section className="rounded-[24px] border border-border/60 bg-card/35 px-5 py-3 shadow-sm md:px-7 md:py-4">
            <div className="grid min-h-[150px] grid-cols-1 gap-4 md:grid-cols-[minmax(18rem,1.2fr)_minmax(18rem,0.95fr)] md:items-center">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/80">Operationele aandacht</p>
                <h2 className="mt-2.5 text-[26px] font-semibold tracking-tight text-foreground md:text-[28px]">
                  Geen aanvragen in matching
                </h2>
                {onNavigateToCasussen ? (
                  <Button
                    type="button"
                    className="mt-3 h-11 min-w-[214px] rounded-xl px-6 text-[14px] font-medium shadow-xl shadow-primary/20"
                    onClick={onNavigateToCasussen}
                  >
                    Naar aanvragen
                    <ArrowRight className="ml-3 size-4" aria-hidden />
                  </Button>
                ) : null}
              </div>

              <div className="relative flex min-w-0 justify-end">
                <div className="w-full max-w-[24rem] rounded-[22px] border border-border/60 bg-background/20 px-4 py-2">
                  <div className="relative">
                    <div className="absolute left-4 top-4 bottom-4 w-px border-l border-dashed border-primary/35" aria-hidden />
                    <div className="space-y-1.5">
                      <div className="relative flex items-start gap-4">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                          <CheckCheck className="size-4" aria-hidden />
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-foreground">Samenvatting gereed</p>
                        </div>
                      </div>
                      <div className="relative flex items-start gap-4">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                          <CheckCheck className="size-4" aria-hidden />
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-foreground">Gemeente validatie</p>
                        </div>
                      </div>
                      <div className="relative flex items-start gap-4">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                          <CheckCheck className="size-4" aria-hidden />
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-foreground">Aanbieder beoordeling</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-border/60 bg-card/35 px-5 py-3 shadow-sm md:px-7 md:py-4">
            <p className="mb-2 text-[15px] font-semibold tracking-tight text-foreground">Zo werkt matching in CareOn</p>
            <div className="grid gap-2 md:grid-cols-4">
              <ProcessStep index={1} title="Voorbereiden" />
              <ProcessStep index={2} title="Selecteren" />
              <ProcessStep index={3} title="Validatie" />
              <ProcessStep index={4} title="Beoordelen" />
            </div>
          </section>

          <section className="rounded-[24px] border border-border/60 bg-card/35 px-5 py-2 shadow-sm md:px-7 md:py-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/10 bg-primary/10 text-primary">
                  <Sparkles className="size-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold tracking-tight text-foreground">Vragen over matching?</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-border/70 px-4 text-[13px] font-medium text-foreground"
                  onClick={onNavigateToCasussen}
                >
                  Hoe matching werkt
                  <ExternalLink className="ml-2 size-4" aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-border/70 px-4 text-[13px] font-medium text-foreground"
                >
                  Support contact
                  <MessageSquareText className="ml-2 size-4" aria-hidden />
                </Button>
              </div>
            </div>
          </section>

          <div className="pt-0 text-center text-[13px] text-muted-foreground/85">CareOn Zorg OS © 2026</div>
        </div>
      ) : (
        <CareWorkspaceSection
          testId="matching-uitvoerlijst"
          aria-labelledby="matching-werkvoorraad-heading"
          bodyBleedX
          header={
            <CareSectionHeader
              className="lg:flex-col lg:items-stretch"
              title={<span id="matching-werkvoorraad-heading">Werkvoorraad</span>}
              meta={
                <div className={cn("w-full min-w-0", CARE_RHYTHM.metaStack)}>
                  <span className="inline-flex w-fit items-center rounded-full border border-border/60 bg-muted/30 px-2.5 py-0.5 text-[12px] font-semibold text-muted-foreground">
                    {loading ? "…" : `${filteredCases.length} casussen`}
                  </span>
                  <CareSearchFiltersBar
                    className="px-0"
                    searchValue={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="Zoek casussen, regio's, aanbieders…"
                    showSecondaryFilters={showSecondaryFilters}
                    onToggleSecondaryFilters={() => setShowSecondaryFilters((current) => !current)}
                    secondaryFiltersLabel="Filters"
                    secondaryFilters={
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[12px] leading-snug text-muted-foreground">
                            Verfijn regio en urgentie; filters worden direct toegepast.
                          </p>
                          <button
                            type="button"
                            className="shrink-0 text-[13px] font-semibold text-primary hover:text-foreground"
                            onClick={clearSidebarFilters}
                          >
                            Wissen
                          </button>
                        </div>
                        <div className="grid items-end gap-2 md:grid-cols-2">
                          <label className="flex min-w-0 flex-col gap-1">
                            <span className="text-[11px] font-medium text-muted-foreground">Weergave</span>
                            <Select value={listTab} onValueChange={(value) => setListTab(value as ListTab)}>
                              <SelectTrigger aria-label="Weergave" className={cn("h-10", selectTriggerClass)}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="border-border bg-card text-foreground">
                                <SelectItem value="all">Alle casussen</SelectItem>
                                <SelectItem value="urgent">Urgent ({loading ? "—" : urgentCount})</SelectItem>
                                <SelectItem value="blocked">Geblokkeerd ({loading ? "—" : blockedCount})</SelectItem>
                              </SelectContent>
                            </Select>
                          </label>
                          <label className="flex min-w-0 flex-col gap-1">
                            <span className="text-[11px] font-medium text-muted-foreground">Sorteren op</span>
                            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                              <SelectTrigger aria-label="Sorteren op" className={cn("h-10", selectTriggerClass)}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="border-border bg-card text-foreground">
                                <SelectItem value="urgency">Urgentie</SelectItem>
                                <SelectItem value="region">Regio</SelectItem>
                                <SelectItem value="wait">Wachttijd in fase</SelectItem>
                              </SelectContent>
                            </Select>
                          </label>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Urgentie</p>
                          {([
                            { key: "critical" as const, label: "Kritiek", tone: "text-red-400", count: counts.critical },
                            { key: "warning" as const, label: "Hoog", tone: "text-amber-400", count: counts.warning },
                            { key: "normal" as const, label: "Normaal", tone: "text-sky-300", count: counts.normal },
                          ] as const).map((row) => (
                            <label
                              key={row.key}
                              className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-border/40 bg-background/30 px-2.5 py-2 text-[13px]"
                            >
                              <span className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={selectedUrgency[row.key]}
                                  onChange={() => toggleUrgency(row.key)}
                                  className="size-4 rounded border-border accent-primary"
                                />
                                <span className={cn("font-medium text-foreground", row.tone)}>{row.label}</span>
                              </span>
                              <span className="tabular-nums text-muted-foreground">{row.count}</span>
                            </label>
                          ))}
                        </div>
                        <label className="block space-y-1.5">
                          <span className="text-[11px] font-medium text-muted-foreground">Regio</span>
                          <select
                            value={selectedRegion}
                            onChange={(event) => setSelectedRegion(event.target.value)}
                            className="h-9 w-full rounded-xl border border-border/80 bg-background px-3 text-sm text-foreground"
                          >
                            {regionOptions.map((region) => (
                              <option key={region} value={region}>
                                {region === "all" ? "Alle regio's" : region}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block space-y-1.5">
                          <span className="text-[11px] font-medium text-muted-foreground">Fase</span>
                          <select disabled className="h-9 w-full rounded-xl border border-border/50 bg-muted/20 px-3 text-sm text-muted-foreground">
                            <option>Matching (vast)</option>
                          </select>
                        </label>
                        <p className="text-[11px] leading-snug text-muted-foreground">
                          <MapPinned className="mr-1 inline size-3.5 align-text-bottom opacity-70" aria-hidden />
                          Selecties gelden direct voor de werkvoorraad.
                        </p>
                      </div>
                    }
                  />
                </div>
              }
            />
          }
        >
          {loading && <LoadingState title="Matching laden…" copy="De wachtrij wordt opgebouwd." />}
          {!loading && error && (
            <ErrorState title="Laden mislukt" copy={error} action={<Button variant="outline" onClick={refetch}>Opnieuw</Button>} />
          )}

          {!loading && !error && filteredCases.length === 0 && (
            <EmptyState
              title={pool.length === 0 ? "Geen aanvragen in matching" : "Geen aanvragen in deze weergave"}
              copy={pool.length === 0 ? undefined : "Pas tabblad, zoekopdracht of filters aan."}
              action={<CareQueueInlineAction onClick={() => onNavigateToCasussen?.()}>Naar aanvragen</CareQueueInlineAction>}
            />
          )}

          {!loading && !error && filteredCases.length > 0 && (
            <CareWorkListCard
              header={
                <CareOperationalQueueHeader labels={["Fase", "Casus", "Matchadvies", "Wachttijd", "Context", "Volgende actie"]} />
              }
            >
              <div className="divide-y divide-border/45">
                <CarePrimaryList>
                  {filteredCases.map((item) => (
                      <CareWorkRow
                      key={item.id}
                      leading={<FlowPhaseBadge phaseId={normalizeBoardColumnToPhaseId(item.boardColumn)} />}
                      title={item.clientLabel}
                      context={`${item.region} · ${item.title}`}
                      status={
                        <CareDominantStatus
                          className={
                            item.matchConfidenceLabel?.includes("Handmatige")
                              ? "border-amber-500/35 bg-amber-500/10 text-amber-100"
                              : item.matchConfidenceLabel?.includes("Capaciteit")
                                ? "border-amber-500/35 bg-amber-500/10 text-amber-100"
                                : undefined
                          }
                        >
                          {item.matchConfidenceLabel ?? item.phaseLabel}
                        </CareDominantStatus>
                      }
                      time={
                        <CareMetaChip>
                          <MapPinned size={12} />
                          {item.daysInCurrentPhase}d in fase
                        </CareMetaChip>
                      }
                      contextInfo={
                        <>
                          <CareMetaChip>{item.recommendedProvidersCount} aanbieders</CareMetaChip>
                          {item.matchAdvisoryHint ? (
                            <CareMetaChip className="max-w-[14rem] truncate" title={item.matchAdvisoryHint}>
                              {item.matchAdvisoryHint}
                            </CareMetaChip>
                          ) : null}
                          {item.isBlocked ? <CareMetaChip className="border-destructive/30 text-destructive">Geblokkeerd</CareMetaChip> : null}
                        </>
                      }
                      actionLabel={item.primaryActionEnabled ? "Vergelijk aanbieders" : "Controleer matchadvies"}
                      actionVariant={item.primaryActionEnabled ? "primary" : "ghost"}
                      onOpen={() => onCaseClick(item.id)}
                      onAction={(event) => {
                        event.stopPropagation();
                        onCaseClick(item.id);
                      }}
                      accentTone={item.isBlocked ? "critical" : item.urgency === "critical" ? "warning" : "neutral"}
                    />
                  ))}
                </CarePrimaryList>
              </div>
            </CareWorkListCard>
          )}
        </CareWorkspaceSection>
      )}
    </CarePageScaffold>
  );
}
