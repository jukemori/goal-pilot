'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, Target } from 'lucide-react'

interface RoadmapViewProps {
  roadmap: {
    id: string
    ai_generated_plan: any
    milestones: any[]
    created_at: string
  }
}

export function RoadmapView({ roadmap }: RoadmapViewProps) {
  const plan = roadmap.ai_generated_plan
  
  if (!plan) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No roadmap data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      {plan.overview && (
        <div>
          <h3 className="font-medium mb-2">Overview</h3>
          <p className="text-sm text-gray-600">{plan.overview}</p>
        </div>
      )}

      {/* Phases */}
      {plan.phases && plan.phases.length > 0 && (
        <div>
          <h3 className="font-medium mb-4">Learning Phases</h3>
          <div className="space-y-4">
            {plan.phases.map((phase: any, index: number) => (
              <Card key={phase.id || index} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{phase.title}</CardTitle>
                    <Badge variant="outline">
                      Phase {index + 1}
                    </Badge>
                  </div>
                  <CardDescription>{phase.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {phase.duration_weeks && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{phase.duration_weeks} weeks duration</span>
                    </div>
                  )}
                  
                  {phase.skills_to_learn && phase.skills_to_learn.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Skills to Learn:</p>
                      <div className="flex flex-wrap gap-1">
                        {phase.skills_to_learn.map((skill: string, skillIndex: number) => (
                          <Badge key={skillIndex} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {phase.tasks && phase.tasks.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Key Tasks:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {phase.tasks.slice(0, 3).map((task: string, taskIndex: number) => (
                          <li key={taskIndex} className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                            {task}
                          </li>
                        ))}
                        {phase.tasks.length > 3 && (
                          <li className="text-xs text-gray-500">
                            +{phase.tasks.length - 3} more tasks
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Milestones */}
      {roadmap.milestones && roadmap.milestones.length > 0 && (
        <div>
          <h3 className="font-medium mb-4">Milestones</h3>
          <div className="space-y-3">
            {roadmap.milestones.map((milestone: any, index: number) => (
              <div key={milestone.id || index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={cn(
                  "mt-1 rounded-full h-2 w-2 flex-shrink-0",
                  milestone.completed ? "bg-green-500" : "bg-gray-300"
                )} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{milestone.title}</h4>
                    {milestone.target_date && (
                      <span className="text-xs text-gray-500">
                        {new Date(milestone.target_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {milestone.description && (
                    <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                  )}
                  {milestone.completed && milestone.completed_date && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      Completed {new Date(milestone.completed_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {(plan.estimated_completion_date || plan.total_hours_required) && (
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {plan.estimated_completion_date && (
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  Est. completion: {new Date(plan.estimated_completion_date).toLocaleDateString()}
                </span>
              </div>
            )}
            {plan.total_hours_required && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  Total time: {plan.total_hours_required}h
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

import { cn } from '@/lib/utils'