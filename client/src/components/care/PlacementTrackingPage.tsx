import { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import {
  CareAttentionBar,
  CareQueueInlineAction,
  CareContextHint,
  CareDominantStatus,
  CareFilterTabButton,
  CareFilterTabGroup,
  CareMetricBadge,
  CareInfoPopover,
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
  PrimaryActionButton,
  normalizeBoardColumnToPhaseId,
} from "./CareDesignPrimitives";
import { useCases } from "../../hooks/useCases";
import { useProviders } from "../../hooks/useProviders";
import {
  buildWorkflowCases,
  placementTrackingRowAction,
  placementTrackingRowStatusLabel,
  placementTrackingSubstepAmbiguous,
  placementTrackingTabBucket,
} from "../../lib/workflowUi";

interface PlacementTrackingPageProps {
  onCaseClick: (caseId: string) => void;
  onNavigateToMatching?: () => void;
}

type PlacementTab = "te-bevestigen" | "lopend" | "afgerond";

function formatClientReference(caseId: string): string {
  const digits = caseId.replace(/\D/g, "");
  if (digits.length >= 3) {
    return `CLI-${digits.padStart(5, "0").slice(-5)}`;
  }
  return "CLI-ONBEKEND";
}

function maskParticipantIdentity(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "Betrokkene afgeschermd";
  }
  return parts
    .map((part) => `${part[0] ?? ""}${"•".repeat(Math.max(3, part.length - 1))}`)
    .join(" ");
}

