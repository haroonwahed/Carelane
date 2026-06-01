import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "../ui/utils";

export type GuidanceContextBannerProps = {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  testId?: string;
};

export function GuidanceContextBanner({
  children,
  icon,
  className,
  testId,
}: GuidanceContextBannerProps) {
  return (
    <div
      role="status"
      data-component="guidance-context-banner"
      data-testid={testId}
      className={cn(
        "flex items-start gap-3 rounded-xl border border-border/60 bg-card/35 px-4 py-3 text-[13px] leading-snug text-muted-foreground",
        className,
      )}
    >
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/25 text-muted-foreground">
        {icon ?? <Info className="size-4" aria-hidden />}
      </div>
      <div className="min-w-0 text-foreground/90">{children}</div>
    </div>
  );
}
