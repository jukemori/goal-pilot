# Goal Pilot - Best Practices & Modern Patterns

**Generated:** 2025-11-09
**Based on:** Official documentation from TanStack Query v5, Next.js 16, Supabase, and Jotai
**Companion to:** REFACTORING_PLAN.md

This document provides specific code patterns and best practices based on the latest official documentation for the libraries used in Goal Pilot.

---

## Table of Contents

1. [React 19 Compiler - Remove useMemo, useCallback, memo](#react-19-compiler---remove-usememo-usecallback-memo)
2. [Feature-Based Architecture with Next.js App Router](#feature-based-architecture-with-nextjs-app-router)
3. [React Query (TanStack Query) v5 Best Practices](#react-query-tanstack-query-v5-best-practices)
4. [Next.js 16 Server Actions Patterns](#nextjs-16-server-actions-patterns)
5. [Supabase TypeScript Integration](#supabase-typescript-integration)
6. [Jotai State Management](#jotai-state-management)
7. [Migration Examples](#migration-examples)

---

## React 19 Compiler - Remove useMemo, useCallback, memo

### Overview

**You're already using React 19!** The React Compiler automatically optimizes your components, making manual memoization unnecessary. This means you can **remove most `useMemo`, `useCallback`, and `React.memo` calls** from your codebase.

### ✅ Setup Complete

The React Compiler is now configured in this project:

1. **Installed:** `babel-plugin-react-compiler@1.0.0`
2. **Configured:** `next.config.ts` has `reactCompiler: true`
3. **Status:** Active and optimizing all components automatically

**Current Issues in Codebase:**

- `useState` + `useMemo` in `components/organisms/calendar/calendar-view.tsx`
- `useState` + `useCallback` in multiple files
- `memo` wrapper in `components/organisms/calendar/simple-task-list.tsx`
- Manual memoization throughout components

**The React Compiler handles these optimizations automatically!**

---

### 1. Remove useMemo

**The compiler automatically memoizes expensive computations.**

#### Before (Manual Memoization):

```typescript
// components/organisms/calendar/calendar-view.tsx
function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())

  // ❌ REMOVE - Compiler does this automatically
  const filteredTasks = useMemo(() => {
    return tasks.filter(task =>
      isSameDay(task.scheduled_date, currentDate)
    )
  }, [tasks, currentDate])

  const tasksByDate = useMemo(() => {
    return groupBy(filteredTasks, task => task.scheduled_date)
  }, [filteredTasks])

  return <div>{/* render */}</div>
}
```

#### After (Compiler Optimized):

```typescript
// components/organisms/calendar/calendar-view.tsx
function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())

  // ✅ Just write the logic - compiler handles memoization
  const filteredTasks = tasks.filter(task =>
    isSameDay(task.scheduled_date, currentDate)
  )

  const tasksByDate = groupBy(filteredTasks, task => task.scheduled_date)

  return <div>{/* render */}</div>
}
```

**What the compiler does:**

- Tracks dependencies automatically (`tasks`, `currentDate`)
- Only recomputes when dependencies actually change
- More efficient than manual `useMemo` dependencies

---

### 2. Remove useCallback

**The compiler automatically memoizes function references.**

#### Before (Manual Memoization):

```typescript
// components/organisms/task-list/task-list.tsx
function TaskList() {
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null)

  // ❌ REMOVE - Compiler does this automatically
  const handleComplete = useCallback((taskId: string) => {
    setLoadingTaskId(taskId)
    completeTask(taskId)
  }, [])

  const handleReschedule = useCallback((taskId: string, newDate: string) => {
    rescheduleTask(taskId, newDate)
  }, [])

  return (
    <div>
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onComplete={handleComplete}
          onReschedule={handleReschedule}
        />
      ))}
    </div>
  )
}
```

#### After (Compiler Optimized):

```typescript
// components/organisms/task-list/task-list.tsx
function TaskList() {
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null)

  // ✅ Just define the functions - compiler handles stability
  const handleComplete = (taskId: string) => {
    setLoadingTaskId(taskId)
    completeTask(taskId)
  }

  const handleReschedule = (taskId: string, newDate: string) => {
    rescheduleTask(taskId, newDate)
  }

  return (
    <div>
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onComplete={handleComplete}
          onReschedule={handleReschedule}
        />
      ))}
    </div>
  )
}
```

**What the compiler does:**

- Preserves function identity across renders
- Only creates new function when captured values change
- Smarter than manual dependency arrays

---

### 3. Remove React.memo

**The compiler automatically prevents unnecessary re-renders.**

#### Before (Manual Memoization):

```typescript
// components/organisms/calendar/simple-task-list.tsx
// ❌ REMOVE - Compiler does this automatically
const SimpleTaskList = memo(({ tasks, onTaskComplete }: Props) => {
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null)

  return (
    <div>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  )
})
```

#### After (Compiler Optimized):

```typescript
// components/organisms/calendar/simple-task-list.tsx
// ✅ Just export the component - compiler handles memo
export function SimpleTaskList({ tasks, onTaskComplete }: Props) {
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null)

  return (
    <div>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  )
}
```

**What the compiler does:**

- Automatically bails out of renders when props haven't changed
- More granular than `React.memo` (can skip parts of a component)
- Handles complex prop comparisons automatically

---

### 4. When to Keep Manual Memoization

**Keep `useMemo`/`useCallback` only for:**

1. **Explicit Dependencies That Compiler Can't Infer**

   ```typescript
   // Keep this - external dependency
   const value = useMemo(() => expensiveLibrary.compute(input), [input])
   ```

2. **Referential Equality for External Libraries**

   ```typescript
   // Keep this - third-party library expects stable reference
   const config = useMemo(() => ({ api: apiKey }), [apiKey])
   useExternalLibrary(config) // Library does strict equality check
   ```

3. **Intentional Infinite Loop Prevention**
   ```typescript
   // Keep this - prevents infinite loop in useEffect
   useEffect(() => {
     fetchData(complexObject)
   }, [complexObject]) // Would recreate every render without memo
   ```

**For Goal Pilot, you can remove ~90% of memoization!**

---

### 5. Migration Strategy

#### Step 1: Remove from New Code First

- Don't add `useMemo`/`useCallback`/`memo` to new components
- Let the compiler handle it

#### Step 2: Remove from Simple Components

Start with components that have simple memoization:

```typescript
// BEFORE
const MyComponent = memo(({ name }) => {
  const greeting = useMemo(() => `Hello ${name}`, [name])
  return <div>{greeting}</div>
})

// AFTER
function MyComponent({ name }) {
  const greeting = `Hello ${name}`
  return <div>{greeting}</div>
}
```

#### Step 3: Remove from Complex Components

Then tackle components with multiple memoizations:

**Files to Update (in order of priority):**

1. `components/organisms/calendar/simple-task-list.tsx` - Remove `memo`
2. `components/organisms/calendar/calendar-view.tsx` - Remove `useMemo` calls
3. `components/molecules/progress-chart/progress-chart.tsx` - Remove `useCallback`
4. `components/organisms/task-list/task-list.tsx` - Remove `useCallback`
5. `components/organisms/task-list/task-list-original.tsx` - Remove `useMemo` and `useCallback`

#### Step 4: Test After Each Change

- Run `pnpm run dev` and test the component
- Check that performance is the same or better
- The compiler often optimizes better than manual memoization!

---

### 6. Expected Benefits

**Code Size Reduction:**

- Remove ~50-100 lines of memoization code
- Cleaner, more readable components
- Fewer dependencies to maintain

**Performance:**

- Compiler is smarter than manual memoization
- Automatically optimizes based on runtime behavior
- No risk of stale closures or incorrect dependencies

**Developer Experience:**

- No more "missing dependency" warnings
- No more debugging why `useCallback` didn't update
- Focus on logic, not optimization

---

### 7. Compiler Output Example

**Your Code:**

```typescript
function Component({ data }) {
  const processed = data.map(item => item.value * 2)
  const total = processed.reduce((sum, val) => sum + val, 0)

  return <div>{total}</div>
}
```

**What Compiler Generates:**

```typescript
function Component({ data }) {
  const $ = _c(3) // Memoization cache
  let processed
  if ($[0] !== data) {
    processed = data.map(item => item.value * 2)
    $[0] = data
    $[1] = processed
  } else {
    processed = $[1]
  }

  let total
  if ($[2] !== processed) {
    total = processed.reduce((sum, val) => sum + val, 0)
    $[2] = processed
    $[3] = total
  } else {
    total = $[3]
  }

  return <div>{total}</div>
}
```

**Notice:**

- Compiler tracks dependencies automatically
- Creates optimal memoization blocks
- Handles all the complexity you'd write with `useMemo`

---

### 8. Quick Removal Checklist

- [ ] Remove `memo()` wrapper from `SimpleTaskList`
- [ ] Remove `useMemo` from `CalendarView` filteredTasks
- [ ] Remove `useMemo` from `CalendarView` tasksByDate
- [ ] Remove `useCallback` from task handlers
- [ ] Remove `useMemo` from `ProgressChart` calculations
- [ ] Remove `useCallback` from `GoalForm` handlers
- [ ] Update ESLint config to remove `exhaustive-deps` rule warnings
- [ ] Add comment: "// Optimized by React Compiler" where helpful

---

## Feature-Based Architecture with Next.js App Router

### Overview

**Current Problem:** Business logic is mixed with UI components in the `components/` directory. Components like `progress-stages.tsx`, `roadmap-timeline.tsx`, and `sidebar.tsx` contain Supabase queries, React Query mutations, and authentication logic.

**Solution:** Separate concerns using feature-based architecture with Next.js App Router patterns.

**Key Principles:**

1. **Server Components for data fetching** - Fetch data at the server level
2. **Client Components for interactivity** - Mark only interactive parts as 'use client'
3. **Feature colocation** - Group related code by feature, not technical type
4. **Pure UI components** - Keep `components/` directory for truly reusable UI only

---

### 1. Server vs Client Component Separation

**Best Practice:** Default to Server Components, use Client Components only when needed.

#### Server Components (Default)

```typescript
// app/(app)/dashboard/page.tsx
// No 'use client' directive - this is a Server Component

import { createClient } from '@/lib/supabase/server'
import { GoalsList } from '@/features/goals/components/goals-list'

async function getGoals() {
  const supabase = await createClient()

  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .order('created_at', { ascending: false })

  return goals || []
}

export default async function DashboardPage() {
  // Fetch data directly in Server Component
  const goals = await getGoals()

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Pass data to Client Component */}
      <GoalsList initialGoals={goals} />
    </div>
  )
}
```

**Benefits:**

- Data fetching happens on the server (faster, more secure)
- No client-side JavaScript for this component
- Automatic code splitting
- Better SEO

---

#### Client Components (When Needed)

```typescript
// features/goals/components/goals-list.tsx
'use client' // Only mark as client when you need interactivity

import { useGoals } from '../hooks/use-goals'
import { GoalCard } from './goal-card'

type Props = {
  initialGoals: Goal[]
}

export function GoalsList({ initialGoals }: Props) {
  // Use React Query for client-side state management
  const { data: goals } = useGoals({
    initialData: initialGoals,
  })

  return (
    <div className="grid gap-4">
      {goals.map(goal => (
        <GoalCard key={goal.id} goal={goal} />
      ))}
    </div>
  )
}
```

**Use 'use client' when you need:**

- `useState`, `useEffect`, or other React hooks
- Event handlers (`onClick`, `onChange`, etc.)
- Browser APIs (`localStorage`, `window`, etc.)
- React Query hooks (`useQuery`, `useMutation`)
- Jotai atoms (`useAtom`, `useAtomValue`)

---

### 2. Feature-Based Directory Structure

**Organize code by feature, not by technical type.**

#### Current Structure (❌ Problem)

```
components/
  organisms/
    progress-stages/
      progress-stages.tsx        # Has Supabase + React Query
    roadmap-timeline/
      roadmap-timeline.tsx       # Has Supabase queries
    sidebar/
      sidebar.tsx                # Has auth logic

lib/
  hooks/
    use-goals.ts                 # Scattered hooks
    use-tasks.ts
```

#### Proposed Structure (✅ Solution)

```
features/
  goals/
    components/
      goals-list.tsx             # Pure UI
      goal-card.tsx              # Pure UI
      goal-form.tsx              # Pure UI
    hooks/
      use-goals.ts               # Data fetching
      use-create-goal.ts         # Mutations
    actions/
      create-goal.ts             # Server Actions
      update-goal.ts
      delete-goal.ts
    types/
      index.ts                   # Feature-specific types
    utils/
      validation.ts              # Feature-specific utils

  roadmap/
    components/
      progress-stages.tsx        # Pure UI (no Supabase)
      roadmap-timeline.tsx       # Pure UI (no queries)
    hooks/
      use-progress-stages.ts     # Extract queries here
      use-roadmap.ts
    actions/
      generate-roadmap.ts
    utils/
      roadmap-helpers.ts

  tasks/
    components/
      task-list.tsx
      task-item.tsx
    hooks/
      use-tasks.ts
      use-complete-task.ts
    actions/
      complete-task.ts
      reschedule-task.ts

components/                      # Pure UI only
  ui/                            # shadcn/ui components
    button.tsx
    card.tsx
    dialog.tsx
  shared/                        # Truly reusable components
    loading-spinner.tsx
    error-boundary.tsx
```

---

### 3. Extracting Business Logic from UI Components

**Before:** Business logic in component

```typescript
// ❌ components/organisms/progress-stages/progress-stages.tsx
'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function ProgressStages({ roadmapId }: Props) {
  const supabase = createClient()

  // ❌ Business logic in UI component
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

  const updateStage = useMutation({
    mutationFn: async (stageId: string) => {
      const { data } = await supabase
        .from('progress_stages')
        .update({ completed: true })
        .eq('id', stageId)
      return data
    }
  })

  return <div>{/* UI rendering */}</div>
}
```

**After:** Separated concerns

```typescript
// ✅ features/roadmap/hooks/use-progress-stages.ts
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useProgressStages(roadmapId: string) {
  return useQuery({
    queryKey: ['progress-stages', roadmapId],
    queryFn: async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('progress_stages')
        .select('*')
        .eq('roadmap_id', roadmapId)
        .order('order_index', { ascending: true })
      return data || []
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// ✅ features/roadmap/hooks/use-update-stage.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProgressStage } from '../actions/update-stage'

export function useUpdateStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProgressStage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-stages'] })
    }
  })
}

// ✅ features/roadmap/components/progress-stages.tsx
'use client'

import { useProgressStages } from '../hooks/use-progress-stages'
import { useUpdateStage } from '../hooks/use-update-stage'

export function ProgressStages({ roadmapId }: Props) {
  // Clean separation: hooks handle data, component handles UI
  const { data: stages, isLoading } = useProgressStages(roadmapId)
  const { mutate: updateStage } = useUpdateStage()

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      {stages?.map(stage => (
        <StageCard
          key={stage.id}
          stage={stage}
          onComplete={() => updateStage(stage.id)}
        />
      ))}
    </div>
  )
}
```

---

### 4. Nesting Client Components in Server Components

**Best Practice:** Pass Server Components as children to Client Components.

```typescript
// ✅ Server Component (layout or page)
import { ClientModal } from '@/components/ui/modal'
import { ServerContent } from './server-content'

export default function Page() {
  return (
    <ClientModal>
      {/* Server Component passed as children */}
      <ServerContent />
    </ClientModal>
  )
}

// ✅ Client Component acts as a slot
'use client'

export function ClientModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        {/* Server-rendered content inside client component */}
        {children}
      </DialogContent>
    </Dialog>
  )
}
```

**Why this pattern?**

- Server Components can't import Client Components directly
- But you can pass Server Components as props/children
- Keeps server-side benefits while adding interactivity

---

### 5. Page-Specific Components with \_components

**For page-specific UI that's not part of a feature:**

```
app/
  (app)/
    dashboard/
      page.tsx                   # Server Component
      _components/               # Page-specific Client Components
        dashboard-header.tsx
        stats-cards.tsx
        recent-activity.tsx
    calendar/
      page.tsx
      _components/
        calendar-grid.tsx
        date-picker.tsx
```

**Example:**

```typescript
// app/(app)/dashboard/page.tsx
import { DashboardHeader } from './_components/dashboard-header'
import { StatsCards } from './_components/stats-cards'
import { GoalsList } from '@/features/goals/components/goals-list'

export default async function DashboardPage() {
  const stats = await getStats()
  const goals = await getGoals()

  return (
    <div>
      <DashboardHeader />
      <StatsCards stats={stats} />
      <GoalsList initialGoals={goals} />
    </div>
  )
}
```

**When to use \_components:**

- Layout composition specific to a page
- UI that's only used in one route
- Not feature-specific logic (use features/ for that)

---

### 6. Context Providers as Client Components

**Best Practice:** Wrap providers at the root layout level.

```typescript
// ✅ providers/theme-provider.tsx
'use client'

import { createContext } from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system">
      {children}
    </NextThemesProvider>
  )
}

// ✅ app/layout.tsx (Server Component)
import { ThemeProvider } from '@/providers/theme-provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {/* Children are still Server Components */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**For Goal Pilot:**

```typescript
// providers/app-providers.tsx
'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { queryClient } from '@/lib/react-query/client'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system">
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}
```

---

### 7. Component Guidelines Summary

**Use in `components/` (Pure UI only):**

- ✅ shadcn/ui components (`Button`, `Card`, `Dialog`)
- ✅ Truly reusable UI patterns (`LoadingSpinner`, `ErrorBoundary`)
- ✅ Layout components (`Container`, `Section`)
- ❌ NO Supabase queries
- ❌ NO React Query mutations
- ❌ NO feature-specific logic

**Use in `features/{feature}/components/` (Feature UI):**

- ✅ Feature-specific components
- ✅ Can use feature hooks for data
- ✅ Event handlers that call feature actions
- ❌ NO direct Supabase calls (use hooks)

**Use in `features/{feature}/hooks/` (Data layer):**

- ✅ React Query hooks (`useQuery`, `useMutation`)
- ✅ Supabase queries
- ✅ Data transformation logic
- ✅ Jotai atoms for feature state

**Use in `features/{feature}/actions/` (Server layer):**

- ✅ Server Actions with 'use server'
- ✅ Server-side Supabase operations
- ✅ AI generation logic
- ✅ `revalidatePath` and `revalidateTag`

**Use in `app/(app)/{route}/_components/` (Page-specific):**

- ✅ Page composition components
- ✅ Layout-specific UI
- ❌ NO business logic (use features/)

---

### 8. Migration Checklist

**Extract from `components/organisms/progress-stages/`:**

- [ ] Move `progress-stages.tsx` to `features/roadmap/components/`
- [ ] Extract Supabase query to `features/roadmap/hooks/use-progress-stages.ts`
- [ ] Extract mutation to `features/roadmap/hooks/use-update-stage.ts`
- [ ] Create Server Action in `features/roadmap/actions/update-stage.ts`
- [ ] Remove all Supabase imports from component

**Extract from `components/organisms/roadmap-timeline/`:**

- [ ] Move to `features/roadmap/components/roadmap-timeline.tsx`
- [ ] Extract queries to `features/roadmap/hooks/use-roadmap.ts`
- [ ] Remove Supabase calls from component

**Extract from `components/organisms/sidebar/`:**

- [ ] Move to `app/(app)/_components/sidebar.tsx` (layout-specific)
- [ ] Extract auth logic to `features/auth/hooks/use-auth.ts`
- [ ] Use Server Component for user data fetching

**General migration for all components:**

- [ ] If it has Supabase queries → extract to `features/{feature}/hooks/`
- [ ] If it's feature-specific → move to `features/{feature}/components/`
- [ ] If it's page-specific → move to `app/{route}/_components/`
- [ ] If it's truly reusable UI → keep in `components/`

---

### 9. Expected Benefits

**Code Organization:**

- Clear separation of concerns
- Easy to find related code
- Feature can be deleted by removing one folder

**Performance:**

- Server Components = less JavaScript sent to client
- Automatic code splitting by route and feature
- Faster initial page loads

**Developer Experience:**

- Easier to reason about data flow
- Clear boundaries between server and client
- Colocation makes changes easier

**Type Safety:**

- Better inference with Server/Client separation
- Clearer prop types between boundaries

---

## React Query (TanStack Query) v5 Best Practices

### 1. Optimistic Updates Pattern

**Current Issue:** Tasks use basic invalidation without optimistic updates

**Best Practice:** Implement optimistic updates for instant UI feedback

```typescript
// lib/hooks/use-tasks.ts - RECOMMENDED PATTERN
export function useCompleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: completeTask,
    // Step 1: Optimistically update before mutation
    onMutate: async (taskId: string) => {
      // Cancel outgoing refetches to prevent overwrites
      await queryClient.cancelQueries({ queryKey: ['tasks'] })

      // Snapshot previous value for rollback
      const previousTasks = queryClient.getQueryData(['tasks'])

      // Optimistically update cache
      queryClient.setQueryData(['tasks'], (old: Task[]) =>
        old.map((task) =>
          task.id === taskId
            ? {
                ...task,
                completed: true,
                completed_at: new Date().toISOString(),
              }
            : task,
        ),
      )

      // Return context for rollback
      return { previousTasks }
    },

    // Step 2: Rollback on error
    onError: (err, taskId, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks)
      }
      toast.error('Failed to complete task')
    },

    // Step 3: Refetch on settle (success or error)
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
```

### 2. Fine-Grained Cache Invalidation

**Current Issue:** Over-invalidation with broad query keys

```typescript
// CURRENT (Too Broad)
queryClient.invalidateQueries({ queryKey: ['tasks'] })
queryClient.invalidateQueries({ queryKey: ['goals'] })

// RECOMMENDED (Specific)
// Use hierarchical query keys
const taskKeys = {
  all: ['tasks'] as const,
  byGoal: (goalId: string) => [...taskKeys.all, 'goal', goalId] as const,
  byDate: (date: string) => [...taskKeys.all, 'date', date] as const,
  today: () => [...taskKeys.all, 'today'] as const,
}

// Then invalidate specifically
queryClient.invalidateQueries({
  queryKey: taskKeys.byGoal(goalId),
})

// Or use predicates for complex logic
queryClient.invalidateQueries({
  predicate: (query) =>
    query.queryKey[0] === 'tasks' &&
    query.queryKey[1] === 'date' &&
    new Date(query.queryKey[2] as string) >= today,
})
```

### 3. Query Configuration Best Practices

**Add proper stale times and cache configuration:**

```typescript
// lib/hooks/use-tasks.ts
export function useTasks(date?: string) {
  return useQuery({
    queryKey: taskKeys.byDate(date || format(new Date(), 'yyyy-MM-dd')),
    queryFn: () => fetchTasks(date),
    staleTime: 1000 * 60 * 5, // 5 minutes - tasks don't change that often
    gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
    refetchOnWindowFocus: true, // Good for calendar view
  })
}

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: fetchGoals,
    staleTime: 1000 * 60 * 10, // 10 minutes - goals change less frequently
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false, // Goals don't need immediate refetch
  })
}
```

### 4. Mutation with Multiple Invalidations

**Best Practice:** Wait for all invalidations before settling

```typescript
// CURRENT
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['tasks'] })
  queryClient.invalidateQueries({ queryKey: ['goals'] })
}

