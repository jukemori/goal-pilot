import { createClient } from '@/lib/supabase/server'
import { updateGoal } from '@/app/actions/goals'
import { GoalForm } from '@/components/organisms/goal-form/goal-form'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit3, Calendar, Clock, Target } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface EditGoalPageProps {
  params: Promise<{ id: string }>
}

export default async function EditGoalPage({ params }: EditGoalPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: goal, error } = await supabase
    .from('goals')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !goal) {
    notFound()
  }

  const defaultValues = {
    title: goal.title,
    description: goal.description || '',
    current_level: goal.current_level as 'beginner' | 'intermediate' | 'advanced' | 'expert',
    start_date: goal.start_date,
    target_date: goal.target_date || '',
    daily_time_commitment: goal.daily_time_commitment || 30,
    weekly_schedule: goal.weekly_schedule as {
      monday: boolean;
      tuesday: boolean;
      wednesday: boolean;
      thursday: boolean;
      friday: boolean;
      saturday: boolean;
      sunday: boolean;
    },
  }

  async function handleUpdate(formData: FormData) {
    'use server'
    return await updateGoal(id, formData)
  }

  return (
    <div className="space-y-8">
      {/* Back Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/goals/${id}`} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Goal
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-25 rounded-2xl -z-10" />
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Edit3 className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Goal</h1>
          </div>
          <p className="text-gray-600 text-lg mb-6">Update your goal details and preferences</p>
          
          {/* Current Goal Summary */}
          <div className="bg-white/50 rounded-xl p-6 border border-white/20">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{goal.title}</h3>
                {goal.description && (
                  <p className="text-gray-600 text-sm">{goal.description}</p>
                )}
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {goal.status}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                Started {new Date(goal.start_date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                {goal.daily_time_commitment} minutes/day
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Target className="h-4 w-4" />
                {goal.target_date ? `Target: ${new Date(goal.target_date).toLocaleDateString()}` : 'No target date'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-2xl mx-auto">
        <GoalForm 
          onSubmit={handleUpdate} 
          defaultValues={defaultValues}
          isEdit={true}
        />
      </div>
    </div>
  )
}