'use client'

import { logger } from '@/lib/utils/logger'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { GoalForm } from './goal-form'
import { Badge } from '@/components/atoms/badge'
import { Sparkles } from 'lucide-react'
import { GoalTemplate } from '@/lib/templates/goal-templates'
import { GoalFormData } from '@/lib/validations/goal'
import { createGoal } from '@/app/actions/goals'

export function NewGoalClient() {
  const searchParams = useSearchParams()
  const fromTemplate = searchParams.get('fromTemplate') === 'true'
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(
    null,
  )
  const [templateDefaults, setTemplateDefaults] = useState<
    Partial<GoalFormData>
  >({})
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(fromTemplate)

  useEffect(() => {
    if (fromTemplate) {
      try {
        const templateData = sessionStorage.getItem('selectedTemplate')
        if (templateData) {
          const template: GoalTemplate = JSON.parse(templateData)
          setSelectedTemplate(template)

          // Convert template to goal form defaults with all fields pre-filled
          const today = new Date()
          const startDate = today.toISOString().split('T')[0]
          const targetDate = template.suggested_target_date_weeks
            ? (() => {
                const target = new Date(today)
                target.setDate(
                  target.getDate() + template.suggested_target_date_weeks * 7,
                )
                return target.toISOString().split('T')[0]
              })()
            : ''

          const defaults: Partial<GoalFormData> = {
            title: template.title,
            description: template.description,
            daily_time_commitment: template.default_time_commitment,
            current_level: template.suggested_current_levels[0] || '',
            start_date: startDate,
            target_date: targetDate,
            weekly_schedule: template.default_weekly_schedule,
          }

          setTemplateDefaults(defaults)

          // Clear the template from sessionStorage
          sessionStorage.removeItem('selectedTemplate')
        }
      } catch (error) {
        logger.error('Error loading template', { error })
      } finally {
        setIsLoadingTemplate(false)
      }
    } else {
      setIsLoadingTemplate(false)
    }
  }, [fromTemplate])

  return (
    <>
      {/* Header */}
      <div className="relative">
        <div className="from-primary/10 to-primary/5 absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r" />
        <div className="p-4 md:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {selectedTemplate ? 'Customize Your Goal' : 'Create New Goal'}
                </h1>
                <p className="mt-1 text-gray-600">
                  {selectedTemplate
                    ? 'Review and customize the template to fit your needs'
                    : "Tell us about your goal and we'll create a personalized roadmap for you"}
                </p>
              </div>
            </div>
            {selectedTemplate && (
              <Badge
                variant="secondary"
                className="gap-2 bg-purple-50 text-purple-700"
              >
                <Sparkles className="h-3 w-3" />
                From Template
              </Badge>
            )}
          </div>

          {selectedTemplate && (
            <div className="mt-4 space-y-4">
              <div className="rounded-lg border border-gray-100 bg-white/50 p-4">
                <h3 className="mb-2 font-medium text-gray-900">
                  Template: {selectedTemplate.title}
                </h3>
                <p className="mb-3 text-sm text-gray-600">
                  {selectedTemplate.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 flex items-center gap-2 font-medium text-blue-900">
                  <Sparkles className="h-4 w-4" />
                  Customization Tips
                </h4>
                <p className="text-sm text-blue-800">
                  {selectedTemplate.customization_notes}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Container - Full Width */}
      {isLoadingTemplate ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-gray-600">Loading template...</p>
          </div>
        </div>
      ) : (
        <div className="px-4 md:px-8">
          <GoalForm onSubmit={createGoal} defaultValues={templateDefaults} />
        </div>
      )}
    </>
  )
}