// RECOMMENDED
onSuccess: async () => {
  // Wait for all invalidations to complete
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['tasks'] }),
    queryClient.invalidateQueries({ queryKey: ['goals'] }),
    queryClient.invalidateQueries({ queryKey: ['progress'] }),
  ])
}
```

---

## Next.js 16 Server Actions Patterns

### 1. Server Actions Return Pattern

**Current Issue:** Throwing errors from server actions

**Best Practice:** Return structured responses

```typescript
// app/actions/goals/create.ts - RECOMMENDED
'use server'

import { revalidatePath } from 'next/cache'

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createGoal(
  formData: FormData,
): Promise<ActionResult<Goal>> {
  try {
    const supabase = await createClient()

    // Validate input
    const validated = goalSchema.safeParse({
      title: formData.get('title'),
      // ... other fields
    })

    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0].message,
      }
    }

    const { data: goal, error } = await supabase
      .from('goals')
      .insert(validated.data)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: 'Failed to create goal. Please try again.',
      }
    }

    // Revalidate after successful mutation
    revalidatePath('/dashboard')

    return { success: true, data: goal }
  } catch (error) {
    console.error('Unexpected error in createGoal:', error)
    return {
      success: false,
      error: 'An unexpected error occurred.',
    }
  }
}

// Usage in component
async function handleSubmit(formData: FormData) {
  const result = await createGoal(formData)

  if (result.success) {
    toast.success('Goal created!')
    router.push(`/goals/${result.data.id}`)
  } else {
    toast.error(result.error)
  }
}
```

### 2. Server Actions with Extra Arguments

**For passing context beyond FormData:**

```typescript
'use server'

