import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DeleteGoalButton } from '@/components/molecules/delete-goal-button'
import { Edit3, Calendar, Clock, Target, CheckCircle, Play, Pause, BarChart3, BookOpen, TrendingUp, Activity } from 'lucide-react'
import { RoadmapView } from '@/components/organisms/roadmap-view/roadmap-view'
import { TaskList } from '@/components/organisms/task-list/task-list'
import { ProgressChart } from '@/components/molecules/progress-chart/progress-chart'
import { LearningPhases } from '@/components/organisms/learning-phases/learning-phases'
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

  const levelColors = {
    beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    intermediate: 'bg-blue-50 text-blue-700 border-blue-200',
    advanced: 'bg-purple-50 text-purple-700 border-purple-200',
    expert: 'bg-orange-50 text-orange-700 border-orange-200',
  }

  const statusColors = {
    active: 'bg-primary/10 text-primary border-primary/20',
    completed: 'bg-blue-50 text-blue-700 border-blue-200',
    paused: 'bg-gray-50 text-gray-700 border-gray-200',
  }

  return (
    <div className="space-y-6">
      {/* Goal Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{goal.title}</h1>
                <Badge variant="outline" className={cn("text-xs px-3 py-1 rounded-full border", levelColors[goal.current_level as keyof typeof levelColors])}>
                  {goal.current_level}
                </Badge>
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
            <div className="flex gap-2">
              <Link href={`/goals/${goal.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                {goal.status === 'active' ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </>
                )}
              </Button>
              <DeleteGoalButton goalId={goal.id} goalTitle={goal.title} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shadcn Style Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="roadmap">
            <BookOpen className="h-4 w-4 mr-2" />
            Roadmap
          </TabsTrigger>
          <TabsTrigger value="progress">
            <TrendingUp className="h-4 w-4 mr-2" />
            Progress
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Dashboard Style */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Progress</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{progressPercentage}%</div>
                <p className="text-xs text-muted-foreground">
                  {completedTasks.length} of {totalTasks} tasks completed
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Days Active</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{daysActive}</div>
                <p className="text-xs text-muted-foreground">Since start date</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time Invested</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((completedTasks.reduce((acc: number, task) => 
                    acc + (task.estimated_duration || 0), 0)) / 60)}h
                </div>
                <p className="text-xs text-muted-foreground">Total hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks Today</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tasks.filter((task) => {
                    const today = new Date().toISOString().split('T')[0]
                    return task.scheduled_date === today
                  }).length}
                </div>
                <p className="text-xs text-muted-foreground">Scheduled for today</p>
              </CardContent>
            </Card>
          </div>

          {/* Roadmap Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Roadmap Summary</CardTitle>
                <CardDescription>
                  {roadmap ? 'Your AI-generated learning path' : 'Generating your roadmap...'}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {roadmap ? (
                <RoadmapView roadmap={roadmap as unknown as Parameters<typeof RoadmapView>[0]['roadmap']} />
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Generating your roadmap...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roadmap Tab */}
        <TabsContent value="roadmap" className="space-y-6">
          {roadmap ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Learning Phases</h3>
                  <p className="text-sm text-muted-foreground">Track your progress through each phase</p>
                </div>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Export to Calendar
                </Button>
              </div>
              <LearningPhases roadmapId={roadmap.id} goalId={goal.id} />
            </div>
          ) : (
            <div className="bg-card rounded-lg border p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Generating your roadmap...</p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
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
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Tasks</h3>
              <p className="text-sm text-muted-foreground">Your daily action items</p>
            </div>
            <div className="bg-card rounded-lg border p-6">
              <TaskList tasks={tasks as unknown as Parameters<typeof TaskList>[0]['tasks']} goalId={goal.id} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}