'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, Target, TrendingUp, Zap, Trophy, CheckCircle2, Flame } from 'lucide-react'
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
    tasks.forEach(task => {
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
        percentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
      }))
      .sort((a, b) => a.day.localeCompare(b.day))
  }

  const weeklyProgress = getCurrentWeekProgress()
  const maxHeight = 60 // Max height for bars in pixels

  // Calculate overall stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.completed).length
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Calculate streak
  const getStreak = useCallback(() => {
    if (tasks.length === 0) return 0
    
    const sortedTasks = tasks
      .filter(task => task.completed)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
    
    let streak = 0
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    
    for (const task of sortedTasks) {
      const taskDate = new Date(task.completed_at!)
      taskDate.setHours(0, 0, 0, 0)
      
      const diffDays = Math.floor((currentDate.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === streak) {
        streak++
      } else if (diffDays === streak + 1) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }, [tasks])

  useEffect(() => {
    if (isClient) {
      setCurrentStreak(getStreak())
    }
  }, [isClient, tasks, getStreak])

  return (
    <div className="space-y-8">
        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <div className="text-center p-2 md:p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-1 md:mb-2">
              <Trophy className="h-4 w-4 md:h-6 md:w-6 text-primary" />
            </div>
            <div className="text-lg md:text-2xl font-bold text-primary">{overallProgress}%</div>
            <div className="text-xs text-gray-500">
              <span className="hidden md:inline">Overall Progress</span>
              <span className="md:hidden">Progress</span>
            </div>
          </div>
          <div className="text-center p-2 md:p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1 md:mb-2">
              <CheckCircle2 className="h-4 w-4 md:h-6 md:w-6 text-blue-600" />
            </div>
            <div className="text-lg md:text-2xl font-bold text-blue-600">{completedTasks}</div>
            <div className="text-xs text-gray-500">
              <span className="hidden md:inline">Tasks Done</span>
              <span className="md:hidden">Done</span>
            </div>
          </div>
          <div className="text-center p-2 md:p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1 md:mb-2">
              <Flame className="h-4 w-4 md:h-6 md:w-6 text-purple-600" />
            </div>
            <div className="text-lg md:text-2xl font-bold text-purple-600">{currentStreak}</div>
            <div className="text-xs text-gray-500">
              <span className="hidden md:inline">Day Streak</span>
              <span className="md:hidden">Streak</span>
            </div>
          </div>
        </div>

        {/* Weekly Progress Chart */}
        {weeklyProgress.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <Calendar className="h-5 w-5 text-primary" />
              This Week's Progress
            </h4>
            <div className="space-y-4">
              <div className="flex items-end justify-between gap-3 h-20">
                {weeklyProgress.map((day, _index) => {
                  const maxTasks = Math.max(...weeklyProgress.map(d => d.total), 1) // Avoid division by 0
                  return (
                    <div key={day.day} className="flex flex-col items-center flex-1 group">
                      <div className="w-full relative">
                        {/* Background bar */}
                        <div
                          className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg w-full transition-all duration-300"
                          style={{ height: `${Math.max((day.total / maxTasks) * maxHeight, 8)}px` }}
                        />
                        {/* Completed portion */}
                        <div
                          className="absolute bottom-0 w-full rounded-lg transition-all duration-300 bg-primary"
                          style={{ height: `${(day.completed / maxTasks) * maxHeight}px` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* Day labels below the chart */}
              <div className="flex justify-between gap-2">
                {weeklyProgress.map((day) => (
                  <div key={`label-${day.day}`} className="text-xs text-center flex-1 space-y-1">
                    <div className="text-gray-500">
                      {day.dayName}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {isClient ? new Date(day.day).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }) : new Date(day.day).toISOString().split('T')[0].split('-').slice(1).join('/')}
                    </div>
                    <div className="font-medium text-xs">
                      {day.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div>
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
            <TrendingUp className="h-5 w-5 text-primary" />
            Recent Activity
          </h4>
          <div className="space-y-3">
            {tasks
              .filter(task => task.completed && task.completed_at)
              .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
              .slice(0, 3)
              .map((task, index) => (
                <div 
                  key={task.id} 
                  className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-primary/5 border border-gray-100"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-primary font-medium">Completed</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {isClient ? new Date(task.completed_at!).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: new Date(task.completed_at!).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                        }) : new Date(task.completed_at!).toISOString().split('T')[0]}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-6 h-6 bg-primary rounded-full flex-shrink-0">
                    <span className="text-xs font-bold text-white">#{index + 1}</span>
                  </div>
                </div>
              ))}
          </div>
          {tasks.filter(task => task.completed).length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Start?</h3>
              <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
                Complete your first task to begin tracking your progress and building momentum!
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