// Define with userId first, FormData last
export async function updateGoal(
  goalId: string,
  formData: FormData
): Promise<ActionResult<Goal>> {
  // Implementation
}

// Usage in Client Component with bind
'use client'

export function GoalForm({ goalId }: { goalId: string }) {
  return (
    <form action={updateGoal.bind(null, goalId)}>
      {/* form fields */}
    </form>
  )
}
```

### 3. Proper Revalidation Strategy

```typescript
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

export async function completeTask(taskId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tasks')
    .update({ completed: true })
    .eq('id', taskId)

  if (error) {
    return { success: false, error: error.message }
  }

  // Revalidate specific paths
  revalidatePath('/calendar')
  revalidatePath('/dashboard')

  // Or use tags for more granular control
  revalidateTag('tasks')
  revalidateTag(`task-${taskId}`)

  return { success: true }
}
```

### 4. Data Fetching in Server Components

```typescript
// app/(app)/dashboard/page.tsx
// No 'use client' - this is a Server Component

async function getGoals() {
  const supabase = await createClient()

  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .order('created_at', { ascending: false })

  return goals || []
}

export default async function DashboardPage() {
  // Fetch data directly in Server Component
  const goals = await getGoals()

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Pass data to Client Components as needed */}
      <GoalsList initialGoals={goals} />
    </div>
  )
}

