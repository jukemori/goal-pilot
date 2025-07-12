import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Delete all user data (cascades through foreign keys)
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id)

    if (deleteError) {
      throw deleteError
    }

    // Sign out the user first
    await supabase.auth.signOut()

    // Note: Deleting the auth user requires admin privileges
    // In production, you would typically:
    // 1. Mark the user as deleted in your database
    // 2. Schedule deletion via a backend service with admin privileges
    // 3. Or use Supabase Edge Functions with service role key

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to delete account',
      },
      { status: 500 },
    )
  }
}
