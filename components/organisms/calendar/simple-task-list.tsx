"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { completeTask, uncompleteTask } from "@/app/actions/tasks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import type { TaskWithRoadmap } from "@/lib/hooks/use-tasks";

interface SimpleTaskListProps {
  tasks: TaskWithRoadmap[];
  goalId: string;
}

export function SimpleTaskList({
  tasks,
  goalId: _goalId,
}: SimpleTaskListProps) {
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleToggleComplete = useCallback(
    async (task: TaskWithRoadmap) => {
      setLoadingTaskId(task.id);
      try {
        if (task.completed) {
          await uncompleteTask(task.id);
          toast.success("Task marked as incomplete");
        } else {
          await completeTask(task.id);
          toast.success("Task completed!");
        }

        // Invalidate calendar queries to refresh the data
        const currentDate = new Date();
        queryClient.invalidateQueries({
          queryKey: [
            "calendar-optimized",
            currentDate.getFullYear(),
            currentDate.getMonth(),
          ],
        });
        // Also invalidate any other task-related queries
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      } catch {
        toast.error("Failed to update task");
      } finally {
        setLoadingTaskId(null);
      }
    },
    [queryClient],
  );

  const { getPriorityColor, getPriorityLabel } = useMemo(
    () => ({
      getPriorityColor: (priority: number) => {
        switch (priority) {
          case 5:
            return "bg-red-100 text-red-800";
          case 4:
            return "bg-orange-100 text-orange-800";
          case 3:
            return "bg-yellow-100 text-yellow-800";
          case 2:
            return "bg-primary/10 text-primary";
          default:
            return "bg-gray-100 text-gray-800";
        }
      },
      getPriorityLabel: (priority: number) => {
        switch (priority) {
          case 5:
            return "Critical";
          case 4:
            return "High";
          case 3:
            return "Medium";
          case 2:
            return "Low";
          default:
            return "Lowest";
        }
      },
    }),
    [],
  );

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="relative mb-4">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-green-50 rounded-full -z-10"></div>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">
          No tasks for today
        </h3>
        <p className="text-xs text-gray-500">Enjoy your free time!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Task Statistics */}
      <TaskStatistics tasks={tasks} />

      {/* Task List */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              "flex items-center gap-3 p-3 border rounded-lg transition-colors",
              task.completed && "opacity-60 bg-gray-50",
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => handleToggleComplete(task)}
              disabled={loadingTaskId === task.id}
            >
              {task.completed ? (
                <CheckCircle className="h-4 w-4 text-primary" />
              ) : (
                <div className="h-4 w-4 border-2 border-gray-300 rounded" />
              )}
            </Button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4
                  className={cn(
                    "font-medium text-sm",
                    task.completed && "line-through text-gray-500",
                  )}
                >
                  {task.title}
                </h4>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    getPriorityColor(task.priority || 1),
                  )}
                >
                  {getPriorityLabel(task.priority || 1)}
                </Badge>
              </div>

              {task.description && (
                <p className="text-sm text-gray-600 mb-1">{task.description}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {task.estimated_duration || 0} min
                </div>
                {task.completed_at && (
                  <div className="flex items-center gap-1 text-primary">
                    <CheckCircle className="h-3 w-3" />
                    Completed{" "}
                    {new Date(task.completed_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleToggleComplete(task)}>
                  {task.completed ? "Mark Incomplete" : "Mark Complete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
}

// Memoized TaskStatistics component
const TaskStatistics = memo(function TaskStatistics({
  tasks,
}: {
  tasks: TaskWithRoadmap[];
}) {
  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.completed === true).length,
      overdue: tasks.filter(
        (t) => t.completed !== true && t.scheduled_date < today,
      ).length,
    };
  }, [tasks]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="text-lg font-semibold text-primary">{stats.total}</div>
        <div className="text-xs text-gray-600">Total Tasks</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold text-primary">
          {stats.completed}
        </div>
        <div className="text-xs text-gray-600">Completed</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold text-orange-600">
          {stats.overdue}
        </div>
        <div className="text-xs text-gray-600">Overdue</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold text-purple-600">
          {stats.total}
        </div>
        <div className="text-xs text-gray-600">Total</div>
      </div>
    </div>
  );
});
