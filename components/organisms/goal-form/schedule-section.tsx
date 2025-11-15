import { Control } from 'react-hook-form'
import { GoalFormData } from '@/lib/validations/goal'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/atoms/form'
import { Input } from '@/components/atoms/input'
import { Checkbox } from '@/components/atoms/checkbox'
import { Calendar } from 'lucide-react'

interface ScheduleSectionProps {
  control: Control<GoalFormData>
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

export function ScheduleSection({ control }: ScheduleSectionProps) {
  return (
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
            control={control}
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
            control={control}
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
            control={control}
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
                        field.onChange(value === '' ? 0 : parseInt(value) || 0)
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

        {/* Weekly Schedule */}
        <div className="mt-6">
          <FormField
            control={control}
            name="weekly_schedule"
            render={() => (
              <FormItem className="space-y-4">
                <FormLabel>Weekly Schedule</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day) => (
                    <FormField
                      key={day.id}
                      control={control}
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
  )
}
