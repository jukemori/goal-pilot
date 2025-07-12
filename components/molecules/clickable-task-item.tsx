"use client";

import { CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCompleteTask, useUncompleteTask } from "@/lib/hooks/use-tasks";
import { Task } from "@/types/database";

interface ClickableTaskItemProps {
  task: Task;
}

export function ClickableTaskItem({ task }: ClickableTaskItemProps) {
  const completeTask = useCompleteTask();
  const uncompleteTask = useUncompleteTask();

  const handleTaskClick = () => {
    if (task.completed === true) {
      uncompleteTask.mutate(task.id);
    } else {
      completeTask.mutate(task.id);
    }
  };

  return (
    <div
      onClick={handleTaskClick}
      className={cn(
        "group flex items-center gap-3 p-4 border rounded-xl transition-all duration-300 hover:shadow-md cursor-pointer",
        task.completed === true
          ? "bg-gradient-to-r from-green-50 to-green-100 border-green-200 opacity-75"
          : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:border-blue-200",
      )}
    >
      <div
        className={cn(
          "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
          task.completed === true
            ? "bg-primary border-primary"
            : "border-gray-300 group-hover:border-blue-500",
        )}
      >
        {task.completed === true && (
          <CheckCircle className="h-3 w-3 text-white" />
        )}
      </div>
      <div className="flex-1">
        <p
          className={cn(
            "font-medium text-gray-900 transition-colors",
            task.completed === true && "line-through text-gray-600",
          )}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Clock className="h-3 w-3" />
            {task.estimated_duration} min
          </div>
          {task.priority && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                task.priority <= 2 && "border-red-200 text-red-600",
                task.priority === 3 && "border-orange-200 text-orange-600",
                task.priority >= 4 && "border-green-200 text-green-600",
              )}
            >
              {task.priority <= 2
                ? "High"
                : task.priority === 3
                  ? "Medium"
                  : "Low"}{" "}
              Priority
            </Badge>
          )}
        </div>
      </div>
      {task.completed === true && (
        <div className="flex items-center gap-1 text-sm text-primary font-medium">
          <CheckCircle className="h-4 w-4" />
          Done
        </div>
      )}
    </div>
  );
}

// Loading skeleton component for lazy loading
export function ClickableTaskItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 border rounded-xl">
      <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
      </div>
    </div>
  );
}
