import { Calendar, CheckCircle, Clock, Filter } from 'lucide-react'
import { Tables } from '@/types/database'

type Task = Tables<'tasks'>

interface TaskStatisticsProps {
  tasks: Task[]
  filteredTasksCount: number
}

export function TaskStatistics({ tasks, filteredTasksCount }: TaskStatisticsProps) {
  const completedCount = tasks.filter(t => t.completed).length
  const overdueCount = tasks.filter(t => 
    !t.completed && t.scheduled_date < new Date().toISOString().split('T')[0]
  ).length

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <Calendar className="h-5 w-5 text-blue-600" />
        </div>
        <div className="text-2xl font-bold text-blue-600">{tasks.length}</div>
        <div className="text-xs text-gray-600">Total Tasks</div>
      </div>
      
      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>
        <div className="text-2xl font-bold text-green-600">{completedCount}</div>
        <div className="text-xs text-gray-600">Completed</div>
      </div>
      
      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <Clock className="h-5 w-5 text-orange-600" />
        </div>
        <div className="text-2xl font-bold text-orange-600">{overdueCount}</div>
        <div className="text-xs text-gray-600">Overdue</div>
      </div>
      
      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <Filter className="h-5 w-5 text-purple-600" />
        </div>
        <div className="text-2xl font-bold text-purple-600">{filteredTasksCount}</div>
        <div className="text-xs text-gray-600">Filtered</div>
      </div>
    </div>
  )
}