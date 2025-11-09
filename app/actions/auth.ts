'use server'

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'

export async function ensureUserProfile() {
  const supabase = await createClient()

  // Get the current user from auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Unauthorized')
  }

  // Check if user profile exists in our users table
  const { data: existingProfile } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single()

  // If profile doesn't exist, create it
  if (!existingProfile) {
    logger.debug('Creating user profile', { userId: user.id })

    const { error: insertError } = await supabase.from('users').insert({
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    })

    if (insertError) {
      logger.error('Failed to create user profile', { error: insertError, userId: user.id })
      throw new Error(`Failed to create user profile: ${insertError.message}`)
    }
  }

  return user
}
