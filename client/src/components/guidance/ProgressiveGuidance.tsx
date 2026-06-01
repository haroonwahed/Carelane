import { CircleHelp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "../ui/utils";
import type { GuidanceMode } from "./types";
import { DEFAULT_GUIDANCE_MODE } from "./types";
import { InlineHelpChip, type InlineHelpChipProps } from "./InlineHelpChip";
import { VideoHelpTrigger, type VideoHelpTriggerProps } from "./VideoHelpTrigger";

export type ProgressiveGuidanceProps = {
  guidanceMode?: GuidanceMode;
  chip: InlineHelpChipProps;
  video?: Omit<VideoHelpTriggerProps, "className">;
  className?: string;
  videoClassName?: string;
};

export function ProgressiveGuidance({
  guidanceMode = DEFAULT_GUIDANCE_MODE,
  chip,
  video,
  className,
  videoClassName,
}: ProgressiveGuidanceProps) {
  if (guidanceMode === "compact") {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            data-component="progressive-guidance-compact"
            data-testid={chip.testId ? `${chip.testId}-compact` : undefined}
            className={cn(
              "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              className,
            )}
            aria-label={chip.title}
          >
            <CircleHelp className="size-3.5" aria-hidden />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-80 max-w-[min(100vw-2rem,22rem)] border-border/60 bg-popover p-4 text-popover-foreground shadow-md"
        >
          <p className="text-sm font-semibold text-foreground">{chip.title}</p>
          <div className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-muted-foreground">{chip.children}</div>
          {video ? (
            <div className="mt-3 border-t border-border/50 pt-3">
              <VideoHelpTrigger {...video} className={videoClassName} />
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-2", className)}>
      <InlineHelpChip {...chip} />
      {video ? <VideoHelpTrigger {...video} className={videoClassName} /> : null}
    </span>
  );
}
