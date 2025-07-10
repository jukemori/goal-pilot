import { CalendarView } from '@/components/organisms/calendar/calendar-view'
import { Calendar } from 'lucide-react'

export default function CalendarPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl -z-10" />
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          </div>
          <p className="text-gray-600 text-lg">Track your daily tasks and learning progress</p>
        </div>
      </div>

      <CalendarView />
    </div>
  )
}