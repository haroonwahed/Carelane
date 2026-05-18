import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, Loader2, Send, XCircle } from "lucide-react";
import { apiClient } from "../../lib/apiClient";
import { useCases, type SpaCase } from "../../hooks/useCases";
import { Button } from "../ui/button";
import {
  CareAttentionBar,
  CareQueueInlineAction,
  CareContextHint,
  CareDominantStatus,
  CareInfoPopover,
  CareMetaChip,
  CareMetricBadge,
  CareOperationalQueueHeader,
  CarePageScaffold,
  CarePrimaryList,
  CareSectionHeader,
  CareWorkspaceSection,
  CareSearchFiltersBar,
  CareWorkListCard,
  CareWorkRow,
  CARE_RHYTHM,
  EmptyState,
  ErrorState,
  LoadingState,
  PrimaryActionButton,
} from "./CareDesignPrimitives";
import { cn } from "../ui/utils";

interface IntakeListPageProps {
  onCaseClick: (caseId: string) => void;
  view?: "requests" | "responses" | "intake";
  onRequestApproved?: (caseId: string) => void;
  role?: "gemeente" | "zorgaanbieder" | "admin";
}

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

function matchesSearch(caseItem: SpaCase, query: string): boolean {
  if (!query) {
    return true;
  }

  const haystack = [caseItem.id, caseItem.title, caseItem.regio, caseItem.zorgtype]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

function requestBadge(view: IntakeListPageProps["view"]): { title: string; description: string } {
  switch (view) {
    case "intake":
      return {
        title: "Intake en plaatsing",
        description: "Geaccepteerde casussen in plaatsing of intake.",
      };
    case "responses":
      return {
        title: "Plaatsingsreacties",
        description: "Casussen die zijn geaccepteerd en doorgestroomd.",
      };
    default:
      return {
        title: "Nieuwe aanvragen",
        description: "Beoordeel nieuwe verzoeken.",
      };
  }
}

export function IntakeListPage({ onCaseClick, view = "intake", onRequestApproved, role = "zorgaanbieder" }: IntakeListPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [submittingCaseId, setSubmittingCaseId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { cases, loading, error, refetch } = useCases({ q: searchQuery });

  const pendingRequests = useMemo(
    () => cases.filter((caseItem) => caseItem.status === "provider_beoordeling" && matchesSearch(caseItem, searchQuery)),
    [cases, searchQuery],
  );
  const intakeCases = useMemo(
    () => cases.filter((caseItem) => caseItem.status === "plaatsing" && matchesSearch(caseItem, searchQuery)),
    [cases, searchQuery],
  );

  const summary = requestBadge(view);
  const visibleCases = view === "requests" ? pendingRequests : intakeCases;
  const attentionMessage =
    feedback ??
    (pendingRequests.length > 0
      ? pendingRequests.length === 1
        ? "1 open aanvraag — beoordeling nodig"
        : `${pendingRequests.length} open aanvragen — beoordeling nodig`
      : "Geen open aanvragen");

  const handleDecision = async (caseId: string, status: "ACCEPTED" | "REJECTED") => {
    if (submittingCaseId) {
      return;
    }

    setSubmittingCaseId(caseId);
    setFeedback(null);

    try {
      await apiClient.post(`/care/api/cases/${caseId}/provider-decision/`, { status });
      refetch();

      if (status === "ACCEPTED") {
        setFeedback(`Casus ${caseId} is geaccepteerd en doorgestuurd naar intake.`);
        onRequestApproved?.(caseId);
      } else {
        setFeedback(`Casus ${caseId} is afgewezen en teruggezet naar matching.`);
      }
    } catch (decisionError) {
      setFeedback(decisionError instanceof Error ? decisionError.message : "Actie kon niet worden verwerkt.");
    } finally {
      setSubmittingCaseId(null);
    }
  };

  return (
    <CarePageScaffold
      archetype="queue"
      className="pb-8"
      title={
        <span className="inline-flex flex-wrap items-center gap-2">
          {summary.title}
          <CareInfoPopover ariaLabel="Intake-overzicht" testId="intake-page-info">
            <p className="text-muted-foreground">{summary.description}</p>
          </CareInfoPopover>
        </span>
      }
      metric={
        <CareMetricBadge>
          {visibleCases.length} zichtbaar · {pendingRequests.length} open{" "}
          {pendingRequests.length === 1 ? "aanvraag" : "aanvragen"} · {intakeCases.length} plaatsing/intake
        </CareMetricBadge>
      }
      dominantAction={
        <CareAttentionBar
          layout="compact"
          tone={pendingRequests.length > 0 ? "warning" : "info"}
          icon={<Send size={16} />}
          message={attentionMessage}
          action={
            visibleCases.length > 0 ? (
              <CareQueueInlineAction onClick={() => onCaseClick(visibleCases[0].id)}>
                Bekijk eerste casus
              </CareQueueInlineAction>
            ) : undefined
          }
        />
      }
      actions={
        <Button variant="outline" onClick={() => void refetch()}>
          Ververs
        </Button>
      }
    >
      <CareWorkspaceSection
        testId="intake-workspace"
        aria-labelledby="intake-werkvoorraad-heading"
        bodyBleedX
        header={
          <CareSectionHeader
            className="lg:flex-col lg:items-stretch"
            title={<span id="intake-werkvoorraad-heading">Werkvoorraad</span>}
            meta={
              <div className={cn("w-full min-w-0", CARE_RHYTHM.metaStack)}>
                <span className="inline-flex w-fit items-center rounded-full border border-border/60 bg-muted/30 px-2.5 py-0.5 text-[12px] font-semibold text-muted-foreground">
                  {visibleCases.length} casussen
                </span>
                <CareSearchFiltersBar
                  variant="workspace"
                  className="px-0"
                  searchValue={searchQuery}
                  onSearchChange={setSearchQuery}
                  searchPlaceholder="Zoek op casus, regio of zorgtype"
                />
              </div>
            }
          />
        }
      >
        {loading && <LoadingState title="Laden…" copy="Intake-overzicht wordt opgebouwd." />}

        {!loading && error && (
          <ErrorState
            title="Fout bij laden"
            copy={error}
            action={<Button variant="outline" onClick={() => void refetch()}>Opnieuw</Button>}
          />
        )}

        {!loading && !error && visibleCases.length === 0 && (
          <EmptyState
            title={view === "requests" ? "Geen open verzoeken" : "Geen casussen in dit overzicht"}
            copy={view === "requests" ? "Pas de zoekopdracht of kom later terug." : "Geen plaatsingen of intakes die aan dit filter voldoen."}
          />
        )}

        {!loading && !error && visibleCases.length > 0 && (
          <CareWorkListCard
            testId="intake-worklist"
            header={
              <CareOperationalQueueHeader
                labels={["Urgentie", "Casus", "Operationeel", "Status", "Wachttijd", "Volgende actie"]}
              />
            }
          >
            <div className="divide-y divide-border/40">
              <CarePrimaryList>
                {visibleCases.map((caseItem) => {
                  const isPending = caseItem.status === "provider_beoordeling";
                  const isBusy = submittingCaseId === caseItem.id;
                  const canDecide = isPending && role === "zorgaanbieder";

                  return (
                    <CareWorkRow
                      key={caseItem.id}
                      density="operational"
                      leading={
                        <CareMetaChip
                          className={cn(
                            "h-6 px-2 text-[11px] font-semibold",
                            caseItem.urgency === "critical"
                              ? "border-red-500/35 bg-red-500/10 text-red-100"
                              : caseItem.urgency === "warning"
                                ? "border-amber-500/35 bg-amber-500/10 text-amber-100"
                                : "border-border bg-muted/30 text-foreground",
                          )}
                        >
                          {caseItem.urgency === "critical" ? "Kritiek" : caseItem.urgency === "warning" ? "Hoog" : "Normaal"}
                        </CareMetaChip>
                      }
                      title={formatClientReference(caseItem.id)}
                      context={
                        <>
                          <CareMetaChip className="font-mono text-[11px]">{caseItem.id}</CareMetaChip>
                          <CareMetaChip>{caseItem.regio || "Regio onbekend"}</CareMetaChip>
                          <span className="line-clamp-1 min-w-0 max-w-[min(100%,28rem)] text-[11px] text-foreground/85">
                            {caseItem.systemInsight || caseItem.recommendedAction || "Geen toelichting."}
                          </span>
                        </>
                      }
                      status={
                        <CareDominantStatus>
                          {isPending ? "In beoordeling" : "Intake / plaatsing"}
                        </CareDominantStatus>
                      }
                      time={
                        <CareMetaChip>
                          <Clock3 size={12} aria-hidden />
                          {caseItem.wachttijd}d wacht
                        </CareMetaChip>
                      }
                      contextInfo={
                        canDecide ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 shrink-0 px-2 text-xs"
                            disabled={isBusy}
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleDecision(caseItem.id, "REJECTED");
                            }}
                          >
                            <XCircle size={14} className="mr-1" aria-hidden />
                            Afwijzen
                          </Button>
                        ) : (
                          <CareMetaChip>{maskParticipantIdentity(caseItem.title || caseItem.id)}</CareMetaChip>
                        )
                      }
                      actionLabel={canDecide ? (isBusy ? "Verwerken…" : "Accepteren") : "Bekijk casus"}
                      actionVariant={canDecide ? "primary" : "ghost"}
                      accentTone={caseItem.urgency === "critical" ? "critical" : caseItem.urgency === "warning" ? "warning" : "neutral"}
                      onOpen={() => onCaseClick(caseItem.id)}
                      onAction={(event) => {
                        event.stopPropagation();
                        if (canDecide && !isBusy) {
                          void handleDecision(caseItem.id, "ACCEPTED");
                        } else {
                          onCaseClick(caseItem.id);
                        }
                      }}
                    />
                  );
                })}
              </CarePrimaryList>
            </div>
          </CareWorkListCard>
        )}
      </CareWorkspaceSection>

      <CareContextHint
        icon={<CheckCircle2 className="text-primary" size={20} />}
        title="Workflow"
        copy="Accepteren zet door naar plaatsing en intake. Afwijzen stuurt terug naar matching."
      />
    </CarePageScaffold>
  );
}
