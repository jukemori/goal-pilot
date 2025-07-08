'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { goalFormSchema, type GoalFormData } from '@/lib/validations/goal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LoadingSpinner, PulsingDots } from '@/components/ui/loading-spinner'

interface GoalFormProps {
  onSubmit: (data: FormData) => Promise<{ success: boolean; goalId?: string }>
  defaultValues?: Partial<GoalFormData>
  isEdit?: boolean
}

const weekDays = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
]

export function GoalForm({ onSubmit, defaultValues, isEdit = false }: GoalFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  // Use a stable default date to avoid hydration mismatches
  const today = typeof window !== 'undefined' ? new Date().toISOString().split('T')[0] : ''
  
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

  async function handleSubmit(values: GoalFormData) {
    setIsLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('title', values.title)
      formData.append('description', values.description || '')
      formData.append('current_level', values.current_level)
      formData.append('start_date', values.start_date)
      formData.append('target_date', values.target_date || '')
      formData.append('daily_time_commitment', values.daily_time_commitment.toString())
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Goal Details</CardTitle>
            <CardDescription>
              Define what you want to achieve and your current starting point
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Learn Spanish" {...field} />
                  </FormControl>
                  <FormDescription>
                    What do you want to achieve?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="I want to become conversational in Spanish for my upcoming trip..."
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
                <FormItem>
                  <FormLabel>Current Level</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., I only know HTML and CSS basics, learning JavaScript... or I can say 'hola' and have simple conversations in Spanish..."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe your current skill level and what you already know in this area
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>
              Set your timeline and daily commitment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Date (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormDescription>
                      When do you want to achieve this goal?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="daily_time_commitment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Time Commitment (minutes)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={15} 
                      max={480} 
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value
                        // If empty, set to 0 temporarily to avoid NaN
                        field.onChange(value === '' ? 0 : parseInt(value) || 0)
                      }}
                      onBlur={(e) => {
                        // On blur, if value is 0 or invalid, set to minimum (15)
                        const value = parseInt(e.target.value) || 0
                        if (value < 15) {
                          field.onChange(15)
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    How many minutes can you dedicate each day?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weekly_schedule"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Available Days</FormLabel>
                    <FormDescription>
                      Select which days you can work on this goal
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {weekDays.map((day) => (
                      <FormField
                        key={day.id}
                        control={form.control}
                        name={`weekly_schedule.${day.id}` as `weekly_schedule.${keyof GoalFormData['weekly_schedule']}`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={!!field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              {day.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button type="submit" disabled={isLoading} className="w-full relative overflow-hidden">
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
                <span>{isEdit ? 'Updating Goal...' : 'Creating Goal & Roadmap'}</span>
                <PulsingDots className="ml-2" />
              </motion.div>
            ) : (
              <motion.span
                key="normal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {isEdit ? 'Update Goal' : 'Create Goal'}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </form>
    </Form>
  )
}