'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Bot, Brain, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

interface AIGenerationOverlayProps {
  isVisible: boolean
  stage: 'roadmap' | 'tasks' | 'analysis'
  onCancel?: () => void
}

const stageConfig = {
  roadmap: {
    title: 'Creating Your Personalized Roadmap',
    subtitle: 'Our AI is analyzing your goal and crafting a detailed learning path tailored just for you.',
    icon: Brain,
    steps: [
      'Analyzing your goal and current level...',
      'Calculating optimal timeline...',
      'Designing learning stages...',
      'Creating detailed milestones...',
      'Finalizing your roadmap...'
    ]
  },
  tasks: {
    title: 'Generating Daily Tasks',
    subtitle: 'Breaking down your learning stages into actionable daily tasks.',
    icon: Zap,
    steps: [
      'Analyzing stage requirements...',
      'Creating daily task sequences...',
      'Optimizing task difficulty...',
      'Scheduling tasks...',
      'Finalizing task list...'
    ]
  },
  analysis: {
    title: 'Analyzing Progress',
    subtitle: 'Our AI is reviewing your progress and updating recommendations.',
    icon: Bot,
    steps: [
      'Reviewing completed tasks...',
      'Analyzing learning patterns...',
      'Adjusting recommendations...',
      'Updating timeline...',
      'Finalizing analysis...'
    ]
  }
}

export function AIGenerationOverlay({ isVisible, stage, onCancel }: AIGenerationOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [dots, setDots] = useState('')
  
  const config = stageConfig[stage]
  const IconComponent = config.icon

  // Cycle through steps
  useEffect(() => {
    if (!isVisible) return
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % config.steps.length)
    }, 2000) // Change step every 2 seconds
    
    return () => clearInterval(interval)
  }, [isVisible, config.steps.length])

  // Animate dots
  useEffect(() => {
    if (!isVisible) return
    
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)
    
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

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          {/* Main content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-md w-full mx-4 bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-2xl"
          >
            {/* Animated background pattern */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Icon with pulsing animation */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="inline-flex items-center justify-center w-16 h-16 text-primary bg-white rounded-2xl shadow-lg mb-6"
              >
                <IconComponent className="w-8 h-8" />
              </motion.div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {config.title}
              </h2>

              {/* Subtitle */}
              <p className="text-gray-600 mb-8 leading-relaxed">
                {config.subtitle}
              </p>

              {/* Current step with animated transition */}
              <div className="min-h-[3rem] flex items-center justify-center mb-6">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-gray-700"
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    {config.steps[currentStep]}{dots}
                  </span>
                </motion.div>
              </div>

              {/* Progress indicator */}
              <div className="flex justify-center gap-2 mb-8">
                {config.steps.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      index === currentStep ? 'bg-primary' : 'bg-gray-300'
                    }`}
                    animate={index === currentStep ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>

              {/* Warning message */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-600 text-xs font-bold">!</span>
                  </div>
                  <div className="text-left">
                    <p className="text-amber-800 text-sm font-medium mb-1">
                      Please don't navigate away
                    </p>
                    <p className="text-amber-700 text-xs leading-relaxed">
                      This process takes about 30 seconds. Leaving this page will interrupt the generation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cancel button */}
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors underline"
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