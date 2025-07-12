"use client";

import { Component, type PropsWithChildren, type ErrorInfo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps extends PropsWithChildren {
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
          />
        );
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({
  error,
  resetError,
}: {
  error?: Error;
  resetError: () => void;
}) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="h-5 w-5" />
          Something went wrong
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-red-700 text-sm">
          We encountered an unexpected error. Please try again or contact
          support if the problem persists.
        </p>
        {error && process.env.NODE_ENV === "development" && (
          <details className="text-xs text-red-600 bg-red-100 p-2 rounded">
            <summary className="cursor-pointer font-medium">
              Error details
            </summary>
            <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>
          </details>
        )}
        <Button
          onClick={resetError}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-100"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}

// Specific error boundaries for different use cases
export function TaskErrorBoundary({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary
      fallback={({ resetError }) => (
        <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
          <div className="flex items-center gap-2 text-orange-800 mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Task loading failed</span>
          </div>
          <p className="text-orange-700 text-sm mb-3">
            Unable to load tasks. This might be a temporary issue.
          </p>
          <Button
            onClick={resetError}
            size="sm"
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <RefreshCw className="h-3 w-3 mr-2" />
            Retry
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

export function CalendarErrorBoundary({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary
      fallback={({ resetError }) => (
        <div className="p-6 border border-blue-200 rounded-lg bg-blue-50 text-center">
          <div className="flex flex-col items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-800 mb-1">
                Calendar unavailable
              </h3>
              <p className="text-blue-700 text-sm mb-4">
                We're having trouble loading your calendar. Please try
                refreshing.
              </p>
              <Button
                onClick={resetError}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload calendar
              </Button>
            </div>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

export function RoadmapErrorBoundary({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary
      fallback={({ resetError }) => (
        <div className="p-6 border border-purple-200 rounded-lg bg-purple-50 text-center">
          <div className="flex flex-col items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-purple-600" />
            <div>
              <h3 className="font-medium text-purple-800 mb-1">
                Roadmap loading error
              </h3>
              <p className="text-purple-700 text-sm mb-4">
                There was an issue loading your learning roadmap.
              </p>
              <Button
                onClick={resetError}
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload roadmap
              </Button>
            </div>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
