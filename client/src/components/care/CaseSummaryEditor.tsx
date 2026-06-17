import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { saveCaseSummary } from "../../lib/decisionEvaluation";

/** Drempel uit de backend (MIN_SUMMARY_CONTEXT_LEN) — voldoende context vóór matching. */
const MIN_SUMMARY_LEN = 24;

/**
 * Inline editor voor de casusomschrijving. Het casusoverzicht wordt hieruit
 * afgeleid; zodra er voldoende context staat is de matchinggate vervuld.
 * Voorkomt dat de gebruiker naar de losse casusbewerking moet navigeren.
 */
export function CaseSummaryEditor({
  caseId,
  initialValue = "",
  onSaved,
}: {
  caseId: string;
  initialValue?: string;
  onSaved: () => void | Promise<void>;
}) {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const trimmedLength = value.trim().length;
  const tooShort = trimmedLength < MIN_SUMMARY_LEN;

  const handleSave = async () => {
    if (tooShort) {
      return;
    }
    setSaving(true);
    try {
      const result = await saveCaseSummary(caseId, value.trim());
      toast.success(
        result.matchingSummaryReady
          ? "Casusoverzicht opgebouwd — je kunt nu matching starten."
          : "Casusomschrijving opgeslagen.",
      );
      await onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Opslaan is mislukt.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2" data-testid="case-summary-editor">
      <Textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={4}
        placeholder="Beschrijf kort de zorgsituatie, de hulpvraag en relevante context…"
      />
      <div className="flex items-center justify-between gap-3">
        <span className={tooShort && trimmedLength > 0 ? "text-[12px] text-care-warning-text" : "text-[12px] text-muted-foreground"}>
          {trimmedLength < MIN_SUMMARY_LEN
            ? `Nog minimaal ${MIN_SUMMARY_LEN - trimmedLength} tekens nodig`
            : "Voldoende context voor matching"}
        </span>
        <Button type="button" size="sm" className="gap-1.5 rounded-full" disabled={saving || tooShort} onClick={handleSave}>
          {saving ? <Loader2 size={14} className="animate-spin" aria-hidden /> : null}
          Opslaan
        </Button>
      </div>
    </div>
  );
}
