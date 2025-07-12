"use client";

import { useState } from "react";
import { Calendar, Filter } from "lucide-react";
import { completeTask, uncompleteTask } from "@/app/actions/tasks";
import { toast } from "sonner";
import { Tables } from "@/types/database";
import { useTaskFilters } from "@/lib/hooks/use-task-filters";
import { TaskStatistics } from "@/components/molecules/task-statistics";
import { TaskFilters } from "@/components/molecules/task-filters";
import { TaskGroup } from "@/components/molecules/task-group";
import { TaskPagination } from "@/components/molecules/task-pagination";

type Task = Tables<"tasks">;

interface TaskListProps {
  tasks: Task[];
  goalId: string;
  pageSize?: number;
}

export function TaskList({
  tasks,
  goalId: _goalId,
  pageSize = 20,
}: TaskListProps) {
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
  const {
    searchQuery,
    statusFilter,
    priorityFilter,
    dateFilter,
    currentPage,
    setSearchQuery,
    setStatusFilter,
    setPriorityFilter,
    setDateFilter,
    setCurrentPage,
    clearFilters,
    filteredTasks,
    groupedTasks,
    paginatedDates,
    totalPages,
    startIndex,
    endIndex,
    sortedDates,
  } = useTaskFilters(tasks, pageSize);

  async function handleToggleComplete(task: Task) {
    setLoadingTaskId(task.id);
    try {
      if (task.completed) {
        await uncompleteTask(task.id);
        toast.success("Task marked as incomplete");
      } else {
        await completeTask(task.id);
        toast.success("Task completed!");
      }
    } catch {
      toast.error("Failed to update task");
    } finally {
      setLoadingTaskId(null);
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 mb-2">No tasks yet</p>
        <p className="text-sm text-gray-400">
          Tasks will appear here once your roadmap is generated
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Task Statistics */}
      <TaskStatistics tasks={tasks} filteredTasksCount={filteredTasks.length} />

      {/* Search and Filters */}
      <TaskFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        dateFilter={dateFilter}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
        onDateChange={setDateFilter}
        onClearFilters={clearFilters}
      />

      {/* Task List */}
      <div className="space-y-8">
        {paginatedDates.map((date) => (
          <TaskGroup
            key={date}
            date={date}
            tasks={groupedTasks[date]}
            loadingTaskId={loadingTaskId}
            onToggleComplete={handleToggleComplete}
          />
        ))}
      </div>

      {/* No results message */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-8">
          <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No tasks found</p>
          <p className="text-sm text-gray-400">
            Try adjusting your filters or search query
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      <TaskPagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={sortedDates.length}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
