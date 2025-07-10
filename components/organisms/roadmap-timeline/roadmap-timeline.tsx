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

// Get appropriate icon for phase name
const getPhaseIcon = (name: string) => {
  const nameLower = name.toLowerCase()
  if (nameLower.includes('foundation') || nameLower.includes('basic') || nameLower.includes('beginner')) return '🏗️'
  if (nameLower.includes('build') || nameLower.includes('develop')) return '💪'
  if (nameLower.includes('advanced') || nameLower.includes('complex')) return '🚀'
  if (nameLower.includes('master') || nameLower.includes('expert')) return '🎯'
  if (nameLower.includes('strength')) return '💪'
  if (nameLower.includes('conversation') || nameLower.includes('speak')) return '💬'
  if (nameLower.includes('code') || nameLower.includes('program')) return '💻'
  return '📈'
}

// Create fitness-specific roadmap
const createFitnessRoadmap = (totalDuration: number, _phases: any[]) => {
  return [
    {
      id: 'roadmap-1',
      name: 'Build Foundation Strength',
      icon: '🏃',
      description: 'Establish exercise habits and build base fitness level',
      duration: Math.ceil(totalDuration * 0.25),
      key_activities: [
        'Complete bodyweight exercises 3x per week',
        'Walk or jog for 30 minutes daily',
        'Practice proper form for basic movements'
      ],
      specific_goals: [
        'Exercise consistently for 4 weeks',
        'Complete a full workout without excessive fatigue',
        'Master proper form for squats, push-ups, and planks'
      ],
      success_metrics: [
        'Can do 20 push-ups with good form',
        'Can hold plank for 60 seconds',
        'Completed 12+ workouts this phase'
      ],
      tools_needed: [
        'Fitness tracking app (MyFitnessPal, Strava)',
        'Yoga mat',
        'Water bottle',
        'Comfortable workout clothes'
      ]
    },
    {
      id: 'roadmap-2',
      name: 'Develop Core Fitness',
      icon: '💪',
      description: 'Build strength, endurance, and flexibility through structured training',
      duration: Math.ceil(totalDuration * 0.35),
      key_activities: [
        'Follow structured workout program 4-5x per week',
        'Add weight training or resistance bands',
        'Include 2 cardio sessions weekly'
      ],
      specific_goals: [
        'Increase strength in all major muscle groups',
        'Improve cardiovascular endurance',
        'Develop consistent workout schedule'
      ],
      success_metrics: [
        'Lift 50% more weight than starting point',
        'Run 5K without stopping',
        'Complete 20+ workouts this phase'
      ],
      tools_needed: [
        'Gym membership or home weights',
        'Resistance bands',
        'Heart rate monitor',
        'Workout journal or app'
      ]
    },
    {
      id: 'roadmap-3',
      name: 'Advanced Training',
      icon: '🚀',
      description: 'Push limits with advanced techniques and specialized training',
      duration: Math.ceil(totalDuration * 0.25),
      key_activities: [
        'Implement progressive overload principles',
        'Try advanced workout techniques (HIIT, supersets)',
        'Focus on weak points and imbalances'
      ],
      specific_goals: [
        'Master advanced exercise variations',
        'Achieve specific performance goals',
        'Optimize nutrition for performance'
      ],
      success_metrics: [
        'Hit all target PRs (personal records)',
        'Complete advanced workout routines',
        'Body composition at target levels'
      ],
      tools_needed: [
        'Advanced training program',
        'Nutrition tracking tools',
        'Recovery tools (foam roller, etc.)',
        'Progress tracking spreadsheet'
      ]
    },
    {
      id: 'roadmap-4',
      name: 'Achieve Peak Performance',
      icon: '🏆',
      description: 'Reach and maintain your fitness goals',
      duration: Math.ceil(totalDuration * 0.15),
      key_activities: [
        'Maintain consistent training schedule',
        'Fine-tune nutrition and recovery',
        'Set new challenging goals'
      ],
      specific_goals: [
        'Achieve all original fitness targets',
        'Establish sustainable long-term routine',
        'Help others on their fitness journey'
      ],
      success_metrics: [
        'All fitness goals achieved',
        'Consistent performance maintained',
        'Lifestyle fully transformed'
      ],
      tools_needed: [
        'Maintenance workout plan',
        'Community or workout partners',
        'Long-term tracking system'
      ]
    }
  ]
}

