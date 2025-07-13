import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { ReactNode } from 'react'
import { server } from '@/tests/mocks/server'
import { http, HttpResponse } from 'msw'
import { useGoals, useGoal, useDeleteGoal, useUpdateGoalStatus } from '@/lib/hooks/use-goals'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Create a test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('Goals Hooks', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  describe('useGoals', () => {
    it('fetches goals successfully', async () => {
      const wrapper = createWrapper()
      
      const { result } = renderHook(() => useGoals(), {
        wrapper,
      })

      expect(result.current.isLoading).toBe(true)
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toBeDefined()
        expect(Array.isArray(result.current.data)).toBe(true)
      })
    })

    it('handles query errors', async () => {
      const wrapper = createWrapper()
      
      // Mock error response
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
      server.use(
        http.get(`${SUPABASE_URL}/rest/v1/goals`, () => {
          return HttpResponse.json(
            { error: 'Database error' },
            { status: 500 }
          )
        })
      )
      
      const { result } = renderHook(() => useGoals(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
        expect(result.current.error).toBeDefined()
      })
    })
  })

  describe('useGoal', () => {
    it('fetches single goal with relationships', async () => {
      const wrapper = createWrapper()
      const goalId = 'goal-1'
      
      // Add specific mock handler for single goal query
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
      server.use(
        http.get(`${SUPABASE_URL}/rest/v1/goals`, ({ request }) => {
          const url = new URL(request.url)
          const id = url.searchParams.get('id')
          
          if (id && id === 'eq.goal-1') {
            return HttpResponse.json({
              id: 'goal-1',
              title: 'Test Goal',
              description: 'Test Description',
              user_id: 'test-user-123',
              status: 'active',
              start_date: '2024-01-01',
              target_date: '2024-06-01',
              daily_time_commitment: 60,
              current_level: 'beginner',
              tags: ['test'],
              weekly_schedule: {},
              created_at: '2024-01-01T00:00:00.000Z',
              updated_at: '2024-01-01T00:00:00.000Z',
              roadmaps: [{
                id: 'roadmap-1',
                ai_generated_plan: { overview: 'Test plan' },
                milestones: [],
                created_at: '2024-01-01T00:00:00.000Z',
                tasks: []
              }]
            })
          }
          
          return HttpResponse.json([])
        })
      )
      
      const { result } = renderHook(() => useGoal(goalId), {
        wrapper,
      })

      expect(result.current.isLoading).toBe(true)
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toBeDefined()
        expect(result.current.data?.id).toBe(goalId)
      })
    })

    it('is disabled when no id provided', () => {
      const wrapper = createWrapper()
      
      const { result } = renderHook(() => useGoal(''), {
        wrapper,
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.data).toBeUndefined()
    })
  })

  describe('useDeleteGoal', () => {
    it('deletes goal successfully', async () => {
      const wrapper = createWrapper()
      
      const { result } = renderHook(() => useDeleteGoal(), {
        wrapper,
      })

      const deleteGoal = result.current.mutate
      
      // Mock successful delete
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
      server.use(
        http.delete(`${SUPABASE_URL}/rest/v1/goals`, () => {
          return new HttpResponse(null, { status: 204 })
        })
      )

      deleteGoal('goal-1')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
    })

    it('handles delete errors', async () => {
      const wrapper = createWrapper()
      
      const { result } = renderHook(() => useDeleteGoal(), {
        wrapper,
      })

      // Mock error response
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
      server.use(
        http.delete(`${SUPABASE_URL}/rest/v1/goals`, () => {
          return HttpResponse.json(
            { error: 'Delete failed' },
            { status: 500 }
          )
        })
      )

      result.current.mutate('goal-1')

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })
    })
  })

  describe('useUpdateGoalStatus', () => {
    it('updates goal status successfully', async () => {
      const wrapper = createWrapper()
      
      const { result } = renderHook(() => useUpdateGoalStatus(), {
        wrapper,
      })

      // Mock successful update
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
      server.use(
        http.patch(`${SUPABASE_URL}/rest/v1/goals`, () => {
          return HttpResponse.json({
            id: 'goal-1',
            status: 'completed',
          })
        })
      )

      result.current.mutate({
        goalId: 'goal-1',
        status: 'completed',
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
    })

    it('handles status update errors', async () => {
      const wrapper = createWrapper()
      
      const { result } = renderHook(() => useUpdateGoalStatus(), {
        wrapper,
      })

      // Mock error response
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
      server.use(
        http.patch(`${SUPABASE_URL}/rest/v1/goals`, () => {
          return HttpResponse.json(
            { error: 'Update failed' },
            { status: 500 }
          )
        })
      )

      result.current.mutate({
        goalId: 'goal-1',
        status: 'completed',
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })
    })
  })
})