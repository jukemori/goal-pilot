'use client'

import { type GoalFormData } from '@/lib/validations/goal'
import { Form } from '@/components/atoms/form'
import { AIGenerationOverlay } from '@/components/molecules/ai-generation-overlay'
import type { ActionResult } from '@/types/actions'
import { useGoalForm } from '@/features/goals/hooks/use-goal-form'
import { GoalDetailsSection } from './goal-details-section'
import { ScheduleSection } from './schedule-section'
import { SubmitButton } from './submit-button'

interface GoalFormProps {
  onSubmit: (data: FormData) => Promise<ActionResult<{ goalId: string }>>
  defaultValues?: Partial<GoalFormData>
  isEdit?: boolean
}

export function GoalForm({
  onSubmit,
  defaultValues,
  isEdit = false,
}: GoalFormProps) {
  const { form, isLoading, handleSubmit } = useGoalForm({
    onSubmit,
    defaultValues,
    isEdit,
  })

  return (
    <>
      <AIGenerationOverlay
        isVisible={isLoading && !isEdit}
        stage="roadmap"
        onCancel={() => {
          /* Note: setIsLoading is handled in the hook */
        }}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <GoalDetailsSection control={form.control} />
          <ScheduleSection control={form.control} />
          <SubmitButton isLoading={isLoading} isEdit={isEdit} />
        </form>
      </Form>
    </>
  )
}
