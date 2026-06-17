import { useMemo, useRef, useState } from "react";
import { Download, FileText, Loader2, Lock, Upload, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { apiClient } from "../../lib/apiClient";
import { useDocuments, type SpaDocument } from "../../hooks/useDocuments";
import type { CaseDecisionRole } from "../../lib/decisionEvaluation";

const DOC_TYPE_LABELS: Record<string, string> = {
  CONTRACT: "Casusdossier",
  AMENDMENT: "Wijziging",
  EXHIBIT: "Bijlage",
  CORRESPONDENCE: "Correspondentie",
  MEMO: "Memo",
  RESEARCH: "Onderzoeksnotitie",
  TEMPLATE: "Template",
  OTHER: "Overig",
};

function docTypeLabel(raw: string): string {
  return DOC_TYPE_LABELS[raw] ?? raw;
}

function formatDocDate(raw: string): string {
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw;
  }
  return parsed.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Echte documenttab voor een casus: lijst (type, datum, zichtbaarheid), download
 * en upload — gescoped op deze casus. Geen doorverwijzing naar casusbewerking.
 */
export function CaseDocumentsPanel({
  caseId,
  role = "gemeente",
}: {
  caseId: string;
  role?: CaseDecisionRole;
}) {
  const { documents, loading, error, refetch } = useDocuments();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const canUpload = role !== "zorgaanbieder";

  const caseDocuments = useMemo(
    () => documents.filter((doc) => doc.linkedCaseId === caseId),
    [documents, caseId],
  );

  const handleFiles = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) {
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("case_id", caseId);
      await apiClient.post("/care/api/documents/", form);
      toast.success(`"${file.name}" toegevoegd.`);
      refetch();
    } catch (uploadError) {
      toast.error(uploadError instanceof Error ? uploadError.message : "Uploaden is mislukt.");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <section
      data-testid="case-documents-panel"
      className="rounded-2xl border border-border/55 bg-card/35"
      aria-label="Documenten"
    >
      <header className="flex items-center justify-between gap-3 border-b border-border/40 px-4 py-3 md:px-5">
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold text-foreground">Documenten</h3>
          <p className="text-[12px] text-muted-foreground">
            {caseDocuments.length === 0
              ? "Nog geen documenten gekoppeld aan deze casus."
              : `${caseDocuments.length} document${caseDocuments.length === 1 ? "" : "en"} gekoppeld aan deze casus.`}
          </p>
        </div>
        {canUpload ? (
          <>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              data-testid="case-document-upload-input"
              onChange={(event) => void handleFiles(event.target.files)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5 rounded-full"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Upload size={14} aria-hidden />}
              Document uploaden
            </Button>
          </>
        ) : null}
      </header>

      <div className="px-4 py-2 md:px-5">
        {loading ? (
          <p className="py-4 text-[13px] text-muted-foreground">Documenten laden…</p>
        ) : error ? (
          <p className="py-4 text-[13px] text-care-urgent-text">{error}</p>
        ) : caseDocuments.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <FileText size={22} className="text-muted-foreground/50" aria-hidden />
            <p className="text-[13px] font-medium text-foreground">Geen documenten</p>
            <p className="max-w-xs text-[12px] text-muted-foreground">
              {canUpload
                ? "Upload bijlagen, beschikkingen of correspondentie die bij deze casus horen."
                : "Er zijn nog geen documenten voor deze casus beschikbaar."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/30">
            {caseDocuments.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function DocumentRow({ doc }: { doc: SpaDocument }) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground">
        <FileText size={16} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-foreground" title={doc.name}>
          {doc.name}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[12px] text-muted-foreground">
          <span>{docTypeLabel(doc.type)}</span>
          <span aria-hidden>·</span>
          <span>{formatDocDate(doc.uploadDate)}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            {doc.isConfidential ? (
              <>
                <Lock size={11} aria-hidden />
                Vertrouwelijk
              </>
            ) : (
              <>
                <Users size={11} aria-hidden />
                Gedeeld
              </>
            )}
          </span>
        </div>
      </div>
      {doc.hasStoredFile ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label={`Download ${doc.name}`}
          asChild
        >
          <a href={`/care/api/documents/${doc.id}/download/`} download>
            <Download size={15} aria-hidden />
          </a>
        </Button>
      ) : null}
    </li>
  );
}
