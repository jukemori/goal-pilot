'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import {
  Clock,
  Target,
  CheckCircle2,
  MapPin,
  Calendar,
} from 'lucide-react'
import { useRoadmapVisual } from '@/features/roadmap/hooks/use-roadmap-visual'

interface RoadmapTimelineProps {
  roadmapId: string
  goalId: string
}

export function RoadmapTimeline({
  roadmapId,
  goalId: _goalId,
}: RoadmapTimelineProps) {
  // Use the extracted hook instead of inline queries
  const { data: roadmapData, isLoading, error } = useRoadmapVisual(roadmapId)

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-gray-200" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8 text-center text-red-500">
        Error loading timeline: {error.message}
      </div>
    )
  }

  if (
    !roadmapData ||
    !roadmapData.roadmapPhases ||
    roadmapData.roadmapPhases.length === 0
  ) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>No roadmap found</p>
        <p className="mt-2 text-sm">Roadmap will be created automatically.</p>
      </div>
    )
  }

  const { roadmapPhases, goal, overview, totalHours, completionDate } =
    roadmapData
  const totalPhases = roadmapPhases.length

  return (
    <div className="space-y-6">
      {/* Roadmap Header */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <MapPin className="text-primary h-6 w-6" />
            Roadmap to {goal?.title || 'Your Goal'}
          </CardTitle>
          <p className="mt-2 text-sm text-gray-600">
            {overview ||
              'Your personalized roadmap showing the key phases to achieve your goal.'}
          </p>
        </CardHeader>
      </Card>

      {/* Roadmap Phases */}
      <div className="relative space-y-4">
        {/* Connecting Line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200" />

        {roadmapPhases.map((phase, index) => {
          const Icon = phase.iconComponent
          const isLast = index === totalPhases - 1

          return (
            <Card
              key={phase.id}
              className="relative border-gray-200 transition-all hover:shadow-md"
            >
              {/* Phase Number Badge */}
              <div className="bg-primary absolute -left-3 top-6 z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white shadow-sm">
                <Icon className="h-6 w-6 text-white" />
              </div>

              <CardHeader className="pl-12">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      Phase {index + 1}: {phase.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {phase.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{phase.duration} weeks</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pl-12">
                {/* Key Activities */}
                {phase.key_activities && phase.key_activities.length > 0 && (
                  <div>
                    <h4 className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                      <Target className="h-4 w-4" />
                      Key Activities
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {phase.key_activities.map((activity, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                          <span>{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Success Metrics */}
                {phase.success_metrics && phase.success_metrics.length > 0 && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium text-gray-700">
                      Success Metrics
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {phase.success_metrics.map((metric, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                          <span>{metric}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>

              {/* Completion Indicator for Last Phase */}
              {isLast && completionDate && (
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Target Completion Date
                    </span>
                    <div className="flex items-center gap-2 font-medium text-gray-900">
                      <Calendar className="h-4 w-4" />
                      {new Date(completionDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                  {totalHours && (
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Hours Required</span>
                      <div className="flex items-center gap-2 font-medium text-gray-900">
                        <Clock className="h-4 w-4" />
                        {totalHours} hours
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
