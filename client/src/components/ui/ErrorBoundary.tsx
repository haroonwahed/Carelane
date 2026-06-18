import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
  retryCount: number;
}

function isChunkError(error: Error | null): boolean {
  if (!error) return false;
  return (
    error.name === "ChunkLoadError" ||
    /Loading chunk \d+ failed|Failed to fetch dynamically imported module/.test(error.message)
  );
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  componentDidUpdate(_: Props, prev: State) {
    // Auto-reload once on chunk load errors (stale deployment artifact).
    if (
      this.state.error &&
      isChunkError(this.state.error) &&
      this.state.retryCount < 1 &&
      prev.retryCount === 0
    ) {
      this.setState({ retryCount: 1 });
      window.location.reload();
    }
  }

  render() {
    const { error, retryCount } = this.state;
    if (!error) return this.props.children;

    if (isChunkError(error)) {
      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-lg border border-border bg-muted/30 p-8 text-center">
          <p className="text-sm font-medium text-foreground">
            {retryCount < 1
              ? "Pagina wordt ververst…"
              : "De pagina kon niet worden geladen."}
          </p>
          {retryCount >= 1 && (
            <>
              <p className="text-xs text-muted-foreground">
                Een nieuw onderdeel kon niet worden geladen. Vernieuw de pagina om verder te gaan.
              </p>
              <button
                className="mt-2 rounded-md border px-3 py-1.5 text-xs hover:bg-muted"
                onClick={() => window.location.reload()}
              >
                Pagina vernieuwen
              </button>
            </>
          )}
        </div>
      );
    }

    if (this.props.fallback) return this.props.fallback;
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
        <p className="text-sm font-medium text-destructive">Er is een onverwachte fout opgetreden.</p>
        <p className="text-xs text-muted-foreground">{error.message}</p>
        <button
          className="mt-2 rounded-md border px-3 py-1.5 text-xs hover:bg-muted"
          onClick={() => this.setState({ error: null, retryCount: 0 })}
        >
          Opnieuw proberen
        </button>
      </div>
    );
  }
}