// components/GoalsList.tsx
'use client'

export function GoalsList({ initialGoals }: { initialGoals: Goal[] }) {
  // Use React Query to manage client-side state
  const { data: goals } = useGoals({
    initialData: initialGoals,
  })

  return (
    <div>
      {goals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
    </div>
  )
}
```

---

## Supabase TypeScript Integration

### 1. Properly Typed Client Creation

**Current Issue:** Using `any` type in Supabase client

```typescript
// lib/supabase/client.ts - RECOMMENDED
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// lib/supabase/server.ts - RECOMMENDED
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options) {
          cookieStore.set(name, '', options)
        },
      },
    },
  )
}
```

### 2. Using Generated Types

```typescript
// Import generated types
import type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/types/database'

// Use in queries
async function getGoal(id: string): Promise<Tables<'goals'> | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('goals')
    .select('*')
    .eq('id', id)
    .single()

  return data
}

// Use in inserts
async function createGoal(
  goal: TablesInsert<'goals'>,
): Promise<Tables<'goals'>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('goals')
    .insert(goal)
    .select()
    .single()

  if (error) throw error
  return data
}

// Use in updates
async function updateGoal(
  id: string,
  updates: TablesUpdate<'goals'>,
): Promise<Tables<'goals'>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
```

### 3. Type-Safe Queries with Joins

```typescript
// Type-safe query with relations
type GoalWithRoadmap = Tables<'goals'> & {
  roadmaps: Tables<'roadmaps'>[]
}

