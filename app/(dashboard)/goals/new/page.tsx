import { createGoal } from '@/app/actions/goals'
import { GoalForm } from '@/components/organisms/goal-form/goal-form'

export default function NewGoalPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Goal</h1>
        <p className="text-gray-600 mt-2">
          Tell us about your goal and we'll create a personalized roadmap for you
        </p>
      </div>

      <GoalForm onSubmit={createGoal} />
    </div>
  )
}