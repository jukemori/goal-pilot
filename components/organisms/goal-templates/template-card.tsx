'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
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
  GraduationCap,
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
  Target,
} as const

interface TemplateCardProps {
  template: GoalTemplate
  onUseTemplate: (template: GoalTemplate) => void
}

export function TemplateCard({ template, onUseTemplate }: TemplateCardProps) {
  const IconComponent =
    ICON_MAP[template.icon as keyof typeof ICON_MAP] || Target
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
    <Card className="group h-full border-gray-200 shadow-sm transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="mb-2 flex items-start justify-between">
          <div className="bg-primary/10 group-hover:bg-primary/20 rounded-lg p-2 transition-colors">
            <IconComponent className="text-primary h-6 w-6" />
          </div>
          <Badge
            variant={getDifficultyBadgeVariant(template.difficulty)}
            className="text-xs"
          >
            {difficultyConfig.label}
          </Badge>
        </div>
        <CardTitle className="line-clamp-2 text-lg font-semibold text-gray-900">
          {template.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-gray-600">
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
            <span>
              {
                Object.values(template.default_weekly_schedule).filter(Boolean)
                  .length
              }{' '}
              days/week
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="px-2 py-0.5 text-xs">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="outline" className="px-2 py-0.5 text-xs">
              +{template.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Starting Level Preview */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Perfect if you:</h4>
          <p className="line-clamp-2 text-xs text-gray-600">
            {template.suggested_current_levels[0]}
          </p>
        </div>

        {/* Sample Milestones Preview */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">You'll Learn:</h4>
          <ul className="space-y-1 text-xs text-gray-600">
            {template.sample_milestones.slice(0, 2).map((milestone, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="bg-primary mt-2 h-1 w-1 flex-shrink-0 rounded-full"></span>
                <span className="line-clamp-1">{milestone}</span>
              </li>
            ))}
            {template.sample_milestones.length > 2 && (
              <li className="text-xs text-gray-400">
                +{template.sample_milestones.length - 2} more milestones...
              </li>
            )}
          </ul>
        </div>

        {/* Use Template Button */}
        <Button
          onClick={() => onUseTemplate(template)}
          className="bg-primary hover:bg-primary/90 w-full shadow-sm"
          size="sm"
        >
          Use This Template
        </Button>
      </CardContent>
    </Card>
  )
}
