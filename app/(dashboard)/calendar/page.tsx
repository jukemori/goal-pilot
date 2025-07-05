import { createClient } from '@/lib/supabase/server'
import { CalendarView } from '@/components/organisms/calendar/calendar-view'

export default async function CalendarPage() {
  const supabase = await createClient()
  
  // Get current month's tasks
  const currentDate = new Date()
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      roadmaps!inner(
        goal_id,
        goals!inner(
          title,
          status
        )
      )
    `)
    .gte('scheduled_date', startOfMonth.toISOString().split('T')[0])
    .lte('scheduled_date', endOfMonth.toISOString().split('T')[0])
    .order('scheduled_date')

  // Get today's tasks
  const today = new Date().toISOString().split('T')[0]
  const { data: todayTasks } = await supabase
    .from('tasks')
    .select(`
      *,
      roadmaps!inner(
        goal_id,
        goals!inner(
          title,
          status
        )
      )
    `)
    .eq('scheduled_date', today)
    .order('priority', { ascending: false })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600 mt-2">Track your daily tasks and progress</p>
      </div>

      <CalendarView tasks={tasks || []} todayTasks={todayTasks || []} />
    </div>
  )
}