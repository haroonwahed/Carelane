import { Fragment, type ReactNode, type Ref } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

/**
 * CareDetailPageTemplate — the single, canonical layout for every Carelane detail page
 * (casus, matching, aanbiederreactie, plaatsing, intake, aanbieder, organisatie).
 *
 * The template owns: layout, spacing, grid, header, workflow strip, action zone,
 * tabs placement, right column, and where CTAs live. The *phase* only supplies
 * content (title, status, action holder, CTA, visible tab content).
 *
 * Slot order (top → bottom):
 *   stickyBar?  →  header  →  workflow (workflow-variant only)  →  actionZone
 *   →  [ main content (70%)  |  sidebar (30%, sticky) ]
 *
 * Fixed component rules enforced here:
 *   - Primary CTA lives only in the action zone (never the sidebar).
 *   - Context metadata lives only in the sidebar (right column).
 *   - Tables/lists live in the main content, never the sidebar.
 */

export type CareDetailVariant = "workflow" | "entity" | "review";

export interface CareDetailPageTemplateProps {
  /** "workflow" shows the 5-step strip; "entity"/"review" hide it. */
  variant?: CareDetailVariant;
  /** Optional sticky context strip shown above the header when the action zone scrolls away. */
  stickyBar?: ReactNode;
  /** Page header — typically <CareDetailHeader />. */
  header: ReactNode;
  /** Workflow strip — typically <CareWorkflowStrip />. Wrapped in the standard card by the template. */
  workflow?: ReactNode;
  /**
   * Operational action zone — typically <CareActionZone />.
   * Default: rendered as the lead card *inside* the main column, so the context
   * column stays top-aligned beside it (the canonical Carelane detail look).
   * With variant="review" it spans full width above the grid instead.
   */
  actionZone?: ReactNode;
  /** Forwarded to the action-zone wrapper (used for scroll/intersection observers). */
  actionZoneRef?: Ref<HTMLDivElement>;
  /** Right column — casuscontext / entity metadata. Never holds a primary CTA. */
  sidebar?: ReactNode;
  /** Main content (active tab content, sections, tables). Left 70% column. */
  children?: ReactNode;
  /** Back-compat testids so existing pages/tests keep their hooks. */
  workflowTestId?: string;
  actionZoneTestId?: string;
  sidebarTestId?: string;
}