export function PlacementTrackingPage({ onCaseClick, onNavigateToMatching }: PlacementTrackingPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<PlacementTab>("te-bevestigen");
  const { cases, loading, error, refetch } = useCases({ q: searchQuery });
  const { providers } = useProviders({ q: "" });

  const placementCases = useMemo(() => {
    return buildWorkflowCases(cases, providers).filter((item) => item.phase === "plaatsing" || item.phase === "afgerond");
  }, [cases, providers]);

  const tabCounts = {
    "te-bevestigen": placementCases.filter((item) => placementTrackingTabBucket(item) === "te-bevestigen").length,
    lopend: placementCases.filter((item) => placementTrackingTabBucket(item) === "lopend").length,
    afgerond: placementCases.filter((item) => placementTrackingTabBucket(item) === "afgerond").length,
  };

  const visibleCases = placementCases.filter((item) => placementTrackingTabBucket(item) === activeTab);

  const intakeStallCount = useMemo(
    () => placementCases.filter((item) => item.phase === "plaatsing" && item.daysInCurrentPhase >= 5).length,
    [placementCases],
  );

  const ambiguousPlacementCount = useMemo(
    () => placementCases.filter((item) => placementTrackingSubstepAmbiguous(item)).length,
    [placementCases],
  );
  const attentionTone = intakeStallCount > 0 ? "warning" : ambiguousPlacementCount > 0 ? "info" : "info";
  const attentionMessage =
    ambiguousPlacementCount > 0 || intakeStallCount > 0
      ? [
          ambiguousPlacementCount > 0
            ? ambiguousPlacementCount === 1
              ? "1 casus heeft geen duidelijk placement-signaal (workflow/arrangement/placement-record)."
              : `${ambiguousPlacementCount} casussen hebben geen duidelijk placement-signaal (workflow/arrangement/placement-record).`
            : null,
          intakeStallCount > 0
            ? intakeStallCount === 1
              ? "1 plaatsing staat ≥5 dagen zonder duidelijke intake."
              : `${intakeStallCount} plaatsingen staan ≥5 dagen zonder duidelijke intake.`
            : null,
        ]
          .filter(Boolean)
          .join(" ")
      : "Plaatsing volgt op provideracceptatie; gebruik dit overzicht om bevestiging, intake en doorlooptijd te bewaken.";

  const emptyCopy = {
    "te-bevestigen": "Bevestig plaatsing en plan intake zodra de aanbieder heeft geaccepteerd.",
    lopend: "Volg lopende plaatsingen tot intake is gepland en gestart.",
    afgerond: "Afgeronde trajecten blijven hier terugvindbaar voor audit en nazorg.",
  } as const;

  const tabLabel: Record<PlacementTab, string> = {
    "te-bevestigen": "Te bevestigen",
    lopend: "Lopend",
    afgerond: "Afgerond",
  };

  return (
    <CarePageScaffold
      archetype="queue"
      className="pb-8"
      title={
        <span className="inline-flex flex-wrap items-center gap-2">
          Plaatsingen
          <CareInfoPopover ariaLabel="Uitleg plaatsingen" testId="plaatsingen-page-info">
            <p className="text-muted-foreground">Van bevestiging tot intake — één lijn door de keten.</p>
          </CareInfoPopover>
        </span>
      }
      subtitle="Plaatsing volgt pas nadat de aanbieder heeft geaccepteerd; daarna plan je intake en volg je de doorlooptijd op."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {onNavigateToMatching ? (
            <CareQueueInlineAction onClick={onNavigateToMatching}>Naar matching</CareQueueInlineAction>
          ) : null}
          <Button variant="outline" onClick={() => void refetch()}>
            Ververs
          </Button>
        </div>
      }
      metric={
        <CareMetricBadge>
          {placementCases.length} plaatsingen in flow
        </CareMetricBadge>
      }
      dominantAction={
        <CareAttentionBar
          layout="compact"
          tone={attentionTone}
          message={attentionMessage}
          action={onNavigateToMatching ? <CareQueueInlineAction onClick={onNavigateToMatching}>Bekijk matching</CareQueueInlineAction> : undefined}
        />
      }
    >
      {loading && <LoadingState title="Plaatsingen laden…" copy="De lijst wordt opgebouwd." />}
      {!loading && error && (
        <ErrorState title="Laden mislukt" copy={error} action={<Button variant="outline" onClick={refetch}>Opnieuw</Button>} />
      )}

      {!loading && !error && (
        <CareWorkspaceSection
          testId="plaatsingen-uitvoerlijst"
          aria-labelledby="plaatsingen-werkvoorraad-heading"
          bodyBleedX
          header={(
          <CareSectionHeader
            className="lg:flex-col lg:items-stretch"
            title={<span id="plaatsingen-werkvoorraad-heading">Werkvoorraad</span>}
            meta={
              <div className={cn("w-full min-w-0", CARE_RHYTHM.metaStack)}>
                <span className="inline-flex w-fit items-center rounded-full border border-border/60 bg-muted/30 px-2.5 py-0.5 text-[12px] font-semibold text-muted-foreground">
                  {visibleCases.length} plaatsingen
                </span>
                <CareSearchFiltersBar
                  variant="workspace"
                  className="px-0"
                  tabs={
                    <CareFilterTabGroup aria-label="Plaatsing-status">
                      {(["te-bevestigen", "lopend", "afgerond"] as PlacementTab[]).map((tab) => (
                        <CareFilterTabButton key={tab} selected={activeTab === tab} onClick={() => setActiveTab(tab)}>
                          {tabLabel[tab]} · {tabCounts[tab]}
                        </CareFilterTabButton>
                      ))}
                    </CareFilterTabGroup>
                  }
                  searchValue={searchQuery}
                  onSearchChange={setSearchQuery}
                  searchPlaceholder="Zoek casus, provider of regio..."
                />
              </div>
            }
          />
          )}
        >
            {visibleCases.length === 0 ? (
              <EmptyState
                title="Geen plaatsingen in dit overzicht"
                copy={emptyCopy[activeTab]}
                action={<CareQueueInlineAction onClick={() => onNavigateToMatching?.()}>Naar matching</CareQueueInlineAction>}
              />
            ) : (
              <CareWorkListCard
                header={
                  <CareOperationalQueueHeader
                    labels={["Fase", "Casus", "Status", "Tijd", "Context", "Volgende actie"]}
                  />
                }
              >
                <div className="divide-y divide-border/45">
                  <CarePrimaryList>
                    {visibleCases.map((item) => {
                      const { actionLabel, actionVariant } = placementTrackingRowAction(item);
                      const ambiguous = placementTrackingSubstepAmbiguous(item);
                      return (
                        <CareWorkRow
                          key={item.id}
                          density="operational"
                          leading={<FlowPhaseBadge phaseId={normalizeBoardColumnToPhaseId(item.boardColumn)} />}
                          title={formatClientReference(item.id)}
                          context={`${item.id} · ${item.recommendedProviderName ?? "Nog niet gekozen"}`}
                          status={<CareDominantStatus>{placementTrackingRowStatusLabel(item)}</CareDominantStatus>}
                          time={<CareMetaChip>{item.daysInCurrentPhase}d in fase</CareMetaChip>}
                          contextInfo={
                            <>
                              <CareMetaChip>Betrokkene: {maskParticipantIdentity(item.clientLabel || item.id)}</CareMetaChip>
                              <CareMetaChip>{item.intakeDateLabel ?? "Intake volgt"}</CareMetaChip>
                              {ambiguous ? (
                                <CareMetaChip title="Geen workflow/arrangement/placement-record in API — controleer via casus">
                                  Status via casus
                                </CareMetaChip>
                              ) : null}
                            </>
                          }
                          actionLabel={actionLabel}
                          actionVariant={actionVariant}
                          onOpen={() => onCaseClick(item.id)}
                          onAction={(event) => {
                            event.stopPropagation();
                            onCaseClick(item.id);
                          }}
                        />
                      );
                    })}
                  </CarePrimaryList>
                </div>
              </CareWorkListCard>
            )}
        </CareWorkspaceSection>
      )}

      <CareContextHint
        icon={<CheckCircle2 className="text-primary" size={20} />}
        title="Volgt uit provideracceptatie"
        copy="Plaatsing & intake horen bij elkaar; gebruik de casus voor de volgende beslissing en houd de volgorde vast."
      />
    </CarePageScaffold>
  );
}
