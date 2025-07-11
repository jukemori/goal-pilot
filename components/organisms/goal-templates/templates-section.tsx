'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TemplateGrid } from './template-grid'
import { GoalTemplate } from '@/lib/templates/goal-templates'
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react'

interface TemplatesSectionProps {
  hasActiveGoals: boolean
}

export function TemplatesSection({ hasActiveGoals }: TemplatesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(!hasActiveGoals) // Auto-expand if no active goals
  const router = useRouter()

  const handleUseTemplate = (template: GoalTemplate) => {
    // Store template data in sessionStorage to pre-fill the form
    sessionStorage.setItem('selectedTemplate', JSON.stringify(template))
    // Navigate to goal creation form
    router.push('/goals/new?fromTemplate=true')
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <div className="p-2 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              Goal Templates
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Jump-start your learning with pre-designed goal templates
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-2"
          >
            {isExpanded ? (
              <>
                Hide
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Browse Templates
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <TemplateGrid
            limit={hasActiveGoals ? 6 : 9} // Show more if no active goals
            showMore={true}
            onUseTemplate={handleUseTemplate}
          />
        </CardContent>
      )}
    </Card>
  )
}