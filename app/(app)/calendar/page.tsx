import { Calendar } from 'lucide-react'
import { CalendarErrorBoundary } from '@/components/error-boundary'
import dynamic from 'next/dynamic'
import { CalendarSkeleton } from '@/components/ui/skeletons'

// Lazy load CalendarView for better performance
const LazyCalendarView = dynamic(
  () =>
    import('@/components/organisms/calendar/calendar-view').then((mod) => ({
      default: mod.CalendarView,
    })),
  {
    loading: () => <CalendarSkeleton />,
  },
)

export default function CalendarPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="from-primary/10 to-primary/5 absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r" />
        <div className="p-4 md:p-8">
          <div className="mb-2 flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <Calendar className="text-primary h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          </div>
          <p className="text-lg text-gray-600">
            Track your daily tasks and learning progress
          </p>
        </div>
      </div>

      <CalendarErrorBoundary>
        <LazyCalendarView />
      </CalendarErrorBoundary>
    </div>
  )
}
