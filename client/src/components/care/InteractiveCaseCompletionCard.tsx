import { ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

export type MissingItem = {
  key: string;
  label: string;
  reason: string;
  actionLabel: string;
};

export function InteractiveCaseCompletionCard({
  isIncomplete,
  missingItems,
  completedCount,
  totalRequired,
  onStartCompletion,
  onRequestData,
  onMissingItemClick,
}: {
  isIncomplete: boolean;
  missingItems: MissingItem[];
  completedCount: number;
  totalRequired: number;
  onStartCompletion: () => void;
  onRequestData?: () => void;
  onMissingItemClick?: (key: string) => void;
}) {
  if (!isIncomplete) return null;

  const progressPercent = totalRequired > 0 ? Math.round((completedCount / totalRequired) * 100) : 100;

  return (
    <section
      className="rounded-2xl border border-border/55 bg-card/35 px-4 py-4 md:px-5 md:py-5"
      aria-label="Casus aanvullen"
    >
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-[14px] font-semibold text-foreground">
          Casus is nog niet compleet
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Matching kan starten zodra de verplichte gegevens zijn aangevuld.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-medium text-foreground">
            {completedCount} van {totalRequired} onderdelen compleet
          </span>
          <span className="text-[12px] font-medium text-muted-foreground">
            {progressPercent}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted/30">
          <div
            className="h-full bg-gradient-to-r from-care-warning-solid to-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
            aria-hidden
          />
        </div>
      </div>

      {/* Missing Items */}
      {missingItems.length > 0 && (
        <div className="mb-4 space-y-0.5 rounded-lg border border-border/40 bg-background/20 overflow-hidden">
          {missingItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onMissingItemClick?.(item.key)}
              className={cn(
                "w-full group flex items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors",
                "border-b border-border/20 last:border-0",
                "hover:bg-muted/20 focus-visible:outline-none focus-visible:bg-primary/5 focus-visible:ring-1 focus-visible:ring-primary"
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-foreground">
                  {item.label}
                </p>
                <p className="mt-0.5 text-[12px] text-muted-foreground line-clamp-1">
                  {item.reason}
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-1.5">
                <span className="text-[12px] text-muted-foreground group-hover:text-foreground transition-colors">
                  {item.actionLabel}
                </span>
                <ChevronRight size={14} className="text-muted-foreground/50 group-hover:text-primary transition-colors" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* CTA Buttons */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          className="rounded-[10px] font-medium sm:flex-1"
          onClick={onStartCompletion}
        >
          Maak casus compleet
        </Button>
        {onRequestData && (
          <Button
            type="button"
            variant="outline"
            className="rounded-[10px] font-medium sm:flex-1"
            onClick={onRequestData}
          >
            Vraag gegevens op
          </Button>
        )}
      </div>
    </section>
  );
}
