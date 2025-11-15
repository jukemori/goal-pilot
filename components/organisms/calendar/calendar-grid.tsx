import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { type TaskWithRoadmap } from '@/features/tasks/hooks/use-tasks'
import { CalendarWeek } from './calendar-week'

interface CalendarGridProps {
  currentDate: Date
  weeks: Date[][]
  tasksByDate: Record<string, TaskWithRoadmap[]>
  selectedDate: string | null
  onDateSelect: (date: string) => void
  isFetching: boolean
  onPreviousMonth: () => void
  onNextMonth: () => void
}

export function CalendarGrid({
  currentDate,
  weeks,
  tasksByDate,
  selectedDate,
  onDateSelect,
  isFetching,
  onPreviousMonth,
  onNextMonth,
}: CalendarGridProps) {
  return (
    <div className="lg:col-span-2">
      <Card className="flex h-full flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {currentDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
              {isFetching && (
                <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPreviousMonth}
                disabled={isFetching}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onNextMonth}
                disabled={isFetching}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          <div
            className={`flex flex-1 flex-col transition-opacity duration-200 ${isFetching ? 'opacity-60' : 'opacity-100'}`}
          >
            {/* Day headers */}
            <div className="mb-2 grid flex-shrink-0 grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid min-w-0 flex-1 grid-rows-6 gap-0.5 md:gap-1">
              {weeks.map((week, weekIndex) => (
                <CalendarWeek
                  key={weekIndex}
                  week={week}
                  tasksByDate={tasksByDate}
                  selectedDate={selectedDate}
                  onDateSelect={onDateSelect}
                  currentDate={currentDate}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