// Create language learning roadmap
const createLanguageRoadmap = (totalDuration: number, phases: any[], language: string) => {
  const lang = language.includes('spanish') ? 'Spanish' : language.includes('french') ? 'French' : 'the language'
  return [
    {
      id: 'roadmap-1',
      name: 'Master Basic Communication',
      icon: '🗣️',
      description: `Build foundation for ${lang} with essential phrases and grammar`,
      duration: Math.ceil(totalDuration * 0.25),
      key_activities: [
        'Study 30 minutes daily with language app',
        'Practice pronunciation with audio lessons',
        'Learn 20 new words per week'
      ],
      specific_goals: [
        'Master 500 most common words',
        'Hold 5-minute basic conversations',
        'Understand simple written texts'
      ],
      success_metrics: [
        'Complete beginner course level',
        'Score 80%+ on basic grammar tests',
        'Have first conversation with native speaker'
      ],
      tools_needed: [
        'Duolingo or Babbel subscription',
        'Flashcard app (Anki)',
        'Language exchange app (HelloTalk)',
        'Grammar reference book'
      ]
    },
    {
      id: 'roadmap-2',
      name: 'Conversational Fluency',
      icon: '💬',
      description: 'Develop ability to discuss everyday topics naturally',
      duration: Math.ceil(totalDuration * 0.35),
      key_activities: [
        'Practice speaking 3x per week with tutors',
        'Watch shows with subtitles daily',
        'Write journal entries in target language'
      ],
      specific_goals: [
        'Discuss daily life, hobbies, and opinions',
        'Understand native speakers at normal speed',
        'Read news articles and simple books'
      ],
      success_metrics: [
        'Hold 30-minute conversations comfortably',
        'Understand 80% of TV shows',
        'Complete intermediate certification'
      ],
      tools_needed: [
        'iTalki or Preply for tutors',
        'Netflix with Language Learning extension',
        'Graded readers',
        'Grammar workbook'
      ]
    },
    {
      id: 'roadmap-3',
      name: 'Advanced Proficiency',
      icon: '📚',
      description: 'Master complex grammar and specialized vocabulary',
      duration: Math.ceil(totalDuration * 0.25),
      key_activities: [
        'Read native-level books and articles',
        'Participate in discussion groups',
        'Study advanced grammar patterns'
      ],
      specific_goals: [
        'Express complex ideas fluently',
        'Understand cultural nuances',
        'Use language professionally'
      ],
      success_metrics: [
        'Pass advanced proficiency test',
        'Read novels without dictionary',
        'Give presentations in target language'
      ],
      tools_needed: [
        'Native media sources',
        'Advanced grammar guides',
        'Professional vocabulary resources',
        'Language meetup groups'
      ]
    },
    {
      id: 'roadmap-4',
      name: 'Near-Native Mastery',
      icon: '🎯',
      description: 'Achieve natural, effortless communication',
      duration: Math.ceil(totalDuration * 0.15),
      key_activities: [
        'Immerse in native content exclusively',
        'Refine accent and intonation',
        'Master idiomatic expressions'
      ],
      specific_goals: [
        'Speak without conscious translation',
        'Understand all dialects and registers',
        'Write professionally'
      ],
      success_metrics: [
        'Native speakers think you are fluent',
        'Can work entirely in target language',
        'Score C2 on proficiency exam'
      ],
      tools_needed: [
        'Native environment/immersion',
        'Professional contexts',
        'Specialized dictionaries'
      ]
    }
  ]
}

