'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function regenerateRoadmap(goalId: string) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'Unauthorized' }
    }

    // Delete existing roadmap and related data
    const { error: deleteError } = await supabase
      .from('roadmaps')
      .delete()
      .eq('goal_id', goalId)

    if (deleteError) {
      console.error('Error deleting existing roadmap:', deleteError)
      return { error: 'Failed to delete existing roadmap' }
    }

    // Generate new roadmap
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/generate-roadmap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ goalId })
    })

    if (!response.ok) {
      const error = await response.json()
      return { error: error.error || 'Failed to regenerate roadmap' }
    }

    const roadmap = await response.json()
    
    // Revalidate the goal page
    revalidatePath(`/goals/${goalId}`)
    
    return { success: true, roadmap }
  } catch (error) {
    console.error('Error regenerating roadmap:', error)
    return { error: 'Failed to regenerate roadmap' }
  }
}