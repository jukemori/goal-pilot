# Goal Pilot - Feature-Based Architecture Guide

**Generated:** 2025-11-09
**Based on:** Next.js 16 best practices, Clean Architecture principles
**Purpose:** Reorganize codebase from shared components to feature-based modules

---

## Table of Contents

1. [Current Problems](#current-problems)
2. [Proposed Architecture](#proposed-architecture)
3. [Directory Structure](#directory-structure)
4. [Migration Plan](#migration-plan)
5. [Feature Module Examples](#feature-module-examples)
6. [Component Guidelines](#component-guidelines)
7. [Migration Checklist](#migration-checklist)

---

## Current Problems

### 1. Business Logic in UI Components

**Issues Found:**

```typescript
// ❌ BAD: components/organisms/progress-stages/progress-stages.tsx
// This component has:
- Direct Supabase calls (createClient, queries)
- React Query mutations (useMutation, useQueryClient)
- Business logic (auto-create, task generation)
- API calls
- Complex state management

// ❌ BAD: components/organisms/roadmap-timeline/roadmap-timeline.tsx
- useQuery with queryFn inline
- createClient() inside component
- Supabase queries

// ❌ BAD: components/organisms/sidebar/sidebar.tsx
- Authentication logic (signOut)
- createClient() calls
```

**Why This Is Bad:**

- ❌ Components can't be reused in different contexts
- ❌ Hard to test UI separately from business logic
- ❌ Difficult to understand what component actually does
- ❌ Violates Single Responsibility Principle
- ❌ Can't share business logic between features

---

## Proposed Architecture

### Feature-Based Organization

**Principle:** Group by feature, not by technical type

```
✅ GOOD: Everything related to "goals" lives together
features/
  goals/
    components/      # Goal-specific UI
    hooks/          # Goal-specific data fetching
    actions/        # Goal-specific server actions
    types/          # Goal-specific types
    utils/          # Goal-specific utilities

❌ BAD: Scattered by technical type
components/organisms/goal-form/
lib/hooks/use-goals.ts
app/actions/goals.ts
types/goal.ts
```

**Benefits:**

- ✅ Easy to find everything related to a feature
- ✅ Can delete entire feature by removing one folder
- ✅ Clear boundaries and dependencies
- ✅ Easier to work on features in isolation
- ✅ Better code splitting opportunities

---

## Directory Structure

### New Structure

```
goal-pilot/
├── app/                          # Next.js App Router (routing only)
│   ├── (app)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx          # Route + data fetching
│   │   │   └── _components/      # Page-specific components
│   │   ├── goals/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── _components/
│   │   │   ├── new/
│   │   │   │   ├── page.tsx
│   │   │   │   └── _components/
│   │   │   └── page.tsx
│   │   └── calendar/
│   │       ├── page.tsx
│   │       └── _components/
│   └── api/                      # API routes (thin wrappers)
│
├── features/                     # 🆕 Feature modules
│   ├── goals/
│   │   ├── components/          # Goal-specific components
│   │   │   ├── goal-form.tsx
│   │   │   ├── goal-card.tsx
│   │   │   ├── goal-list.tsx
│   │   │   └── delete-goal-button.tsx
│   │   ├── hooks/               # Goal data fetching
│   │   │   ├── use-goals.ts
│   │   │   ├── use-goal.ts
│   │   │   ├── use-create-goal.ts
│   │   │   └── use-delete-goal.ts
│   │   ├── actions/             # Goal server actions
│   │   │   ├── create-goal.ts
│   │   │   ├── update-goal.ts
│   │   │   └── delete-goal.ts
│   │   ├── types/               # Goal-specific types
│   │   │   └── index.ts
│   │   ├── utils/               # Goal utilities
│   │   │   └── calculations.ts
│   │   └── index.ts             # Public API
│   │
│   ├── tasks/
│   │   ├── components/
│   │   │   ├── task-list.tsx
│   │   │   ├── task-item.tsx
│   │   │   ├── task-filters.tsx
│   │   │   └── task-group.tsx
│   │   ├── hooks/
│   │   │   ├── use-tasks.ts
│   │   │   ├── use-complete-task.ts
│   │   │   └── use-reschedule-task.ts
│   │   ├── actions/
│   │   │   ├── complete-task.ts
│   │   │   ├── reschedule-task.ts
│   │   │   └── update-duration.ts
│   │   └── index.ts
│   │
│   ├── roadmap/
│   │   ├── components/
│   │   │   ├── roadmap-view.tsx
│   │   │   ├── roadmap-timeline.tsx
│   │   │   └── progress-stages.tsx
│   │   ├── hooks/
│   │   │   ├── use-roadmap.ts
│   │   │   └── use-generate-roadmap.ts
│   │   ├── actions/
│   │   │   ├── generate-roadmap.ts
│   │   │   └── generate-tasks.ts
│   │   └── index.ts
│   │
│   ├── ai/
│   │   ├── services/            # AI generation logic
│   │   │   ├── openai.ts
│   │   │   ├── prompts.ts
│   │   │   └── generation-config.ts
│   │   ├── components/          # AI-related UI
│   │   │   ├── ai-generation-overlay.tsx
│   │   │   └── generation-progress.tsx
│   │   ├── hooks/
│   │   │   └── use-roadmap-generation.ts
│   │   └── index.ts
│   │
│   ├── calendar/
│   │   ├── components/
│   │   │   ├── calendar-view.tsx
│   │   │   └── simple-task-list.tsx
│   │   ├── hooks/
│   │   │   └── use-calendar-tasks.ts
│   │   └── index.ts
│   │
│   └── templates/
│       ├── components/
│       │   ├── template-grid.tsx
│       │   ├── template-card.tsx
│       │   └── templates-section.tsx
│       ├── data/
│       │   └── goal-templates.ts
│       └── index.ts
│
├── components/                   # 🎨 Pure UI components only
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── layout/                  # Layout components
│   │   ├── sidebar.tsx          # (simplified, no auth logic)
│   │   └── header.tsx
│   └── shared/                  # Truly reusable components
│       ├── loading-spinner.tsx
│       ├── error-message.tsx
│       └── stats-card.tsx
│
├── lib/                         # Shared utilities
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── utils/
│   │   ├── date.ts
│   │   └── cn.ts
│   └── validations/
│       └── schemas.ts
│
└── types/                       # Global types
    ├── database.ts              # Generated Supabase types
    └── index.ts
```

---

## Migration Plan

### Required Tools and Process

**CRITICAL: Use Serena tools for ALL migrations:**

1. **Before starting each task:**
   - Use `get_symbols_overview` to understand file structure
   - Use `find_symbol` to locate the code to migrate
   - Use `find_referencing_symbols` to check what depends on it

2. **During migration:**
   - Use `replace_symbol_body` to update function implementations
   - Use `insert_after_symbol` or `insert_before_symbol` to add new code
   - Use `rename_symbol` if renaming is needed

3. **After each task:**

   ```bash
   pnpm run type-check    # Fix any TypeScript errors
   pnpm run build         # Ensure build passes
   ```

   - Only mark task as complete after build succeeds
   - Update checklist in REFACTORING_PLAN.md

### Phase 1: Create Feature Directories (Week 1)

**Step 1: Create folder structure**

```bash
mkdir -p features/{goals,tasks,roadmap,ai,calendar,templates}/{components,hooks,actions,types,utils}
```

**Step 2: Move components by feature**

**Priority 1: Goals Feature**

```
Move:
  components/organisms/goal-form/
    → features/goals/components/goal-form.tsx

  components/organisms/goal-tabs/
    → features/goals/components/goal-tabs.tsx

  components/molecules/delete-goal-button.tsx
    → features/goals/components/delete-goal-button.tsx

  lib/hooks/use-goals.ts
    → features/goals/hooks/use-goals.ts

  app/actions/goals.ts
    → features/goals/actions/index.ts
```

**Priority 2: Tasks Feature**

```
Move:
  components/organisms/task-list/
    → features/tasks/components/task-list.tsx

  components/molecules/task-item.tsx
    → features/tasks/components/task-item.tsx

  components/molecules/task-filters.tsx
    → features/tasks/components/task-filters.tsx

  components/molecules/task-group.tsx
    → features/tasks/components/task-group.tsx

  lib/hooks/use-tasks.ts
    → features/tasks/hooks/use-tasks.ts

  app/actions/tasks.ts
    → features/tasks/actions/index.ts
```

**Priority 3: Roadmap Feature**

```
Move:
  components/organisms/roadmap-view/
    → features/roadmap/components/roadmap-view.tsx

  components/organisms/roadmap-timeline/
    → features/roadmap/components/roadmap-timeline.tsx

  components/organisms/progress-stages/
    → features/roadmap/components/progress-stages.tsx

  lib/hooks/use-roadmap-generation.ts
    → features/roadmap/hooks/use-roadmap-generation.ts
```

**Priority 4: AI Feature**

```
Move:
  components/molecules/ai-generation-overlay.tsx
    → features/ai/components/ai-generation-overlay.tsx

  components/molecules/generation-progress.tsx
    → features/ai/components/generation-progress.tsx

  lib/ai/*
    → features/ai/services/

  app/actions/ai.ts
    → features/ai/actions/index.ts
```

---

### Phase 2: Extract Business Logic (Week 2)

**Step 1: Create hooks for data fetching**

**Example: Progress Stages**

```typescript
// ❌ BEFORE: components/organisms/progress-stages/progress-stages.tsx
'use client'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation } from '@tanstack/react-query'

export function ProgressStages({ roadmapId }: Props) {
  const supabase = createClient()

  const { data: stages } = useQuery({
    queryKey: ['progress-stages', roadmapId],
    queryFn: async () => {
      const { data } = await supabase
        .from('progress_stages')
        .select('*')
        .eq('roadmap_id', roadmapId)
      return data
    }
  })

  const autoCreateMutation = useMutation({
    mutationFn: async () => {
      // Complex logic here
    }
  })

  return <div>{/* UI */}</div>
}
```

```typescript
// ✅ AFTER: Separated into hook + component

// features/roadmap/hooks/use-progress-stages.ts
import { useQuery } from '@tanstack/react-query'
import { fetchProgressStages } from '../actions/fetch-progress-stages'

export function useProgressStages(roadmapId: string) {
  return useQuery({
    queryKey: ['progress-stages', roadmapId],
    queryFn: () => fetchProgressStages(roadmapId),
    staleTime: 1000 * 60 * 5,
  })
}

// features/roadmap/hooks/use-auto-create-stages.ts
export function useAutoCreateStages() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: autoCreateStages,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-stages'] })
    }
  })
}

// features/roadmap/components/progress-stages.tsx
'use client'
import { useProgressStages, useAutoCreateStages } from '../hooks'

export function ProgressStages({ roadmapId }: Props) {
  const { data: stages, isLoading } = useProgressStages(roadmapId)
  const autoCreate = useAutoCreateStages()

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      {stages?.map(stage => (
        <StageCard key={stage.id} stage={stage} />
      ))}
      <Button onClick={() => autoCreate.mutate()}>
        Auto Create
      </Button>
    </div>
  )
}
```

---

### Phase 3: Simplify Page Components (Week 2-3)

**Use \_components for page-specific UI**

```typescript
// ✅ app/(app)/goals/[id]/page.tsx
import { fetchGoal } from '@/features/goals/actions/fetch-goal'
import { GoalDetails } from './_components/goal-details'

export default async function GoalPage({ params }: Props) {
  const goal = await fetchGoal(params.id)

  if (!goal) {
    notFound()
  }

  return <GoalDetails goal={goal} />
}

// ✅ app/(app)/goals/[id]/_components/goal-details.tsx
'use client'
import { GoalForm } from '@/features/goals/components/goal-form'
import { RoadmapView } from '@/features/roadmap/components/roadmap-view'

export function GoalDetails({ goal }: Props) {
  const [tab, setTab] = useState('overview')

  return (
    <div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <GoalForm goal={goal} />
        </TabsContent>

        <TabsContent value="roadmap">
          <RoadmapView goalId={goal.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

---

## Feature Module Examples

### Example 1: Goals Feature

```typescript
// features/goals/index.ts - Public API
export * from './components/goal-form'
export * from './components/goal-card'
export * from './components/goal-list'
export * from './hooks/use-goals'
export * from './hooks/use-create-goal'
export * from './types'

// features/goals/components/goal-form.tsx
'use client'
import { useCreateGoal, useUpdateGoal } from '../hooks'
import { goalSchema } from '../types'

export function GoalForm({ goal }: Props) {
  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()

  // Pure UI logic, no business logic
  return <form>{/* ... */}</form>
}

// features/goals/hooks/use-create-goal.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createGoal } from '../actions/create-goal'

export function useCreateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    }
  })
}

// features/goals/actions/create-goal.ts
'use server'
import { createClient } from '@/lib/supabase/server'

export async function createGoal(data: GoalInput) {
  const supabase = await createClient()

  const { data: goal, error } = await supabase
    .from('goals')
    .insert(data)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: goal }
}

// features/goals/types/index.ts
import { z } from 'zod'
import type { Tables } from '@/types/database'

export type Goal = Tables<'goals'>

export const goalSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  // ...
})