// Create programming roadmap
const createProgrammingRoadmap = (totalDuration: number, _phases: any[]) => {
  return [
    {
      id: 'roadmap-1',
      name: 'Code Foundations',
      icon: '💻',
      description: 'Master programming basics and development environment',
      duration: Math.ceil(totalDuration * 0.25),
      key_activities: [
        'Complete daily coding challenges',
        'Build simple projects following tutorials',
        'Set up professional development environment'
      ],
      specific_goals: [
        'Write clean, working code independently',
        'Understand core programming concepts',
        'Complete 10+ small projects'
      ],
      success_metrics: [
        'Solve 50 coding challenges',
        'Build 3 projects without tutorials',
        'Comfortable with Git and terminal'
      ],
      tools_needed: [
        'VS Code or preferred IDE',
        'GitHub account',
        'Online course platform',
        'Documentation references'
      ]
    },
    {
      id: 'roadmap-2',
      name: 'Build Real Applications',
      icon: '🛠️',
      description: 'Create functional applications and learn frameworks',
      duration: Math.ceil(totalDuration * 0.35),
      key_activities: [
        'Build full-stack applications',
        'Learn popular frameworks/libraries',
        'Implement databases and APIs'
      ],
      specific_goals: [
        'Deploy 3 working applications',
        'Master a web framework',
        'Understand system architecture'
      ],
      success_metrics: [
        'Apps have real users',
        'Portfolio with 5+ projects',
        'Can build apps from scratch'
      ],
      tools_needed: [
        'Cloud hosting (Vercel, Heroku)',
        'Database service',
        'API testing tools',
        'Framework documentation'
      ]
    },
    {
      id: 'roadmap-3',
      name: 'Advanced Development',
      icon: '🚀',
      description: 'Master advanced patterns and best practices',
      duration: Math.ceil(totalDuration * 0.25),
      key_activities: [
        'Study design patterns and architecture',
        'Contribute to open source',
        'Build complex, scalable systems'
      ],
      specific_goals: [
        'Architect large applications',
        'Write production-quality code',
        'Mentor other developers'
      ],
      success_metrics: [
        'Lead a significant project',
        'Open source contributions merged',
        'Code passes senior review'
      ],
      tools_needed: [
        'Architecture resources',
        'Testing frameworks',
        'CI/CD pipelines',
        'Code review tools'
      ]
    },
    {
      id: 'roadmap-4',
      name: 'Professional Mastery',
      icon: '🎯',
      description: 'Work at professional developer level',
      duration: Math.ceil(totalDuration * 0.15),
      key_activities: [
        'Lead development projects',
        'Stay current with technology',
        'Share knowledge through content'
      ],
      specific_goals: [
        'Work as professional developer',
        'Build innovative solutions',
        'Contribute to tech community'
      ],
      success_metrics: [
        'Employed or freelancing successfully',
        'Recognized expertise',
        'Teaching others'
      ],
      tools_needed: [
        'Professional network',
        'Continuous learning resources',
        'Industry connections'
      ]
    }
  ]
}

