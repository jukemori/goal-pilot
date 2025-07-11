'use client'

import { createGoal } from '@/app/actions/goals'
import { GoalForm } from '@/components/organisms/goal-form/goal-form'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Target, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { GoalTemplate } from '@/lib/templates/goal-templates'
import { GoalFormData } from '@/lib/validations/goal'

export default function NewGoalPage() {
  const searchParams = useSearchParams()
  const fromTemplate = searchParams.get('fromTemplate') === 'true'
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null)
  const [templateDefaults, setTemplateDefaults] = useState<Partial<GoalFormData>>({})
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
          const targetDate = template.suggested_target_date_weeks ? (() => {
            const target = new Date(today)
            target.setDate(target.getDate() + (template.suggested_target_date_weeks * 7))
            return target.toISOString().split('T')[0]
          })() : ''

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
        console.error('Error loading template:', error)
      } finally {
        setIsLoadingTemplate(false)
      }
    } else {
      setIsLoadingTemplate(false)
    }
  }, [fromTemplate])

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/goals" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Goals
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl -z-10" />
        <div className="p-4 md:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {selectedTemplate ? 'Customize Your Goal' : 'Create New Goal'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {selectedTemplate 
                    ? 'Review and customize the template to fit your needs'
                    : 'Tell us about your goal and we\'ll create a personalized roadmap for you'
                  }
                </p>
              </div>
            </div>
            {selectedTemplate && (
              <Badge variant="secondary" className="bg-purple-50 text-purple-700 gap-2">
                <Sparkles className="h-3 w-3" />
                From Template
              </Badge>
            )}
          </div>
          
          {selectedTemplate && (
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-white/50 rounded-lg border border-gray-100">
                <h3 className="font-medium text-gray-900 mb-2">Template: {selectedTemplate.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{selectedTemplate.description}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading template...</p>
          </div>
        </div>
      ) : (
        <GoalForm onSubmit={createGoal} defaultValues={templateDefaults} />
      )}
    </div>
  )
}