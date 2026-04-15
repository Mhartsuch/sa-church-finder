import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Route-level error boundary for graceful per-page degradation.
 *
 * This is the ONE exception to the "no class components" rule —
 * React error boundaries require componentDidCatch / getDerivedStateFromError,
 * which are only available in class components.
 */
export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <main className="flex flex-1 items-center justify-center px-6 py-20">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
            <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
            <h2 className="mt-4 text-xl font-semibold text-foreground">Something went wrong</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              An error occurred while loading this page. You can try again or head back to the home
              page.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
              >
                Try again
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground transition hover:border-foreground hover:text-foreground"
              >
                Go home
              </a>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
