'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h1>
          <p className="text-gray-600">
            An unexpected error occurred. Please try again or contact support if the problem persists.
          </p>
          {error.digest && (
            <p className="text-sm text-gray-500 mt-2">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        
        <Button onClick={reset}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
      </div>
    </div>
  )
}