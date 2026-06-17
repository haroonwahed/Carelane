import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, Flag, Loader2, MapPin, UserRound } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import {
  CasusWorkspaceStatusBadges,
  FlowPhaseBadge,
  PriorityBadge,
  type CasusWorkspaceStatusVariant,
  type PriorityTone,
} from "./CareDesignPrimitives";
import {
  CareDetailHeader,
  CareDetailPageTemplate,
  type CareContextItem,
} from "./CareDetailPageTemplate";

export type { CasusWorkspaceStatusVariant };

/**
 * Casus-specific adapter over the canonical {@link CareDetailPageTemplate}.
 * It maps the casus props onto the template slots (header, workflow, action zone,
 * sidebar, main content) so the casus detail page can never drift from the shared
 * layout. Phase-specific content is still supplied by the caller.
 */
export interface CasusWorkspaceLayoutProps {
  onBack: () => void;
  backLabel?: string;
  /** Canonical flow progress (always visible, directly below identity). */
  flowProgress?: ReactNode;
  title: string;
  /** Optional second line below the title — e.g. "Jongere, 17 jaar · Ambulante begeleiding" */
  titleSubline?: string;
  /** Human label — used when `phaseId` is omitted (legacy callers). */
  phaseLabel: string;
  /** Canonical keten id — when set, shows `FlowPhaseBadge` aligned with lists/boards. */
  phaseId?: string;
  statusVariant: CasusWorkspaceStatusVariant;
  statusHint?: string | null;
  headerActions?: ReactNode;
  updatedAtLabel?: string | null;
  onRefresh?: () => void | Promise<void>;
  refreshing?: boolean;
  /** Problem + primary action — the operational action zone (full width). */
  caseHero: ReactNode;
  /** Explain → risk → guidance for this phase (no duplicate primary CTA here). */
  decisionPanel?: ReactNode;
  /** Summary, details, evidence, tabs — the main content column. */
  contextStack: ReactNode;
  /** Persistent context strip — shown as a sticky bar at the top when scrolling. */
  caseIdentityLabel?: string;
  municipality?: string;
  urgencyLabel?: string;
  urgencyTone?: "critical" | "warning" | "neutral";
  /** Priority badge shown in the header badge row (always visible, even for "normaal") */
  priorityBadgeTone?: PriorityTone;
  priorityBadgeLabel?: string;
  ownerLabel?: string;
  elapsedLabel?: string;
  blockerLabel?: string;
  dominantActionLabel?: string;
  onDominantAction?: () => void;
  dominantActionDisabled?: boolean;
  dominantActionPending?: boolean;
  /** Right-side context rail. */
  contextRail?: ReactNode;
}

