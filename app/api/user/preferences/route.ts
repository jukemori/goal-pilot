import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Default preferences
  const defaultPreferences = {
    user_id: user.id,
    push_notifications: true,
    email_notifications: false,
    daily_reminders: true,
    weekly_reports: true
  }

  try {
    // Check if the table exists by attempting a query
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116' || error.code === '42P01') {
        // Table doesn't exist or no rows found, return defaults
        return NextResponse.json({ data: defaultPreferences })
      }
      throw error
    }

    return NextResponse.json({ data: data || defaultPreferences })
  } catch (error) {
    console.warn('User preferences table not yet available:', error)
    return NextResponse.json({ data: defaultPreferences })
  }
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  try {
    // Attempt to upsert preferences
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist yet
        console.warn('User preferences table not yet available')
        return NextResponse.json({ 
          data: { 
            user_id: user.id, 
            ...body,
            updated_at: new Date().toISOString()
          } 
        })
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error updating preferences:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to update preferences' 
    }, { status: 500 })
  }
}