async function getGoalWithRoadmap(id: string): Promise<GoalWithRoadmap | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('goals')
    .select(
      `
      *,
      roadmaps (*)
    `,
    )
    .eq('id', id)
    .single()

  return data as GoalWithRoadmap | null
}
```

---

## Jotai State Management

### 1. Atom Best Practices

**Current Issue:** Jotai is installed but underutilized

**Recommended Usage:**

```typescript
// store/atoms/generation.ts
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// Simple state atom
export const generationStatusAtom = atom<'idle' | 'generating' | 'complete'>(
  'idle',
)

// Derived atom (computed from other atoms)
export const isGeneratingAtom = atom((get) => {
  const status = get(generationStatusAtom)
  return status === 'generating'
})

// Atom with localStorage persistence
export const userPreferencesAtom = atomWithStorage('user-preferences', {
  theme: 'light',
  startOfWeek: 'sunday',
})

// Async atom
export const currentGoalAtom = atom(async (get) => {
  const goalId = get(selectedGoalIdAtom)
  if (!goalId) return null

  const supabase = createClient()
  const { data } = await supabase
    .from('goals')
    .select('*')
    .eq('id', goalId)
    .single()

  return data
})

// Write-only atom (for actions)
export const completeTaskAtom = atom(
  null, // no read
  async (get, set, taskId: string) => {
    set(generationStatusAtom, 'generating')
    try {
      await completeTask(taskId)
      set(generationStatusAtom, 'complete')
    } catch (error) {
      set(generationStatusAtom, 'idle')
      throw error
    }
  },
)
```

### 2. Using Jotai with React Query

**Combine for global UI state and server state:**

```typescript
// store/atoms/ui.ts
import { atom } from 'jotai'

