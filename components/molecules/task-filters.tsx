import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter } from 'lucide-react'

interface TaskFiltersProps {
  searchQuery: string
  statusFilter: 'all' | 'completed' | 'pending'
  priorityFilter: 'all' | '5' | '4' | '3' | '2' | '1'
  dateFilter: 'all' | 'today' | 'week' | 'overdue'
  onSearchChange: (value: string) => void
  onStatusChange: (value: 'all' | 'completed' | 'pending') => void
  onPriorityChange: (value: 'all' | '5' | '4' | '3' | '2' | '1') => void
  onDateChange: (value: 'all' | 'today' | 'week' | 'overdue') => void
  onClearFilters: () => void
}

export function TaskFilters({
  searchQuery,
  statusFilter,
  priorityFilter,
  dateFilter,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onDateChange,
  onClearFilters
}: TaskFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 h-12 text-base bg-white border-gray-200 rounded-xl shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      
      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[140px] h-10 bg-white border-gray-200 rounded-xl shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={onPriorityChange}>
          <SelectTrigger className="w-[140px] h-10 bg-white border-gray-200 rounded-xl shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="5">Critical</SelectItem>
            <SelectItem value="4">High</SelectItem>
            <SelectItem value="3">Medium</SelectItem>
            <SelectItem value="2">Low</SelectItem>
            <SelectItem value="1">Lowest</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={onDateChange}>
          <SelectTrigger className="w-[140px] h-10 bg-white border-gray-200 rounded-xl shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20">
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="gap-2 h-9 px-4 bg-white border-gray-200 rounded-xl shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <Filter className="h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  )
}