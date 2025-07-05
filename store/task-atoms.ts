import { atom } from 'jotai'
import type { Task } from '@/types'

export const tasksAtom = atom<Task[]>([])
export const selectedDateAtom = atom(new Date())
export const isLoadingTasksAtom = atom(false)

// Derived atoms for selected date tasks
export const todayTasksAtom = atom((get) => {
  const tasks = get(tasksAtom)
  const selectedDate = get(selectedDateAtom)
  const dateString = selectedDate.toISOString().split('T')[0]
  
  return tasks.filter((task) => task.scheduled_date === dateString)
})

export const completedTasksCountAtom = atom((get) =>
  get(todayTasksAtom).filter((task) => task.completed).length
)

export const taskProgressAtom = atom((get) => {
  const todayTasks = get(todayTasksAtom)
  const completed = get(completedTasksCountAtom)
  
  if (todayTasks.length === 0) return 0
  return Math.round((completed / todayTasks.length) * 100)
})