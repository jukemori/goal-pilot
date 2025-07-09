'use client'

import { CheckCircle, Clock, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RoadmapViewProps {
  roadmap: {
    id: string
    ai_generated_plan: {
      overview?: string
      phases: Array<{
        title: string
        description: string
        duration_weeks: number
        learning_objectives?: string[]
        key_concepts?: string[]
        deliverables?: string[]
      }>
      timeline: {
        total_weeks: number
        daily_commitment: string
      }
      estimated_completion_date?: string
      total_hours_required?: number
    }
    milestones: Array<{
      id?: string
      week: number
      title: string
      description: string
      deliverables: string[]
      completed?: boolean
      completed_date?: string
      target_date?: string
    }>
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


      {/* Milestones */}
      {roadmap.milestones && roadmap.milestones.length > 0 && (
        <div>
          <h3 className="font-medium mb-4">Milestones</h3>
          <div className="space-y-3">
            {roadmap.milestones.map((milestone, index: number) => (
              <div key={milestone.id || index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={cn(
                  "mt-1 rounded-full h-2 w-2 flex-shrink-0",
                  milestone.completed ? "bg-primary" : "bg-gray-300"
                )} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{milestone.title}</h4>
                    {milestone.target_date && (
                      <span className="text-xs text-gray-500">
                        {new Date(milestone.target_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    )}
                  </div>
                  {milestone.description && (
                    <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                  )}
                  {milestone.completed && milestone.completed_date && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                      <CheckCircle className="h-3 w-3" />
                      Completed {new Date(milestone.completed_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
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
                  Est. completion: {new Date(plan.estimated_completion_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
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