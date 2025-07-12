import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GoalTabs } from '@/components/organisms/goal-tabs/goal-tabs'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DeleteGoalButton } from '@/components/molecules/delete-goal-button'
import { Edit3, Calendar, Clock, Target, CheckCircle, Activity, BookOpen } from 'lucide-react'
import { RoadmapView } from '@/components/organisms/roadmap-view/roadmap-view'
import { TaskList } from '@/components/organisms/task-list/task-list'
import { ProgressChart } from '@/components/molecules/progress-chart/progress-chart'
import { ProgressStages } from '@/components/organisms/progress-stages/progress-stages'
import { RoadmapTimeline } from '@/components/organisms/roadmap-timeline/roadmap-timeline'
import { cn } from '@/lib/utils'

interface GoalPageProps {
  params: Promise<{ id: string }>
}

export default async function GoalPage({ params }: GoalPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  // Get goal with roadmap and tasks
  const { data: goal, error } = await supabase
    .from('goals')
    .select(`
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
    `)
    .eq('id', id)
    .single()

  if (error || !goal) {
    notFound()
  }

  const roadmap = goal.roadmaps[0]
  const tasks = roadmap?.tasks || []
  const completedTasks = tasks.filter((task) => task.completed)
  const totalTasks = tasks.length
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0
  
  // Calculate days active on server side to avoid hydration mismatch
  const daysActive = Math.ceil((new Date().getTime() - new Date(goal.start_date).getTime()) / (1000 * 60 * 60 * 24))

  const statusColors = {
    active: 'bg-primary/10 text-primary border-primary/20',
    completed: 'bg-primary/5 text-primary border-primary/20',
  }

  return (
    <div className="space-y-6">
      {/* Goal Header */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold">{goal.title}</h1>
                <Badge variant="outline" className={cn("text-xs px-3 py-1 rounded-full border font-medium", statusColors[goal.status as keyof typeof statusColors])}>
                  {goal.status}
                </Badge>
              </div>
              {goal.description && (
                <p className="text-muted-foreground max-w-2xl">{goal.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Started {new Date(goal.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{goal.daily_time_commitment} min/day</span>
                </div>
                {goal.target_date && (
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span>Target: {new Date(goal.target_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 lg:flex-shrink-0">
              <Link href={`/goals/${goal.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
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
          <div className="grid gap-3 grid-cols-2 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
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
              value={`${Math.round((completedTasks.reduce((acc: number, task) => 
                acc + (task.estimated_duration || 0), 0)) / 60)}h`}
              icon={<Clock className="h-4 w-4 md:h-5 md:w-5" />}
              color="purple"
              subtitle="Total hours"
            />
            <StatsCard
              title="Tasks Today"
              value={tasks.filter((task) => {
                const today = new Date().toISOString().split('T')[0]
                return task.scheduled_date === today
              }).length}
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
                  <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  Roadmap Summary
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  {roadmap ? 'Your AI-generated learning path' : 'Generating your roadmap...'}
                </CardDescription>
              </div>
              {roadmap && (
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">Learning Path</div>
                  <div className="text-xs text-gray-500">AI-Generated</div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {roadmap ? (
                <RoadmapView roadmap={roadmap as unknown as Parameters<typeof RoadmapView>[0]['roadmap']} />
              ) : (
                <div className="text-center py-12">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary/50" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Creating Your Learning Path</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Our AI is analyzing your goal and crafting a personalized roadmap tailored to your learning objectives.
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
                  <RoadmapTimeline roadmapId={roadmap.id} goalId={goal.id} />
                </div>
              ) : (
                <div className="bg-card rounded-lg border p-4 md:p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Generating your roadmap...</p>
                  </div>
                </div>
              )}
            </div>
          ),
          stages: (
            <div className="space-y-6">
              {roadmap ? (
                <div className="space-y-6">
                  <ProgressStages roadmapId={roadmap.id} goalId={goal.id} />
                </div>
              ) : (
                <div className="bg-card rounded-lg border p-4 md:p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Generating your stages...</p>
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
                  <ProgressChart tasks={tasks as unknown as Parameters<typeof ProgressChart>[0]['tasks']} />
                </div>
              </div>

              {/* Tasks List - Clean Layout */}
              <div className="space-y-4" id="tasks-section">
                <div>
                  <h3 className="text-lg font-semibold">Tasks</h3>
                  <p className="text-sm text-muted-foreground">Your daily action items</p>
                </div>
                <div className="bg-card rounded-lg border p-4 md:p-6">
                  <TaskList tasks={tasks as unknown as Parameters<typeof TaskList>[0]['tasks']} goalId={goal.id} />
                </div>
              </div>
            </div>
          ),
        }}
      </GoalTabs>
    </div>
  )
}

function StatsCard({
  title,
  value,
  icon,
  color,
  subtitle,
  progress,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'blue' | 'purple' | 'green' | 'orange'
  subtitle?: string
  progress?: number
}) {
  const cardStyles = {
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
    green: 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20',
    orange: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200',
  }

  const iconStyles = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-primary/10 text-primary',
    orange: 'bg-orange-100 text-orange-600',
  }

  const progressBarStyles = {
    blue: 'bg-blue-600',
    purple: 'bg-purple-600', 
    green: 'bg-primary',
    orange: 'bg-orange-600',
  }

  return (
    <Card className={cn(
      "relative overflow-hidden",
      cardStyles[color]
    )}>
      <CardContent className="p-3 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs md:text-sm font-medium text-gray-700">{title}</p>
            <p className="text-2xl md:text-3xl font-bold mt-0.5 md:mt-1 text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={cn(
            "p-2 md:p-3 rounded-full ml-2 flex-shrink-0",
            iconStyles[color]
          )}>
            {icon}
          </div>
        </div>
        
        {progress !== undefined ? (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={cn("h-1.5 rounded-full transition-all duration-300", progressBarStyles[color])}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="mt-2 md:mt-3 flex items-center text-xs text-gray-600">
            <div className={cn(
              "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mr-1 md:mr-2",
              color === 'blue' && "bg-blue-600",
              color === 'purple' && "bg-purple-600", 
              color === 'green' && "bg-primary",
              color === 'orange' && "bg-orange-600"
            )}></div>
            <span className="truncate">
              {color === 'blue' && 'Learning streak'}
              {color === 'purple' && 'Study time'}
              {color === 'green' && 'Achievement rate'}
              {color === 'orange' && 'Daily focus'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}