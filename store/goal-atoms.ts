import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { Goal } from '@/types'

// Goals state
export const goalsAtom = atom<Goal[]>([])
export const selectedGoalAtom = atom<Goal | null>(null)
export const isLoadingGoalsAtom = atom(false)

// Derived atoms
export const activeGoalsAtom = atom((get) =>
  get(goalsAtom).filter((goal) => goal.status === 'active'),
)

export const completedGoalsAtom = atom((get) =>
  get(goalsAtom).filter((goal) => goal.status === 'completed'),
)

// Persisted atoms
export const goalFiltersAtom = atomWithStorage('goal-filters', {
  level: 'all',
  status: 'all',
  dateRange: null as {
    start: string
    end: string
  } | null,
})
