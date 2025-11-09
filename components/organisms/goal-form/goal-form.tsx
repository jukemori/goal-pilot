'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { goalFormSchema, type GoalFormData } from '@/lib/validations/goal'
import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import { Textarea } from '@/components/atoms/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/atoms/form'
import { Checkbox } from '@/components/atoms/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { toast } from 'sonner'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LoadingSpinner, PulsingDots } from '@/components/atoms/loading-spinner'
import { AIGenerationOverlay } from '@/components/molecules/ai-generation-overlay'
import { Target, Calendar } from 'lucide-react'

interface GoalFormProps {
  onSubmit: (data: FormData) => Promise<{ success: boolean; goalId?: string }>
  defaultValues?: Partial<GoalFormData>
  isEdit?: boolean
}

const weekDays = [
  { id: 'sunday', label: 'Sunday' },
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
]

export function GoalForm({
  onSubmit,
  defaultValues,
  isEdit = false,
}: GoalFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Use a stable default date in local timezone to avoid hydration mismatches
  // Optimized by React Compiler
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
        if (result.goalId) {
          router.push(`/goals/${result.goalId}`)
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

  return (
    <>
      <AIGenerationOverlay
        isVisible={isLoading && !isEdit}
        stage="roadmap"
        onCancel={() => setIsLoading(false)}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Goal Details Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="text-primary h-5 w-5" />
                Goal Details
              </CardTitle>
              <CardDescription>
                Define what you want to achieve and your current starting point
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Goal Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Learn Spanish, Get Fit, Master Photography"
                        className="focus:border-primary focus:ring-primary/20 border-gray-200"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., I want to become conversational in Spanish for my upcoming trip to Mexico..."
                        className="focus:border-primary focus:ring-primary/20 min-h-[100px] resize-none border-gray-200"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="current_level"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Current Skill Level</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Complete beginner, I can have simple conversations in Spanish, I've been practicing for 6 months..."
                        className="focus:border-primary focus:ring-primary/20 min-h-[80px] resize-none border-gray-200"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-sm text-gray-500">
                      Help us understand your starting point so we can create
                      the perfect roadmap
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Schedule Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="text-primary h-5 w-5" />
                Schedule & Timeline
              </CardTitle>
              <CardDescription>
                Set your availability and timeline preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="focus:border-primary focus:ring-primary/20 border-gray-200"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>When you want to begin</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="target_date"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Target Date (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="focus:border-primary focus:ring-primary/20 border-gray-200"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty to let us calculate the optimal timeline
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="daily_time_commitment"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Daily Time (minutes)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            min={15}
                            max={480}
                            {...field}
                            className="focus:border-primary focus:ring-primary/20 border-gray-200 pr-16"
                            placeholder="30"
                            onChange={(e) => {
                              const value = e.target.value
                              field.onChange(
                                value === '' ? 0 : parseInt(value) || 0,
                              )
                            }}
                            onBlur={(e) => {
                              const value = parseInt(e.target.value) || 0
                              if (value < 15) {
                                field.onChange(15)
                              }
                            }}
                          />
                          <div className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-gray-500">
                            min
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>15-480 minutes per day</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Weekly Schedule within the same card */}
              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="weekly_schedule"
                  render={() => (
                    <FormItem className="space-y-4">
                      <FormLabel>Weekly Schedule</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {weekDays.map((day) => (
                          <FormField
                            key={day.id}
                            control={form.control}
                            name={
                              `weekly_schedule.${day.id}` as `weekly_schedule.${keyof GoalFormData['weekly_schedule']}`
                            }
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-0">
                                <FormControl>
                                  <label
                                    className={`relative flex cursor-pointer items-center justify-center rounded-md border-2 px-3 py-1.5 transition-all ${
                                      field.value
                                        ? 'border-primary bg-primary text-white shadow-sm'
                                        : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                                    } `}
                                  >
                                    <Checkbox
                                      checked={!!field.value}
                                      onCheckedChange={field.onChange}
                                      className="sr-only"
                                    />
                                    <span className="text-xs font-medium">
                                      {day.label.slice(0, 3)}
                                    </span>
                                  </label>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormDescription>
                        Select which days you can work on this goal
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="from-primary to-primary/90 hover:from-primary/90 hover:to-primary relative w-full overflow-hidden bg-gradient-to-r shadow-lg"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-center"
                  >
                    <LoadingSpinner size="sm" className="mr-2" />
                    <span>
                      {isEdit ? 'Updating Goal...' : 'Creating Goal & Roadmap'}
                    </span>
                    <PulsingDots className="ml-2" />
                  </motion.div>
                ) : (
                  <motion.span
                    key="normal"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 font-semibold"
                  >
                    {isEdit ? (
                      <>
                        <Target className="h-4 w-4" />
                        Update Goal
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4" />
                        Create Goal & Generate Roadmap
                      </>
                    )}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>

            {!isEdit && (
              <p className="mt-3 text-center text-sm text-gray-500">
                This will take about 30 seconds to generate your personalized
                roadmap
              </p>
            )}
          </div>
        </form>
      </Form>
    </>
  )
}