export function CasusWorkspaceLayout({
  onBack,
  backLabel = "Terug naar casussen",
  flowProgress,
  title,
  titleSubline,
  phaseLabel,
  phaseId,
  statusVariant,
  statusHint,
  headerActions,
  updatedAtLabel,
  onRefresh,
  refreshing = false,
  caseHero,
  decisionPanel,
  contextStack,
  caseIdentityLabel,
  municipality,
  urgencyLabel,
  urgencyTone = "neutral",
  priorityBadgeTone,
  ownerLabel,
  elapsedLabel,
  blockerLabel,
  dominantActionLabel,
  onDominantAction,
  dominantActionDisabled = false,
  dominantActionPending = false,
  contextRail,
}: CasusWorkspaceLayoutProps) {
  const hasStickyBar = Boolean(caseIdentityLabel || urgencyLabel || ownerLabel || blockerLabel);
  const heroBandRef = useRef<HTMLDivElement>(null);
  const [heroInView, setHeroInView] = useState(true);

  useEffect(() => {
    const el = heroBandRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeroInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const contextItems: CareContextItem[] = [];
  if (titleSubline) contextItems.push({ icon: <UserRound className="size-3.5" />, node: titleSubline });
  if (municipality) contextItems.push({ icon: <MapPin className="size-3.5" />, node: municipality });
  if (urgencyLabel) {
    contextItems.push({
      icon: <Flag className="size-3.5" />,
      node: (
        <>
          Urgentie:{" "}
          <span className={cn("font-medium", urgencyTone === "critical" && "text-care-urgent-text")}>{urgencyLabel}</span>
        </>
      ),
    });
  }

  const badges = (
    <>
      {phaseId ? (
        <FlowPhaseBadge phaseId={phaseId} />
      ) : phaseLabel ? (
        <Badge className="border-border/40 bg-muted/30 text-[11px] font-medium text-muted-foreground shadow-none">
          {phaseLabel}
        </Badge>
      ) : null}
      <CasusWorkspaceStatusBadges variant={statusVariant} hint={statusHint} />
      {priorityBadgeTone && (
        <PriorityBadge tone={priorityBadgeTone} className="border-border/30 bg-muted/20 text-[11px] opacity-85" />
      )}
    </>
  );

  const stickyBar = hasStickyBar ? (
    <div
      data-testid="casus-sticky-context-bar"
      className={cn(
        "sticky top-3 mx-4 transition-all duration-150",
        heroInView
          ? "pointer-events-none max-h-0 overflow-hidden opacity-0"
          : "flex items-center gap-3 rounded-xl border border-primary/25 bg-[var(--surface-elevated)] px-4 py-2.5 opacity-100",
      )}
      style={{ zIndex: "var(--care-z-sticky)", boxShadow: heroInView ? "none" : "0 4px 16px rgba(0,0,0,0.22), 0 0 0 1px rgba(var(--color-primary-rgb, 99,102,241),0.08)" }}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
        {caseIdentityLabel && (
          <span className="text-[12px] font-semibold text-foreground">{caseIdentityLabel}</span>
        )}
        {urgencyLabel && (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
              urgencyTone === "critical"
                ? "bg-care-urgent-bg text-care-urgent-text"
                : urgencyTone === "warning"
                  ? "bg-care-warning-bg text-care-warning-text"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {urgencyLabel}
          </span>
        )}
        {municipality && (
          <span className="hidden text-[12px] text-muted-foreground sm:inline">{municipality}</span>
        )}
        {ownerLabel && (
          <span className="hidden text-[12px] text-muted-foreground md:inline">
            <span className="mr-1 text-muted-foreground/60">Eigenaar:</span>
            {ownerLabel}
          </span>
        )}
        {elapsedLabel && (
          <span className="hidden text-[12px] text-muted-foreground lg:inline">{elapsedLabel}</span>
        )}
        {blockerLabel && (
          <span className="flex items-center gap-1 text-[12px] text-care-urgent-text">
            <AlertTriangle size={11} aria-hidden />
            <span className="max-w-[220px] truncate" title={blockerLabel}>{blockerLabel}</span>
          </span>
        )}
      </div>
      {dominantActionLabel && onDominantAction && !heroInView && (
        <Button
          type="button"
          size="sm"
          onClick={onDominantAction}
          disabled={dominantActionDisabled || dominantActionPending}
          className="ml-auto h-8 shrink-0 rounded-full px-4 text-[12px] font-semibold"
        >
          {dominantActionPending && <Loader2 size={12} className="mr-1.5 animate-spin" aria-hidden />}
          {dominantActionLabel}
        </Button>
      )}
    </div>
  ) : undefined;

  return (
    <CareDetailPageTemplate
      variant="workflow"
      stickyBar={stickyBar}
      header={
        <CareDetailHeader
          onBack={onBack}
          backLabel={backLabel}
          title={title}
          badges={badges}
          contextItems={contextItems}
          updatedAtLabel={updatedAtLabel}
          onRefresh={onRefresh}
          refreshing={refreshing}
          refreshLabel="Ververs casusgegevens"
          actions={headerActions}
        />
      }
      workflow={flowProgress}
      workflowTestId="casus-flow-progress"
      actionZone={caseHero}
      actionZoneRef={heroBandRef}
      actionZoneTestId="casus-hero-band"
      sidebar={contextRail}
      sidebarTestId="casus-context-rail"
    >
      {decisionPanel ? (
        <section data-testid="casus-decision-panel" className="rounded-2xl border border-border/55 bg-card/35 p-5 md:p-6">
          {decisionPanel}
        </section>
      ) : null}
      <div data-testid="casus-context-stack" className="space-y-3">
        <div data-testid="case-context-panel" className="space-y-3">
          {contextStack}
        </div>
      </div>
    </CareDetailPageTemplate>
  );
}
