import { CheckCircle2 } from "lucide-react";
import { cn } from "../ui/utils";
import type { ReactNode } from "react";

export function GuidedFieldWrapper({
  fieldId,
  stepNumber,
  totalSteps,
  isActive,
  isComplete,
  label,
  children,
  onMarkComplete,
}: {
  fieldId: string;
  stepNumber: number;
  totalSteps: number;
  isActive: boolean;
  isComplete: boolean;
  label: string;
  children: ReactNode;
  onMarkComplete?: () => void;
}) {
  return (
    <div
      id={fieldId}
      className={cn(
        "rounded-[16px] border px-4 py-4 md:px-5 md:py-5 transition-all duration-200",
        isActive
          ? "border-primary/50 bg-primary/5 ring-2 ring-primary/20 shadow-lg"
          : isComplete
            ? "border-care-success-border bg-care-success-bg/30"
            : "border-border/55 bg-card/35"
      )}
    >
      {/* Step indicator */}
      {stepNumber > 0 && (
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-primary/70">
            Onderdeel {stepNumber} van {totalSteps}
          </span>
          {isComplete && <CheckCircle2 size={16} className="text-care-success-solid" aria-hidden />}
        </div>
      )}

      {/* Label */}
      <h3 className="mb-3 text-[14px] font-semibold text-foreground">{label}</h3>

      {/* Content */}
      <div className={cn("space-y-3", isActive && "focus-within:ring-0")}>
        {children}
      </div>

      {/* Completion info */}
      {isActive && !isComplete && (
        <div className="mt-3 border-t border-border/20 pt-3">
          <p className="text-[12px] text-muted-foreground">
            Klik hieronder op voltooid wanneer dit onderdeel compleet is.
          </p>
          {onMarkComplete && (
            <button
              type="button"
              onClick={onMarkComplete}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-primary/10 text-[12px] font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              Voltooid
            </button>
          )}
        </div>
      )}
    </div>
  );
}