export type GoalInput = z.infer<typeof goalSchema>
```

---

### Example 2: Tasks Feature

```typescript
// features/tasks/index.ts
export * from './components/task-list'
export * from './components/task-item'
export * from './components/task-filters'
export * from './hooks/use-tasks'
export * from './hooks/use-complete-task'

// features/tasks/components/task-list.tsx
'use client'
import { useTasks } from '../hooks/use-tasks'
import { TaskItem } from './task-item'
import { TaskFilters } from './task-filters'

export function TaskList({ goalId }: Props) {
  const [filters, setFilters] = useState({ status: 'all' })
  const { data: tasks, isLoading } = useTasks({ goalId, filters })

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      <TaskFilters value={filters} onChange={setFilters} />
      <div>
        {tasks?.map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}

// features/tasks/hooks/use-tasks.ts
import { useQuery } from '@tanstack/react-query'
import { fetchTasks } from '../actions/fetch-tasks'
import { taskKeys } from './query-keys'

export function useTasks(params: TasksParams) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => fetchTasks(params),
    staleTime: 1000 * 60 * 5,
  })
}

// features/tasks/hooks/query-keys.ts
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: TasksParams) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
}
```

---

## Component Guidelines

### What Goes in `/components` (Pure UI Only)

**✅ ALLOWED:**

```typescript
// components/ui/button.tsx
export function Button({ children, onClick, variant }: Props) {
  return (
    <button
      onClick={onClick}
      className={cn('btn', variantClasses[variant])}
    >
      {children}
    </button>
  )
}

