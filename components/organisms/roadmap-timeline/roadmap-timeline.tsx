'use client'

import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Target, CheckCircle2, ArrowRight, MapPin, Trophy, Star, Flag } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Milestone } from '@/types/database'

interface RoadmapTimelineProps {
  roadmapId: string
  goalId: string
}

// Milestone icon mapping
const getMilestoneIcon = (icon: string) => {
  switch (icon) {
    case 'foundation':
      return Target
    case 'target':
      return Target
    case 'trophy':
      return Trophy
    case 'star':
      return Star
    case 'flag':
      return Flag
    default:
      return Target
  }
}


export function RoadmapTimeline({ roadmapId, goalId: _goalId }: RoadmapTimelineProps) {
  const supabase = createClient()

  // Fetch roadmap data for high-level timeline view
  const { data: timelineData, isLoading, error } = useQuery({
    queryKey: ['roadmap-overview', roadmapId],
    queryFn: async () => {
      console.log('Fetching roadmap overview for timeline:', roadmapId)
      
      // Get roadmap with AI plan and milestones
      const { data: roadmap, error: roadmapError } = await supabase
        .from('roadmaps')
        .select('ai_generated_plan, milestones')
        .eq('id', roadmapId)
        .single()

      if (roadmapError) {
        console.error('Error fetching roadmap:', roadmapError)
        throw roadmapError
      }

      if (!roadmap?.ai_generated_plan) {
        return { phases: [], milestones: [] }
      }

      const aiPlan = roadmap.ai_generated_plan as { phases: Array<{ duration_weeks?: number; skills_to_learn?: string[] }> }
      const phases = aiPlan?.phases || []
      const milestones = (roadmap.milestones as unknown as Milestone[]) || []

      console.log('AI Plan phases count:', phases.length)
      console.log('AI Plan phases:', phases)

      // If we only have 1-2 stages, create a default multi-phase timeline
      if (phases.length <= 2) {
        const totalWeeks = phases.reduce((sum: number, p: { duration_weeks?: number }) => sum + (p.duration_weeks || 0), 0) || 12
        const phaseWeeks = Math.ceil(totalWeeks / 3)
        
        return {
          phases: [
            {
              id: 'timeline-phase-1',
              name: 'Getting Started',
              icon: '🚀',
              color: 'blue',
              duration_weeks: phaseWeeks,
              key_skills: [],
              stage_range: phases.length === 1 ? '1 stage' : '1-2 stages',
              description: 'Begin your journey with essential foundations and first steps'
            },
            {
              id: 'timeline-phase-2', 
              name: 'Building Momentum',
              icon: '⚡',
              color: 'purple',
              duration_weeks: phaseWeeks,
              key_skills: [],
              stage_range: '1 stage',
              description: 'Develop core competencies and gain confidence'
            },
            {
              id: 'timeline-phase-3',
              name: 'Achievement',
              icon: '🏆', 
              color: 'green',
              duration_weeks: totalWeeks - (2 * phaseWeeks),
              key_skills: [],
              stage_range: '1 stage',
              description: 'Reach your goal and demonstrate mastery'
            }
          ],
          milestones
        }
      }

      // Group phases into high-level timeline phases (every 2 stages = 1 timeline phase)
      const timelinePhases = []
      const phaseGroups = Math.ceil(phases.length / 2) // Group every 2 stages for more timeline phases
      
      for (let i = 0; i < phaseGroups; i++) {
        const startIdx = i * 2
        const endIdx = Math.min(startIdx + 2, phases.length)
        const groupPhases = phases.slice(startIdx, endIdx)
        
        // Create high-level, conceptual phase names based on journey position
        let phaseName = ''
        let phaseIcon = ''
        let phaseColor = ''
        let phaseDescription = ''
        
        if (i === 0) {
          phaseName = 'Getting Started'
          phaseIcon = '🚀'
          phaseColor = 'blue'
          phaseDescription = 'Begin your journey with essential foundations and first steps'
        } else if (i === phaseGroups - 1) {
          phaseName = 'Achievement'
          phaseIcon = '🏆'
          phaseColor = 'green'
          phaseDescription = 'Reach your goal and demonstrate mastery'
        } else if (phaseGroups === 3 && i === 1) {
          phaseName = 'Building Momentum'
          phaseIcon = '⚡'
          phaseColor = 'purple'
          phaseDescription = 'Develop core competencies and gain confidence'
        } else {
          // For longer journeys with multiple middle phases
          const midPhaseNames = [
            { name: 'Building Momentum', icon: '⚡', desc: 'Develop core competencies and gain confidence' },
            { name: 'Expanding Knowledge', icon: '🌟', desc: 'Broaden your understanding and skills' },
            { name: 'Deepening Expertise', icon: '💎', desc: 'Refine your abilities and tackle challenges' },
            { name: 'Advanced Practice', icon: '🎯', desc: 'Apply knowledge in complex scenarios' }
          ]
          const phaseIndex = Math.min(i - 1, midPhaseNames.length - 1)
          phaseName = midPhaseNames[phaseIndex].name
          phaseIcon = midPhaseNames[phaseIndex].icon
          phaseDescription = midPhaseNames[phaseIndex].desc
          phaseColor = 'purple'
        }

        // Calculate total duration and create very high-level summary
        const totalWeeks = groupPhases.reduce((sum: number, p: { duration_weeks?: number }) => sum + (p.duration_weeks || 0), 0)
        // No specific skills - keep it completely general
        
        timelinePhases.push({
          id: `timeline-phase-${i + 1}`,
          name: phaseName,
          icon: phaseIcon,
          color: phaseColor,
          duration_weeks: totalWeeks,
          key_skills: [], // No specific skills for timeline
          stage_range: `${endIdx - startIdx} stages`,
          description: phaseDescription
        })
      }

      return { phases: timelinePhases, milestones }
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

  if (!timelineData || !timelineData.phases || timelineData.phases.length === 0) {
    return <div className="text-center py-8 text-gray-500">
      <p>No timeline found</p>
      <p className="text-sm mt-2">Timeline will be created automatically.</p>
    </div>
  }

  const { phases: timelinePhases, milestones: timelineMilestones } = timelineData
  const totalPhases = timelinePhases.length

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <Card className="border-gray-200 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <MapPin className="h-6 w-6 text-primary" />
            Your Learning Journey
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl">
            This high-level view shows the major phases of your journey. Each phase represents multiple detailed stages that you can explore in the "Stages" tab.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-600 mt-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>{totalPhases} Journey Phases</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{timelineMilestones?.length || 0} Milestones</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Big Picture View</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Vertical Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        <div 
          className="absolute left-8 top-0 w-0.5 bg-gradient-to-b from-primary to-primary/60 transition-all duration-1000"
          style={{ height: `${(1 / totalPhases) * 100}%` }}
        ></div>
        
        <div className="space-y-8">
          {timelinePhases.map((phase, index) => {
            // Check if there's a milestone near this phase
            const nearbyMilestone = timelineMilestones?.find(m => 
              m.stage_number >= (index * 2) + 1 && m.stage_number <= (index * 2) + 2
            )

            return (
              <div key={phase.id}>
                {/* Milestone marker (if exists) */}
                {nearbyMilestone && (
                  <div className="relative flex items-start gap-6 mb-6">
                    <div className="relative z-10 w-12 h-12 rounded-full border-2 border-orange-300 bg-orange-100 flex items-center justify-center shadow-sm">
                      {(() => {
                        const IconComponent = getMilestoneIcon(nearbyMilestone.icon)
                        return <IconComponent className="h-5 w-5 text-orange-600" />
                      })()}
                    </div>
                    <Card className="flex-1 border-orange-200 bg-orange-50">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-orange-800 mb-1">🎯 {nearbyMilestone.title}</h4>
                            <p className="text-orange-700 text-xs">{nearbyMilestone.description}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs bg-orange-200 text-orange-800">
                            Milestone
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  </div>
                )}

                {/* Timeline Phase */}
                <div className="relative flex items-start gap-6">
                  {/* Timeline dot */}
                  <div className="relative z-10 w-16 h-16 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center text-2xl shadow-sm">
                    {phase.icon}
                  </div>

                  {/* Phase card */}
                  <Card className="flex-1 border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2 text-gray-900">{phase.name}</h3>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {phase.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs text-gray-500">
                          {phase.stage_range}
                        </Badge>
                      </div>

                      {/* Duration */}
                      <div className="flex items-center gap-2 text-gray-500 text-sm mt-3">
                        <Clock className="h-4 w-4" />
                        <span>{phase.duration_weeks} weeks</span>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Arrow to next phase */}
                  {index < timelinePhases.length - 1 && (
                    <div className="absolute left-8 -bottom-4 z-10 w-16 flex justify-center">
                      <ArrowRight className="h-4 w-4 text-gray-300 rotate-90" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}