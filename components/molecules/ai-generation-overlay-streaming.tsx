'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Bot, Brain, Zap, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface AIGenerationOverlayProps {
  isVisible: boolean
  stage: 'roadmap' | 'tasks' | 'analysis'
  onCancel?: () => void
  streamingProgress?: {
    message: string
    phaseCount?: number
    taskCount?: number
    percentage?: number
  }
}

const stageConfig = {
  roadmap: {
    title: 'Creating Your Personalized Roadmap',
    subtitle:
      'Our AI is analyzing your goal and crafting a detailed learning path tailored just for you.',
    icon: Brain,
    estimatedTime: '15-30 seconds',
  },
  tasks: {
    title: 'Generating Daily Tasks',
    subtitle: 'Breaking down your learning stages into actionable daily tasks.',
    icon: Zap,
    estimatedTime: '10-20 seconds',
  },
  analysis: {
    title: 'Analyzing Progress',
    subtitle: 'Our AI is reviewing your progress and updating recommendations.',
    icon: Bot,
    estimatedTime: '5-10 seconds',
  },
}

export function AIGenerationOverlayStreaming({
  isVisible,
  stage,
  onCancel,
  streamingProgress,
}: AIGenerationOverlayProps) {
  const [dots, setDots] = useState('')
  const [elapsedTime, setElapsedTime] = useState(0)

  const config = stageConfig[stage]
  const IconComponent = config.icon

  // Animate dots
  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 500)

    return () => clearInterval(interval)
  }, [isVisible])

  // Track elapsed time
  useEffect(() => {
    if (!isVisible) {
      setElapsedTime(0)
      return
    }

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isVisible])

  // Prevent background scrolling
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isVisible])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex h-screen min-h-screen w-screen items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative mx-4 w-full max-w-md rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-2xl"
          >
            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Icon with pulsing animation */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="text-primary mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg"
              >
                <IconComponent className="h-8 w-8" />
              </motion.div>

              {/* Title */}
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                {config.title}
              </h2>

              {/* Subtitle */}
              <p className="mb-6 leading-relaxed text-gray-600">
                {config.subtitle}
              </p>

              {/* Real-time progress */}
              <div className="mb-6 space-y-4">
                {/* Current status message */}
                <motion.div
                  key={streamingProgress?.message}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 text-gray-700"
                >
                  <Sparkles className="text-primary h-4 w-4" />
                  <span className="text-sm font-medium">
                    {streamingProgress?.message || 'Starting generation'}
                    {dots}
                  </span>
                </motion.div>

                {/* Progress details */}
                {(streamingProgress?.phaseCount ||
                  streamingProgress?.taskCount) && (
                  <div className="flex justify-center gap-6 text-sm">
                    {streamingProgress.phaseCount && (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="font-medium">
                          {streamingProgress.phaseCount} phases
                        </span>
                      </div>
                    )}
                    {streamingProgress.taskCount && (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="font-medium">
                          {streamingProgress.taskCount} tasks
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Progress bar */}
                {streamingProgress?.percentage !== undefined && (
                  <div className="mx-auto w-full max-w-xs">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${streamingProgress.percentage}%` }}
                        transition={{ duration: 0.3 }}
                        className="from-primary to-primary/80 h-full bg-gradient-to-r"
                      />
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      {streamingProgress.percentage}% complete
                    </div>
                  </div>
                )}
              </div>

              {/* Time tracker */}
              <div className="mb-6 flex justify-center gap-4 text-xs text-gray-500">
                <span>Elapsed: {formatTime(elapsedTime)}</span>
                <span>•</span>
                <span>Est: {config.estimatedTime}</span>
              </div>

              {/* Info message */}
              <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs leading-relaxed text-blue-700">
                  Generation is optimized for quality. The process streams
                  results in real-time to keep you updated on progress.
                </p>
              </div>

              {/* Cancel button */}
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="text-sm text-gray-500 underline transition-colors hover:text-gray-700"
                >
                  Cancel Generation
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
