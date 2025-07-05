import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Edit3, Calendar, Clock, Target, CheckCircle, Play, Pause } from 'lucide-react'
import { RoadmapView } from '@/components/organisms/roadmap-view/roadmap-view'
import { TaskList } from '@/components/organisms/task-list/task-list'
import { ProgressChart } from '@/components/molecules/progress-chart/progress-chart'

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
  const completedTasks = tasks.filter((task: any) => task.completed)
  const totalTasks = tasks.length
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0

  const levelColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-blue-100 text-blue-800',
    advanced: 'bg-purple-100 text-purple-800',
    expert: 'bg-red-100 text-red-800',
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    paused: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="space-y-8">
      {/* Goal Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{goal.title}</h1>
            <Badge className={cn("text-xs", levelColors[goal.current_level as keyof typeof levelColors])}>
              {goal.current_level}
            </Badge>
            <Badge className={cn("text-xs", statusColors[goal.status as keyof typeof statusColors])}>
              {goal.status}
            </Badge>
          </div>
          {goal.description && (
            <p className="text-gray-600 max-w-2xl">{goal.description}</p>
          )}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Started {new Date(goal.start_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{goal.daily_time_commitment} min/day</span>
            </div>
            {goal.target_date && (
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
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
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div className="text-2xl font-bold">
              {Math.ceil((new Date().getTime() - new Date(goal.start_date).getTime()) / (1000 * 60 * 60 * 24))}
            </div>
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
              {Math.round((completedTasks.reduce((acc: number, task: any) => 
                acc + (task.actual_duration || task.estimated_duration || 0), 0)) / 60)}h
            </div>
            <p className="text-xs text-muted-foreground">Total hours</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Roadmap */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Roadmap</CardTitle>
              <CardDescription>
                {roadmap ? 'AI-generated learning path' : 'Generating your personalized roadmap...'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {roadmap ? (
                <RoadmapView roadmap={roadmap} />
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Generating your roadmap...</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <ProgressChart tasks={tasks} />
        </div>

        {/* Tasks */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>Your daily action items</CardDescription>
            </CardHeader>
            <CardContent>
              <TaskList tasks={tasks} goalId={goal.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

import { cn } from '@/lib/utils'