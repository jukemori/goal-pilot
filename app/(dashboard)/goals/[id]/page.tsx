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
        <CardContent className="p-6">
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Total Progress</CardTitle>
                <div className="p-2 bg-primary/10 rounded-full">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-1">{progressPercentage}%</div>
                <p className="text-xs text-gray-600">
                  {completedTasks.length} of {totalTasks} tasks completed
                </p>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg hover:shadow-blue-100 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Days Active</CardTitle>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-1">{daysActive}</div>
                <p className="text-xs text-gray-600">Since start date</p>
                <div className="mt-3 flex items-center text-xs text-blue-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                  Learning streak
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg hover:shadow-purple-100 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Time Invested</CardTitle>
                <div className="p-2 bg-purple-100 rounded-full">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {Math.round((completedTasks.reduce((acc: number, task) => 
                    acc + (task.estimated_duration || 0), 0)) / 60)}h
                </div>
                <p className="text-xs text-gray-600">Total hours</p>
                <div className="mt-3 flex items-center text-xs text-purple-600">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
                  Study time
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg hover:shadow-orange-100 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Tasks Today</CardTitle>
                <div className="p-2 bg-orange-100 rounded-full">
                  <Activity className="h-5 w-5 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {tasks.filter((task) => {
                    const today = new Date().toISOString().split('T')[0]
                    return task.scheduled_date === today
                  }).length}
                </div>
                <p className="text-xs text-gray-600">Scheduled for today</p>
                <div className="mt-3 flex items-center text-xs text-orange-600">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mr-2"></div>
                  Daily focus
                </div>
              </CardContent>
            </Card>
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
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Visual Roadmap</h3>
                      <p className="text-sm text-muted-foreground">Your personalized path to success</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Export to Calendar
                    </Button>
                  </div>
                  <RoadmapTimeline roadmapId={roadmap.id} goalId={goal.id} />
                </div>
              ) : (
                <div className="bg-card rounded-lg border p-8">
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
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Detailed Stages</h3>
                      <p className="text-sm text-muted-foreground">Deep dive into each stage with full details</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Target className="h-4 w-4 mr-2" />
                      Generate Tasks
                    </Button>
                  </div>
                  <ProgressStages roadmapId={roadmap.id} goalId={goal.id} />
                </div>
              ) : (
                <div className="bg-card rounded-lg border p-8">
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
                <div>
                  <h3 className="text-lg font-semibold">Progress Overview</h3>
                  <p className="text-sm text-muted-foreground">Track your completion rate and milestones</p>
                </div>
                <div className="bg-card rounded-lg border p-6">
                  <ProgressChart tasks={tasks as unknown as Parameters<typeof ProgressChart>[0]['tasks']} />
                </div>
              </div>

              {/* Tasks List - Clean Layout */}
              <div className="space-y-4" id="tasks-section">
                <div>
                  <h3 className="text-lg font-semibold">Tasks</h3>
                  <p className="text-sm text-muted-foreground">Your daily action items</p>
                </div>
                <div className="bg-card rounded-lg border p-6">
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