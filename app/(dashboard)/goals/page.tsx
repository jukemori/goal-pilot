import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Plus, Clock, Target, Star, ArrowRight } from 'lucide-react'
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
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl -z-10" />
        <div className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
              </div>
              <p className="text-gray-600 text-lg">Manage and track all your learning goals</p>
            </div>
            <Button asChild className="bg-primary hover:bg-primary/90 shadow-md">
              <Link href="/goals/new">
                <Plus className="h-4 w-4 mr-2" />
                New Goal
              </Link>
            </Button>
          </div>
        </div>
      </div>

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
            <div className="space-y-4">
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
            <div className="space-y-4">
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
    <Link href={`/goals/${goal.id}`} className="block group">
      <div className="p-4 border rounded-xl hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 hover:border-primary/20 transition-all duration-300 hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                {goal.title}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {goal.status}
              </Badge>
            </div>
            {goal.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {goal.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {goal.current_level} level
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {goal.daily_time_commitment} min/day
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {goal.roadmaps && goal.roadmaps.length > 0 ? (
                <>
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm text-primary font-medium">Ready</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-orange-600 font-medium">Generating...</span>
                </>
              )}
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  )
}