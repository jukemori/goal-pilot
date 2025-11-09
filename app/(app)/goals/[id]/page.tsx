import { createClient } from '@/lib/supabase/server'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { GoalTabs } from '@/components/organisms/goal-tabs/goal-tabs'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DeleteGoalButton } from '@/components/molecules/delete-goal-button'
import {
  Edit3,
  Calendar,
  Clock,
  Target,
  CheckCircle,
  Activity,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
import {
  ErrorBoundary,
  TaskErrorBoundary,
  RoadmapErrorBoundary,
} from '@/components/error-boundary'
import { Tables } from '@/types/database'
import {
  RoadmapSkeleton,
  TaskListSkeleton,
  ProgressChartSkeleton,
  ProgressStagesSkeleton,
  RoadmapTimelineSkeleton,
} from '@/components/atoms/skeletons'
import { StatsCard } from '@/components/molecules/stats-card'

// Component prop types for proper TypeScript handling
type RoadmapViewRoadmapType = {
  id: string
  ai_generated_plan: {
    overview?: string
    phases: Array<{
      title: string
      description: string
      duration_weeks: number
      learning_objectives?: string[]
      key_concepts?: string[]
      deliverables?: string[]
    }>
    timeline: {
      total_weeks: number
      daily_commitment: string
    }
    estimated_completion_date?: string
    total_hours_required?: number
  }
  milestones: Array<{
    id?: string
    week: number
    title: string
    description: string
    deliverables: string[]
    completed?: boolean
    completed_date?: string
    target_date?: string
  }>
  created_at: string
}

// Lazy load heavy components to reduce initial bundle size
const RoadmapView = dynamic(
  () =>
    import('@/components/organisms/roadmap-view/roadmap-view').then((mod) => ({
      default: mod.RoadmapView,
    })),
  {
    loading: () => <RoadmapSkeleton />,
  },
)

const TaskList = dynamic(
  () =>
    import('@/components/organisms/task-list/task-list').then((mod) => ({
      default: mod.TaskList,
    })),
  {
    loading: () => <TaskListSkeleton />,
  },
)

const ProgressChart = dynamic(
  () =>
    import('@/components/molecules/progress-chart/progress-chart').then(
      (mod) => ({ default: mod.ProgressChart }),
    ),
  {
    loading: () => <ProgressChartSkeleton />,
  },
)

const ProgressStages = dynamic(
  () =>
    import('@/features/roadmap/components/progress-stages').then(
      (mod) => ({ default: mod.ProgressStages }),
    ),
  {
    loading: () => <ProgressStagesSkeleton />,
  },
)

const RoadmapTimeline = dynamic(
  () =>
    import('@/components/organisms/roadmap-timeline/roadmap-timeline').then(
      (mod) => ({ default: mod.RoadmapTimeline }),
    ),
  {
    loading: () => <RoadmapTimelineSkeleton />,
  },
)

interface GoalPageProps {
  params: Promise<{ id: string }>
}

export default async function GoalPage({ params }: GoalPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get goal with roadmap and tasks
  const { data: goalData, error } = await supabase
    .from('goals')
    .select(
      `
      *,
      roadmaps (
        id,
        ai_generated_plan,
        milestones,
        created_at,
        tasks (
          id,
          title,
          description,
          scheduled_date,
          estimated_duration,
          completed,
          completed_at,
          priority
        )
      )
    `,
    )
    .eq('id', id)
    .single()

  type GoalWithRoadmapsAndTasks = Tables<'goals'> & {
    roadmaps: (Tables<'roadmaps'> & {
      tasks: Tables<'tasks'>[]
    })[]
  }

  const goal = goalData as GoalWithRoadmapsAndTasks | null

  if (error || !goal) {
    notFound()
  }

  const roadmap = goal.roadmaps[0]
  const tasks = roadmap?.tasks || []
  const completedTasks = tasks.filter((task) => task.completed)
  const totalTasks = tasks.length
  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0

  // Calculate days active on server side to avoid hydration mismatch
  const daysActive = Math.ceil(
    (new Date().getTime() - new Date(goal.start_date).getTime()) /
      (1000 * 60 * 60 * 24),
  )

  const statusColors = {
    active: 'bg-primary/10 text-primary border-primary/20',
    completed: 'bg-primary/5 text-primary border-primary/20',
  }

  return (
    <div className="space-y-6">
      {/* Goal Header */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold">{goal.title}</h1>
                <Badge
                  variant="outline"
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium',
                    statusColors[goal.status as keyof typeof statusColors],
                  )}
                >
                  {goal.status}
                </Badge>
              </div>
              {goal.description && (
                <p className="text-muted-foreground max-w-2xl">
                  {goal.description}
                </p>
              )}
              <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Started{' '}
                    {new Date(goal.start_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{goal.daily_time_commitment} min/day</span>
                </div>
                {goal.target_date && (
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span>
                      Target:{' '}
                      {new Date(goal.target_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 lg:flex-shrink-0">
              <Link href={`/goals/${goal.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <DeleteGoalButton goalId={goal.id} goalTitle={goal.title} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shadcn Style Tabs */}
      <GoalTabs>
        {{
          overview: (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
                <StatsCard
                  title="Total Progress"
                  value={`${progressPercentage}%`}
                  icon={<CheckCircle className="h-4 w-4 md:h-5 md:w-5" />}
                  color="green"
                  subtitle={`${completedTasks.length} of ${totalTasks} tasks completed`}
                  progress={progressPercentage}
                />
                <StatsCard
                  title="Days Active"
                  value={daysActive}
                  icon={<Calendar className="h-4 w-4 md:h-5 md:w-5" />}
                  color="blue"
                  subtitle="Since start"
                />
                <StatsCard
                  title="Time Invested"
                  value={`${Math.round(
                    completedTasks.reduce(
                      (acc: number, task) =>
                        acc + (task.estimated_duration || 0),
                      0,
                    ) / 60,
                  )}h`}
                  icon={<Clock className="h-4 w-4 md:h-5 md:w-5" />}
                  color="purple"
                  subtitle="Total hours"
                />
                <StatsCard
                  title="Tasks Today"
                  value={
                    tasks.filter((task) => {
                      const today = new Date().toISOString().split('T')[0]
                      return task.scheduled_date === today
                    }).length
                  }
                  icon={<Activity className="h-4 w-4 md:h-5 md:w-5" />}
                  color="orange"
                  subtitle="Scheduled"
                />
              </div>

              {/* Roadmap Summary */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <div className="from-primary/10 to-primary/20 rounded-lg bg-gradient-to-br p-2">
                        <BookOpen className="text-primary h-5 w-5" />
                      </div>
                      Roadmap Summary
                    </CardTitle>
                    <CardDescription className="mt-1 text-gray-600">
                      {roadmap
                        ? 'Your AI-generated learning path'
                        : 'Generating your roadmap...'}
                    </CardDescription>
                  </div>
                  {roadmap && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700">
                        Learning Path
                      </div>
                      <div className="text-xs text-gray-500">AI-Generated</div>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {roadmap ? (
                    <RoadmapErrorBoundary>
                      <RoadmapView
                        roadmap={roadmap as unknown as RoadmapViewRoadmapType}
                      />
                    </RoadmapErrorBoundary>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="relative">
                        <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="text-primary/50 h-5 w-5" />
                        </div>
                      </div>
                      <h3 className="mb-2 text-lg font-medium text-gray-900">
                        Creating Your Learning Path
                      </h3>
                      <p className="mx-auto max-w-md text-gray-600">
                        Our AI is analyzing your goal and crafting a
                        personalized roadmap tailored to your learning
                        objectives.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ),
          roadmap: (
            <div className="space-y-6">
              {roadmap ? (
                <div className="space-y-6">
                  <RoadmapErrorBoundary>
                    <RoadmapTimeline roadmapId={roadmap.id} goalId={goal.id} />
                  </RoadmapErrorBoundary>
                </div>
              ) : (
                <div className="bg-card rounded-lg border p-4 md:p-8">
                  <div className="text-center">
                    <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                    <p className="text-muted-foreground">
                      Generating your roadmap...
                    </p>
                  </div>
                </div>
              )}
            </div>
          ),
          stages: (
            <div className="space-y-6">
              {roadmap ? (
                <div className="space-y-6">
                  <RoadmapErrorBoundary>
                    <ProgressStages roadmapId={roadmap.id} goalId={goal.id} />
                  </RoadmapErrorBoundary>
                </div>
              ) : (
                <div className="bg-card rounded-lg border p-4 md:p-8">
                  <div className="text-center">
                    <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                    <p className="text-muted-foreground">
                      Generating your stages...
                    </p>
                  </div>
                </div>
              )}
            </div>
          ),
          progress: (
            <div className="space-y-6">
              {/* Progress Overview - Clean Layout */}
              <div className="space-y-4">
                <div className="bg-card rounded-lg border p-4 md:p-6">
                  <ErrorBoundary>
                    <ProgressChart tasks={tasks as Tables<'tasks'>[]} />
                  </ErrorBoundary>
                </div>
              </div>

              {/* Tasks List - Clean Layout */}
              <div className="space-y-4" id="tasks-section">
                <div>
                  <h3 className="text-lg font-semibold">Tasks</h3>
                  <p className="text-muted-foreground text-sm">
                    Your daily action items
                  </p>
                </div>
                <div className="bg-card rounded-lg border p-4 md:p-6">
                  <TaskErrorBoundary>
                    <TaskList
                      tasks={tasks as Tables<'tasks'>[]}
                      goalId={goal.id}
                    />
                  </TaskErrorBoundary>
                </div>
              </div>
            </div>
          ),
        }}
      </GoalTabs>
    </div>
  )
}
