import { createGoal } from '@/app/actions/goals'
import { GoalForm } from '@/components/organisms/goal-form/goal-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Target } from 'lucide-react'
import Link from 'next/link'

export default function NewGoalPage() {
  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/goals" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Goals
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl -z-10" />
        <div className="p-4 md:p-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Goal</h1>
              <p className="text-gray-600 mt-1">Tell us about your goal and we'll create a personalized roadmap for you</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Container - Full Width */}
      <GoalForm onSubmit={createGoal} />
    </div>
  )
}