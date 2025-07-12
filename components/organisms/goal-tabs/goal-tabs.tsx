'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, BookOpen, TrendingUp, Target } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Suspense } from 'react'

interface GoalTabsProps {
  children: {
    overview: React.ReactNode
    roadmap: React.ReactNode
    stages: React.ReactNode
    progress: React.ReactNode
  }
}

function GoalTabsInner({ children }: GoalTabsProps) {
  const [tab, setTab] = useQueryState('tab', {
    defaultValue: 'overview',
  })

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4 h-auto">
        <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center justify-center px-1 py-2 sm:px-3 sm:py-1.5 text-xs sm:text-sm">
          <BarChart3 className="h-4 w-4 sm:mr-2 mb-0.5 sm:mb-0" />
          <span>Overview</span>
        </TabsTrigger>
        <TabsTrigger value="roadmap" className="flex flex-col sm:flex-row items-center justify-center px-1 py-2 sm:px-3 sm:py-1.5 text-xs sm:text-sm">
          <BookOpen className="h-4 w-4 sm:mr-2 mb-0.5 sm:mb-0" />
          <span>Roadmap</span>
        </TabsTrigger>
        <TabsTrigger value="stages" className="flex flex-col sm:flex-row items-center justify-center px-1 py-2 sm:px-3 sm:py-1.5 text-xs sm:text-sm">
          <Target className="h-4 w-4 sm:mr-2 mb-0.5 sm:mb-0" />
          <span>Stages</span>
        </TabsTrigger>
        <TabsTrigger value="progress" className="flex flex-col sm:flex-row items-center justify-center px-1 py-2 sm:px-3 sm:py-1.5 text-xs sm:text-sm">
          <TrendingUp className="h-4 w-4 sm:mr-2 mb-0.5 sm:mb-0" />
          <span>Progress</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">{children.overview}</TabsContent>
      <TabsContent value="roadmap">{children.roadmap}</TabsContent>
      <TabsContent value="stages">{children.stages}</TabsContent>
      <TabsContent value="progress">{children.progress}</TabsContent>
    </Tabs>
  )
}

export function GoalTabs(props: GoalTabsProps) {
  return (
    <NuqsAdapter>
      <Suspense fallback={<div>Loading...</div>}>
        <GoalTabsInner {...props} />
      </Suspense>
    </NuqsAdapter>
  )
}