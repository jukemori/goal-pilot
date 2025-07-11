import { createGoal } from '@/app/actions/goals'
import { GoalForm } from '@/components/organisms/goal-form/goal-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Target, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'

export default function NewGoalPage() {
  return (
    <div className="space-y-8">
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
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Goal</h1>
          </div>
          <p className="text-gray-600 text-lg">Tell us about your goal and we'll create a personalized roadmap for you</p>
          
          {/* Feature highlights */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
              <Sparkles className="h-4 w-4 text-primary" />
              AI-Generated Roadmap
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
              <Zap className="h-4 w-4 text-primary" />
              Personalized Timeline
            </div>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-2xl mx-auto">
        <GoalForm onSubmit={createGoal} />
      </div>
    </div>
  )
}