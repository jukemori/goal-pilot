import { createClient } from '@/lib/supabase/server'
import { updateGoal } from '@/app/actions/goals'
import { GoalForm } from '@/components/organisms/goal-form/goal-form'
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
    await updateGoal(id, formData)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Goal</h1>
        <p className="text-gray-600 mt-2">
          Update your goal details and preferences
        </p>
      </div>

      <GoalForm 
        onSubmit={handleUpdate} 
        defaultValues={defaultValues}
        isEdit={true}
      />
    </div>
  )
}