import { Button } from '@/components/atoms/button'
import { LoadingSpinner, PulsingDots } from '@/components/atoms/loading-spinner'
import { motion, AnimatePresence } from 'framer-motion'
import { Target } from 'lucide-react'

interface SubmitButtonProps {
  isLoading: boolean
  isEdit: boolean
}

export function SubmitButton({ isLoading, isEdit }: SubmitButtonProps) {
  return (
    <div className="mt-6">
      <Button
        type="submit"
        disabled={isLoading}
        size="lg"
        className="from-primary to-primary/90 hover:from-primary/90 hover:to-primary relative w-full overflow-hidden bg-gradient-to-r shadow-lg"
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center"
            >
              <LoadingSpinner size="sm" className="mr-2" />
              <span>
                {isEdit ? 'Updating Goal...' : 'Creating Goal & Roadmap'}
              </span>
              <PulsingDots className="ml-2" />
            </motion.div>
          ) : (
            <motion.span
              key="normal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 font-semibold"
            >
              {isEdit ? (
                <>
                  <Target className="h-4 w-4" />
                  Update Goal
                </>
              ) : (
                <>
                  <Target className="h-4 w-4" />
                  Create Goal & Generate Roadmap
                </>
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      {!isEdit && (
        <p className="mt-3 text-center text-sm text-gray-500">
          This will take about 30 seconds to generate your personalized roadmap
        </p>
      )}
    </div>
  )
}
