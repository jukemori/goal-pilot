'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GoalTemplate, DIFFICULTY_LEVELS } from '@/lib/templates/goal-templates'
import { 
  Clock, 
  Calendar, 
  Target,
  Code,
  Code2,
  Zap,
  MessageCircle,
  Briefcase,
  Activity,
  Trophy,
  TrendingUp,
  Mic,
  Camera,
  Music,
  BarChart3,
  Palette,
  GraduationCap
} from 'lucide-react'

// Icon mapping for dynamic icon rendering
const ICON_MAP = {
  Code,
  Code2,
  Zap,
  MessageCircle,
  Briefcase,
  Activity,
  Trophy,
  TrendingUp,
  Mic,
  Camera,
  Music,
  BarChart3,
  Palette,
  GraduationCap,
  Target
} as const

interface TemplateCardProps {
  template: GoalTemplate
  onUseTemplate: (template: GoalTemplate) => void
}

export function TemplateCard({ template, onUseTemplate }: TemplateCardProps) {
  const IconComponent = ICON_MAP[template.icon as keyof typeof ICON_MAP] || Target
  const difficultyConfig = DIFFICULTY_LEVELS[template.difficulty]
  
  const getDifficultyBadgeVariant = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'default'
      case 'intermediate':
        return 'secondary'
      case 'advanced':
        return 'destructive'
      default:
        return 'default'
    }
  }

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 border-gray-200 shadow-sm group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <IconComponent className="h-6 w-6 text-primary" />
          </div>
          <Badge variant={getDifficultyBadgeVariant(template.difficulty)} className="text-xs">
            {difficultyConfig.label}
          </Badge>
        </div>
        <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
          {template.title}
        </CardTitle>
        <CardDescription className="text-gray-600 line-clamp-2">
          {template.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Duration and Time Info */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>{template.default_time_commitment} min/day</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>~{template.estimated_duration_weeks} weeks</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-gray-400" />
            <span>{Object.values(template.default_weekly_schedule).filter(Boolean).length} days/week</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              +{template.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Starting Level Preview */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Perfect if you:</h4>
          <p className="text-xs text-gray-600 line-clamp-2">
            {template.suggested_current_levels[0]}
          </p>
        </div>

        {/* Sample Milestones Preview */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">You'll Learn:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            {template.sample_milestones.slice(0, 2).map((milestone, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span className="line-clamp-1">{milestone}</span>
              </li>
            ))}
            {template.sample_milestones.length > 2 && (
              <li className="text-gray-400 text-xs">
                +{template.sample_milestones.length - 2} more milestones...
              </li>
            )}
          </ul>
        </div>

        {/* Use Template Button */}
        <Button 
          onClick={() => onUseTemplate(template)}
          className="w-full bg-primary hover:bg-primary/90 shadow-sm"
          size="sm"
        >
          Use This Template
        </Button>
      </CardContent>
    </Card>
  )
}