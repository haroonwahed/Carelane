import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "./utils";

interface ApiErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

export function ApiErrorMessage({ message, onRetry, className, compact = false }: ApiErrorMessageProps) {
  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive", className)}>
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        <span>{message}</span>
        {onRetry && (
          <button onClick={onRetry} className="ml-auto flex items-center gap-1 font-medium hover:underline">
            <RefreshCw className="h-3 w-3" />
            Opnieuw
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center", className)}>
      <AlertCircle className="h-8 w-8 text-destructive/60" />
      <div>
        <p className="text-sm font-medium text-foreground">Laden mislukt</p>
        <p className="mt-1 text-xs text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Opnieuw proberen
        </button>
      )}
    </div>
  );
}
