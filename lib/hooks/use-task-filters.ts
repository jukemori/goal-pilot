import { useState, useMemo, useEffect } from "react";
import { Tables } from "@/types/database";

type Task = Tables<"tasks">;

export function useTaskFilters(tasks: Task[], pageSize = 20) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "pending"
  >("all");
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "5" | "4" | "3" | "2" | "1"
  >("all");
  const [dateFilter, setDateFilter] = useState<
    "all" | "today" | "week" | "overdue"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) =>
        statusFilter === "completed" ? task.completed : !task.completed,
      );
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter(
        (task) => task.priority === parseInt(priorityFilter),
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      const today = new Date().toISOString().split("T")[0];
      const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      filtered = filtered.filter((task) => {
        switch (dateFilter) {
          case "today":
            return task.scheduled_date === today;
          case "week":
            return (
              task.scheduled_date >= today && task.scheduled_date <= weekFromNow
            );
          case "overdue":
            return task.scheduled_date < today && !task.completed;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [tasks, searchQuery, statusFilter, priorityFilter, dateFilter]);

  // Group filtered tasks by date
  const groupedTasks = useMemo(() => {
    return filteredTasks.reduce(
      (acc, task) => {
        const date = task.scheduled_date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(task);
        return acc;
      },
      {} as Record<string, Task[]>,
    );
  }, [filteredTasks]);

  // Sort dates and paginate
  const sortedDates = Object.keys(groupedTasks).sort();

  // Calculate pagination for dates (not individual tasks)
  const totalPages = Math.ceil(sortedDates.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedDates = sortedDates.slice(startIndex, endIndex);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, priorityFilter, dateFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setDateFilter("all");
  };

  return {
    // State
    searchQuery,
    statusFilter,
    priorityFilter,
    dateFilter,
    currentPage,

    // Setters
    setSearchQuery,
    setStatusFilter,
    setPriorityFilter,
    setDateFilter,
    setCurrentPage,
    clearFilters,

    // Computed values
    filteredTasks,
    groupedTasks,
    sortedDates,
    paginatedDates,
    totalPages,
    startIndex,
    endIndex,
  };
}
