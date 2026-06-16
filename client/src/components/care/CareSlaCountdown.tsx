import { AlertCircle } from "lucide-react";
import { cn } from "../ui/utils";
import type { CoordinationDecisionOverviewItem } from "../../lib/coordinationDecisionOverview";
import { getSlaCountdown, slaCountdownFromHours, type SlaCountdown } from "../../lib/careSla";

/**
 * Gedeelde SLA-aftelling: rendert de twee-regelige wachttijd-cel zoals de
 * Regiekamer (RegiekamerWorkRow) die toont — time-to-breach, niet verstreken
 * tijd. Herbruikbaar op andere care-pagina's.
 *
 * Voed met een coordination-overview item (`item={…}`) óf met losse uren
 * (`elapsedHours` + `targetHours`) voor pagina's met een ander datamodel.
 */
type CareSlaCountdownProps =
  | { item: CoordinationDecisionOverviewItem; elapsedHours?: never; targetHours?: never; contextLabel?: never }
  | { item?: never; elapsedHours: number; targetHours: number | null; contextLabel?: string };

export function CareSlaCountdown(props: CareSlaCountdownProps) {
  const sla: SlaCountdown =
    props.item != null
      ? getSlaCountdown(props.item)
      : slaCountdownFromHours(props.elapsedHours, props.targetHours, props.contextLabel);
  return (
    <div className="pt-0.5">
      <p className={cn("flex items-center gap-1 text-[13px] font-medium tabular-nums leading-snug", sla.className)}>
        {sla.status === "breached" && <AlertCircle size={12} className="shrink-0" aria-hidden />}
        {sla.label}
      </p>
      <p className="mt-0.5 text-[11px] text-muted-foreground/60">{sla.sublabel}</p>
    </div>
  );
}
