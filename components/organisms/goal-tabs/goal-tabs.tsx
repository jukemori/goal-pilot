'use client'

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/atoms/tabs'
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
      <TabsList className="grid h-auto w-full grid-cols-4 sm:flex sm:w-auto sm:justify-start">
        <TabsTrigger
          value="overview"
          className="flex flex-col items-center justify-center px-1 py-2 text-xs sm:flex-row sm:px-2 sm:py-1.5 sm:text-sm"
        >
          <span className="group-data-[state=active]:after:bg-primary relative flex flex-col items-center group-data-[state=active]:after:absolute group-data-[state=active]:after:right-0 group-data-[state=active]:after:bottom-[-6px] group-data-[state=active]:after:left-0 group-data-[state=active]:after:h-0.5 sm:flex-row">
            <BarChart3 className="mb-0.5 h-4 w-4 sm:mr-2 sm:mb-0" />
            <span>Overview</span>
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="roadmap"
          className="flex flex-col items-center justify-center px-1 py-2 text-xs sm:flex-row sm:px-2 sm:py-1.5 sm:text-sm"
        >
          <span className="group-data-[state=active]:after:bg-primary relative flex flex-col items-center group-data-[state=active]:after:absolute group-data-[state=active]:after:right-0 group-data-[state=active]:after:bottom-[-6px] group-data-[state=active]:after:left-0 group-data-[state=active]:after:h-0.5 sm:flex-row">
            <BookOpen className="mb-0.5 h-4 w-4 sm:mr-2 sm:mb-0" />
            <span>Roadmap</span>
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="stages"
          className="flex flex-col items-center justify-center px-1 py-2 text-xs sm:flex-row sm:px-2 sm:py-1.5 sm:text-sm"
        >
          <span className="group-data-[state=active]:after:bg-primary relative flex flex-col items-center group-data-[state=active]:after:absolute group-data-[state=active]:after:right-0 group-data-[state=active]:after:bottom-[-6px] group-data-[state=active]:after:left-0 group-data-[state=active]:after:h-0.5 sm:flex-row">
            <Target className="mb-0.5 h-4 w-4 sm:mr-2 sm:mb-0" />
            <span>Stages</span>
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="progress"
          className="flex flex-col items-center justify-center px-1 py-2 text-xs sm:flex-row sm:px-2 sm:py-1.5 sm:text-sm"
        >
          <span className="group-data-[state=active]:after:bg-primary relative flex flex-col items-center group-data-[state=active]:after:absolute group-data-[state=active]:after:right-0 group-data-[state=active]:after:bottom-[-6px] group-data-[state=active]:after:left-0 group-data-[state=active]:after:h-0.5 sm:flex-row">
            <TrendingUp className="mb-0.5 h-4 w-4 sm:mr-2 sm:mb-0" />
            <span>Progress</span>
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        {children.overview}
      </TabsContent>
      <TabsContent value="roadmap" className="mt-6">
        {children.roadmap}
      </TabsContent>
      <TabsContent value="stages" className="mt-6">
        {children.stages}
      </TabsContent>
      <TabsContent value="progress" className="mt-6">
        {children.progress}
      </TabsContent>
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
