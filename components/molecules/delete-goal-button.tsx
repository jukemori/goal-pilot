'use client'
import { logger } from '@/lib/utils/logger'

import { useState } from 'react'
import { Button } from '@/components/atoms/button'
import { Trash2 } from 'lucide-react'
import { deleteGoal } from '@/app/actions/goals'
import { motion, AnimatePresence } from 'framer-motion'
import { LoadingSpinner } from '@/components/atoms/loading-spinner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/atoms/alert-dialog'

interface DeleteGoalButtonProps {
  goalId: string
  goalTitle: string
}

export function DeleteGoalButton({ goalId, goalTitle }: DeleteGoalButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteGoal(goalId)
    } catch (error) {
      logger.error('Failed to delete goal', { error })
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={isDeleting}>
          <Trash2 className="mr-2 h-4 w-4" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border border-gray-200 bg-white shadow-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Goal</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{goalTitle}"? This will permanently
            delete the goal, its roadmap, and all associated tasks. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="relative overflow-hidden"
            disabled={isDeleting}
          >
            <AnimatePresence mode="wait">
              {isDeleting ? (
                <motion.div
                  key="deleting"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-2"
                >
                  <LoadingSpinner size="sm" />
                  <span>Deleting Goal...</span>
                </motion.div>
              ) : (
                <motion.div
                  key="normal"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Delete Goal
                </motion.div>
              )}
            </AnimatePresence>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
