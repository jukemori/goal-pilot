import { Button } from '@/components/atoms/button'
import { ArrowLeft, Target } from 'lucide-react'
import Link from 'next/link'
import { NewGoalClient } from '@/components/organisms/goal-form/new-goal-client'
import { Suspense } from 'react'

export default function NewGoalPage() {
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

      {/* Icon for header (static server component) */}
      <div className="bg-primary/10 inline-flex rounded-lg p-2">
        <Target className="text-primary h-6 w-6" />
      </div>

      {/* Client component with Suspense for search params handling */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        }
      >
        <NewGoalClient />
      </Suspense>
    </div>
  )
}
