import { useMemo, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { Button } from "../ui/button";
import {
  CareContextHint,
  CareInfoPopover,
  CareMetaChip,
  CareMetricBadge,
  CareOperationalQueueHeader,
  CarePageScaffold,
  CarePrimaryList,
  CareQueueInlineAction,
  CareSearchFiltersBar,
  CareWorkListCard,
  CareWorkRow,
  CareDominantStatus,
  EmptyState,
  ErrorState,
  LoadingState,
} from "./CareDesignPrimitives";
import { useCases } from "../../hooks/useCases";
import { useProviders } from "../../hooks/useProviders";
import { buildWorkflowCases } from "../../lib/workflowUi";
import { tokens } from "../../design/tokens";

interface AssessmentQueuePageProps {
  onCaseClick?: (caseId: string) => void;
  onNavigateToCasussen?: () => void;
}

export function AssessmentQueuePage({ onCaseClick, onNavigateToCasussen }: AssessmentQueuePageProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUrgency, setSelectedUrgency] = useState("all");
  const [showSecondaryFilters, setShowSecondaryFilters] = useState(false);
  const { cases, loading, error, refetch } = useCases({ q: searchQuery });
  const { providers } = useProviders({ q: "" });

  const queueCases = useMemo(() => {
    return buildWorkflowCases(cases, providers)
      .filter((item) => item.phase === "intake" || item.phase === "provider_beoordeling")
      .filter((item) => selectedUrgency === "all" || item.urgency === selectedUrgency)
      .sort((left, right) => right.daysInCurrentPhase - left.daysInCurrentPhase);
  }, [cases, providers, selectedUrgency]);

  return (
    <CarePageScaffold
      archetype="queue"
      className="pb-8"
      title={
        <span className="inline-flex flex-wrap items-center gap-2">
          Reacties
          <CareInfoPopover ariaLabel="Uitleg wachtrij reacties" testId="aanbieder-beoordeling-queue-info">
            <p className="text-muted-foreground">Open voor besluit.</p>
          </CareInfoPopover>
        </span>
      }
      metric={
        <CareMetricBadge>
          {queueCases.length} {queueCases.length === 1 ? "casus in wachtrij" : "casussen in wachtrij"}
        </CareMetricBadge>
      }
      filters={
        <CareSearchFiltersBar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Zoek casus, regio of aanbieder..."
          showSecondaryFilters={showSecondaryFilters}
          onToggleSecondaryFilters={() => setShowSecondaryFilters((current) => !current)}
          secondaryFilters={
            <label className="block text-xs text-muted-foreground" style={{ maxWidth: tokens.layout.contentMeasureTight }}>
              <span className="mb-1 block font-medium uppercase tracking-[0.08em]">Urgentie</span>
              <select
                value={selectedUrgency}
                onChange={(event) => setSelectedUrgency(event.target.value)}
                className="h-10 w-full rounded-xl border border-border/70 bg-background px-3 text-sm text-foreground"
              >
                <option value="all">Alle urgentie</option>
                <option value="critical">Kritiek</option>
                <option value="warning">Hoog</option>
                <option value="normal">Normaal</option>
                <option value="stable">Laag</option>
              </select>
            </label>
          }
        />
      }
    >
      {loading && <LoadingState title="Casussen laden…" copy="De beoordelingswachtrij wordt opgebouwd." />}

      {!loading && error && (
        <ErrorState title="Laden mislukt" copy={error} action={<Button variant="outline" onClick={refetch}>Opnieuw</Button>} />
      )}

      {!loading && !error && queueCases.length === 0 && (
        <EmptyState
          title="Geen open beoordelingen"
          copy="Zodra casussen intake of aanbieder-beoordeling ingaan, verschijnen ze hier."
          action={
            onNavigateToCasussen ? (
              <CareQueueInlineAction onClick={() => onNavigateToCasussen()}>Open werkvoorraad</CareQueueInlineAction>
            ) : undefined
          }
        />
      )}

      {!loading && !error && queueCases.length > 0 && (
        <CareWorkListCard
          testId="assessment-queue-worklist"
          header={
            <CareOperationalQueueHeader
              labels={["Urgentie", "Casus", "Operationeel", "Fase", "Wachttijd", "Actie"]}
            />
          }
        >
          <CarePrimaryList>
            {queueCases.map((item) => (
              <CareWorkRow
                key={item.id}
                density="operational"
                leading={
                  <CareMetaChip className="h-6 px-2 text-[11px] font-semibold">
                    {item.urgencyLabel}
                  </CareMetaChip>
                }
                title={item.clientLabel}
                context={
                  <>
                    <CareMetaChip className="font-mono text-[11px]">{item.id}</CareMetaChip>
                    <CareMetaChip>{item.region}</CareMetaChip>
                    <span className="line-clamp-1 text-[11px]">{item.tags[0] ?? "Casus"}</span>
                  </>
                }
                status={<CareDominantStatus>{item.phaseLabel}</CareDominantStatus>}
                time={
                  <CareMetaChip>
                    {item.daysInCurrentPhase} dagen
                  </CareMetaChip>
                }
                actionLabel="Openen"
                actionVariant="ghost"
                onOpen={() => onCaseClick?.(item.id)}
                onAction={(event) => {
                  event.stopPropagation();
                  onCaseClick?.(item.id);
                }}
              />
            ))}
          </CarePrimaryList>
        </CareWorkListCard>
      )}

      <CareContextHint
        icon={<ClipboardCheck className="text-muted-foreground" size={20} />}
        title="Zelfde casusflow"
        copy="Beoordeling blijft aan de casus gekoppeld."
      />
    </CarePageScaffold>
  );
}
