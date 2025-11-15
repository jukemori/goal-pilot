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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/atoms/form'
import { Input } from '@/components/atoms/input'
import { Textarea } from '@/components/atoms/textarea'
import { Target } from 'lucide-react'

interface GoalDetailsSectionProps {
  control: Control<GoalFormData>
}

export function GoalDetailsSection({ control }: GoalDetailsSectionProps) {
  return (
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
          control={control}
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
          control={control}
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
          control={control}
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
                Help us understand your starting point so we can create the
                perfect roadmap
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
