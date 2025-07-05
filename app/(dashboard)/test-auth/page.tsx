import { createClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/app/actions/auth'

export default async function TestAuthPage() {
  const supabase = await createClient()
  
  try {
    // Test auth
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // Test user profile
    let profileUser = null
    try {
      profileUser = await ensureUserProfile()
    } catch (profileError) {
      console.error('Profile error:', profileError)
    }
    
    // Test database access
    const { data: testGoals, error: goalError } = await supabase
      .from('goals')
      .select('*')
      .limit(1)

    return (
      <div className="p-8 space-y-4">
        <h1 className="text-2xl font-bold">Authentication Test</h1>
        
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Auth User:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {userError ? `Error: ${userError.message}` : JSON.stringify(user, null, 2)}
          </pre>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Profile User:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(profileUser, null, 2)}
          </pre>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Database Test (Goals):</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {goalError ? `Error: ${goalError.message}` : JSON.stringify(testGoals, null, 2)}
          </pre>
        </div>
      </div>
    )
  } catch (error: any) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Auth Test Failed</h1>
        <pre className="bg-red-100 p-4 rounded text-sm mt-4">
          {error.message}
        </pre>
      </div>
    )
  }
}