import type { ReactNode } from "react";
import { CircleHelp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "../ui/utils";

export type InlineHelpChipProps = {
  title: string;
  children: ReactNode;
  triggerLabel?: string;
  testId?: string;
  align?: "center" | "start" | "end";
  className?: string;
};

export function InlineHelpChip({
  title,
  children,
  triggerLabel = "Waarom vragen we dit?",
  testId,
  align = "start",
  className,
}: InlineHelpChipProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-testid={testId}
          data-component="inline-help-chip"
          className={cn(
            "inline-flex max-w-full items-center gap-1 rounded-full border border-transparent px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground underline-offset-2 transition-colors hover:border-border/60 hover:bg-muted/35 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            className,
          )}
        >
          <CircleHelp className="size-3 shrink-0 opacity-80" aria-hidden />
          <span className="truncate">{triggerLabel}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className="w-80 max-w-[min(100vw-2rem,22rem)] border-border/60 bg-popover p-4 text-popover-foreground shadow-md"
      >
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <div className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-muted-foreground">{children}</div>
      </PopoverContent>
    </Popover>
  );
}
