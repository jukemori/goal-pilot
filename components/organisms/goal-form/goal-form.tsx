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
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Goal Details Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
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
                        className="border-gray-200 focus:border-primary focus:ring-primary/20" 
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
                    <FormLabel>Current Skill Level</FormLabel>
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
            </CardContent>
          </Card>

          {/* Schedule Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Schedule & Timeline
              </CardTitle>
              <CardDescription>
                Set your availability and timeline preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        className="border-gray-200 focus:border-primary focus:ring-primary/20"
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
                        className="border-gray-200 focus:border-primary focus:ring-primary/20"
                        {...field} 
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormDescription>Leave empty to let us calculate the optimal timeline</FormDescription>
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
                          className="pr-16 border-gray-200 focus:border-primary focus:ring-primary/20"
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
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
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
                          name={`weekly_schedule.${day.id}` as `weekly_schedule.${keyof GoalFormData['weekly_schedule']}`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-0">
                              <FormControl>
                                <div 
                                  className={`
                                    relative flex items-center justify-center py-1.5 px-3 rounded-md border-2 transition-all cursor-pointer
                                    ${field.value 
                                      ? 'border-primary bg-primary text-white shadow-sm' 
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
                                  <span className="text-xs font-medium">
                                    {day.label.slice(0, 3)}
                                  </span>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormDescription>Select which days you can work on this goal</FormDescription>
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