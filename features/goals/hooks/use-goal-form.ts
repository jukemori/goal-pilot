import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { goalFormSchema, type GoalFormData } from '@/lib/validations/goal'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { ActionResult } from '@/types/actions'

interface UseGoalFormOptions {
  onSubmit: (data: FormData) => Promise<ActionResult<{ goalId: string }>>
  defaultValues?: Partial<GoalFormData>
  isEdit?: boolean
}

/**
 * Custom hook for managing goal form state and submission logic
 * Handles form validation, submission, navigation, and default value updates
 */
export function useGoalForm({
  onSubmit,
  defaultValues,
  isEdit = false,
}: UseGoalFormOptions) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Use a stable default date in local timezone to avoid hydration mismatches
  const today =
    typeof window !== 'undefined'
      ? (() => {
          const now = new Date()
          const year = now.getFullYear()
          const month = String(now.getMonth() + 1).padStart(2, '0')
          const day = String(now.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        })()
      : ''

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: '',
      description: '',
      current_level: '',
      start_date: today,
      target_date: '',
      daily_time_commitment: 30,
      weekly_schedule: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
      ...defaultValues,
    },
  })

  // Track if we've processed the current defaultValues to prevent infinite loops
  const defaultValuesRef = useRef(defaultValues)

  // Update form values when defaultValues change (e.g., when template is loaded)
  useEffect(() => {
    if (defaultValues && defaultValues !== defaultValuesRef.current) {
      defaultValuesRef.current = defaultValues

      const formDefaults = {
        title: defaultValues.title || '',
        description: defaultValues.description || '',
        current_level: defaultValues.current_level || '',
        start_date: defaultValues.start_date || today,
        target_date: defaultValues.target_date || '',
        daily_time_commitment: defaultValues.daily_time_commitment || 30,
        weekly_schedule: defaultValues.weekly_schedule || {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false,
        },
      }

      // Reset form with new values
      form.reset(formDefaults)
    }
  }, [defaultValues, today, form])

  async function handleSubmit(values: GoalFormData) {
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('title', values.title)
      formData.append('description', values.description || '')
      formData.append('current_level', values.current_level)
      formData.append('start_date', values.start_date)
      formData.append('target_date', values.target_date || '')
      formData.append(
        'daily_time_commitment',
        values.daily_time_commitment.toString(),
      )
      formData.append('weekly_schedule', JSON.stringify(values.weekly_schedule))

      const result = await onSubmit(formData)

      if (result.success) {
        if (result.data?.goalId) {
          router.push(`/goals/${result.data.goalId}`)
        }
      } else {
        toast.error(isEdit ? 'Failed to update goal' : 'Failed to create goal')
      }
    } catch {
      toast.error(isEdit ? 'Failed to update goal' : 'Failed to create goal')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    form,
    isLoading,
    handleSubmit,
  }
}
