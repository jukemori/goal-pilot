'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { goalFormSchema, type GoalFormData } from '@/lib/validations/goal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LoadingSpinner, PulsingDots } from '@/components/ui/loading-spinner'
import { AIGenerationOverlay } from '@/components/molecules/ai-generation-overlay'
import { Target, Calendar } from 'lucide-react'

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
  
  // Use a stable default date in local timezone to avoid hydration mismatches
  const today = typeof window !== 'undefined' ? (() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })() : ''
  
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
    <>
      <AIGenerationOverlay 
        isVisible={isLoading && !isEdit} 
        stage="roadmap"
        onCancel={() => setIsLoading(false)}
      />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Goal Details Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Goal Details</h2>
                <p className="text-gray-600 text-sm">Define what you want to achieve and your current starting point</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-base font-medium text-gray-900">
                      What do you want to achieve?
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Learn Spanish, Get Fit, Master Photography" 
                        className="text-lg py-3 border-gray-200 focus:border-primary focus:ring-primary/20" 
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
                    <FormLabel className="text-base font-medium text-gray-900">
                      Tell us more about your goal <span className="text-gray-500 text-sm font-normal">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., I want to become conversational in Spanish for my upcoming trip to Mexico..."
                        className="min-h-[100px] border-gray-200 focus:border-primary focus:ring-primary/20 resize-none"
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
                    <FormLabel className="text-base font-medium text-gray-900">
                      What's your current skill level?
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., Complete beginner, I can have simple conversations in Spanish, I've been practicing for 6 months..."
                        className="min-h-[80px] border-gray-200 focus:border-primary focus:ring-primary/20 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-sm text-gray-500">Help us understand your starting point so we can create the perfect roadmap</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Schedule Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Schedule & Timeline</h2>
                <p className="text-gray-600 text-sm">Set your availability and timeline preferences</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-base font-medium text-gray-900">
                        When do you want to start?
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          className="py-3 border-gray-200 focus:border-primary focus:ring-primary/20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="target_date"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-base font-medium text-gray-900">
                        Target completion date <span className="text-gray-500 text-sm font-normal">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          className="py-3 border-gray-200 focus:border-primary focus:ring-primary/20"
                          {...field} 
                          value={field.value || ''} 
                        />
                      </FormControl>
                      <p className="text-sm text-gray-500">Leave empty to let us calculate the optimal timeline</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="daily_time_commitment"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-base font-medium text-gray-900">
                        Daily time commitment
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="number" 
                            min={15} 
                            max={480} 
                            {...field}
                            className="text-lg py-3 pr-20 border-gray-200 focus:border-primary focus:ring-primary/20"
                            placeholder="30"
                            onChange={(e) => {
                              const value = e.target.value
                              field.onChange(value === '' ? 0 : parseInt(value) || 0)
                            }}
                            onBlur={(e) => {
                              const value = parseInt(e.target.value) || 0
                              if (value < 15) {
                                field.onChange(15)
                              }
                            }}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-base text-gray-500 font-medium">
                            minutes
                          </div>
                        </div>
                      </FormControl>
                      <p className="text-sm text-gray-500">How many minutes per day can you dedicate? (15-480 minutes)</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="weekly_schedule"
                  render={() => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-base font-medium text-gray-900">
                        Which days can you work on this goal?
                      </FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-1">
                        {weekDays.map((day) => (
                          <FormField
                            key={day.id}
                            control={form.control}
                            name={`weekly_schedule.${day.id}` as `weekly_schedule.${keyof GoalFormData['weekly_schedule']}`}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-0">
                                <FormControl>
                                  <div 
                                    className={`
                                      relative flex items-center justify-center py-3 px-2 rounded-xl border-2 transition-all cursor-pointer w-full min-w-0
                                      ${field.value 
                                        ? 'border-primary bg-primary text-white shadow-md' 
                                        : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                                      }
                                    `}
                                    onClick={() => field.onChange(!field.value)}
                                  >
                                    <Checkbox
                                      checked={!!field.value}
                                      onCheckedChange={field.onChange}
                                      className="sr-only"
                                    />
                                    <span className="text-sm font-medium">
                                      {day.label.slice(0, 3)}
                                    </span>
                                  </div>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">Select at least one day to continue</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Button 
              type="submit" 
              disabled={isLoading} 
              size="lg"
              className="w-full relative overflow-hidden bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
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
                    <span>{isEdit ? 'Updating Goal...' : 'Creating Goal & Roadmap'}</span>
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
              <p className="text-center text-sm text-gray-500 mt-3">
                This will take about 30 seconds to generate your personalized roadmap
              </p>
            )}
          </div>
        </form>
      </Form>
    </>
  )
}