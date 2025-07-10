'use client'

import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Target, CheckCircle2, ArrowRight, MapPin, Trophy, Star, Flag } from 'lucide-react'
import { cn } from '@/lib/utils'
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

      // Group phases into high-level timeline phases (every 3-4 stages = 1 timeline phase)
      const timelinePhases = []
      const phaseGroups = Math.ceil(phases.length / 3) // Group every 3 stages
      
      for (let i = 0; i < phaseGroups; i++) {
        const startIdx = i * 3
        const endIdx = Math.min(startIdx + 3, phases.length)
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

      {/* Horizontal Timeline */}
      <div className="overflow-x-auto pb-4">
        <div className="relative min-w-[800px]">
          {/* Timeline line */}
          <div className="absolute top-16 left-16 right-16 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full"></div>
          
          {/* Timeline phases */}
          <div className="flex justify-between items-start pt-8">
            {timelinePhases.map((phase, index) => {
              // Check if there's a milestone near this phase
              const nearbyMilestone = timelineMilestones?.find(m => 
                m.stage_number >= (index * 3) + 1 && m.stage_number <= (index * 3) + 3
              )

              return (
                <div key={phase.id} className="flex flex-col items-center text-center max-w-[200px]">
                  {/* Milestone marker above if exists */}
                  {nearbyMilestone && (
                    <div className="mb-4">
                      <div className="w-12 h-12 rounded-full border-4 border-yellow-400 bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow-lg mb-2">
                        {(() => {
                          const IconComponent = getMilestoneIcon(nearbyMilestone.icon)
                          return <IconComponent className="h-6 w-6 text-yellow-600" />
                        })()}
                      </div>
                      <div className="text-xs text-yellow-700 font-medium">{nearbyMilestone.title}</div>
                    </div>
                  )}

                  {/* Phase circle */}
                  <div className={cn(
                    "relative z-10 w-16 h-16 rounded-full border-4 flex items-center justify-center text-2xl shadow-lg mb-4",
                    phase.color === 'blue' && "bg-blue-500 border-blue-500 text-white",
                    phase.color === 'purple' && "bg-purple-500 border-purple-500 text-white", 
                    phase.color === 'green' && "bg-green-500 border-green-500 text-white"
                  )}>
                    {phase.icon}
                  </div>

                  {/* Phase info */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-gray-800">{phase.name}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {phase.description}
                    </p>
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{phase.duration_weeks} weeks</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {phase.stage_range}
                    </Badge>
                  </div>

                  {/* Connecting arrow */}
                  {index < timelinePhases.length - 1 && (
                    <div className="absolute top-16 left-full w-8 flex justify-center z-0">
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}