// UI state in Jotai (fast, local changes)
export const selectedDateAtom = atom(new Date())
export const sidebarOpenAtom = atom(false)
export const taskFiltersAtom = atom({
  status: 'all',
  priority: 'all',
})

// Server state in React Query (for data fetching)
// lib/hooks/use-tasks.ts
export function useTasks() {
  const [selectedDate] = useAtom(selectedDateAtom)
  const [filters] = useAtom(taskFiltersAtom)

  return useQuery({
    queryKey: ['tasks', format(selectedDate, 'yyyy-MM-dd'), filters],
    queryFn: () => fetchTasks(selectedDate, filters),
  })
}
```

### 3. Loadable Pattern for Async Atoms

```typescript
import { atom } from 'jotai'
import { loadable } from 'jotai/utils'

const userDataAtom = atom(async () => {
  const response = await fetch('/api/user')
  return response.json()
})

// Wrap with loadable to avoid Suspense
export const loadableUserAtom = loadable(userDataAtom)

// Usage in component
function UserProfile() {
  const userLoadable = useAtomValue(loadableUserAtom)

  if (userLoadable.state === 'loading') {
    return <Spinner />
  }

  if (userLoadable.state === 'hasError') {
    return <ErrorMessage error={userLoadable.error} />
  }

  // userLoadable.state === 'hasData'
  return <div>{userLoadable.data.name}</div>
}
```

---

## Migration Examples

### Example 1: Migrate Goal Creation

**Before (current - multiple files):**

```typescript
// app/actions/goals.ts
export async function createGoal(data: GoalInput) {
  try {
    const supabase = await createClient()
    const { data: goal, error } = await supabase
      .from('goals')
      .insert(data)
      .select()
      .single()

    if (error) throw new Error('Failed to create goal')

    await generateRoadmap(goal.id)
    return goal
  } catch (error) {
    console.error(error)
    throw new Error('Failed to create goal')
  }
}

