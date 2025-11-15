'use client'
import { logger } from '@/lib/utils/logger'

import { Component, type PropsWithChildren, type ErrorInfo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps extends PropsWithChildren {
  fallback?: React.ComponentType<{
    error?: Error
    resetError: () => void
  }>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Error caught by boundary', { error, errorInfo })
    this.props.onError?.(error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
          />
        )
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          resetError={this.resetError}
        />
      )
    }

    return this.props.children
  }
}

function DefaultErrorFallback({
  error,
  resetError,
}: {
  error?: Error
  resetError: () => void
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
        <p className="text-sm text-red-700">
          We encountered an unexpected error. Please try again or contact
          support if the problem persists.
        </p>
        {error && process.env.NODE_ENV === 'development' && (
          <details className="rounded bg-red-100 p-2 text-xs text-red-600">
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
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </CardContent>
    </Card>
  )
}

// Specific error boundaries for different use cases
export function TaskErrorBoundary({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary
      fallback={({ resetError }) => (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Task loading failed</span>
          </div>
          <p className="mb-3 text-sm text-orange-700">
            Unable to load tasks. This might be a temporary issue.
          </p>
          <Button
            onClick={resetError}
            size="sm"
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            Retry
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}

export function CalendarErrorBoundary({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary
      fallback={({ resetError }) => (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="mb-1 font-medium text-blue-800">
                Calendar unavailable
              </h3>
              <p className="mb-4 text-sm text-blue-700">
                We're having trouble loading your calendar. Please try
                refreshing.
              </p>
              <Button
                onClick={resetError}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload calendar
              </Button>
            </div>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}

export function RoadmapErrorBoundary({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary
      fallback={({ resetError }) => (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-purple-600" />
            <div>
              <h3 className="mb-1 font-medium text-purple-800">
                Roadmap loading error
              </h3>
              <p className="mb-4 text-sm text-purple-700">
                There was an issue loading your learning roadmap.
              </p>
              <Button
                onClick={resetError}
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload roadmap
              </Button>
            </div>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}
