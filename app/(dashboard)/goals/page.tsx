import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Calendar, Clock, Target } from 'lucide-react'
import { Tables } from '@/types/database'

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
          <p className="text-gray-600 mt-2">Manage and track all your goals</p>
        </div>
        <Button asChild>
          <Link href="/goals/new">
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Link>
        </Button>
      </div>

      {/* Active Goals */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Active Goals</h2>
        {activeGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal as unknown as Parameters<typeof GoalCard>[0]['goal']} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No active goals yet</p>
              <Button asChild>
                <Link href="/goals/new">Create your first goal</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Completed Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal as unknown as Parameters<typeof GoalCard>[0]['goal']} />
            ))}
          </div>
        </div>
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
            <div className="mt-4 text-sm text-green-600 font-medium">
              Completed
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}