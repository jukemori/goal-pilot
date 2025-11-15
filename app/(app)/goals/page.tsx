import { createClient } from '@/lib/supabase/server'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import Link from 'next/link'
import { Plus, Clock, Target, Calendar } from 'lucide-react'
import { Tables } from '@/types/database'
import dynamic from 'next/dynamic'
import { ErrorBoundary } from '@/components/error-boundary'
import { TemplatesSkeleton } from '@/components/atoms/skeletons'
import { Suspense } from 'react'

// Type for GoalCard component props
type GoalCardGoalType = Tables<'goals'> & {
  progress?: number
  roadmaps?: Array<{
    id: string
    tasks?: Array<{ completed: boolean }>
  }>
}

// Lazy load TemplatesSection to reduce initial bundle
const TemplatesSection = dynamic(() =>
  import('@/components/organisms/goal-templates/templates-section').then(
    (mod) => ({ default: mod.TemplatesSection }),
  ),
)

export default async function GoalsPage() {
  const supabase = await createClient()

  const { data: goalsData } = await supabase
    .from('goals')
    .select('*, roadmaps(id)')
    .order('created_at', { ascending: false })

  const goals = goalsData as
    | (Tables<'goals'> & {
        roadmaps: { id: string }[]
      })[]
    | null

  const activeGoals = goals?.filter((g) => g.status === 'active') || []
  const completedGoals = goals?.filter((g) => g.status === 'completed') || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="from-primary/10 to-primary/5 absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r" />
        <div className="p-4 md:p-8">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Target className="text-primary h-6 w-6" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
              </div>
              <p className="text-lg text-gray-600">
                Manage and track all your learning goals
              </p>
            </div>
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 self-start shadow-md md:self-auto"
            >
              <Link href="/goals/new">
                <Plus className="mr-2 h-4 w-4" />
                New Goal
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Goal Templates Section */}
      <ErrorBoundary>
        <Suspense fallback={<TemplatesSkeleton />}>
          <TemplatesSection hasActiveGoals={activeGoals.length > 0} />
        </Suspense>
      </ErrorBoundary>

      {/* Active Goals */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <div className="from-primary/10 to-primary/20 rounded-lg bg-gradient-to-br p-2">
              <Target className="text-primary h-5 w-5" />
            </div>
            Active Goals
          </CardTitle>
          <CardDescription className="mt-1 text-gray-600">
            Your active learning goals and their progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeGoals.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal as unknown as GoalCardGoalType}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="relative">
                <div className="from-primary/10 to-primary/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br">
                  <Target className="text-primary h-8 w-8" />
                </div>
                <div className="bg-primary/5 absolute top-0 left-1/2 -z-10 h-20 w-20 -translate-x-1/2 transform rounded-full"></div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No active goals yet
              </h3>
              <p className="mx-auto mb-6 max-w-md text-gray-600">
                Start your learning journey by creating your first goal. Set
                your target and let AI generate a personalized roadmap.
              </p>
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 shadow-md"
              >
                <Link href="/goals/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Goal
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-2">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              Completed Goals
            </CardTitle>
            <CardDescription className="mt-1 text-gray-600">
              Goals you've successfully completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal as unknown as GoalCardGoalType}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function GoalCard({ goal }: { goal: GoalCardGoalType }) {
  return (
    <Link href={`/goals/${goal.id}`}>
      <Card className="h-full cursor-pointer transition-shadow hover:shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">{goal.title}</CardTitle>
          {goal.description && (
            <CardDescription className="line-clamp-2">
              {goal.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                Started {new Date(goal.start_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{goal.daily_time_commitment} min/day</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>
                {goal.roadmaps && goal.roadmaps.length > 0
                  ? 'Roadmap ready'
                  : 'Generating roadmap...'}
              </span>
            </div>
          </div>
          {goal.status === 'completed' && (
            <div className="text-primary mt-4 text-sm font-medium">
              Completed
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
