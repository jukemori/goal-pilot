import { useState, useCallback, useRef } from 'react'

interface StreamingProgress {
  message: string
  phaseCount?: number
  taskCount?: number
  percentage?: number
}

import { Roadmap, Task } from '@/types/database'

type GenerationResult = Roadmap | Task[] | { roadmap?: Roadmap; tasks?: Task[] }

interface UseSSEGenerationOptions {
  onProgress?: (progress: StreamingProgress) => void
  onComplete?: (data: GenerationResult) => void
  onError?: (error: string) => void
}

export function useSSEGeneration(options: UseSSEGenerationOptions = {}) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<StreamingProgress>({ message: 'Starting...' })
  const eventSourceRef = useRef<EventSource | null>(null)
  
  const startGeneration = useCallback(async (
    endpoint: string,
    body: Record<string, unknown>
  ) => {
    try {
      setIsGenerating(true)
      setProgress({ message: 'Initializing...' })
      
      // First, make a POST request to get the stream URL
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      
      if (!response.ok) {
        throw new Error('Failed to start generation')
      }
      
      // For SSE, we need to handle the stream differently
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      
      if (!reader) {
        throw new Error('No response body')
      }
      
      let buffer = ''
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        
        // Process complete lines
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim()
          
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              switch (data.type) {
                case 'status':
                case 'progress':
                  const newProgress = {
                    message: data.message,
                    phaseCount: data.phaseCount,
                    taskCount: data.taskCount,
                    percentage: data.percentage,
                  }
                  setProgress(newProgress)
                  options.onProgress?.(newProgress)
                  break
                  
                case 'complete':
                  setIsGenerating(false)
                  options.onComplete?.(data.roadmap || data.tasks || data)
                  break
                  
                case 'error':
                  setIsGenerating(false)
                  options.onError?.(data.error)
                  break
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e)
            }
          }
        }
        
        // Keep the last incomplete line in the buffer
        buffer = lines[lines.length - 1]
      }
      
    } catch (error) {
      console.error('Generation error:', error)
      setIsGenerating(false)
      options.onError?.(error instanceof Error ? error.message : 'Generation failed')
    }
  }, [options])
  
  const cancelGeneration = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsGenerating(false)
  }, [])
  
  return {
    isGenerating,
    progress,
    startGeneration,
    cancelGeneration,
  }
}