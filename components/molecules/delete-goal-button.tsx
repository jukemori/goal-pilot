'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteGoal } from '@/app/actions/goals'

interface DeleteGoalButtonProps {
  goalId: string
  goalTitle: string
}

export function DeleteGoalButton({ goalId, goalTitle }: DeleteGoalButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${goalTitle}"?\n\nThis will permanently delete the goal, its roadmap, and all associated tasks. This action cannot be undone.`
    )
    
    if (!confirmed) return
    
    setIsDeleting(true)
    try {
      await deleteGoal(goalId)
    } catch (error) {
      console.error('Failed to delete goal:', error)
      setIsDeleting(false)
    }
  }

  return (
    <Button 
      variant="destructive" 
      size="sm" 
      disabled={isDeleting}
      onClick={handleDelete}
    >
      <Trash2 className="h-4 w-4 mr-2" />
      {isDeleting ? 'Deleting...' : 'Delete'}
    </Button>
  )
}