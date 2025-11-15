'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface GenerationStatus {
  status:
    | 'idle'
    | 'generating-overview'
    | 'generating-stages'
    | 'completed'
    | 'error'
  progress: number
  message: string
}

export function useRoadmapGeneration() {
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({
    status: 'idle',
    progress: 0,
    message: '',
  })
  const router = useRouter()

  // Optimized by React Compiler
  const generateRoadmap = async (goalId: string) => {
    setGenerationStatus({
      status: 'generating-overview',
      progress: 10,
      message: 'Creating your personalized roadmap overview...',
    })

    try {
      // Step 1: Generate overview (fast)
      const overviewResponse = await fetch('/api/ai/generate-overview-fast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId }),
      })

      if (!overviewResponse.ok) {
        throw new Error('Failed to generate overview')
      }

      const { roadmapId } = await overviewResponse.json()

      setGenerationStatus({
        status: 'generating-stages',
        progress: 50,
        message: 'Designing your learning stages...',
      })

      // Step 2: Generate stages (in background)
      fetch('/api/ai/generate-stages-fast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roadmapId, goalId }),
      }).then(() => {
        // Update progress in background
        setTimeout(() => {
          setGenerationStatus({
            status: 'completed',
            progress: 100,
            message: 'Your roadmap is ready!',
          })
        }, 2000)
      })

      // Don't wait for stages - redirect immediately
      setTimeout(() => {
        router.push(`/dashboard/goals/${goalId}`)
      }, 500)

      return { success: true }
    } catch (error) {
      setGenerationStatus({
        status: 'error',
        progress: 0,
        message: 'Failed to generate roadmap. Please try again.',
      })
      toast.error('Failed to generate roadmap')
      throw error
    }
  }

  return {
    generateRoadmap,
    generationStatus,
  }
}
