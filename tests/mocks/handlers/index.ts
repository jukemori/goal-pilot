import { authHandlers } from './auth'
import { goalsHandlers } from './goals'
import { tasksHandlers } from './tasks'
import { roadmapsHandlers } from './roadmaps'

// Combine all handlers
export const handlers = [
  ...authHandlers,
  ...goalsHandlers,
  ...tasksHandlers,
  ...roadmapsHandlers,
]
