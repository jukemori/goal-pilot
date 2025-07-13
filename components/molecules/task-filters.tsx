import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select'
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
  onClearFilters,
}: TaskFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="focus:border-primary focus:ring-primary/20 h-12 rounded-xl border-gray-200 bg-white pl-12 text-base shadow-sm focus:ring-2"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="focus:border-primary focus:ring-primary/20 h-10 w-[140px] rounded-xl border-gray-200 bg-white shadow-sm focus:ring-2">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={onPriorityChange}>
          <SelectTrigger className="focus:border-primary focus:ring-primary/20 h-10 w-[140px] rounded-xl border-gray-200 bg-white shadow-sm focus:ring-2">
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
          <SelectTrigger className="focus:border-primary focus:ring-primary/20 h-10 w-[140px] rounded-xl border-gray-200 bg-white shadow-sm focus:ring-2">
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
          className="focus:border-primary focus:ring-primary/20 h-9 gap-2 rounded-xl border-gray-200 bg-white px-4 shadow-sm focus:ring-2"
        >
          <Filter className="h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  )
}
