import React, { ReactElement, ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import type { Tables } from '@/types/database'

// Create a test-specific query client with disabled retries
const createTestQueryClient = () =>
  new QueryClient({
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

// All the providers that wrap your app
function AllTheProviders({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Type definitions using generated database types
export type MockUser = Tables<'users'>
export type MockGoal = Tables<'goals'>
export type MockTask = Tables<'tasks'>
export type MockRoadmap = Tables<'roadmaps'>
export type MockProgressStage = Tables<'progress_stages'>
export type MockUserPreferences = Tables<'user_preferences'>

// Enhanced TaskWithRoadmap for tests matching the actual hook type
export interface TaskWithRoadmap extends MockTask {
  roadmaps: {
    goal_id: string
    goals: {
      title: string
      status: string
    }
  }
}

// Helper functions for testing
export const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  avatar: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  ...overrides,
})

export const createMockGoal = (overrides: Partial<MockGoal> = {}): MockGoal => ({
  id: 'test-goal-123',
  user_id: 'test-user-123',
  title: 'Test Goal',
  description: 'A test goal for testing',
  current_level: 'beginner',
  start_date: '2024-01-01',
  target_date: '2024-06-01',
  daily_time_commitment: 60,
  weekly_schedule: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  },
  status: 'active',
  tags: ['test'],
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  ...overrides,
})

export const createMockTask = (overrides: Partial<MockTask> = {}): MockTask => ({
  id: 'test-task-123',
  roadmap_id: 'test-roadmap-123',
  title: 'Test Task',
  description: 'A test task for testing',
  scheduled_date: '2024-01-15',
  estimated_duration: 60,
  actual_duration: null,
  priority: 3,
  completed: false,
  completed_at: null,
  rescheduled_count: 0,
  tags: ['test'],
  phase_id: 'stage-1',
  phase_number: 1,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  ...overrides,
})

// Wait for elements to appear/disappear
export const waitForLoadingToFinish = () =>
  new Promise(resolve => setTimeout(resolve, 0))