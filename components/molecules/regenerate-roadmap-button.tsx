'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { regenerateRoadmap } from '@/app/actions/regenerate-roadmap'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface RegenerateRoadmapButtonProps {
  goalId: string
}

export function RegenerateRoadmapButton({ goalId }: RegenerateRoadmapButtonProps) {
  const [isRegenerating, setIsRegenerating] = useState(false)
  const router = useRouter()

  const handleRegenerate = async () => {
    if (!confirm('This will delete your current roadmap and create a new one. Continue?')) {
      return
    }

    setIsRegenerating(true)
    
    try {
      const result = await regenerateRoadmap(goalId)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Roadmap regenerated successfully!')
        router.refresh()
      }
    } catch (error) {
      toast.error('Failed to regenerate roadmap')
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRegenerate}
      disabled={isRegenerating}
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
      {isRegenerating ? 'Regenerating...' : 'Regenerate Roadmap'}
    </Button>
  )
}