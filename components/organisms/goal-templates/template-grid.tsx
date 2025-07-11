'use client'

import { useState } from 'react'
import { TemplateCard } from './template-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GoalTemplate, GOAL_TEMPLATES, TEMPLATE_CATEGORIES } from '@/lib/templates/goal-templates'
import { ChevronDown, ChevronUp, Filter } from 'lucide-react'

interface TemplateGridProps {
  limit?: number
  showMore?: boolean
  onUseTemplate: (template: GoalTemplate) => void
}

export function TemplateGrid({ limit = 6, showMore = true, onUseTemplate }: TemplateGridProps) {
  const [showAll, setShowAll] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)

  // Filter templates based on selected filters
  const filteredTemplates = GOAL_TEMPLATES.filter((template) => {
    if (selectedCategory && template.category !== selectedCategory) return false
    if (selectedDifficulty && template.difficulty !== selectedDifficulty) return false
    return true
  })

  // Apply limit if not showing all
  const templatesToShow = showAll ? filteredTemplates : filteredTemplates.slice(0, limit)
  const hasMoreTemplates = filteredTemplates.length > limit

  const clearFilters = () => {
    setSelectedCategory(null)
    setSelectedDifficulty(null)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter className="h-4 w-4" />
          <span>Filter by:</span>
        </div>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(TEMPLATE_CATEGORIES).map(([key, category]) => (
            <Badge
              key={key}
              variant={selectedCategory === key ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
            >
              {category.label}
            </Badge>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className="flex flex-wrap gap-2">
          {['beginner', 'intermediate', 'advanced'].map((difficulty) => (
            <Badge
              key={difficulty}
              variant={selectedDifficulty === difficulty ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/10 transition-colors capitalize"
              onClick={() => setSelectedDifficulty(selectedDifficulty === difficulty ? null : difficulty)}
            >
              {difficulty}
            </Badge>
          ))}
        </div>

        {/* Clear Filters */}
        {(selectedCategory || selectedDifficulty) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {filteredTemplates.length === GOAL_TEMPLATES.length ? (
          `Showing ${templatesToShow.length} of ${GOAL_TEMPLATES.length} templates`
        ) : (
          `Showing ${templatesToShow.length} of ${filteredTemplates.length} filtered templates`
        )}
      </div>

      {/* Templates Grid */}
      {templatesToShow.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templatesToShow.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUseTemplate={onUseTemplate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <Filter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more templates</p>
          </div>
          <Button variant="outline" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      )}

      {/* Show More/Less Button */}
      {showMore && hasMoreTemplates && !showAll && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={() => setShowAll(true)}
            className="gap-2"
          >
            Show More Templates
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {showMore && showAll && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={() => setShowAll(false)}
            className="gap-2"
          >
            Show Less
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}