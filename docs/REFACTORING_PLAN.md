# Goal Pilot - Comprehensive Refactoring Plan

> **⚠️ THIS IS THE MASTER REFERENCE DOCUMENT**
>
> **For current progress and status** → See **[REFACTORING_PROGRESS.md](./REFACTORING_PROGRESS.md)**
>
> **For quick overview** → See **[docs/README.md](./README.md)**

**Generated:** 2025-11-09
**Last Updated:** 2025-01-09
**Version:** 1.0
**Status:** In Progress (Phase 2)

---

## 📊 Current Status At-A-Glance

| Phase                 | Status          | Details                                                                    |
| --------------------- | --------------- | -------------------------------------------------------------------------- |
| Phase 1: Code Quality | ✅ **COMPLETE** | See [Progress Doc](./REFACTORING_PROGRESS.md#phase-1-code-quality)         |
| Phase 2: Architecture | 🔄 **60% Done** | See [Progress Doc](./REFACTORING_PROGRESS.md#phase-2-architecture)         |
| Phase 3: Performance  | ✅ **COMPLETE** | See [Progress Doc](./REFACTORING_PROGRESS.md#phase-3-performance)          |
| Phase 4: DevEx        | ⏳ **Planned**  | See [Progress Doc](./REFACTORING_PROGRESS.md#phase-4-developer-experience) |

**👉 [View Detailed Progress Tracker](./REFACTORING_PROGRESS.md)**

---

## Executive Summary

This document outlines a comprehensive, phased refactoring plan for the Goal Pilot application. The plan addresses code quality, architecture, performance, and maintainability issues identified through codebase analysis.

**Key Findings:**

- 150+ console.log/error statements in production code
- Duplicate/parallel server action implementations (3 versions of goal creation)
- Extensive error handling inconsistencies
- Mixed client/server component boundaries
- Suboptimal React Query cache invalidation patterns
- Performance optimization opportunities in AI generation flow

---

## Table of Contents

1. [Priority Levels](#priority-levels)
2. [Phase 1: Critical Code Quality Issues](#phase-1-critical-code-quality-issues-p0)
3. [Phase 2: Architecture & Structure](#phase-2-architecture--structure-p1)
4. [Phase 3: Performance Optimization](#phase-3-performance-optimization-p1-p2)
5. [Phase 4: Developer Experience](#phase-4-developer-experience-p2)
6. [Phase 5: Advanced Features](#phase-5-advanced-features-p3)
7. [Implementation Guidelines](#implementation-guidelines)
8. [Success Metrics](#success-metrics)

---

## Priority Levels

- **P0 (Critical)**: Security, bugs, production issues - Fix immediately
- **P1 (High)**: Architecture, performance, code quality - Fix within 2-4 weeks
- **P2 (Medium)**: Developer experience, maintainability - Fix within 1-2 months
- **P3 (Low)**: Nice-to-have improvements - Fix when capacity allows

---

## Phase 1: Critical Code Quality Issues (P0)

**Duration:** 1-2 weeks
**Dependencies:** None
**Impact:** Code quality, debugging, production stability

### 1.1 Logging & Debugging Cleanup

#### Issues

- 150+ console.log/error statements throughout codebase
- Production code contains debugging statements
- Inconsistent error logging patterns
- No structured logging solution

#### Refactoring Tasks

**Priority: P0**

- [ ] **Remove debug console.logs** (2-3 days)
  - Files affected: 30+ files across `app/`, `components/`, `lib/`
  - Action: Remove or replace with proper logging utility
  - Keep only error logs for critical failures

- [ ] **Implement structured logging** (2 days)
  - Create `lib/utils/logger.ts` with production-safe logging
  - Add log levels: error, warn, info, debug
  - Environment-based logging (verbose in dev, minimal in prod)
  - Example:
    ```typescript
    // lib/utils/logger.ts
    export const logger = {
      error: (message: string, context?: object) => {
        /* ... */
      },
      warn: (message: string, context?: object) => {
        /* ... */
      },
      info: (message: string, context?: object) => {
        /* ... */
      },
      debug: (message: string, context?: object) => {
        /* ... */
      },
    }
    ```

- [ ] **Replace console.error with proper error tracking** (1 day)
  - Integrate Sentry or similar error tracking
  - Structured error reporting with context
  - User-friendly error messages vs. internal logging

**Files to Update:**

```
app/actions/ai.ts (20+ console statements)
app/actions/ai-async.ts (10+ statements)
app/api/tasks/generate-phase/route.ts (15+ statements)
app/api/ai/generate-roadmap/route.ts (10+ statements)
components/organisms/progress-stages/progress-stages.tsx
lib/hooks/use-roadmap-generation.ts
... (25+ more files)
```

---

### 1.2 Error Handling Standardization

#### Issues

- Inconsistent error throwing patterns
- Generic error messages without context
- No error boundary implementation in critical paths
- Mixed error handling strategies (throw vs return)

#### Refactoring Tasks

**Priority: P0**

- [ ] **Create standardized error types** (1 day)

  ```typescript
  // lib/errors/index.ts
  export class GoalPilotError extends Error {
    constructor(
      message: string,
      public code: string,
      public context?: object,
    ) {
      super(message)
    }
  }

  export class DatabaseError extends GoalPilotError {}
  export class AIGenerationError extends GoalPilotError {}
  export class AuthenticationError extends GoalPilotError {}
  export class ValidationError extends GoalPilotError {}
  ```

- [ ] **Standardize error handling in server actions** (3 days)
  - All server actions return `{ success: boolean, error?: string, data?: T }`
  - Replace `throw new Error()` with structured responses
  - Files: `app/actions/*.ts` (8 files)

- [ ] **Add error boundaries** (2 days)
  - Component-level error boundaries for forms
  - Route-level error boundaries (already exists at `app/error.tsx`)
  - AI generation error boundary with retry logic

**Example Pattern:**

```typescript
// Before
export async function createGoal(data: GoalInput) {
  try {
    // ...
    if (error) throw new Error('Failed to create goal')
  } catch (error) {
    console.error(error)
    throw new Error('Failed to create goal')
  }
}

// After
export async function createGoal(data: GoalInput): Promise<Result<Goal>> {
  try {
    // ...
    if (error) {
      return {
        success: false,
        error: new DatabaseError('Failed to create goal', 'DB_INSERT_FAILED', {
          table: 'goals',
          originalError: error,
        }),
      }
    }
    return { success: true, data: goal }
  } catch (error) {
    logger.error('Unexpected error in createGoal', { error })
    return { success: false, error: 'An unexpected error occurred' }
  }
}
```

---

### 1.3 TypeScript Type Safety Improvements

#### Issues

- Use of `any` type in Supabase client (1 occurrence)
- Type assertions with `as unknown as Type` patterns
- Missing proper type guards

#### Refactoring Tasks

**Priority: P0**

- [ ] **Remove `any` type usage** (1 day)
  - File: `app/actions/ai-async.ts:47`
  - Replace `SupabaseClient<Database, 'public', any>` with proper typing
  - Use generated Supabase types exclusively

- [ ] **Review and reduce type assertions** (2 days)
  - Files: Throughout components and API routes
  - Add proper type guards where needed
  - Validate runtime types for external data (AI responses, API calls)

- [ ] **Add runtime validation for AI responses** (1 day)
  - Use Zod schemas for AI JSON responses
  - Validate before type casting
  - Example:

    ```typescript
    import { z } from 'zod'

    const RoadmapSchema = z.object({
      phases: z.array(
        z.object({
          title: z.string(),
          duration_weeks: z.number(),
          // ...
        }),
      ),
    })

    const validated = RoadmapSchema.safeParse(aiResponse)
    if (!validated.success) {
      throw new ValidationError('Invalid AI response', 'AI_INVALID_SCHEMA')
    }
    ```

---

## Phase 2: Architecture & Structure (P1)

**Duration:** 4-5 weeks
**Dependencies:** Phase 1 completion recommended
**Impact:** Maintainability, code duplication, clarity, scalability

### 2.0 Feature-Based Architecture Migration

#### Issues

- **Business logic mixed with UI components**
  - `progress-stages.tsx` has Supabase queries + mutations
  - `roadmap-timeline.tsx` has data fetching inline
  - `sidebar.tsx` has authentication logic
- **Components scattered by technical type**, not by feature
- **Hard to find related code** (hooks in `lib/`, actions in `app/`, components in `components/`)
- **Can't reuse components** without bringing along Supabase dependencies

#### Refactoring Tasks

**Priority: P1**

- [ ] **Create feature-based directory structure** (1 day)
  - Create `features/` directory
  - Set up folders: `goals/`, `tasks/`, `roadmap/`, `ai/`, `calendar/`, `templates/`
  - Each feature has: `components/`, `hooks/`, `actions/`, `types/`, `utils/`

- [ ] **Migrate Goals feature** (3 days)
  - Move `goal-form`, `goal-tabs`, `delete-goal-button` to `features/goals/components/`
  - Move `use-goals.ts` to `features/goals/hooks/`
  - Move `app/actions/goals.ts` to `features/goals/actions/`
  - Create `features/goals/index.ts` public API
  - Update all imports

- [ ] **Migrate Tasks feature** (3 days)
  - Move `task-list`, `task-item`, `task-filters`, `task-group` to `features/tasks/components/`
  - Move `use-tasks.ts` to `features/tasks/hooks/`
  - Move task actions to `features/tasks/actions/`
  - Extract business logic from components into hooks

- [ ] **Migrate Roadmap feature** (4 days)
  - Move roadmap components to `features/roadmap/components/`
  - **CRITICAL: Extract Supabase queries from `progress-stages.tsx`**
  - **CRITICAL: Extract Supabase queries from `roadmap-timeline.tsx`**
  - Create `use-progress-stages.ts` hook
  - Create `use-roadmap-timeline.ts` hook
  - Move actions to `features/roadmap/actions/`

- [ ] **Migrate AI feature** (2 days)
  - Move AI components to `features/ai/components/`
  - Move AI services (`lib/ai/*`) to `features/ai/services/`
  - Move AI actions to `features/ai/actions/`

- [ ] **Clean up `/components` directory** (2 days)
  - Keep only **pure UI components** (no business logic)
  - Move to `components/ui/` - shadcn/ui components
  - Move to `components/shared/` - truly reusable components
  - Remove `components/organisms/` and `components/molecules/`

- [ ] **Create page-specific components with `_components`** (2 days)
  - `app/(app)/dashboard/_components/` for dashboard-specific UI
  - `app/(app)/goals/[id]/_components/` for goal detail page UI
  - Use for page composition, not business logic

**See ARCHITECTURE_GUIDE.md for detailed migration steps and examples**

---

### 2.1 Consolidate Duplicate Server Actions

#### Issues

- **3 parallel implementations** of goal creation:
  - `app/actions/goals.ts` - Original
  - `app/actions/goals-async.ts` - Async variant
  - `app/actions/goals-optimized.ts` - Template-based
- Similar duplication in AI generation functions
- Confusing for developers which to use
- Maintenance burden (bugs fixed in one but not others)

#### Refactoring Tasks

**Priority: P1**

- [ ] **Merge goal creation logic** (3 days)
  - Create single `createGoal` function with strategy pattern
  - Support both instant (template) and async (AI) generation
  - Deprecate old files
  - Update all imports across codebase

  ```typescript
  // app/actions/goals/create.ts
  export async function createGoal(
    data: GoalInput,
    options: {
      strategy: 'instant' | 'async' | 'legacy'
      templateId?: string
    },
  ): Promise<Result<Goal>> {
    // Unified implementation
  }
  ```

- [ ] **Consolidate AI generation functions** (4 days)
  - Merge `generateRoadmap`, `generateRoadmapLegacy`, `generateRoadmapAsync`
  - Single entry point with configuration object
  - Strategy pattern for different AI approaches
  - Files to merge:
    - `app/actions/ai.ts`
    - `app/actions/ai-async.ts`

- [ ] **Create shared utilities for common patterns** (2 days)
  - Date calculations (phase start/end dates)
  - Task scheduling logic
  - Priority mapping
  - Move to `lib/utils/`

**Files to Refactor:**

```
app/actions/goals.ts → app/actions/goals/create.ts
app/actions/goals-async.ts → DELETE
app/actions/goals-optimized.ts → DELETE
app/actions/ai.ts → app/actions/ai/generate.ts
app/actions/ai-async.ts → DELETE
```

---

### 2.2 API Route Organization

#### Issues

- Nested API routes with unclear purpose
- Duplicate logic between API routes and server actions
- Inconsistent response formats

#### Refactoring Tasks

**Priority: P1**

- [ ] **Standardize API response format** (2 days)

  ```typescript
  // lib/api/response.ts
  export type ApiResponse<T> = {
    success: boolean
    data?: T
    error?: {
      code: string
      message: string
    }
  }
  ```

- [ ] **Consolidate AI generation routes** (3 days)
  - Currently 6 different AI routes:
    - `generate-instant`, `generate-roadmap`, `generate-overview-fast`
    - `generate-roadmap-stream`, `generate-stages-fast`
  - Reduce to 2-3 focused endpoints
  - Use query parameters for variations

- [ ] **Move business logic to server actions** (2 days)
  - API routes should be thin wrappers
  - Actual logic in server actions (reusable from server components)
  - API routes only for external/client-only access

---

### 2.3 Component Architecture Improvements

#### Issues

- Mixed client/server component boundaries
- Unclear component responsibility (organisms/molecules)
- Some components doing too much

#### Refactoring Tasks

**Priority: P1-P2**

- [ ] **Clarify client/server boundaries** (3 days)
  - Audit all `'use client'` directives (7 files)
  - Move server data fetching to server components
  - Pass data as props to client components
  - Example: Settings page, Dashboard page

- [ ] **Split large components** (4 days)
  - `components/organisms/goal-form/goal-form.tsx` - 500+ lines
  - `components/organisms/calendar/calendar-view.tsx` - Large, complex
  - `app/(app)/settings/page.tsx` - Multiple responsibilities

- [ ] **Improve component organization** (2 days)
  - Review atoms/molecules/organisms structure
  - Some "molecules" are actually organisms
  - Create better separation of concerns

---

## Phase 3: Performance Optimization (P1-P2)

**Duration:** 2-3 weeks
**Dependencies:** Phase 2 recommended
**Impact:** User experience, load times, API costs

### 3.1 React Query Optimization

#### Issues

- Over-invalidation of caches
- Multiple cache invalidations for same mutation
- Missing optimistic updates
- No cache stale time configuration

#### Refactoring Tasks

**Priority: P1**

- [ ] **Optimize cache invalidation** (3 days)
  - Review all `queryClient.invalidateQueries()` calls
  - Use more specific query keys
  - Implement optimistic updates for tasks
  - Files: `lib/hooks/use-tasks.ts`, `lib/hooks/use-goals.ts`

  ```typescript
  // Current
  queryClient.invalidateQueries({ queryKey: ['tasks'] })
  queryClient.invalidateQueries({ queryKey: ['goals'] })

  // Optimized
  queryClient.invalidateQueries({
    queryKey: ['tasks', { goalId, date }],
  })
  ```

- [ ] **Add cache configuration** (1 day)
  - Set appropriate `staleTime` for different queries
  - Configure `gcTime` (garbage collection)
  - Add `refetchOnWindowFocus` strategically

- [ ] **Implement optimistic updates** (2 days)
  - Task completion/uncomplete
  - Task rescheduling
  - Goal status updates

---

### 3.2 AI Generation Performance

#### Issues

- Long wait times for roadmap generation
- Retry logic with exponential backoff can be slow
- No progress indication for users during multi-step generation
- Template system underutilized

#### Refactoring Tasks

**Priority: P1**

- [ ] **Expand template library** (3 days)
  - Add more goal templates for instant generation
  - Reduce AI dependency for common goals
  - File: `lib/templates/goal-templates.ts`

- [ ] **Optimize AI timeout/retry logic** (2 days)
  - Current: 120s timeout with 3 retries = potential 6+ minutes
  - Reduce timeouts for overview generation
  - Better fallback strategies
  - Files: `app/actions/ai.ts`, `app/actions/ai-async.ts`

- [ ] **Implement streaming for better UX** (3 days)
  - Use existing streaming route more broadly
  - Show real-time progress
  - File: `app/api/ai/generate-roadmap-stream/route.ts`

- [ ] **Add AI response caching** (2 days)
  - Cache similar goal requests
  - Deduplicate identical AI calls
  - Redis or database caching layer

---

### 3.3 Database Query Optimization

#### Issues

- Potential N+1 queries
- Missing database indexes
- Suboptimal query patterns

#### Refactoring Tasks

**Priority: P2**

- [ ] **Review and optimize Supabase queries** (3 days)
  - Use `.select()` with specific columns
  - Batch operations where possible
  - Add indexes for common queries

- [ ] **Add database indexes** (1 day)
  - `tasks.scheduled_date`
  - `tasks.roadmap_id + completed`
  - `progress_stages.roadmap_id + phase_number`
  - `goals.user_id + status`

- [ ] **Implement query result pagination** (2 days)
  - Large task lists
  - Goal history
  - Activity feeds

---

## Phase 4: Developer Experience (P2)

**Duration:** 2-3 weeks
**Dependencies:** None (can run parallel)
**Impact:** Team velocity, onboarding, debugging

### 4.1 Development Tooling

#### Refactoring Tasks

**Priority: P2**

- [ ] **Add pre-commit hooks** (1 day)
  - Already have husky installed
  - Add type checking
  - Add linting
  - Add prettier formatting
  - Prevent console.log commits

- [ ] **Improve testing coverage** (Ongoing)
  - Current: Vitest configured but minimal tests
  - Add tests for critical paths:
    - Server actions
    - AI generation logic
    - Date calculations
    - Task scheduling

- [ ] **Add API documentation** (2 days)
  - Document all API routes
  - OpenAPI/Swagger spec
  - Example requests/responses

- [ ] **Create development guides** (2 days)
  - Component creation guidelines
  - Server action patterns
  - State management best practices
  - AI prompt engineering guide

---

### 4.2 Code Organization

#### Refactoring Tasks

**Priority: P2**

- [ ] **Organize action files** (2 days)

  ```
  app/actions/
    goals/
      create.ts
      update.ts
      delete.ts
      index.ts
    tasks/
      complete.ts
      reschedule.ts
      index.ts
    ai/
      generate-roadmap.ts
      generate-tasks.ts
      index.ts
    auth/
      login.ts
      signup.ts
      index.ts
  ```

- [ ] **Create barrel exports** (1 day)
  - Add index.ts files for cleaner imports
  - Reduce import statement complexity

  ```typescript
  // Instead of
  import { useGoals } from '@/lib/hooks/use-goals'
  import { useTasks } from '@/lib/hooks/use-tasks'

  // Use
  import { useGoals, useTasks } from '@/lib/hooks'
  ```

- [ ] **Move types to centralized location** (1 day)
  - Consolidate type definitions
  - Reduce type duplication
  - Better type reusability

---

## Phase 5: Advanced Features (P3)

**Duration:** Ongoing
**Dependencies:** Phases 1-2 recommended
**Impact:** User experience, feature completeness

### 5.1 Enhanced Error Recovery

**Priority: P3**

- [ ] **Add retry mechanisms for failed AI generations** (2 days)
  - User-triggered retry
  - Automatic retry with backoff
  - Save partial results

- [ ] **Implement undo functionality** (3 days)
  - Task completion undo
  - Goal deletion undo
  - Recent actions history

### 5.2 Advanced Caching

**Priority: P3**

- [ ] **Implement service worker for offline support** (5 days)
  - Cache static assets
  - Queue mutations for offline
  - Sync when online

- [ ] **Add Redis caching layer** (3 days)
  - Cache AI responses
  - Cache user preferences
  - Cache roadmap data

### 5.3 Performance Monitoring

**Priority: P3**

- [ ] **Add performance monitoring** (2 days)
  - Web Vitals tracking
  - API response time monitoring
  - AI generation time tracking

- [ ] **Implement analytics** (2 days)
  - User flow tracking
  - Feature usage analytics
  - Error rate monitoring

---

## Implementation Guidelines

### Refactoring Process

**IMPORTANT: Follow this process for EVERY refactoring task:**

1. **Use Serena tools for all refactoring operations**
   - Use `find_symbol` to locate code to refactor
   - Use `get_symbols_overview` to understand file structure
   - Use `replace_symbol_body` for symbol-level changes
   - Use `search_for_pattern` to find patterns across codebase
   - Use `find_referencing_symbols` to check impact of changes

2. **Test build after EACH refactoring task**

   ```bash
   pnpm run type-check
   pnpm run build
   ```

   - Fix any TypeScript errors immediately
   - Ensure build completes successfully
   - Check for any runtime warnings

3. **Update checklist in this document**
   - Mark task as complete with [x]
   - Document any issues encountered
   - Note any deviations from the plan

### Code Review Checklist

Before merging any refactoring PR:

- [ ] Used Serena tools for refactoring (not manual find/replace)
- [ ] Build tested and passing (`pnpm run build`)
- [ ] Type check passing (`pnpm run type-check`)
- [ ] No console.log statements added
- [ ] Proper error handling with structured errors
- [ ] TypeScript strict mode compliant
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Performance impact considered
- [ ] Backward compatibility maintained

### Migration Strategy

1. **Gradual Migration**: Don't rewrite everything at once
2. **Feature Flags**: Use flags for major changes
3. **Deprecation Period**: Mark old code as deprecated, remove after 2 sprints
4. **Testing**: Test thoroughly in staging before production
5. **Monitoring**: Watch metrics after each phase

### Rollback Plan

- Keep old code for 1 sprint after migration
- Tag releases for easy rollback
- Monitor error rates closely
- Have rollback scripts ready

---

## Success Metrics

### Phase 1 Success Criteria

- ✅ Zero console.log in production build
- ✅ <5 console.error statements (only for critical errors)
- ✅ All server actions return standardized responses
- ✅ No `any` types in codebase
- ✅ Error tracking service integrated

### Phase 2 Success Criteria

- ✅ Single goal creation function (3 files merged to 1)
- ✅ <10 API routes (down from 15+)
- ✅ All components properly categorized
- ✅ <5 'use client' directives in app directory

### Phase 3 Success Criteria

- ✅ 50% reduction in cache invalidations
- ✅ AI generation <30s for 80% of requests
- ✅ Template usage >40% of goal creations
- ✅ All database queries <100ms

### Phase 4 Success Criteria

- ✅ >60% code coverage for critical paths
- ✅ Pre-commit hooks active
- ✅ API documentation complete
- ✅ Developer onboarding <2 hours

---

## Quick Win Checklist

**These can be done immediately for quick impact:**

1. [x] **Remove useMemo/useCallback/memo (1-2 days)** - React 19 Compiler handles this! ✅ COMPLETE
2. [ ] Remove all console.log statements (2-3 days)
3. [ ] Add ESLint rule to prevent console.log
4. [ ] Standardize error responses in server actions
5. [ ] Add proper TypeScript types for Supabase client
6. [ ] Implement structured logging utility
7. [ ] Add database indexes
8. [ ] Configure React Query cache times
9. [ ] Merge duplicate goal creation functions

**NEW: See REFACTORING_BEST_PRACTICES.md for React 19 Compiler guide!**

---

## Estimated Timeline

| Phase   | Duration  | Dependencies        | Team Size |
| ------- | --------- | ------------------- | --------- |
| Phase 1 | 1-2 weeks | None                | 1-2 devs  |
| Phase 2 | 3-4 weeks | Phase 1 recommended | 2 devs    |
| Phase 3 | 2-3 weeks | Phase 2 recommended | 1-2 devs  |
| Phase 4 | 2-3 weeks | Can run parallel    | 1 dev     |
| Phase 5 | Ongoing   | Phases 1-2          | As needed |

**Total Core Refactoring Time:** 8-12 weeks with 2 developers

---

## Risk Assessment

### High Risk Items

- **AI generation consolidation**: Complex logic, high user impact
  - Mitigation: Feature flags, gradual rollout, extensive testing

- **Server action standardization**: Breaking changes to API
  - Mitigation: Deprecation period, backward compatibility layer

### Medium Risk Items

- **Database index addition**: Potential performance impact during migration
  - Mitigation: Add during low-traffic periods, monitor closely

### Low Risk Items

- **Logging cleanup**: Low impact changes
- **Component reorganization**: Mostly file moves
- **Documentation**: No code changes

---

## Notes

- This is a living document - update as we progress
- Priorities may shift based on business needs
- Some tasks can be parallelized
- Consider creating GitHub issues/projects from this plan
- Regular retrospectives after each phase

---

**Document Maintainer:** Development Team
**Last Updated:** 2025-11-09
**Next Review:** After Phase 1 completion