// Generic roadmap for other goals
const createGenericRoadmap = (totalDuration: number, phases: any[], goalTitle: string) => {
  return [
    {
      id: 'roadmap-1',
      name: 'Build Foundation',
      icon: '🏗️',
      description: `Establish core ${goalTitle} fundamentals and habits`,
      duration: Math.ceil(totalDuration * 0.25),
      key_activities: phases[0]?.skills_to_learn?.slice(0, 3) || [
        'Learn fundamental concepts',
        'Practice basic techniques daily',
        'Build consistent routine'
      ],
      specific_goals: phases[0]?.learning_objectives?.slice(0, 3) || [
        'Master basic skills',
        'Establish regular practice',
        'Complete beginner milestones'
      ],
      success_metrics: phases[0]?.outcomes?.slice(0, 3) || [
        'Consistent daily practice achieved',
        'Basic competency demonstrated',
        'Ready for intermediate level'
      ],
      tools_needed: ['Beginner resources', 'Practice materials', 'Progress tracking system']
    },
    {
      id: 'roadmap-2',
      name: 'Develop Core Skills',
      icon: '📈',
      description: `Build practical ${goalTitle} abilities through focused practice`,
      duration: Math.ceil(totalDuration * 0.35),
      key_activities: phases[Math.floor(phases.length * 0.3)]?.skills_to_learn?.slice(0, 3) || [
        'Practice intermediate techniques',
        'Apply skills in real scenarios',
        'Get feedback and iterate'
      ],
      specific_goals: phases[Math.floor(phases.length * 0.3)]?.learning_objectives?.slice(0, 3) || [
        'Achieve intermediate proficiency',
        'Complete practical projects',
        'Build confidence'
      ],
      success_metrics: phases[Math.floor(phases.length * 0.3)]?.outcomes?.slice(0, 3) || [
        'Intermediate goals achieved',
        'Can work independently',
        'Consistent improvement shown'
      ],
      tools_needed: ['Intermediate resources', 'Practice opportunities', 'Feedback systems']
    },
    {
      id: 'roadmap-3',
      name: 'Advanced Mastery',
      icon: '🚀',
      description: `Master complex ${goalTitle} concepts and techniques`,
      duration: Math.ceil(totalDuration * 0.25),
      key_activities: phases[Math.floor(phases.length * 0.7)]?.skills_to_learn?.slice(0, 3) || [
        'Master advanced techniques',
        'Tackle complex challenges',
        'Develop personal style'
      ],
      specific_goals: phases[Math.floor(phases.length * 0.7)]?.learning_objectives?.slice(0, 3) || [
        'Achieve advanced proficiency',
        'Complete complex projects',
        'Develop expertise'
      ],
      success_metrics: phases[Math.floor(phases.length * 0.7)]?.outcomes?.slice(0, 3) || [
        'Advanced skills demonstrated',
        'Complex goals achieved',
        'Recognition earned'
      ],
      tools_needed: ['Advanced resources', 'Challenge opportunities', 'Expert guidance']
    },
    {
      id: 'roadmap-4',
      name: 'Goal Achievement',
      icon: '🎯',
      description: `Achieve mastery and maintain ${goalTitle} excellence`,
      duration: Math.ceil(totalDuration * 0.15),
      key_activities: phases[phases.length - 1]?.skills_to_learn?.slice(0, 3) || [
        'Refine and perfect skills',
        'Share knowledge with others',
        'Set new ambitious goals'
      ],
      specific_goals: phases[phases.length - 1]?.learning_objectives?.slice(0, 3) || [
        'Achieve original goal',
        'Establish ongoing practice',
        'Inspire others'
      ],
      success_metrics: phases[phases.length - 1]?.outcomes?.slice(0, 3) || [
        'Goal fully achieved',
        'Sustainable practice established',
        'Ready for next challenge'
      ],
      tools_needed: ['Mastery resources', 'Community connections', 'Teaching opportunities']
    }
  ]
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
      
      const milestones = (roadmap.milestones as unknown as Milestone[]) || []
      
      // Use AI-generated roadmap phases if available, otherwise create default ones
      let roadmapPhases = []
      
      if (aiPlan.roadmap_phases && aiPlan.roadmap_phases.length > 0) {
        // Use the detailed roadmap phases from AI
        const totalDuration = aiPlan.phases.reduce((sum, p) => sum + (p.duration_weeks || 0), 0)
        roadmapPhases = aiPlan.roadmap_phases.map(phase => ({
          ...phase,
          icon: getPhaseIcon(phase.name),
          duration: Math.ceil(totalDuration * (phase.duration_percentage / 100))
        }))
      } else {
        // Fallback: Create smart roadmap phases based on goal type
        const goalTitle = roadmap.goals.title.toLowerCase()
        const totalDuration = aiPlan.phases.reduce((sum, p) => sum + (p.duration_weeks || 0), 0)
        
        // Detect goal type and create appropriate phases
        if (goalTitle.includes('fitness') || goalTitle.includes('exercise') || goalTitle.includes('workout') || goalTitle.includes('gym')) {
          roadmapPhases = createFitnessRoadmap(totalDuration, aiPlan.phases)
        } else if (goalTitle.includes('language') || goalTitle.includes('spanish') || goalTitle.includes('english') || goalTitle.includes('french')) {
          roadmapPhases = createLanguageRoadmap(totalDuration, aiPlan.phases, goalTitle)
        } else if (goalTitle.includes('programming') || goalTitle.includes('coding') || goalTitle.includes('development')) {
          roadmapPhases = createProgrammingRoadmap(totalDuration, aiPlan.phases)
        } else {
          roadmapPhases = createGenericRoadmap(totalDuration, aiPlan.phases, goalTitle)
        }
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

                        {/* Key Activities */}
                        {phase.key_activities && phase.key_activities.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">What You'll Do:</h4>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                              {phase.key_activities.map((activity: string, idx: number) => (
                                <li key={idx}>{activity}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Specific Goals */}
                        {phase.specific_goals && phase.specific_goals.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Goals for This Phase:</h4>
                            <div className="flex flex-wrap gap-2">
                              {phase.specific_goals.map((goal: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {goal}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Success Metrics */}
                        {phase.success_metrics && phase.success_metrics.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">How You'll Know You're Done:</h4>
                            <ul className="list-check list-inside text-sm text-gray-600 space-y-1">
                              {phase.success_metrics.map((metric: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{metric}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Tools Needed */}
                        {phase.tools_needed && phase.tools_needed.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Tools & Resources:</h4>
                            <div className="flex flex-wrap gap-2">
                              {phase.tools_needed.map((tool: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tool}
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