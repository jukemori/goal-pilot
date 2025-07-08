import { Sidebar } from '@/components/organisms/sidebar/sidebar'
import { redirect } from 'next/navigation'
import { ensureUserProfile } from '@/app/actions/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    // This will check auth and ensure user profile exists
    await ensureUserProfile()
  } catch (error) {
    console.error('Auth error:', error)
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}