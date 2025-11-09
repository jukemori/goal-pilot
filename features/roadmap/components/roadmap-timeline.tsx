'use client'

import React from 'react'
import { Card, CardHeader, CardTitle } from '@/components/atoms/card'
import {
  Clock,
  Target,
  CheckCircle2,
  MapPin,
} from 'lucide-react'
import { useRoadmapVisual, type RoadmapVisualData } from '../hooks/use-roadmap-visual'

interface RoadmapTimelineProps {
  roadmapId: string
  goalId: string
}

export function RoadmapTimeline({
  roadmapId,
  goalId: _goalId,
}: RoadmapTimelineProps) {
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

  if (!roadmapData || roadmapData.roadmapPhases.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>No roadmap found</p>
        <p className="mt-2 text-sm">Roadmap will be created automatically.</p>
      </div>
    )
  }

  const { roadmapPhases, goal, overview, totalHours, completionDate } =
    roadmapData as RoadmapVisualData
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
          <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>{totalPhases} Major Phases</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{totalHours} hours total</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                Complete by{' '}
                {completionDate
                  ? new Date(completionDate).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'TBD'}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Vertical Roadmap */}
      <div className="relative">
        {/* Roadmap line */}
        <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gray-200"></div>
        <div
          className="from-primary to-primary/60 absolute top-0 left-6 w-0.5 bg-gradient-to-b transition-all duration-1000"
          style={{ height: `${(1 / totalPhases) * 100}%` }}
        ></div>

        <div className="space-y-4">
          {roadmapPhases.map((phase, index) => (
            <div key={phase.id} className="relative flex items-start gap-4">
              {/* Roadmap dot */}
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-300 bg-white shadow-sm">
                {React.createElement(phase.iconComponent, {
                  className: 'h-6 w-6 text-primary',
                })}
              </div>

              {/* Compact Phase card */}
              <div className="flex-1 rounded-lg bg-gray-50 p-4">
                <div className="mb-2 flex items-start justify-between gap-4">
                  <h3 className="text-base font-semibold text-gray-900">
                    {phase.name}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {phase.duration} weeks
                  </span>
                </div>

                <p className="mb-3 text-sm text-gray-600">
                  {phase.description}
                </p>

                {/* Key Activities - Simplified */}
                {phase.key_activities && phase.key_activities.length > 0 && (
                  <div className="space-y-1">
                    {phase.key_activities
                      .slice(0, 2)
                      .map((activity: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-sm text-gray-700">
                            {activity}
                          </span>
                        </div>
                      ))}
                  </div>
                )}

                {/* Success Indicator - Just one key metric */}
                {phase.success_metrics && phase.success_metrics.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 rounded bg-green-50 px-2 py-1 text-sm text-green-700">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{phase.success_metrics[0]}</span>
                  </div>
                )}
              </div>

              {/* Connector to next phase */}
              {index < roadmapPhases.length - 1 && (
                <div className="absolute top-12 left-6 h-full w-0.5 bg-gray-200"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
