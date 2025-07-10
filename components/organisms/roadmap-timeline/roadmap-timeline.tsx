'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

        // Calculate total duration and create high-level summary
        const totalWeeks = groupPhases.reduce((sum: number, p: { duration_weeks?: number }) => sum + (p.duration_weeks || 0), 0)
        const allSkills = groupPhases.flatMap((p: { skills_to_learn?: string[] }) => p.skills_to_learn || [])
        const keyOutcomes = allSkills.slice(0, 2) // Just 2 high-level outcomes
        
        timelinePhases.push({
          id: `timeline-phase-${i + 1}`,
          name: phaseName,
          icon: phaseIcon,
          color: phaseColor,
          duration_weeks: totalWeeks,
          key_skills: keyOutcomes,
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

      {/* Timeline Progress Bar */}
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-200 rounded-full"></div>
        <div 
          className="absolute left-8 top-0 w-1 bg-gradient-to-b from-primary to-green-500 transition-all duration-1000 rounded-full"
          style={{ height: `${(1 / totalPhases) * 100}%` }}
        ></div>
        
        <div className="space-y-12">
          {timelinePhases.map((phase, index) => {
            // Check if there's a milestone near this phase
            const nearbyMilestone = timelineMilestones?.find(m => 
              m.stage_number >= (index * 3) + 1 && m.stage_number <= (index * 3) + 3
            )

            return (
              <div key={phase.id}>
                {/* Milestone marker (if exists) */}
                {nearbyMilestone && (
                  <div className="relative flex items-start gap-8 mb-8">
                    <div className="relative z-10 w-20 h-20 rounded-full border-4 border-yellow-400 bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow-lg">
                      {(() => {
                        const IconComponent = getMilestoneIcon(nearbyMilestone.icon)
                        return <IconComponent className="h-10 w-10 text-yellow-600" />
                      })()}
                    </div>
                    <Card className="flex-1 border-yellow-200 bg-gradient-to-r from-yellow-50 to-yellow-100 shadow-md">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-yellow-800 mb-2">🏆 {nearbyMilestone.title}</h4>
                            <p className="text-yellow-700 text-sm mb-3">{nearbyMilestone.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {nearbyMilestone.skills_validated.map((skill, skillIndex) => (
                                <Badge key={skillIndex} className="text-xs bg-yellow-200 text-yellow-800">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Badge className="bg-yellow-500 text-white text-xs">
                            Key Milestone
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* High-level Timeline Phase */}
                <div className="relative flex items-start gap-8">
                  {/* Large Timeline dot with icon */}
                  <div className={cn(
                    "relative z-10 w-16 h-16 rounded-full border-4 flex items-center justify-center text-2xl shadow-lg",
                    phase.color === 'blue' && "bg-blue-500 border-blue-500 text-white",
                    phase.color === 'purple' && "bg-purple-500 border-purple-500 text-white", 
                    phase.color === 'green' && "bg-green-500 border-green-500 text-white"
                  )}>
                    {phase.icon}
                  </div>

                  {/* Timeline Phase card */}
                  <Card className={cn(
                    "flex-1 transition-all duration-300 hover:shadow-xl border-2",
                    phase.color === 'blue' && "border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100",
                    phase.color === 'purple' && "border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100",
                    phase.color === 'green' && "border-green-200 bg-gradient-to-r from-green-50 to-green-100"
                  )}>
                    <CardContent className="p-8">
                      <div className="space-y-6">
                        {/* Phase header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-3 text-gray-800">{phase.name}</h3>
                            <p className="text-gray-600 text-base leading-relaxed mb-4">
                              {phase.description.length > 200 
                                ? phase.description.substring(0, 200) + '...' 
                                : phase.description}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-sm px-3 py-1">
                            {phase.stage_range}
                          </Badge>
                        </div>

                        {/* Duration */}
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-5 w-5" />
                          <span className="text-lg font-medium">{phase.duration_weeks} weeks total</span>
                        </div>

                        {/* Key Outcomes Preview */}
                        {phase.key_skills && phase.key_skills.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-3 text-gray-700">What You'll Achieve:</h4>
                            <div className="flex flex-wrap gap-2">
                              {phase.key_skills.map((outcome: string, outcomeIndex: number) => (
                                <Badge key={outcomeIndex} variant="secondary" className={cn(
                                  "text-sm px-3 py-1",
                                  phase.color === 'blue' && "bg-blue-100 text-blue-800",
                                  phase.color === 'purple' && "bg-purple-100 text-purple-800",
                                  phase.color === 'green' && "bg-green-100 text-green-800"
                                )}>
                                  {outcome}
                                </Badge>
                              ))}
                              <Badge variant="outline" className="text-xs px-2 py-1 text-gray-500">
                                {phase.stage_range}
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Arrow to next phase */}
                  {index < timelinePhases.length - 1 && (
                    <div className="absolute left-8 -bottom-6 z-10 w-16 flex justify-center">
                      <ArrowRight className="h-6 w-6 text-gray-400" />
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