// components/shared/stats-card.tsx
export function StatsCard({ title, value, icon }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-2xl font-bold">{value}</span>
        </div>
      </CardContent>
    </Card>
  )
}
```

**❌ NOT ALLOWED:**

```typescript
// ❌ NO: Data fetching
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

// ❌ NO: Server actions
import { createGoal } from '@/app/actions/goals'

// ❌ NO: Feature-specific logic
const handleComplete = async (taskId: string) => {
  await completeTask(taskId)
}
```

---

### What Goes in `/features/{feature}/components`

**✅ ALLOWED:**

```typescript
// features/goals/components/goal-form.tsx
'use client'
import { useCreateGoal } from '../hooks/use-create-goal' // ✅ Feature hook
import { Button } from '@/components/ui/button'          // ✅ UI component

export function GoalForm({ goal }: Props) {
  const createGoal = useCreateGoal()

  const handleSubmit = (data: GoalInput) => {
    createGoal.mutate(data)
  }

  return <form onSubmit={handleSubmit}>{/* ... */}</form>
}
```

**✅ ALLOWED: Using hooks from the same feature**
**✅ ALLOWED: Using UI components from `/components`**
**✅ ALLOWED: Feature-specific business logic**

---

### What Goes in Page `_components`

**Use for page-specific layout/composition:**

```typescript
// app/(app)/dashboard/_components/dashboard-stats.tsx
'use client'
import { StatsCard } from '@/components/shared/stats-card'
import { useGoals } from '@/features/goals/hooks/use-goals'
import { useTasks } from '@/features/tasks/hooks/use-tasks'

