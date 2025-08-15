'use client'

import { motion } from 'framer-motion'
import { Loader2, CheckCircle, Sparkles } from 'lucide-react'
import { Progress } from '@/components/atoms/progress'

interface GenerationProgressProps {
  status: 'idle' | 'generating-overview' | 'generating-stages' | 'completed' | 'error'
  progress: number
  message: string
}

export function GenerationProgress({
  status,
  progress,
  message,
}: GenerationProgressProps) {
  if (status === 'idle') return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="mx-4 w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-center mb-4">
          {status === 'completed' ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <CheckCircle className="h-12 w-12 text-green-500" />
            </motion.div>
          ) : status === 'error' ? (
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          ) : (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="h-12 w-12 text-blue-500" />
            </motion.div>
          )}
        </div>

        <h3 className="text-center text-lg font-semibold text-gray-900 mb-2">
          {status === 'completed'
            ? 'All Set!'
            : status === 'error'
            ? 'Something went wrong'
            : 'Creating Your Roadmap'}
        </h3>

        <p className="text-center text-sm text-gray-600 mb-4">{message}</p>

        {status !== 'error' && status !== 'completed' && (
          <>
            <Progress value={progress} className="mb-2" />
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Working on it...</span>
            </div>
          </>
        )}

        {status === 'completed' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-xs text-gray-500"
          >
            Redirecting you to your roadmap...
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  )
}