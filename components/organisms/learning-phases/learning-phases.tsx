'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Calendar, CheckCircle2, Play } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { LearningPhase } from '@/types'

interface LearningPhaseWithTasks extends LearningPhase {
  taskCount: number
  hasGeneratedTasks: boolean
}

interface LearningPhasesProps {
  roadmapId: string
  goalId: string
}

export function LearningPhases({ roadmapId, goalId: _goalId }: LearningPhasesProps) {
  const [generatingPhase, setGeneratingPhase] = useState<string | null>(null)
  const [hasTriggeredAutoCreate, setHasTriggeredAutoCreate] = useState(false)
  const queryClient = useQueryClient()
  const supabase = createClient()

  // Fetch learning phases with task counts
  const { data: phases, isLoading, error } = useQuery<LearningPhaseWithTasks[]>({
    queryKey: ['learning-phases', roadmapId],
    queryFn: async () => {
      console.log('Fetching learning phases for roadmap:', roadmapId)
      
      // First get the phases
      const { data: phasesData, error: phasesError } = await supabase
        .from('learning_phases')
        .select('*')
        .eq('roadmap_id', roadmapId)
        .order('phase_number')

      if (phasesError) {
        console.error('Error fetching learning phases:', phasesError)
        throw phasesError
      }

      // Then get task counts for each phase
      const phasesWithTaskCounts = await Promise.all(
        (phasesData || []).map(async (phase) => {
          const { count } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('roadmap_id', roadmapId)
            .eq('phase_id', phase.phase_id)

          return {
            ...phase,
            taskCount: count || 0,
            hasGeneratedTasks: (count || 0) > 0
          }
        })
      )

      console.log('Learning phases with task counts:', phasesWithTaskCounts)
      return phasesWithTaskCounts
    }
  })

  // Auto-create phases if none exist
  const autoCreateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/learning-phases/auto-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roadmapId })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create learning phases')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-phases', roadmapId] })
      setHasTriggeredAutoCreate(false)
    }
  })

  // Generate tasks for a phase
  const generateTasksMutation = useMutation({
    mutationFn: async (phase: LearningPhase) => {
      console.log('Generating tasks for phase:', phase)
      const response = await fetch('/api/tasks/generate-phase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phaseId: phase.id, roadmapId })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate tasks')
      }
      
      return response.json()
    },
    onSuccess: (data) => {
      toast.success(`Generated ${data.tasksCount} tasks`)
      // Invalidate all task-related queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['learning-phases', roadmapId] })
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      // Refresh the page to show new tasks in all components
      window.location.reload()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
    onSettled: () => {
      setGeneratingPhase(null)
    }
  })


  // Auto-trigger phase creation if needed
  useEffect(() => {
    if (!phases || phases.length === 0) {
      if (!isLoading && !error && !autoCreateMutation.isPending && !autoCreateMutation.isSuccess && !hasTriggeredAutoCreate) {
        setHasTriggeredAutoCreate(true)
        autoCreateMutation.mutate()
      }
    }
  }, [phases, isLoading, error, autoCreateMutation, hasTriggeredAutoCreate])

  if (isLoading || autoCreateMutation.isPending) {
    return <div className="animate-pulse space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-32 bg-gray-200 rounded-lg" />
      ))}
    </div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">
      Error loading learning phases: {error.message}
    </div>
  }

  if (!phases || phases.length === 0) {
    return <div className="text-center py-8 text-gray-500">
      <p>No learning phases found</p>
      <p className="text-sm mt-2">Learning phases will be created automatically.</p>
      <p className="text-xs mt-1 text-gray-400">Roadmap ID: {roadmapId}</p>
    </div>
  }

  console.log('Rendering phases:', phases.length, 'phases for roadmap:', roadmapId)

  return (
    <div className="space-y-4">
      {phases.map((phase) => {
        const isActive = phase.status === 'active'
        const isCompleted = phase.status === 'completed'
        const hasGeneratedTasks = phase.hasGeneratedTasks
        
        return (
          <Card 
            key={phase.id}
            className={cn(
              "transition-all",
              isActive && "border-green-500 shadow-md",
              isCompleted && "opacity-75",
              hasGeneratedTasks && "border-green-500"
            )}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    {phase.title}
                    <Badge 
                      variant={isActive ? "default" : isCompleted ? "secondary" : "outline"}
                      className="ml-2"
                    >
                      {phase.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{phase.description}</CardDescription>
                </div>
                <Badge variant="outline">
                  Phase {phase.phase_number}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{phase.duration_weeks} weeks</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(phase.start_date + 'T00:00:00').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short', 
                      day: 'numeric'
                    })} - 
                    {new Date(phase.end_date + 'T00:00:00').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {phase.skills_to_learn && phase.skills_to_learn.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Skills to Learn:</p>
                  <div className="flex flex-wrap gap-1">
                    {phase.skills_to_learn.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Show learning objectives if available */}
              {phase.learning_objectives && phase.learning_objectives.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Learning Objectives:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {phase.learning_objectives?.map((objective: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Show key concepts if available */}
              {phase.key_concepts && phase.key_concepts.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Key Concepts:</p>
                  <div className="flex flex-wrap gap-1">
                    {phase.key_concepts.map((concept: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {concept}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button
                  size="sm"
                  variant={hasGeneratedTasks ? "secondary" : (isActive ? "default" : "outline")}
                  onClick={() => {
                    setGeneratingPhase(phase.id)
                    generateTasksMutation.mutate(phase)
                  }}
                  disabled={generatingPhase === phase.id || isCompleted || hasGeneratedTasks}
                  className="gap-2"
                >
                  {generatingPhase === phase.id ? (
                    <>Generating...</>
                  ) : hasGeneratedTasks ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      Tasks Generated ({phase.taskCount})
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3" />
                      Generate Tasks
                    </>
                  )}
                </Button>

                {isCompleted && (
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Phase Completed
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}