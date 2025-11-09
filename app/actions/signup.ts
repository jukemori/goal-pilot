'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  })

  if (error) {
    logger.error('Signup error', { error, email })
    redirect('/error')
  }

  // If user is created and session exists (email confirmation disabled)
  if (authData.user && authData.session) {
    // Create user profile
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      email: authData.user.email!,
      name,
    })

    if (profileError) {
      logger.error('Profile creation error', { error: profileError, userId: authData.user.id })
      // Continue to dashboard even if profile creation fails
      // The dashboard layout will handle creating it
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
