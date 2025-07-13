import { createClient } from '@/lib/supabase/server'
import { updateGoal } from '@/app/actions/goals'
import { GoalForm } from '@/components/organisms/goal-form/goal-form'
import { Button } from '@/components/atoms/button'
import { ArrowLeft, Edit3 } from 'lucide-react'
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
    current_level: goal.current_level as
      | 'beginner'
      | 'intermediate'
      | 'advanced'
      | 'expert',
    start_date: goal.start_date,
    target_date: goal.target_date || '',
    daily_time_commitment: goal.daily_time_commitment || 30,
    weekly_schedule: goal.weekly_schedule as {
      monday: boolean
      tuesday: boolean
      wednesday: boolean
      thursday: boolean
      friday: boolean
      saturday: boolean
      sunday: boolean
    },
  }

  async function handleUpdate(formData: FormData) {
    'use server'
    return await updateGoal(id, formData)
  }

  return (
    <div className="space-y-6">
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
        <div className="from-primary/10 to-primary/5 absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r" />
        <div className="p-4 md:p-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <Edit3 className="text-primary h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Goal</h1>
              <p className="mt-1 text-gray-600">
                Update your goal details and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Container - Full Width */}
      <div className="px-4 md:px-8">
        <GoalForm
          onSubmit={handleUpdate}
          defaultValues={defaultValues}
          isEdit={true}
        />
      </div>
    </div>
  )
}