// app/actions/goals-async.ts (duplicate)
// app/actions/goals-optimized.ts (duplicate)
```

**After (consolidated with best practices):**

```typescript
// app/actions/goals/create.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { generateRoadmapAsync } from '../ai/generate-roadmap'
import { findTemplate } from '@/lib/templates/goal-templates'
import type { TablesInsert } from '@/types/database'

type CreateGoalOptions = {
  strategy?: 'instant' | 'async'
  templateId?: string
}

type ActionResult<T> =
  | { success: true; data: T; instant?: boolean }
  | { success: false; error: string }

export async function createGoal(
  goalData: TablesInsert<'goals'>,
  options: CreateGoalOptions = {},
): Promise<ActionResult<Tables<'goals'>>> {
  try {
    const supabase = await createClient()

    // Create the goal
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .insert(goalData)
      .select()
      .single()

    if (goalError || !goal) {
      return {
        success: false,
        error: 'Failed to create goal. Please try again.',
      }
    }

    // Strategy: Try template first, fallback to AI
    const template = findTemplate(goal.title)

    if (template && options.strategy !== 'async') {
      // Instant roadmap generation from template
      try {
        await generateFromTemplate(goal, template)
        revalidatePath('/dashboard')
        return { success: true, data: goal, instant: true }
      } catch (error) {
        // Fallback to async if template fails
        console.error('Template generation failed:', error)
      }
    }

    // Async AI generation (don't await)
    generateRoadmapAsync(goal.id).catch((error) => {
      console.error('Background roadmap generation failed:', error)
    })

    revalidatePath('/dashboard')
    return { success: true, data: goal, instant: false }
  } catch (error) {
    console.error('Unexpected error in createGoal:', error)
    return {
      success: false,
      error: 'An unexpected error occurred.',
    }
  }
}

// Usage
const result = await createGoal(goalData, { strategy: 'instant' })
if (result.success) {
  toast.success(
    result.instant
      ? 'Goal created with instant roadmap!'
      : 'Goal created! Roadmap is generating...',
  )
}
```

### Example 2: Migrate Task Completion with Optimistic Updates

**Before:**

```typescript
// lib/hooks/use-tasks.ts
export function useCompleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: completeTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}
```

**After:**

```typescript
// lib/hooks/use-tasks.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { completeTask } from '@/app/actions/tasks'
import { taskKeys } from './query-keys'

