'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Target, CheckCircle2, ArrowRight, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { LearningPhase } from '@/types'

interface RoadmapTimelineProps {
  roadmapId: string
  goalId: string
}

// TODO: Implement milestones in future version
// interface Milestone { ... }

interface TimelineStage extends LearningPhase {
  taskCount: number
  completedTasks: number
  isActive: boolean
  isCompleted: boolean
}

export function RoadmapTimeline({ roadmapId, goalId: _goalId }: RoadmapTimelineProps) {
  const supabase = createClient()

  // TODO: Fetch milestones in future version
  // const { data: milestones } = useQuery<Milestone[]>({...

  // Fetch stages with task progress
  const { data: stages, isLoading, error } = useQuery<TimelineStage[]>({
    queryKey: ['roadmap-timeline', roadmapId],
    queryFn: async () => {
      console.log('Fetching timeline stages for roadmap:', roadmapId)
      
      // Get stages first
      const { data: stagesData, error: stagesError } = await supabase
        .from('learning_phases')
        .select('*')
        .eq('roadmap_id', roadmapId)
        .order('phase_number')

      if (stagesError) {
        console.error('Error fetching stages:', stagesError)
        throw stagesError
      }

      if (!stagesData || stagesData.length === 0) {
        return []
      }

      // Get task counts and completion status for all stages
      const stageIds = stagesData.map(s => s.phase_id)
      const { data: tasks } = await supabase
        .from('tasks')
        .select('phase_id, completed')
        .eq('roadmap_id', roadmapId)
        .in('phase_id', stageIds)

      // Calculate task progress per stage
      const stageProgressMap = new Map<string, { total: number; completed: number }>()
      tasks?.forEach(task => {
        if (task.phase_id) {
          const current = stageProgressMap.get(task.phase_id) || { total: 0, completed: 0 }
          current.total++
          if (task.completed) current.completed++
          stageProgressMap.set(task.phase_id, current)
        }
      })

      // Transform the data to include progress
      const timelineStages = stagesData.map((stage: LearningPhase) => {
        const progress = stageProgressMap.get(stage.phase_id || '') || { total: 0, completed: 0 }
        return {
          ...stage,
          taskCount: progress.total,
          completedTasks: progress.completed,
          isActive: stage.status === 'active',
          isCompleted: stage.status === 'completed'
        }
      })

      console.log('Timeline stages with progress:', timelineStages)
      return timelineStages
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  })

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-24 bg-gray-200 rounded-lg" />
      ))}
    </div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">
      Error loading timeline: {error.message}
    </div>
  }

  if (!stages || stages.length === 0) {
    return <div className="text-center py-8 text-gray-500">
      <p>No stages found</p>
      <p className="text-sm mt-2">Timeline will be created automatically.</p>
    </div>
  }

  const totalStages = stages.length
  const completedStages = stages.filter(s => s.isCompleted).length
  const currentStage = stages.find(s => s.isActive)

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <Card className="border-gray-200 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <MapPin className="h-6 w-6 text-primary" />
            Journey Timeline
          </CardTitle>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>{totalStages} Stages Total</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{completedStages} Completed</span>
            </div>
            {currentStage && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Stage {currentStage.phase_number} Active</span>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Timeline Progress Bar */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        <div 
          className="absolute left-6 top-0 w-0.5 bg-primary transition-all duration-1000"
          style={{ height: `${(completedStages / totalStages) * 100}%` }}
        ></div>
        
        <div className="space-y-6">
          {stages.map((stage, index) => {
            const progressPercentage = stage.taskCount > 0 
              ? Math.round((stage.completedTasks / stage.taskCount) * 100) 
              : 0

            // Note: Milestones will be implemented in future version

            return (
              <div key={stage.id} className="relative flex items-start gap-6">
                {/* Timeline dot */}
                <div className={cn(
                  "relative z-10 w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-sm",
                  stage.isCompleted 
                    ? "bg-green-500 border-green-500 text-white" 
                    : stage.isActive 
                      ? "bg-primary border-primary text-white"
                      : "bg-white border-gray-300 text-gray-500"
                )}>
                  {stage.isCompleted ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    stage.phase_number
                  )}
                </div>

                {/* Stage card */}
                <Card className={cn(
                  "flex-1 transition-all duration-300 hover:shadow-lg",
                  stage.isActive && "border-primary shadow-md bg-gradient-to-r from-primary/5 to-primary/10",
                  stage.isCompleted && "bg-gradient-to-r from-green-50 to-green-100 border-green-200"
                )}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Stage header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2 line-clamp-1">{stage.title}</h3>
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                            {stage.description && stage.description.length > 150 
                              ? stage.description.substring(0, 150) + '...' 
                              : stage.description}
                          </p>
                        </div>
                        <Badge 
                          variant={stage.isActive ? "default" : stage.isCompleted ? "secondary" : "outline"}
                          className={cn(
                            "capitalize",
                            stage.isActive && "bg-primary text-white",
                            stage.isCompleted && "bg-green-500 text-white"
                          )}
                        >
                          {stage.status}
                        </Badge>
                      </div>

                      {/* Timeline and progress info */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{stage.duration_weeks} weeks</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(stage.start_date + 'T00:00:00').toLocaleDateString('en-US', {
                              month: 'short', 
                              day: 'numeric'
                            })} - {new Date(stage.end_date + 'T00:00:00').toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        {stage.taskCount > 0 && (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>{stage.completedTasks}/{stage.taskCount} tasks ({progressPercentage}%)</span>
                          </div>
                        )}
                      </div>

                      {/* Quick preview of skills */}
                      {stage.skills_to_learn && stage.skills_to_learn.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {stage.skills_to_learn.slice(0, 3).map((skill: string, skillIndex: number) => (
                            <Badge key={skillIndex} variant="secondary" className="text-xs bg-gray-100">
                              {skill}
                            </Badge>
                          ))}
                          {stage.skills_to_learn.length > 3 && (
                            <Badge variant="secondary" className="text-xs bg-gray-100">
                              +{stage.skills_to_learn.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Progress bar for active/in-progress stages */}
                      {stage.taskCount > 0 && !stage.isCompleted && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Progress</span>
                            <span>{progressPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-500"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Arrow to next stage */}
                {index < stages.length - 1 && (
                  <div className="absolute left-6 -bottom-3 z-10 w-12 flex justify-center">
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}