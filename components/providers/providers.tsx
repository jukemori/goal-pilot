'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'jotai'
import { Toaster } from '@/components/ui/sonner'
import { useState } from 'react'
import { PerformanceProvider } from './performance-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              if ((error as { status?: number })?.status === 404) return false
              return failureCount < 2
            },
          },
          mutations: {
            retry: 1,
          },
        },
      }),
  )

  return (
    <Provider>
      <QueryClientProvider client={queryClient}>
        <PerformanceProvider>
          {children}
          <Toaster />
        </PerformanceProvider>
      </QueryClientProvider>
    </Provider>
  )
}
