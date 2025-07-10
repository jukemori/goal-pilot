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

  // Fetch roadmap data to create high-level roadmap view
  const { data: roadmapData, isLoading, error } = useQuery({
    queryKey: ['roadmap-visual', roadmapId],
    queryFn: async () => {
      console.log('Fetching roadmap for visual view:', roadmapId)
      
      // Get roadmap with AI plan and goal details
      const { data: roadmap, error: roadmapError } = await supabase
        .from('roadmaps')
        .select(`
          ai_generated_plan,
          milestones,
          goals!inner (
            title,
            description,
            target_date,
            daily_time_commitment
          )
        `)
        .eq('id', roadmapId)
        .single()

      if (roadmapError) {
        console.error('Error fetching roadmap:', roadmapError)
        throw roadmapError
      }

      if (!roadmap?.ai_generated_plan) {
        return { roadmapPhases: [], milestones: [], goal: roadmap.goals }
      }

      const aiPlan = roadmap.ai_generated_plan as { 
        overview: string;
        phases: Array<{ 
          title: string;
          description: string;
          duration_weeks?: number; 
          skills_to_learn?: string[];
          learning_objectives?: string[];
          outcomes?: string[];
        }>;
        total_hours_required: number;
        estimated_completion_date: string;
      }
      
      const milestones = (roadmap.milestones as unknown as Milestone[]) || []
      
      // Create high-level roadmap phases based on actual goal content
      // Not grouping stages - creating independent roadmap view
      const roadmapPhases = []
      
      // Create 4-5 major roadmap phases based on the goal journey
      if (aiPlan.phases && aiPlan.phases.length > 0) {
        const totalDuration = aiPlan.phases.reduce((sum, p) => sum + (p.duration_weeks || 0), 0)
        
        // Phase 1: Foundation (first 20% of journey)
        roadmapPhases.push({
          id: 'roadmap-1',
          name: 'Foundation Phase',
          icon: '🏗️',
          description: `Build essential ${roadmap.goals.title.toLowerCase()} fundamentals and establish learning habits`,
          duration: Math.ceil(totalDuration * 0.2),
          focus: aiPlan.phases[0]?.learning_objectives?.slice(0, 2) || ['Core basics', 'Initial concepts']
        })
        
        // Phase 2: Skill Development (next 30%)
        roadmapPhases.push({
          id: 'roadmap-2', 
          name: 'Skill Building',
          icon: '📈',
          description: `Develop practical ${roadmap.goals.title.toLowerCase()} skills through hands-on practice`,
          duration: Math.ceil(totalDuration * 0.3),
          focus: aiPlan.phases[Math.floor(aiPlan.phases.length * 0.3)]?.skills_to_learn?.slice(0, 2) || ['Core skills', 'Practical application']
        })
        
        // Phase 3: Advanced Learning (next 30%)
        roadmapPhases.push({
          id: 'roadmap-3',
          name: 'Advanced Development', 
          icon: '🚀',
          description: `Master complex ${roadmap.goals.title.toLowerCase()} concepts and tackle real challenges`,
          duration: Math.ceil(totalDuration * 0.3),
          focus: aiPlan.phases[Math.floor(aiPlan.phases.length * 0.6)]?.outcomes?.slice(0, 2) || ['Advanced techniques', 'Complex scenarios']
        })
        
        // Phase 4: Mastery (final 20%)
        roadmapPhases.push({
          id: 'roadmap-4',
          name: 'Mastery & Application',
          icon: '🎯',
          description: `Achieve ${roadmap.goals.title.toLowerCase()} proficiency and apply skills confidently`,
          duration: Math.ceil(totalDuration * 0.2),
          focus: aiPlan.phases[aiPlan.phases.length - 1]?.outcomes?.slice(0, 2) || ['Professional application', 'Goal achievement']
        })
      }

      return { 
        roadmapPhases, 
        milestones,
        goal: roadmap.goals,
        overview: aiPlan.overview,
        totalHours: aiPlan.total_hours_required,
        completionDate: aiPlan.estimated_completion_date
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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

  if (!roadmapData || !roadmapData.roadmapPhases || roadmapData.roadmapPhases.length === 0) {
    return <div className="text-center py-8 text-gray-500">
      <p>No roadmap found</p>
      <p className="text-sm mt-2">Roadmap will be created automatically.</p>
    </div>
  }

  const { roadmapPhases, milestones, goal, overview, totalHours, completionDate } = roadmapData
  const totalPhases = roadmapPhases.length

  return (
    <div className="space-y-6">
      {/* Roadmap Header */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <MapPin className="h-6 w-6 text-primary" />
            Roadmap to {goal?.title || 'Your Goal'}
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            {overview || 'Your personalized roadmap showing the key phases to achieve your goal.'}
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-600 mt-4">
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
              <span>Complete by {completionDate ? new Date(completionDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'TBD'}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Vertical Roadmap */}
      <div className="relative">
        {/* Roadmap line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        <div 
          className="absolute left-8 top-0 w-0.5 bg-gradient-to-b from-primary to-primary/60 transition-all duration-1000"
          style={{ height: `${(1 / totalPhases) * 100}%` }}
        ></div>
        
        <div className="space-y-8">
          {roadmapPhases.map((phase, index) => {
            // Find milestone that matches this phase position
            const phaseMilestone = milestones?.find(m => {
              const phasePosition = (index + 1) / totalPhases
              const milestonePosition = m.stage_number / 6 // Assuming 6 total stages
              return Math.abs(phasePosition - milestonePosition) < 0.2
            })

            return (
              <div key={phase.id}>
                {/* Milestone marker (if exists) */}
                {phaseMilestone && (
                  <div className="relative flex items-start gap-6 mb-6">
                    <div className="relative z-10 w-12 h-12 rounded-full border-2 border-orange-300 bg-orange-100 flex items-center justify-center shadow-sm">
                      {(() => {
                        const IconComponent = getMilestoneIcon(phaseMilestone.icon)
                        return <IconComponent className="h-5 w-5 text-orange-600" />
                      })()}
                    </div>
                    <Card className="flex-1 border-orange-200 bg-orange-50">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-orange-800 mb-1">🎯 {phaseMilestone.title}</h4>
                            <p className="text-orange-700 text-xs">{phaseMilestone.description}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs bg-orange-200 text-orange-800">
                            Milestone
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  </div>
                )}

                {/* Roadmap Phase */}
                <div className="relative flex items-start gap-6">
                  {/* Roadmap dot */}
                  <div className="relative z-10 w-16 h-16 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center text-2xl shadow-sm">
                    {phase.icon}
                  </div>

                  {/* Phase card */}
                  <Card className="flex-1 border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="pb-4">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2 text-gray-900">{phase.name}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {phase.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Clock className="h-4 w-4" />
                            <span>{phase.duration} weeks</span>
                          </div>
                        </div>

                        {/* Focus areas */}
                        {phase.focus && phase.focus.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Key Focus Areas:</h4>
                            <div className="flex flex-wrap gap-2">
                              {phase.focus.map((item, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Arrow to next phase */}
                  {index < roadmapPhases.length - 1 && (
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