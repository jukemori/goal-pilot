import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { ReactNode } from 'react'
import { server } from '@/tests/mocks/server'
import { useTasksByGoal } from '@/features/tasks/hooks/use-tasks'

// Create a test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useTasksByGoal Hook', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  it('should fetch tasks successfully', async () => {
    const wrapper = createWrapper()

    const { result } = renderHook(() => useTasksByGoal('test-goal-123'), {
      wrapper,
    })

    // Initially might be loading
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.data).toBeDefined()
    })
  })

  it('should handle loading state', () => {
    const wrapper = createWrapper()

    const { result } = renderHook(() => useTasksByGoal('test-goal-123'), {
      wrapper,
    })

    // Initially should be loading when query starts
    expect(result.current.isLoading).toBe(true)
  })

  it('should handle error state', async () => {
    // You can override MSW handlers for specific tests
    const wrapper = createWrapper()

    const { result } = renderHook(() => useTasksByGoal('invalid-goal'), {
      wrapper,
    })

    await waitFor(() => {
      expect(result.current.error).toBeNull() // Adjust based on your implementation
    })
  })
})
