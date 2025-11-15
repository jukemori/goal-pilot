'use client'

import { useState, useEffect } from 'react'
import {
  Calendar,
  Target,
  TrendingUp,
  Zap,
  Trophy,
  CheckCircle2,
  Flame,
} from 'lucide-react'
import { Tables } from '@/types/database'

type Task = Tables<'tasks'>

interface ProgressChartProps {
  tasks: Task[]
}

export function ProgressChart({ tasks }: ProgressChartProps) {
  const [currentStreak, setCurrentStreak] = useState(0)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Group tasks by day for current week (Sunday to Saturday) using UTC
  const getCurrentWeekProgress = () => {
    const dailyData: Record<string, { total: number; completed: number }> = {}

    // Get current week's Sunday using UTC to match task scheduling
    const currentDate = new Date()
    const currentDay = currentDate.getUTCDay() // 0 = Sunday, using UTC
    const weekStart = new Date(currentDate)
    weekStart.setUTCDate(currentDate.getUTCDate() - currentDay)
    weekStart.setUTCHours(0, 0, 0, 0) // Set to start of day in UTC

    // Initialize all 7 days of current week (Sunday to Saturday)
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(weekStart)
      dayDate.setUTCDate(weekStart.getUTCDate() + i)
      const dayKey = dayDate.toISOString().split('T')[0]

      dailyData[dayKey] = { total: 0, completed: 0 }
    }

    // Add task data to the days
    tasks.forEach((task) => {
      const taskDate = new Date(task.scheduled_date)
      const dayKey = taskDate.toISOString().split('T')[0]

      if (dailyData[dayKey]) {
        dailyData[dayKey].total++
        if (task.completed) {
          dailyData[dayKey].completed++
        }
      }
    })

    return Object.entries(dailyData)
      .map(([day, data], index) => ({
        day,
        dayName: daysOfWeek[index],
        total: data.total,
        completed: data.completed,
        percentage:
          data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      }))
      .sort((a, b) => a.day.localeCompare(b.day))
  }

  const weeklyProgress = getCurrentWeekProgress()
  const maxHeight = 60 // Max height for bars in pixels

  // Calculate overall stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.completed).length
  const overallProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Calculate streak - Optimized by React Compiler
  const getStreak = () => {
    if (tasks.length === 0) return 0

    const sortedTasks = tasks
      .filter((task) => task.completed)
      .sort(
        (a, b) =>
          new Date(b.completed_at!).getTime() -
          new Date(a.completed_at!).getTime(),
      )

    let streak = 0
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const task of sortedTasks) {
      const taskDate = new Date(task.completed_at!)
      taskDate.setHours(0, 0, 0, 0)

      const diffDays = Math.floor(
        (currentDate.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24),
      )

      if (diffDays === streak) {
        streak++
      } else if (diffDays === streak + 1) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  useEffect(() => {
    if (isClient) {
      setCurrentStreak(getStreak())
    }
  }, [isClient, tasks])

  return (
    <div className="space-y-8">
      {/* Key Stats */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <div className="from-primary/5 to-primary/10 border-primary/20 rounded-xl border bg-gradient-to-br p-2 text-center md:p-4">
          <div className="bg-primary/10 mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full md:mb-2 md:h-12 md:w-12">
            <Trophy className="text-primary h-4 w-4 md:h-6 md:w-6" />
          </div>
          <div className="text-primary text-lg font-bold md:text-2xl">
            {overallProgress}%
          </div>
          <div className="text-xs text-gray-500">
            <span className="hidden md:inline">Overall Progress</span>
            <span className="md:hidden">Progress</span>
          </div>
        </div>
        <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-2 text-center md:p-4">
          <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 md:mb-2 md:h-12 md:w-12">
            <CheckCircle2 className="h-4 w-4 text-blue-600 md:h-6 md:w-6" />
          </div>
          <div className="text-lg font-bold text-blue-600 md:text-2xl">
            {completedTasks}
          </div>
          <div className="text-xs text-gray-500">
            <span className="hidden md:inline">Tasks Done</span>
            <span className="md:hidden">Done</span>
          </div>
        </div>
        <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-2 text-center md:p-4">
          <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 md:mb-2 md:h-12 md:w-12">
            <Flame className="h-4 w-4 text-purple-600 md:h-6 md:w-6" />
          </div>
          <div className="text-lg font-bold text-purple-600 md:text-2xl">
            {currentStreak}
          </div>
          <div className="text-xs text-gray-500">
            <span className="hidden md:inline">Day Streak</span>
            <span className="md:hidden">Streak</span>
          </div>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      {weeklyProgress.length > 0 && (
        <div>
          <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
            <Calendar className="text-primary h-5 w-5" />
            This Week's Progress
          </h4>
          <div className="space-y-4">
            <div className="flex h-20 items-end justify-between gap-3">
              {weeklyProgress.map((day, _index) => {
                const maxTasks = Math.max(
                  ...weeklyProgress.map((d) => d.total),
                  1,
                ) // Avoid division by 0
                return (
                  <div
                    key={day.day}
                    className="group flex flex-1 flex-col items-center"
                  >
                    <div className="relative w-full">
                      {/* Background bar */}
                      <div
                        className="from-primary/5 to-primary/10 border-primary/20 w-full rounded-lg border bg-gradient-to-br transition-all duration-300"
                        style={{
                          height: `${Math.max((day.total / maxTasks) * maxHeight, 8)}px`,
                        }}
                      />
                      {/* Completed portion */}
                      <div
                        className="bg-primary absolute bottom-0 w-full rounded-lg transition-all duration-300"
                        style={{
                          height: `${(day.completed / maxTasks) * maxHeight}px`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Day labels below the chart */}
            <div className="flex justify-between gap-2">
              {weeklyProgress.map((day) => (
                <div
                  key={`label-${day.day}`}
                  className="flex-1 space-y-1 text-center text-xs"
                >
                  <div className="text-gray-500">{day.dayName}</div>
                  <div className="text-xs text-gray-400">
                    {isClient
                      ? new Date(day.day).toLocaleDateString('en-US', {
                          month: 'numeric',
                          day: 'numeric',
                        })
                      : new Date(day.day)
                          .toISOString()
                          .split('T')[0]
                          .split('-')
                          .slice(1)
                          .join('/')}
                  </div>
                  <div className="text-xs font-medium">{day.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
          <TrendingUp className="text-primary h-5 w-5" />
          Recent Activity
        </h4>
        <div className="space-y-3">
          {tasks
            .filter((task) => task.completed && task.completed_at)
            .sort(
              (a, b) =>
                new Date(b.completed_at!).getTime() -
                new Date(a.completed_at!).getTime(),
            )
            .slice(0, 3)
            .map((task, index) => (
              <div
                key={task.id}
                className="to-primary/5 flex items-center gap-3 rounded-lg border border-gray-100 bg-gradient-to-r from-gray-50 p-3"
              >
                <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <CheckCircle2 className="text-primary h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {task.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-primary text-xs font-medium">
                      Completed
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {isClient
                        ? new Date(task.completed_at!).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year:
                                new Date(task.completed_at!).getFullYear() !==
                                new Date().getFullYear()
                                  ? 'numeric'
                                  : undefined,
                            },
                          )
                        : new Date(task.completed_at!)
                            .toISOString()
                            .split('T')[0]}
                    </span>
                  </div>
                </div>
                <div className="bg-primary flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="text-xs font-bold text-white">
                    #{index + 1}
                  </span>
                </div>
              </div>
            ))}
        </div>
        {tasks.filter((task) => task.completed).length === 0 && (
          <div className="py-8 text-center">
            <div className="from-primary/20 to-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br">
              <Target className="text-primary h-8 w-8" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Ready to Start?
            </h3>
            <p className="mx-auto mb-4 max-w-sm text-sm text-gray-500">
              Complete your first task to begin tracking your progress and
              building momentum!
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>Track Progress</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span>Build Streaks</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