export function DashboardStats() {
  const { data: goals } = useGoals()
  const { data: tasks } = useTasks()

  const completedTasks = tasks?.filter(t => t.completed).length || 0
  const activeGoals = goals?.filter(g => g.status === 'active').length || 0

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatsCard title="Active Goals" value={activeGoals} />
      <StatsCard title="Completed Tasks" value={completedTasks} />
      <StatsCard title="Total Tasks" value={tasks?.length || 0} />
    </div>
  )
}
```

**✅ ALLOWED: Composing feature components**
**✅ ALLOWED: Page-specific layout logic**
**❌ NOT ALLOWED: Reusable business logic (move to feature)**

---

## Migration Checklist

### Week 1: Setup & Goals

- [ ] Create feature directory structure
- [ ] Move `goal-form` to `features/goals/components/`
- [ ] Move `goal-tabs` to `features/goals/components/`
- [ ] Move `delete-goal-button` to `features/goals/components/`
- [ ] Move `use-goals.ts` to `features/goals/hooks/`
- [ ] Move `app/actions/goals.ts` to `features/goals/actions/`
- [ ] Create `features/goals/index.ts` public API
- [ ] Update imports in pages
- [ ] Test goals feature

### Week 2: Tasks & Roadmap

- [ ] Move task components to `features/tasks/components/`
- [ ] Extract business logic from `TaskList` into hooks
- [ ] Move `use-tasks.ts` to `features/tasks/hooks/`
- [ ] Move task actions to `features/tasks/actions/`
- [ ] Create `features/tasks/index.ts`
- [ ] Move roadmap components to `features/roadmap/components/`
- [ ] **Extract Supabase calls from `progress-stages.tsx`**
- [ ] **Extract Supabase calls from `roadmap-timeline.tsx`**
- [ ] Create roadmap hooks
- [ ] Create `features/roadmap/index.ts`
- [ ] Update all imports

### Week 3: AI, Calendar, Templates

- [ ] Move AI components to `features/ai/components/`
- [ ] Move AI services to `features/ai/services/`
- [ ] Move calendar components to `features/calendar/components/`
- [ ] Move template components to `features/templates/components/`
- [ ] Create feature indexes
- [ ] Update all imports

### Week 4: Cleanup & UI Components

- [ ] Move pure UI to `components/ui/`
- [ ] Move shared components to `components/shared/`
- [ ] **Remove business logic from Sidebar**
- [ ] Simplify layout components
- [ ] Delete old `components/organisms/`
- [ ] Delete old `components/molecules/`
- [ ] Update all remaining imports
- [ ] Run tests
- [ ] Update documentation

---

## Benefits After Migration

### Before (Current)

```
❌ Business logic scattered across components
❌ Can't reuse TaskList without Supabase
❌ Hard to find goal-related code
❌ Components do too much
❌ Testing requires mocking everything
```

### After (Feature-Based)

```
✅ All goal code in features/goals/
✅ Components are pure UI (testable with props)
✅ Hooks are testable independently
✅ Actions are testable server-side
✅ Easy to find and modify features
✅ Clear separation of concerns
✅ Can delete entire feature easily
```

---

## Quick Reference

### Import Patterns

```typescript
// ✅ GOOD: Import from feature public API
import { GoalForm, useGoals, createGoal } from '@/features/goals'

// ✅ GOOD: Import UI components
import { Button, Card } from '@/components/ui'

// ✅ GOOD: Import shared utilities
import { cn } from '@/lib/utils'

// ❌ BAD: Don't reach into feature internals
import { GoalForm } from '@/features/goals/components/goal-form'

// ❌ BAD: Don't import features from UI components
// components/ui/button.tsx
import { useGoals } from '@/features/goals' // ❌ NO!
```

### File Naming Conventions

```
Features:
  features/goals/components/goal-form.tsx    (kebab-case)
  features/goals/hooks/use-goals.ts          (kebab-case)
  features/goals/actions/create-goal.ts      (kebab-case)

UI Components:
  components/ui/button.tsx                   (kebab-case)
  components/shared/stats-card.tsx           (kebab-case)

Page Components:
  app/(app)/dashboard/_components/stats.tsx  (kebab-case)
```

---

**Next Steps:** See REFACTORING_PLAN.md Phase 2 for detailed implementation timeline

**Last Updated:** 2025-11-09
**Maintainer:** Development Team
