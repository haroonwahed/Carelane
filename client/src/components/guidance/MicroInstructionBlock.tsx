import type { ReactNode } from "react";
import { cn } from "../ui/utils";

export type MicroInstructionBlockProps = {
  title: string;
  children: ReactNode;
  impact?: ReactNode;
  className?: string;
  testId?: string;
};

export function MicroInstructionBlock({
  title,
  children,
  impact,
  className,
  testId,
}: MicroInstructionBlockProps) {
  return (
    <div
      data-component="micro-instruction-block"
      data-testid={testId}
      className={cn(
        "rounded-xl border border-border/60 bg-muted/10 px-4 py-3",
        className,
      )}
    >
      <p className="text-[13px] font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{children}</p>
      {impact ? (
        <p className="mt-2 text-[12px] leading-snug text-muted-foreground/90">{impact}</p>
      ) : null}
    </div>
  );
}
