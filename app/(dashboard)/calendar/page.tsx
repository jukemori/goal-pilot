import { CalendarView } from '@/components/organisms/calendar/calendar-view'

export default function CalendarPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600 mt-2">Track your daily tasks and progress</p>
      </div>

      <CalendarView />
    </div>
  )
}