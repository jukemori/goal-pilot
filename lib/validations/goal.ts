import { z } from 'zod'

export const goalFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().optional(),
  current_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  start_date: z.string(),
  target_date: z.string().optional().nullable(),
  daily_time_commitment: z.number().min(15).max(480), // 15 minutes to 8 hours
  weekly_schedule: z.object({
    monday: z.boolean(),
    tuesday: z.boolean(),
    wednesday: z.boolean(),
    thursday: z.boolean(),
    friday: z.boolean(),
    saturday: z.boolean(),
    sunday: z.boolean(),
  }).refine(
    (schedule) => Object.values(schedule).some(day => day === true),
    { message: 'Please select at least one day' }
  ),
})

export type GoalFormData = z.infer<typeof goalFormSchema>