import { z } from 'zod'

export const goalFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().optional(),
  current_level: z
    .string()
    .min(5, 'Please describe your current level (at least 5 characters)')
    .max(500, 'Description too long (max 500 characters)'),
  start_date: z.string(),
  target_date: z.string().optional().nullable(),
  daily_time_commitment: z
    .number()
    .min(15, 'Minimum 15 minutes')
    .max(480, 'Maximum 8 hours (480 minutes)'), // 15 minutes to 8 hours
  weekly_schedule: z
    .object({
      monday: z.boolean(),
      tuesday: z.boolean(),
      wednesday: z.boolean(),
      thursday: z.boolean(),
      friday: z.boolean(),
      saturday: z.boolean(),
      sunday: z.boolean(),
    })
    .refine((schedule) => Object.values(schedule).some((day) => day === true), {
      message: 'Please select at least one day',
    }),
})

export type GoalFormData = z.infer<typeof goalFormSchema>