export function CareDetailPageTemplate({
  variant = "workflow",
  stickyBar,
  header,
  workflow,
  actionZone,
  actionZoneRef,
  sidebar,
  children,
  workflowTestId,
  actionZoneTestId,
  sidebarTestId,
}: CareDetailPageTemplateProps) {
  const showWorkflow = variant === "workflow";
  /** "review" pages get the loud full-width action band; everything else keeps it in-column. */
  const fullWidthActionZone = variant === "review";

  const actionZoneNode = actionZone ? (
    <section ref={actionZoneRef} data-testid={actionZoneTestId}>
      {actionZone}
    </section>
  ) : null;

  return (
    <div className="w-full min-w-0 space-y-4 pb-8 text-foreground">
      {stickyBar}

      {header}

      {showWorkflow && workflow ? (
        <section
          data-testid={workflowTestId}
          className="rounded-xl border border-border/60 bg-card/30 px-5 py-3 overflow-x-auto"
        >
          {workflow}
        </section>
      ) : null}

      {fullWidthActionZone ? actionZoneNode : null}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-4">
          {fullWidthActionZone ? null : actionZoneNode}
          {children}
        </div>

        {sidebar ? (
          <aside
            data-testid={sidebarTestId}
            className="w-full shrink-0 lg:sticky lg:top-4 lg:w-[340px] lg:self-start"
          >
            {sidebar}
          </aside>
        ) : null}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * 1. Header
 * ────────────────────────────────────────────────────────────────────────── */

export interface CareContextItem {
  icon: ReactNode;
  node: ReactNode;
}

export interface CareDetailHeaderProps {
  onBack: () => void;
  backLabel: string;
  title: ReactNode;
  /** Status / phase / priority badges shown next to the title. */
  badges?: ReactNode;
  /** Short context line — icon left of every item, dot-separated. */
  contextItems?: CareContextItem[];
  updatedAtLabel?: string | null;
  onRefresh?: () => void | Promise<void>;
  refreshing?: boolean;
  refreshLabel?: string;
  /** Secondary actions menu (right side). */
  actions?: ReactNode;
}

export function CareDetailHeader({
  onBack,
  backLabel,
  title,
  badges,
  contextItems,
  updatedAtLabel,
  onRefresh,
  refreshing = false,
  refreshLabel = "Ververs gegevens",
  actions,
}: CareDetailHeaderProps) {
  return (
    <div className="min-w-0 space-y-3">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold leading-none text-primary transition-colors hover:text-muted-foreground"
      >
        <ArrowLeft size={16} className="translate-y-px" />
        {backLabel}
      </button>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="care-text-title text-foreground">{title}</h1>
            {badges}
          </div>
          {contextItems && contextItems.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-muted-foreground">
              {contextItems.map((item, index) => (
                <Fragment key={index}>
                  {index > 0 && <span className="text-border/60" aria-hidden>·</span>}
                  <span className="inline-flex items-center gap-1.5">
                    <span className="shrink-0 text-muted-foreground" aria-hidden>{item.icon}</span>
                    {item.node}
                  </span>
                </Fragment>
              ))}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {updatedAtLabel ? (
            <span className="hidden items-center gap-1.5 text-[12px] text-muted-foreground md:inline-flex">
              Bijgewerkt {updatedAtLabel}
              {onRefresh ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => void onRefresh()}
                  disabled={refreshing}
                  className="h-6 w-6 text-muted-foreground/50 hover:text-foreground"
                  aria-label={refreshLabel}
                  title={refreshLabel}
                >
                  <RefreshCw size={13} className={refreshing ? "animate-spin" : undefined} />
                </Button>
              ) : null}
            </span>
          ) : null}
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * 2. Workflow strip
 * ────────────────────────────────────────────────────────────────────────── */

export interface CareWorkflowStep {
  label: string;
}

/** The canonical Carelane workflow. Use these five everywhere a workflow page renders. */
export const CARE_WORKFLOW_STEPS: readonly CareWorkflowStep[] = [
  { label: "Aanmelding" },
  { label: "Matching" },
  { label: "Aanbiederreactie" },
  { label: "Plaatsing" },
  { label: "Intake" },
];

export function CareWorkflowStrip({
  steps = CARE_WORKFLOW_STEPS,
  activeIndex,
}: {
  steps?: readonly CareWorkflowStep[];
  activeIndex: number;
}) {
  return (
    <nav className="flex min-w-[640px] items-center" aria-label="Workflow fasen">
      {steps.map((step, index, arr) => {
        const isCurrent = index === activeIndex;
        const isDone = index < activeIndex;
        return (
          <Fragment key={step.label}>
            <div className="flex shrink-0 items-center gap-2.5" aria-current={isCurrent ? "step" : undefined}>
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border text-[12px] font-semibold tabular-nums",
                  isCurrent || isDone
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/60 bg-transparent text-muted-foreground",
                )}
              >
                {isDone ? <Check className="size-3.5" aria-hidden /> : index + 1}
              </div>
              <span
                className={cn(
                  "whitespace-nowrap text-[13px] font-medium",
                  isCurrent ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {index < arr.length - 1 ? (
              <div className="mx-3 h-px flex-1 bg-border/50" aria-hidden />
            ) : null}
          </Fragment>
        );
      })}
    </nav>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * 3. Operational action zone — "what's happening, why, what now"
 * ────────────────────────────────────────────────────────────────────────── */

export interface CareActionZoneCta {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  pending?: boolean;
}

export function CareActionZone({
  icon,
  title,
  description,
  tone = "default",
  criteria,
  actionHolderLabel = "Actiehouder",
  actionHolderValue,
  primary,
  secondary,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  tone?: "default" | "blocked";
  /** 2–4 concrete criteria / context rows shown in the middle. */
  criteria?: ReactNode;
  actionHolderLabel?: string;
  actionHolderValue?: ReactNode;
  primary?: CareActionZoneCta | null;
  secondary?: CareActionZoneCta | null;
}) {
  return (
    <div className="rounded-[22px] border border-border/60 bg-card/30 p-5 md:p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        {/* Left — status */}
        <div className="flex min-w-0 items-start gap-4">
          {icon ? (
            <div
              className={cn(
                "flex size-12 shrink-0 items-center justify-center rounded-full",
                tone === "blocked" ? "bg-destructive/15 text-destructive" : "bg-primary/10 text-primary",
              )}
            >
              {icon}
            </div>
          ) : null}
          <div className="min-w-0">
            <h2 className="text-[17px] font-semibold leading-snug text-foreground">{title}</h2>
            {description ? <p className="mt-1 text-[13px] text-muted-foreground">{description}</p> : null}
            {criteria ? <div className="mt-3">{criteria}</div> : null}
          </div>
        </div>

        {/* Right — action holder + CTA */}
        {(actionHolderValue || primary || secondary) && (
          <div className="flex shrink-0 flex-col items-stretch gap-3 md:items-end md:text-right">
            {actionHolderValue ? (
              <div>
                <p className="text-[11px] font-medium text-muted-foreground/70">{actionHolderLabel}</p>
                <p className="mt-1 text-[13px] font-medium text-foreground">{actionHolderValue}</p>
              </div>
            ) : null}
            {primary ? (
              <Button
                type="button"
                onClick={primary.onClick}
                disabled={primary.disabled || primary.pending}
                className="gap-2 rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {primary.pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                {primary.label}
                {!primary.pending ? <ArrowRight className="size-4" aria-hidden /> : null}
              </Button>
            ) : null}
            {secondary ? (
              <button
                type="button"
                onClick={secondary.onClick}
                disabled={secondary.disabled || secondary.pending}
                className="text-[13px] font-medium text-primary hover:underline disabled:opacity-50"
              >
                {secondary.label}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * 4. Tabs
 * ────────────────────────────────────────────────────────────────────────── */

export interface CareDetailTab {
  id: string;
  label: string;
}

export function CareDetailTabs({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: readonly CareDetailTab[];
  activeTab: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 border-b border-border/50" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "-mb-px border-b-2 px-3 py-2 text-[13px] font-medium transition-colors",
            activeTab === tab.id
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * 5. Right column — context panel
 * ────────────────────────────────────────────────────────────────────────── */

export interface CareContextRow {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  onClick?: () => void;
}

export function CareContextPanel({
  heading = "Casuscontext",
  rows,
}: {
  heading?: ReactNode;
  rows: CareContextRow[];
}) {
  return (
    <div className="rounded-[22px] border border-border/60 bg-card/45 p-4 shadow-sm">
      <h3 className="care-text-subheading text-foreground">{heading}</h3>
      <div className="mt-3 space-y-3">
        {rows.map((row, index) => {
          const body = (
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium leading-none tracking-wide text-muted-foreground/60">{row.label}</p>
              <p className="mt-0.5 break-words text-[13px] font-medium leading-snug text-foreground">{row.value}</p>
            </div>
          );
          return (
            <div key={index} className="flex min-w-0 gap-2.5">
              {row.icon ? <span className="mt-0.5 shrink-0 text-muted-foreground/60" aria-hidden>{row.icon}</span> : null}
              {row.onClick ? (
                <button type="button" onClick={row.onClick} className="flex min-w-0 flex-1 gap-2.5 text-left hover:opacity-80">
                  {body}
                </button>
              ) : (
                body
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * 6. Content building blocks
 * ────────────────────────────────────────────────────────────────────────── */

export function CareSection({
  title,
  icon,
  action,
  children,
}: {
  title: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[22px] border border-border/60 p-4 md:p-5" aria-label={typeof title === "string" ? title : undefined}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
          {icon ? <span className="text-muted-foreground" aria-hidden>{icon}</span> : null}
          {title}
        </h3>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export interface CareField {
  label: string;
  value: ReactNode;
  title?: string;
}

export function CareFieldGrid({
  fields,
  columns = 3,
}: {
  fields: CareField[];
  columns?: 2 | 3 | 4;
}) {
  const colClass = columns === 4 ? "sm:grid-cols-4" : columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";
  return (
    <div className={cn("grid grid-cols-2 gap-2.5", colClass)}>
      {fields.map((field) => (
        <div key={field.label} className="rounded-[14px] border border-border/50 bg-background/40 p-3">
          <p className="text-[11px] text-muted-foreground">{field.label}</p>
          <p className="truncate text-[13px] font-semibold text-foreground" title={field.title ?? (typeof field.value === "string" ? field.value : undefined)}>
            {field.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export interface CareActivityEvent {
  label: ReactNode;
  timestamp?: string | null;
  source?: string | null;
}

export function CareActivityList({ events }: { events: CareActivityEvent[] }) {
  if (events.length === 0) {
    return <p className="text-[13px] text-muted-foreground">Nog geen activiteit vastgelegd.</p>;
  }
  return (
    <ul className="space-y-0">
      {events.map((event, index) => (
        <li key={index} className="flex items-baseline justify-between gap-3 border-b border-border/30 py-2.5 last:border-0">
          <span className="min-w-0 text-[13px] text-foreground">{event.label}</span>
          {event.timestamp ? (
            <span className="shrink-0 text-[12px] tabular-nums text-muted-foreground">{event.timestamp}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
