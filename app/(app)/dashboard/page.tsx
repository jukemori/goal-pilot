import { createClient } from '@/lib/supabase/server'
import { Tables } from '@/types/database'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import Link from 'next/link'
import {
  Plus,
  Target,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
  BookOpen,
  Zap,
  Star,
  ArrowRight,
} from 'lucide-react'
import { StatsCard } from '@/components/molecules/stats-card'
import dynamic from 'next/dynamic'
import { ClickableTaskItemSkeleton } from '@/components/molecules/clickable-task-item'

// Lazy load the ClickableTaskItem component for better performance
const ClickableTaskItem = dynamic(
  () =>
    import('@/components/molecules/clickable-task-item').then((mod) => ({
      default: mod.ClickableTaskItem,
    })),
  {
    loading: () => <ClickableTaskItemSkeleton />,
  },
)

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get user's goals
  const { data: goalsData } = await supabase
    .from('goals')
    .select('*, roadmaps(id)')
    .order('created_at', { ascending: false })
    .limit(3)

  // Type the goals with roadmaps relationship
  const goals = goalsData as (Tables<'goals'> & {
    roadmaps: { id: string }[]
  })[] | null

  // Get today's tasks
  const today = new Date().toISOString().split('T')[0]
  const { data: tasksData } = await supabase
    .from('tasks')
    .select('*')
    .eq('scheduled_date', today)

  const todayTasks = tasksData as Tables<'tasks'>[] | null

  const completedTasks =
    todayTasks?.filter((task) => task.completed).length || 0
  const totalTasks = todayTasks?.length || 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="from-primary/10 to-primary/5 absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r" />
        <div className="p-4 md:p-8">
          <div className="mb-2 flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <Zap className="text-primary h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <p className="text-lg text-gray-600">
            Track your progress and manage your learning journey
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
        <StatsCard
          title="Active Goals"
          value={goals?.filter((g) => g.status === 'active').length || 0}
          icon={<Target className="h-4 w-4 md:h-5 md:w-5" />}
          color="blue"
        />
        <StatsCard
          title="Today's Tasks"
          value={totalTasks}
          icon={<Clock className="h-4 w-4 md:h-5 md:w-5" />}
          color="purple"
        />
        <StatsCard
          title="Completed Today"
          value={completedTasks}
          icon={<CheckCircle className="h-4 w-4 md:h-5 md:w-5" />}
          color="green"
        />
        <StatsCard
          title="Progress Rate"
          value={
            totalTasks > 0
              ? `${Math.round((completedTasks / totalTasks) * 100)}%`
              : '0%'
          }
          icon={<TrendingUp className="h-4 w-4 md:h-5 md:w-5" />}
          color="orange"
        />
      </div>

      {/* Recent Goals */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <div className="from-primary/10 to-primary/20 rounded-lg bg-gradient-to-br p-2">
                <Target className="text-primary h-5 w-5" />
              </div>
              Recent Goals
            </CardTitle>
            <CardDescription className="mt-1 text-gray-600">
              Your latest goals and their progress
            </CardDescription>
          </div>
          <Link href="/goals/new" className="self-start sm:self-auto">
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 shadow-md"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Goal
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {goals && goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map((goal) => (
                <Link
                  key={goal.id}
                  href={`/goals/${goal.id}`}
                  className="group block"
                >
                  <div className="hover:from-primary/5 hover:to-primary/10 hover:border-primary/20 rounded-xl border p-4 transition-all duration-300 hover:bg-gradient-to-r hover:shadow-md">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h3 className="group-hover:text-primary truncate font-semibold text-gray-900 transition-colors">
                            {goal.title}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="flex-shrink-0 text-xs"
                          >
                            {goal.status}
                          </Badge>
                        </div>
                        <div className="flex flex-col gap-1 text-sm text-gray-600 sm:flex-row sm:items-center sm:gap-3">
                          <div className="flex min-w-0 items-center gap-1">
                            <Star className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                              {goal.current_level}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span className="whitespace-nowrap">
                              {goal.daily_time_commitment} min/day
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        <div className="flex items-center gap-1">
                          {goal.roadmaps.length > 0 ? (
                            <>
                              <div className="bg-primary h-2 w-2 rounded-full"></div>
                              <span className="text-primary text-sm font-medium">
                                Ready
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="h-2 w-2 animate-pulse rounded-full bg-orange-500"></div>
                              <span className="text-sm font-medium text-orange-600">
                                Generating...
                              </span>
                            </>
                          )}
                        </div>
                        <ArrowRight className="group-hover:text-primary h-4 w-4 text-gray-400 transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              <div className="pt-2">
                <Link href="/goals">
                  <Button variant="outline" className="w-full">
                    <BookOpen className="mr-2 h-4 w-4" />
                    View All Goals
                  </Button>
                </Link>
              </div>
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
                No goals yet
              </h3>
              <p className="mx-auto mb-6 max-w-md text-gray-600">
                Start your learning journey by creating your first goal. Set
                your target and let AI generate a personalized roadmap.
              </p>
              <Link href="/goals/new">
                <Button className="bg-primary hover:bg-primary/90 shadow-md">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Goal
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Tasks */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-2">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            Today's Tasks
          </CardTitle>
          <CardDescription className="mt-1 text-gray-600">
            Tasks scheduled for{' '}
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todayTasks && todayTasks.length > 0 ? (
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <ClickableTaskItem key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="relative">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-blue-100">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <div className="absolute top-0 left-1/2 -z-10 h-20 w-20 -translate-x-1/2 transform rounded-full bg-blue-50"></div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No tasks for today
              </h3>
              <p className="mx-auto mb-6 max-w-md text-gray-600">
                You're all caught up! Tasks will appear here when you generate
                them from your learning phases.
              </p>
              <Link href="/goals">
                <Button variant="outline">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Explore Your Goals
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
