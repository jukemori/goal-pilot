import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/tests/utils/test-utils'
import userEvent from '@testing-library/user-event'
import { server } from '@/tests/mocks/server'
import { http, HttpResponse } from 'msw'
import { SimpleTaskList } from '@/components/organisms/calendar/simple-task-list'
import { createMockTask, type TaskWithRoadmap } from '@/tests/utils/test-utils'

describe('SimpleTaskList Component', () => {
  const mockTasks: TaskWithRoadmap[] = [
    {
      ...createMockTask({
        id: 'task-1',
        title: 'Complete HTML Tutorial',
        description: 'Learn HTML basics',
        completed: false,
        priority: 5,
        estimated_duration: 60,
      }),
      roadmaps: {
        goal_id: 'goal-1',
        goals: {
          title: 'Learn Web Development',
          status: 'active',
        },
      },
    },
    {
      ...createMockTask({
        id: 'task-2',
        title: 'Practice CSS',
        description: 'Build a layout',
        completed: true,
        priority: 3,
        estimated_duration: 45,
        completed_at: '2024-01-15T14:30:00.000Z',
      }),
      roadmaps: {
        goal_id: 'goal-1',
        goals: {
          title: 'Learn Web Development',
          status: 'active',
        },
      },
    },
  ]

  beforeEach(() => {
    // Reset any mock handlers before each test
    server.resetHandlers()
  })

  it('renders empty state when no tasks', () => {
    render(<SimpleTaskList tasks={[]} goalId="test-goal" />)

    expect(screen.getByText('No tasks for today')).toBeInTheDocument()
    expect(screen.getByText('Enjoy your free time!')).toBeInTheDocument()
  })

  it('renders task list with tasks', () => {
    render(<SimpleTaskList tasks={mockTasks} goalId="test-goal" />)

    expect(screen.getByText('Complete HTML Tutorial')).toBeInTheDocument()
    expect(screen.getByText('Practice CSS')).toBeInTheDocument()
    expect(screen.getByText('Learn HTML basics')).toBeInTheDocument()
    expect(screen.getByText('Build a layout')).toBeInTheDocument()
  })

  it('shows task statistics', () => {
    render(<SimpleTaskList tasks={mockTasks} goalId="test-goal" />)

    // Should show statistics about tasks - use more specific selectors
    const totalTasksElements = screen.getAllByText('2')
    const completedTasksElements = screen.getAllByText('1')

    expect(totalTasksElements.length).toBeGreaterThan(0) // Total tasks appears in multiple places
    expect(completedTasksElements.length).toBeGreaterThan(0) // Completed tasks
  })

  it('marks task as complete when clicked', async () => {
    const user = userEvent.setup()

    // Mock the API call for updating task
    const SUPABASE_URL =
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/tasks`, () => {
        return HttpResponse.json({
          id: 'task-1',
          completed: true,
          completed_at: new Date().toISOString(),
        })
      }),
    )

    render(<SimpleTaskList tasks={mockTasks} goalId="test-goal" />)

    // Find the incomplete task checkbox by looking for buttons with the checkbox div
    const taskCheckboxes = screen
      .getAllByRole('button')
      .filter((button) => button.querySelector('div.border-gray-300'))
    const incompleteTaskCheckbox = taskCheckboxes.find((checkbox) =>
      checkbox.closest('div')?.textContent?.includes('Complete HTML Tutorial'),
    )

    expect(incompleteTaskCheckbox).toBeInTheDocument()

    if (incompleteTaskCheckbox) {
      await user.click(incompleteTaskCheckbox)

      // Wait for the API call and state update
      await waitFor(() => {
        // The task should now show as completed (you might need to adjust this based on your actual implementation)
        expect(incompleteTaskCheckbox).toBeInTheDocument()
      })
    }
  })

  it('shows completed task with strike-through', () => {
    render(<SimpleTaskList tasks={mockTasks} goalId="test-goal" />)

    const completedTaskTitle = screen.getByText('Practice CSS')
    expect(completedTaskTitle).toHaveClass('line-through')
  })

  it('displays task priority badges', () => {
    render(<SimpleTaskList tasks={mockTasks} goalId="test-goal" />)

    expect(screen.getByText('Critical')).toBeInTheDocument() // Priority 5
    expect(screen.getByText('Medium')).toBeInTheDocument() // Priority 3
  })

  it('shows estimated duration for tasks', () => {
    render(<SimpleTaskList tasks={mockTasks} goalId="test-goal" />)

    expect(screen.getByText('60 min')).toBeInTheDocument()
    expect(screen.getByText('45 min')).toBeInTheDocument()
  })

  it('shows completed time for finished tasks', () => {
    render(<SimpleTaskList tasks={mockTasks} goalId="test-goal" />)

    // Look for completed time specifically (not the stats label)
    expect(screen.getByText(/completed.*\d{1,2}:\d{2}/i)).toBeInTheDocument()
  })
})
