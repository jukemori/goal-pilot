# Component Usage Guide

This guide provides documentation for key components in the Goal Pilot application, organized by atomic design principles.

## Table of Contents

- [Organisms](#organisms)
- [Molecules](#molecules)
- [Atoms](#atoms)
- [Providers](#providers)

---

## Organisms

### RoadmapTimeline

Displays a visual timeline of learning phases for a roadmap.

**Location:** `components/organisms/roadmap-timeline/roadmap-timeline.tsx`

**Usage:**

```tsx
import { RoadmapTimeline } from '@/components/organisms/roadmap-timeline/roadmap-timeline'

;<RoadmapTimeline roadmapId="uuid-here" goalId="uuid-here" />
```

**Props:**

- `roadmapId: string` - Required. The ID of the roadmap to display
- `goalId: string` - Required. The ID of the associated goal

**Features:**

- Displays learning phases with timeline visualization
- Shows duration, key activities, and success metrics
- Calculates total hours and completion date
- Responsive design with mobile support

**Data Source:** Uses `useRoadmapVisual` hook from `@/features/roadmap`

---

### TaskList

Displays a list of tasks with filtering and completion controls.

**Location:** `components/organisms/task-list/task-list.tsx`

**Usage:**

```tsx
import { TaskList } from '@/components/organisms/task-list/task-list'

;<TaskList
  tasks={tasks}
  onTaskComplete={handleComplete}
  onTaskReschedule={handleReschedule}
/>
```

**Props:**

- `tasks: Task[]` - Array of tasks to display
- `onTaskComplete?: (taskId: string) => void` - Callback when task is completed
- `onTaskReschedule?: (taskId: string, newDate: string) => void` - Callback when task is rescheduled

**Features:**

- Task completion toggling
- Task rescheduling
- Priority indicators
- Duration display

---

### CalendarView

Interactive calendar with task scheduling and visualization.

**Location:** `components/organisms/calendar/calendar-view.tsx`

**Usage:**

```tsx
import { CalendarView } from '@/components/organisms/calendar/calendar-view'

;<CalendarView
  selectedDate={date}
  onDateSelect={handleDateSelect}
  tasks={tasks}
/>
```

**Props:**

- `selectedDate: Date` - Currently selected date
- `onDateSelect: (date: Date) => void` - Callback when date is selected
- `tasks: Task[]` - Tasks to display on calendar

**Features:**

- Month/week/day views
- Task indicators on dates
- Drag-and-drop rescheduling (planned)
- Responsive mobile layout

---

### GoalForm

Form for creating and editing goals.

**Location:** `components/organisms/goal-form/goal-form.tsx`

**Usage:**

```tsx
import { GoalForm } from '@/components/organisms/goal-form/goal-form'

;<GoalForm
  onSubmit={handleSubmit}
  initialData={existingGoal}
  mode="create" // or "edit"
/>
```

**Props:**

- `onSubmit: (data: GoalFormData) => void` - Callback when form is submitted
- `initialData?: Partial<GoalFormData>` - Initial form values for editing
- `mode: 'create' | 'edit'` - Form mode

**Features:**

- Title and description inputs
- Target date picker
- Daily time commitment slider
- Form validation with Zod
- Integration with react-hook-form

---

### Sidebar

Application navigation sidebar.

**Location:** `components/organisms/sidebar/sidebar.tsx`

**Usage:**

```tsx
import { Sidebar } from '@/components/organisms/sidebar/sidebar'

;<Sidebar />
```

**Features:**

- Navigation links
- Active route highlighting
- User profile section
- Responsive collapse on mobile

---

### GoalTabs

Tab interface for goal views (Overview, Roadmap, Tasks).

**Location:** `components/organisms/goal-tabs/goal-tabs.tsx`

**Usage:**

```tsx
import { GoalTabs } from '@/components/organisms/goal-tabs/goal-tabs'

;<GoalTabs goalId={goalId} activeTab="roadmap" onTabChange={handleTabChange} />
```

**Props:**

- `goalId: string` - Goal ID for context
- `activeTab: string` - Currently active tab
- `onTabChange: (tab: string) => void` - Tab change callback

---

## Molecules

### TaskItem

Individual task display component.

**Location:** `components/molecules/task-item.tsx`

**Usage:**

```tsx
import { TaskItem } from '@/components/molecules/task-item'

;<TaskItem
  task={task}
  onComplete={handleComplete}
  onReschedule={handleReschedule}
/>
```

**Props:**

- `task: Task` - Task object
- `onComplete?: (taskId: string) => void` - Completion callback
- `onReschedule?: (taskId: string, date: string) => void` - Reschedule callback

**Features:**

- Checkbox for completion
- Priority badge
- Duration display
- Action menu

---

### DeleteGoalButton

Button component for deleting goals with confirmation.

**Location:** `components/molecules/delete-goal-button.tsx`

**Usage:**

```tsx
import { DeleteGoalButton } from '@/components/molecules/delete-goal-button'

;<DeleteGoalButton goalId={goalId} onSuccess={handleDeleted} />
```

**Props:**

- `goalId: string` - Goal ID to delete
- `onSuccess?: () => void` - Success callback

**Features:**

- Confirmation dialog
- Optimistic updates
- Error handling

---

## Atoms

### Button

Primary button component with variants.

**Location:** `components/atoms/button.tsx`

**Usage:**

```tsx
import { Button } from '@/components/atoms/button'

;<Button variant="default" size="md" onClick={handleClick}>
  Click Me
</Button>
```

**Props:**

- `variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'`
- `size?: 'sm' | 'md' | 'lg' | 'icon'`
- `disabled?: boolean`
- Standard button HTML attributes

**Variants:**

- `default` - Primary action button
- `destructive` - Dangerous actions (delete, etc.)
- `outline` - Secondary actions
- `ghost` - Minimal style
- `link` - Text link style

---

### Card

Container component for content grouping.

**Location:** `components/atoms/card.tsx`

**Usage:**

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/atoms/card'

;<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>
```

**Sub-components:**

- `Card` - Main container
- `CardHeader` - Header section
- `CardTitle` - Title text
- `CardDescription` - Subtitle/description
- `CardContent` - Main content area
- `CardFooter` - Footer section

---

### Input

Text input component with variants.

**Location:** `components/atoms/input.tsx`

**Usage:**

```tsx
import { Input } from '@/components/atoms/input'

;<Input
  type="text"
  placeholder="Enter text"
  value={value}
  onChange={handleChange}
/>
```

**Props:**

- `type?: string` - Input type (text, email, password, etc.)
- `placeholder?: string`
- `disabled?: boolean`
- Standard input HTML attributes

---

### Badge

Small status indicator component.

**Location:** `components/atoms/badge.tsx`

**Usage:**

```tsx
import { Badge } from '@/components/atoms/badge'

;<Badge variant="default">Status</Badge>
```

**Props:**

- `variant?: 'default' | 'secondary' | 'destructive' | 'outline'`

**Use Cases:**

- Priority indicators
- Status labels
- Tags

---

## Providers

### PerformanceProvider

Provides performance monitoring context.

**Location:** `components/providers/performance-provider.tsx`

**Usage:**

```tsx
import { PerformanceProvider } from '@/components/providers/performance-provider'

;<PerformanceProvider>
  <App />
</PerformanceProvider>
```

**Features:**

- Tracks component render times
- Monitors route transitions
- Reports performance metrics

**Note:** Should wrap the entire app in the root layout.

---

## Best Practices

### Component Organization

Components are organized using atomic design:

- **Atoms** - Basic building blocks (buttons, inputs)
- **Molecules** - Simple component groups (task items)
- **Organisms** - Complex UI sections (sidebars, forms)

### Importing Components

Use absolute imports with TypeScript path aliases:

```tsx
import { Button } from '@/components/atoms/button'
import { TaskList } from '@/components/organisms/task-list/task-list'
```

### Feature-based Imports

For feature-specific components, use barrel exports:

```tsx
import { RoadmapTimeline, ProgressStages } from '@/features/roadmap'
import { useGoals, useDeleteGoal } from '@/features/goals'
```

### Type Safety

All components are fully typed with TypeScript. Import types alongside components:

```tsx
import { Button, type ButtonProps } from '@/components/atoms/button'
```

### Styling

Components use Tailwind CSS with the `cn()` utility for conditional classes:

```tsx
import { cn } from '@/lib/utils'

;<div className={cn('base-class', condition && 'conditional-class')} />
```

### State Management

- **Local state** - Use React hooks (useState, useReducer)
- **Server state** - Use React Query hooks from features
- **Global state** - Use Jotai atoms (sparingly)

### Error Handling

Wrap components in ErrorBoundary for graceful error handling:

```tsx
import { ErrorBoundary } from '@/components/error-boundary'

;<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```
