'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, BookOpen, TrendingUp } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Suspense } from 'react'

interface GoalTabsProps {
  children: {
    overview: React.ReactNode
    roadmap: React.ReactNode
    progress: React.ReactNode
  }
}

function GoalTabsInner({ children }: GoalTabsProps) {
  const [tab, setTab] = useQueryState('tab', {
    defaultValue: 'overview',
  })

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList>
        <TabsTrigger value="overview">
          <BarChart3 className="h-4 w-4 mr-2" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="roadmap">
          <BookOpen className="h-4 w-4 mr-2" />
          Roadmap
        </TabsTrigger>
        <TabsTrigger value="progress">
          <TrendingUp className="h-4 w-4 mr-2" />
          Progress
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">{children.overview}</TabsContent>
      <TabsContent value="roadmap">{children.roadmap}</TabsContent>
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