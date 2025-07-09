export interface UserPreferences {
  id: string
  user_id: string
  push_notifications: boolean
  email_notifications: boolean
  daily_reminders: boolean
  weekly_reports: boolean
  start_of_week: 'sunday' | 'monday'
  created_at: string
  updated_at: string
}