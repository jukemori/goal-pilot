import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@/tests/utils/test-utils'
import userEvent from '@testing-library/user-event'
import { server } from '@/tests/mocks/server'
import { http, HttpResponse } from 'msw'
import { TaskItem } from '@/components/molecules/task-item'
import { createMockTask } from '@/tests/utils/test-utils'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock task actions
vi.mock('@/app/actions/tasks', () => ({
  completeTask: vi.fn(),
  uncompleteTask: vi.fn(),
  rescheduleTask: vi.fn(),
}))

describe('TaskItem Component', () => {
  beforeEach(() => {
    server.resetHandlers()
    vi.clearAllMocks()
  })

  it('renders incomplete task correctly', () => {
    const task = createMockTask({
      id: 'task-1',
      title: 'Test Task',
      description: 'Task description',
      completed: false,
      priority: 3,
      estimated_duration: 60,
    })

    render(<TaskItem task={task} />)

    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('Task description')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('60 min')).toBeInTheDocument()

    // Should show empty checkbox for incomplete task
    const buttons = screen.getAllByRole('button')
    const checkbox = buttons[0] // First button is the checkbox
    expect(checkbox).toBeInTheDocument()
    expect(checkbox.querySelector('.border-gray-300')).toBeInTheDocument()
  })

  it('renders completed task correctly', () => {
    const task = createMockTask({
      id: 'task-1',
      title: 'Completed Task',
      completed: true,
      completed_at: '2024-01-15T14:30:00.000Z',
      priority: 5,
    })

    render(<TaskItem task={task} />)

    expect(screen.getByText('Completed Task')).toBeInTheDocument()
    expect(screen.getByText('Critical')).toBeInTheDocument()

    // Should show completed styling
    const title = screen.getByText('Completed Task')
    expect(title).toHaveClass('line-through')

    // Should show completion time - look for any completion time
    expect(screen.getByText(/Completed \d{1,2}:\d{2} [AP]M/i)).toBeInTheDocument()
  })

  it('renders without description when not provided', () => {
    const task = createMockTask({
      title: 'Task without description',
      description: null,
    })

    render(<TaskItem task={task} />)

    expect(screen.getByText('Task without description')).toBeInTheDocument()
    expect(screen.queryByText('Task description')).not.toBeInTheDocument()
  })

  it('shows correct priority badges', () => {
    const { rerender } = render(
      <TaskItem task={createMockTask({ priority: 5 })} />
    )
    expect(screen.getByText('Critical')).toBeInTheDocument()

    rerender(<TaskItem task={createMockTask({ priority: 4 })} />)
    expect(screen.getByText('High')).toBeInTheDocument()

    rerender(<TaskItem task={createMockTask({ priority: 3 })} />)
    expect(screen.getByText('Medium')).toBeInTheDocument()

    rerender(<TaskItem task={createMockTask({ priority: 2 })} />)
    expect(screen.getByText('Low')).toBeInTheDocument()

    rerender(<TaskItem task={createMockTask({ priority: 1 })} />)
    expect(screen.getByText('Lowest')).toBeInTheDocument()
  })

  it('handles task completion via callback', async () => {
    const user = userEvent.setup()
    const onToggleComplete = vi.fn()
    const task = createMockTask({ completed: false })

    render(<TaskItem task={task} onToggleComplete={onToggleComplete} />)

    const buttons = screen.getAllByRole('button')
    const checkbox = buttons[0] // First button is the checkbox
    await user.click(checkbox)

    expect(onToggleComplete).toHaveBeenCalledWith(task)
  })

  it('shows loading state when isLoading prop is true', () => {
    const task = createMockTask()

    render(<TaskItem task={task} isLoading={true} />)

    const buttons = screen.getAllByRole('button')
    const checkbox = buttons[0] // First button is the checkbox
    expect(checkbox).toBeDisabled()
  })

  it('opens dropdown menu with options', async () => {
    const user = userEvent.setup()
    const task = createMockTask({ completed: false })

    render(<TaskItem task={task} />)

    // Click the more options button (second button)
    const buttons = screen.getAllByRole('button')
    const dropdownTrigger = buttons[1] // Second button is the dropdown trigger

    await user.click(dropdownTrigger)

    // Check dropdown menu items
    await waitFor(() => {
      expect(screen.getByText('Mark Complete')).toBeInTheDocument()
      expect(screen.getByText('Reschedule to Tomorrow')).toBeInTheDocument()
      expect(screen.getByText('Reschedule to Next Week')).toBeInTheDocument()
    })
  })

  it('shows different dropdown option for completed task', async () => {
    const user = userEvent.setup()
    const task = createMockTask({ completed: true })

    render(<TaskItem task={task} />)

    const buttons = screen.getAllByRole('button')
    const dropdownTrigger = buttons[1] // Second button is the dropdown trigger

    await user.click(dropdownTrigger)

    await waitFor(() => {
      expect(screen.getByText('Mark Incomplete')).toBeInTheDocument()
    })
  })

  it('handles missing estimated_duration gracefully', () => {
    const task = createMockTask({
      estimated_duration: null,
    })

    render(<TaskItem task={task} />)

    // Should still render the duration area but show null/undefined
    expect(screen.getByText('min')).toBeInTheDocument()
  })

  it('applies completed styling correctly', () => {
    const task = createMockTask({
      completed: true,
      title: 'Completed Task',
    })

    render(<TaskItem task={task} />)

    const container = screen.getByText('Completed Task').closest('div')!
    expect(container.closest('.bg-gray-50\\/80')).toBeInTheDocument()
  })

  it('renders with default priority when not provided', () => {
    const task = createMockTask({
      priority: null,
    })

    render(<TaskItem task={task} />)

    // Should default to Medium (priority 3)
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })
})