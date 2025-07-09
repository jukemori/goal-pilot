"use client"

import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight } from "lucide-react"

interface TaskGenerationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskCount: number
  phaseTitle: string
  onViewTasks: () => void
}

export function TaskGenerationDialog({
  open,
  onOpenChange,
  taskCount,
  phaseTitle,
  onViewTasks
}: TaskGenerationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent 
        className="sm:max-w-md bg-white text-gray-900 border border-gray-200 shadow-xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="flex justify-center mb-4"
          >
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </motion.div>
          
          <DialogTitle className="text-xl text-gray-900 text-center">Tasks Generated Successfully!</DialogTitle>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Generated <strong className="text-gray-900">{taskCount} tasks</strong> for the phase:
            </p>
            <p className="font-medium text-gray-900">"{phaseTitle}"</p>
            <p className="text-sm text-gray-600 mt-4">
              You can view and manage your tasks in the <strong className="text-gray-900">Progress tab</strong> or continue working on your roadmap.
            </p>
          </div>
        </DialogHeader>
        
        <div className="flex flex-col sm:flex-row gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Continue Planning
          </Button>
          <Button
            onClick={onViewTasks}
            className="flex-1 gap-2"
          >
            View Tasks
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}