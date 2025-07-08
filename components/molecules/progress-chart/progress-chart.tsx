'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar } from 'lucide-react'
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

  // Group tasks by week and calculate completion rate
  const getWeeklyProgress = () => {
    const weeklyData: Record<string, { total: number; completed: number }> = {}
    
    tasks.forEach(task => {
      const taskDate = new Date(task.scheduled_date)
      const weekStart = new Date(taskDate)
      weekStart.setDate(taskDate.getDate() - taskDate.getDay()) // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0]
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { total: 0, completed: 0 }
      }
      
      weeklyData[weekKey].total++
      if (task.completed) {
        weeklyData[weekKey].completed++
      }
    })
    
    return Object.entries(weeklyData)
      .map(([week, data]) => ({
        week,
        total: data.total,
        completed: data.completed,
        percentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8) // Last 8 weeks
  }

  const weeklyProgress = getWeeklyProgress()
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
    <div className="space-y-6">
        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{overallProgress}%</div>
            <div className="text-xs text-gray-500">Overall Progress</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
            <div className="text-xs text-gray-500">Tasks Done</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{currentStreak}</div>
            <div className="text-xs text-gray-500">Day Streak</div>
          </div>
        </div>

        {/* Weekly Progress Chart */}
        {weeklyProgress.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Weekly Progress
            </h4>
            <div className="space-y-4">
              <div className="flex items-end justify-between gap-2 h-20">
                {weeklyProgress.map((week, _index) => (
                  <div key={week.week} className="flex flex-col items-center flex-1">
                    <div className="w-full relative">
                      <div
                        className="bg-green-100 rounded-t w-full transition-all duration-300"
                        style={{ height: `${(week.total / Math.max(...weeklyProgress.map(w => w.total))) * maxHeight}px` }}
                      />
                      <div
                        className="bg-green-500 rounded-t w-full absolute bottom-0 transition-all duration-300"
                        style={{ height: `${(week.completed / Math.max(...weeklyProgress.map(w => w.total))) * maxHeight}px` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Week labels below the chart */}
              <div className="flex justify-between gap-2">
                {weeklyProgress.map((week) => (
                  <div key={`label-${week.week}`} className="text-xs text-center flex-1 space-y-1">
                    <div className="text-gray-500">
                      {new Date(week.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="font-medium text-xs">
                      {week.percentage}%
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
          <h4 className="text-sm font-medium mb-3">Recent Activity</h4>
          <div className="space-y-2">
            {tasks
              .filter(task => task.completed && task.completed_at)
              .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
              .slice(0, 3)
              .map((task) => (
                <div key={task.id} className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 bg-green-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-600 truncate flex-1">{task.title}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(task.completed_at!).toLocaleDateString()}
                  </span>
                </div>
              ))}
          </div>
          {tasks.filter(task => task.completed).length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No completed tasks yet. Start completing tasks to see your progress!
            </p>
          )}
        </div>
    </div>
  )
}