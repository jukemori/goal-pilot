import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Target, CheckCircle, Clock, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Get user's goals
  const { data: goals } = await supabase
    .from('goals')
    .select('*, roadmaps(id)')
    .order('created_at', { ascending: false })
    .limit(3)

  // Get today's tasks
  const today = new Date().toISOString().split('T')[0]
  const { data: todayTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('scheduled_date', today)

  const completedTasks = todayTasks?.filter(task => task.completed).length || 0
  const totalTasks = todayTasks?.length || 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Track your progress and manage your goals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Goals"
          value={goals?.filter(g => g.status === 'active').length || 0}
          icon={<Target className="h-5 w-5" />}
          color="blue"
        />
        <StatsCard
          title="Today's Tasks"
          value={totalTasks}
          icon={<Clock className="h-5 w-5" />}
          color="purple"
        />
        <StatsCard
          title="Completed Today"
          value={completedTasks}
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
        />
        <StatsCard
          title="Progress Rate"
          value={totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}%` : '0%'}
          icon={<TrendingUp className="h-5 w-5" />}
          color="orange"
        />
      </div>

      {/* Recent Goals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Goals</CardTitle>
            <CardDescription>Your latest goals and their progress</CardDescription>
          </div>
          <Link href="/goals/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
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
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{goal.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {goal.current_level} level • {goal.daily_time_commitment} min/day
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {goal.roadmaps.length > 0 ? 'Roadmap ready' : 'Generating roadmap...'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No goals yet</p>
              <Link href="/goals/new">
                <Button>Create your first goal</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Tasks</CardTitle>
          <CardDescription>Tasks scheduled for today</CardDescription>
        </CardHeader>
        <CardContent>
          {todayTasks && todayTasks.length > 0 ? (
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center gap-3 p-3 border rounded-lg",
                    task.completed && "opacity-60"
                  )}
                >
                  <div className="flex-1">
                    <p className={cn(
                      "font-medium",
                      task.completed && "line-through"
                    )}>
                      {task.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {task.estimated_duration} minutes
                    </p>
                  </div>
                  {task.completed && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No tasks scheduled for today
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatsCard({
  title,
  value,
  icon,
  color,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'blue' | 'purple' | 'green' | 'orange'
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={cn(
            "p-3 rounded-lg",
            colors[color]
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

import { cn } from '@/lib/utils'