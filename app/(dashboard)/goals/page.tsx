import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Clock, Target, Calendar } from 'lucide-react'
import { Tables } from '@/types/database'
import { TemplatesSection } from '@/components/organisms/goal-templates/templates-section'

export default async function GoalsPage() {
  const supabase = await createClient()
  
  const { data: goals } = await supabase
    .from('goals')
    .select('*, roadmaps(id)')
    .order('created_at', { ascending: false })

  const activeGoals = goals?.filter(g => g.status === 'active') || []
  const completedGoals = goals?.filter(g => g.status === 'completed') || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl -z-10" />
        <div className="p-4 md:p-8">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
              </div>
              <p className="text-gray-600 text-lg">Manage and track all your learning goals</p>
            </div>
            <Button asChild className="bg-primary hover:bg-primary/90 shadow-md self-start md:self-auto">
              <Link href="/goals/new">
                <Plus className="h-4 w-4 mr-2" />
                New Goal
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Goal Templates Section */}
      <TemplatesSection hasActiveGoals={activeGoals.length > 0} />

      {/* Active Goals */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg">
              <Target className="h-5 w-5 text-primary" />
            </div>
            Active Goals
          </CardTitle>
          <CardDescription className="text-gray-600 mt-1">
            Your active learning goals and their progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal as unknown as Parameters<typeof GoalCard>[0]['goal']} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="relative">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-primary/5 rounded-full -z-10"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No active goals yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start your learning journey by creating your first goal. Set your target and let AI generate a personalized roadmap.
              </p>
              <Button asChild className="bg-primary hover:bg-primary/90 shadow-md">
                <Link href="/goals/new">
                  <Plus className="h-4 w-4 mr-2" />
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
              <div className="p-2 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              Completed Goals
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Goals you've successfully completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal as unknown as Parameters<typeof GoalCard>[0]['goal']} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function GoalCard({ goal }: { goal: Tables<'goals'> & { 
  progress?: number;
  roadmaps?: Array<{
    id: string;
    tasks: Array<{ completed: boolean }>;
  }>;
} }) {

  return (
    <Link href={`/goals/${goal.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
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
              <span>Started {new Date(goal.start_date).toLocaleDateString()}</span>
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
            <div className="mt-4 text-sm text-primary font-medium">
              Completed
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}