export function useCompleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (taskId: string) => {
      const result = await completeTask(taskId)
      if (!result.success) throw new Error(result.error)
      return result.data
    },

    // Optimistic update
    onMutate: async (taskId) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: taskKeys.all })

      // Snapshot
      const previousTasks = queryClient.getQueryData(taskKeys.all)

      // Optimistically update all task queries
      queryClient.setQueriesData(
        { queryKey: taskKeys.all },
        (old: Task[] | undefined) => {
          if (!old) return old
          return old.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  completed: true,
                  completed_at: new Date().toISOString(),
                }
              : task,
          )
        },
      )

      return { previousTasks }
    },

    // Rollback on error
    onError: (err, taskId, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.all, context.previousTasks)
      }
      toast.error('Failed to complete task')
    },

    // Refetch to ensure consistency
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })
}

// lib/hooks/query-keys.ts
export const taskKeys = {
  all: ['tasks'] as const,
  byDate: (date: string) => [...taskKeys.all, 'date', date] as const,
  byGoal: (goalId: string) => [...taskKeys.all, 'goal', goalId] as const,
  today: () => [...taskKeys.all, 'today'] as const,
}
```

---

## Quick Wins Checklist

**IMPORTANT: For each task below:**

1. ✅ Use Serena tools (`find_symbol`, `replace_symbol_body`, etc.) for all code changes
2. ✅ Run `pnpm run type-check` after each change
3. ✅ Run `pnpm run build` after each change
4. ✅ Mark checkbox as complete only after build passes

Apply these patterns immediately:

### Phase 1: React Compiler Optimization (1-2 days) ✅ COMPLETE

- [x] Install React Compiler: `pnpm add -D babel-plugin-react-compiler@latest` ✅
- [x] Configure Next.js: Add `reactCompiler: true` to next.config.ts ✅
- [x] Remove ALL useMemo from codebase (6 instances removed) → Test build ✅
- [x] Remove ALL useCallback from codebase (3 instances removed) → Test build ✅
- [x] Remove ALL memo() wrappers from codebase (0 instances remaining) → Test build ✅
- [x] Verified: No manual memoization remaining in codebase ✅
- [x] All builds passing ✅

**Files cleaned:**

- ✅ `components/organisms/calendar/simple-task-list.tsx` - removed 1 memo, 1 useMemo, 1 useCallback
- ✅ `components/organisms/calendar/calendar-view.tsx` - removed 5 memo, 2 useMemo
- ✅ `components/molecules/progress-chart/progress-chart.tsx` - removed 1 useCallback
- ✅ `components/organisms/task-list/task-list-original.tsx` - removed 2 useMemo
- ✅ `components/organisms/goal-form/goal-form.tsx` - removed 1 useMemo
- ✅ `lib/hooks/use-task-filters.ts` - removed 2 useMemo
- ✅ `lib/hooks/use-roadmap-generation.ts` - removed 1 useCallback
- ✅ `lib/hooks/use-sse-generation.ts` - removed 2 useCallback

### Phase 2: Feature-Based Architecture (1 week)

- [ ] Create `features/` directory structure → Test build
- [ ] Extract `progress-stages.tsx` → `features/roadmap/` (use Serena) → Test build
- [ ] Extract `roadmap-timeline.tsx` → `features/roadmap/` (use Serena) → Test build
- [ ] Extract business logic from `sidebar.tsx` (use Serena) → Test build
- [ ] Move hooks from `lib/hooks/` to `features/{feature}/hooks/` (use Serena) → Test build
- [ ] Create Server Actions in `features/{feature}/actions/` → Test build
- [ ] Clean up `components/` to only have pure UI → Test build

### Phase 3: TypeScript & Error Handling (2-3 days)

- [ ] Add `ActionResult<T>` type to all server actions (use Serena) → Test build
- [ ] Replace `throw new Error()` with `return { success: false, error }` (use Serena) → Test build
- [ ] Add proper TypeScript generics to `createClient<Database>()` (use Serena) → Test build
- [ ] Remove `any` type from Supabase client (use Serena) → Test build

### Phase 4: React Query Optimization (1-2 days)

- [ ] Implement optimistic updates for task completion (use Serena) → Test build
- [ ] Add staleTime and gcTime to all useQuery calls (use Serena) → Test build
- [ ] Use hierarchical query keys (use Serena) → Test build
- [ ] Add `await Promise.all()` to multiple invalidations (use Serena) → Test build

### Phase 5: Server Actions (1 day)

- [ ] Replace broad revalidatePath with specific paths (use Serena) → Test build
- [ ] Move data fetching from Client to Server Components (use Serena) → Test build

### Phase 6: State Management (1 day)

- [ ] Use Jotai for UI state (use Serena) → Test build

---

## References

- [React 19 Documentation](https://react.dev/)
- [React Compiler](https://react.dev/learn/react-compiler) - **NEW!**
- [TanStack Query v5 Docs](https://tanstack.com/query/latest)
- [Next.js 16 App Router](https://nextjs.org/docs)
- [Supabase TypeScript Guide](https://supabase.com/docs/guides/api/rest/generating-types)
- [Jotai Documentation](https://jotai.org/)

---

**Last Updated:** 2025-11-09
**Updated With:** React 19 Compiler best practices using Context7 documentation
**Maintainer:** Development Team
