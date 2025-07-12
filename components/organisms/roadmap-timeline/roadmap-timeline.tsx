'use client'

import React from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Target, CheckCircle2, MapPin, BookOpen, Zap, Rocket, Award } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface RoadmapTimelineProps {
  roadmapId: string
  goalId: string
}


// Generate phase name based on stage content and phase type
const generatePhaseName = (stageTitle: string, phaseType: string, goalTitle: string) => {
  // Extract key words from goal title to understand the domain
  const goalWords = goalTitle.toLowerCase().split(' ')
  
  // Find the main subject/domain from goal title (usually the main noun)
  const domain = goalWords.find(word => 
    word.length > 3 && 
    !['learn', 'master', 'become', 'achieve', 'improve', 'develop', 'build', 'get', 'start'].includes(word)
  ) || goalWords[goalWords.length - 1] || 'skill'
  
  // Capitalize domain for display
  const capitalizedDomain = domain.charAt(0).toUpperCase() + domain.slice(1)
  
  // Generate appropriate phase names based on type
  switch (phaseType) {
    case 'foundation':
      return `Build ${capitalizedDomain} Foundation`
    case 'building':
      return `Develop Core ${capitalizedDomain} Skills`
    case 'advanced':
      return `Master Advanced ${capitalizedDomain}`
    case 'mastery':
      return `Achieve ${capitalizedDomain} Excellence`
    default:
      return `${capitalizedDomain} Progress`
  }
}

// Create phase description
const createPhaseDescription = (phaseName: string, goalTitle: string) => {
  const name = phaseName.toLowerCase()
  const goal = goalTitle.toLowerCase()
  
  if (name.includes('foundation') || name.includes('basic')) {
    return `Build essential ${goal} fundamentals and establish consistent practice habits`
  } else if (name.includes('develop') || name.includes('build') || name.includes('core')) {
    return `Develop practical ${goal} skills through focused practice and application`
  } else if (name.includes('advanced') || name.includes('complex')) {
    return `Master advanced ${goal} techniques and tackle challenging scenarios`
  } else if (name.includes('mastery') || name.includes('achieve') || name.includes('peak')) {
    return `Achieve ${goal} mastery and maintain excellence in your practice`
  } else {
    return `Continue progressing in your ${goal} journey with focused practice`
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
        roadmap_phases?: Array<{
          id: string;
          name: string;
          description: string;
          duration_percentage: number;
          key_activities: string[];
          specific_goals: string[];
          success_metrics: string[];
          tools_needed: string[];
        }>;
        total_hours_required: number;
        estimated_completion_date: string;
      }
      
      
      // Generate roadmap phases from actual AI stages data
      
      // Create 4 high-level roadmap phases by grouping the detailed stages
      const roadmapPhases = []
      const stagesPerPhase = Math.ceil(aiPlan.phases.length / 4)
      
      for (let i = 0; i < 4; i++) {
        const startIdx = i * stagesPerPhase
        const endIdx = Math.min(startIdx + stagesPerPhase, aiPlan.phases.length)
        const phaseStages = aiPlan.phases.slice(startIdx, endIdx)
        
        if (phaseStages.length === 0) break
        
        // Calculate duration for this roadmap phase
        const phaseDuration = phaseStages.reduce((sum, stage) => sum + (stage.duration_weeks || 0), 0)
        
        // Generate phase name based on position and content
        let phaseName = ''
        let phaseIconComponent = BookOpen // Default icon
        const firstStage = phaseStages[0]
        
        if (i === 0) {
          phaseName = generatePhaseName(firstStage.title, 'foundation', roadmap.goals.title)
          phaseIconComponent = BookOpen
        } else if (i === 3 || i === Math.floor(4 * 0.75)) {
          phaseName = generatePhaseName(firstStage.title, 'mastery', roadmap.goals.title)
          phaseIconComponent = Award
        } else if (i === 1) {
          phaseName = generatePhaseName(firstStage.title, 'building', roadmap.goals.title)
          phaseIconComponent = Zap
        } else {
          phaseName = generatePhaseName(firstStage.title, 'advanced', roadmap.goals.title)
          phaseIconComponent = Rocket
        }
        
        // Extract key activities from stages
        const keyActivities: string[] = []
        phaseStages.forEach(stage => {
          if (stage.skills_to_learn && stage.skills_to_learn.length > 0) {
            keyActivities.push(...stage.skills_to_learn.slice(0, 1))
          }
        })
        
        // Extract success metrics from stages
        const successMetrics: string[] = []
        phaseStages.forEach(stage => {
          if (stage.outcomes && stage.outcomes.length > 0) {
            successMetrics.push(...stage.outcomes.slice(0, 1))
          }
        })
        
        roadmapPhases.push({
          id: `roadmap-${i + 1}`,
          name: phaseName,
          iconComponent: phaseIconComponent,
          description: createPhaseDescription(phaseName, roadmap.goals.title),
          duration: phaseDuration,
          key_activities: keyActivities.slice(0, 2), // Max 2 activities
          success_metrics: successMetrics.slice(0, 1) // Max 1 success metric
        })
      }

      return { 
        roadmapPhases, 
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

  const { roadmapPhases, goal, overview, totalHours, completionDate } = roadmapData
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
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        <div 
          className="absolute left-6 top-0 w-0.5 bg-gradient-to-b from-primary to-primary/60 transition-all duration-1000"
          style={{ height: `${(1 / totalPhases) * 100}%` }}
        ></div>
        
        <div className="space-y-4">
          {roadmapPhases.map((phase, index) => (
            <div key={phase.id} className="relative flex items-start gap-4">
              {/* Roadmap dot */}
              <div className="relative z-10 w-12 h-12 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center shadow-sm">
                {React.createElement(phase.iconComponent, { className: "h-6 w-6 text-primary" })}
              </div>

              {/* Compact Phase card */}
              <div className="flex-1 bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-base font-semibold text-gray-900">{phase.name}</h3>
                  <span className="text-xs text-gray-500">{phase.duration} weeks</span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{phase.description}</p>

                {/* Key Activities - Simplified */}
                {phase.key_activities && phase.key_activities.length > 0 && (
                  <div className="space-y-1">
                    {phase.key_activities.slice(0, 2).map((activity: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-sm text-gray-700">{activity}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Success Indicator - Just one key metric */}
                {phase.success_metrics && phase.success_metrics.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded px-2 py-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{phase.success_metrics[0]}</span>
                  </div>
                )}
              </div>

              {/* Connector to next phase */}
              {index < roadmapPhases.length - 1 && (
                <div className="absolute left-6 top-12 h-full w-0.5 bg-gray-200"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}