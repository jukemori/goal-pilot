import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  completeTask,
  uncompleteTask,
  rescheduleTask,
} from "@/app/actions/tasks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tables } from "@/types/database";
import { format, parseISO } from "date-fns";

type Task = Tables<"tasks">;

interface TaskItemProps {
  task: Task;
  isLoading?: boolean;
  onToggleComplete?: (task: Task) => void;
}

export function TaskItem({ task, isLoading, onToggleComplete }: TaskItemProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = isLoading || internalLoading;

  async function handleToggleComplete() {
    if (onToggleComplete) {
      onToggleComplete(task);
      return;
    }

    setInternalLoading(true);
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
      setInternalLoading(false);
    }
  }

  async function handleReschedule(newDate: string) {
    try {
      await rescheduleTask(task.id, newDate);
      toast.success("Task rescheduled");
    } catch {
      toast.error("Failed to reschedule task");
    }
  }

  const getPriorityColor = (priority: number) => {
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
  };

  const getPriorityLabel = (priority: number) => {
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
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-200",
        task.completed && "opacity-60 bg-gray-50/80",
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-primary/10"
        onClick={handleToggleComplete}
        disabled={loading}
      >
        {task.completed ? (
          <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center">
            <CheckCircle className="h-3 w-3 text-white" />
          </div>
        ) : (
          <div className="h-5 w-5 border-2 border-gray-300 rounded-full hover:border-primary transition-colors" />
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
            className={cn("text-xs", getPriorityColor(task.priority || 3))}
          >
            {getPriorityLabel(task.priority || 3)}
          </Badge>
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 mb-1">{task.description}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {task.estimated_duration} min
          </div>
          {task.completed_at && (
            <div className="flex items-center gap-1 text-primary">
              <CheckCircle className="h-3 w-3" />
              Completed {format(parseISO(task.completed_at), "h:mm a")}
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
          <DropdownMenuItem onClick={handleToggleComplete}>
            {task.completed ? "Mark Incomplete" : "Mark Complete"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              handleReschedule(tomorrow.toISOString().split("T")[0]);
            }}
          >
            Reschedule to Tomorrow
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              const nextWeek = new Date();
              nextWeek.setDate(nextWeek.getDate() + 7);
              handleReschedule(nextWeek.toISOString().split("T")[0]);
            }}
          >
            Reschedule to Next Week
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
