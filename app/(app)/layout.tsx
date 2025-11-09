import { Sidebar } from '@/components/organisms/sidebar/sidebar'
import { redirect } from 'next/navigation'
import { ensureUserProfile } from '@/app/actions/auth'
import { logger } from '@/lib/utils/logger'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    // This will check auth and ensure user profile exists
    await ensureUserProfile()
  } catch (error) {
    logger.error('Auth error', { error })
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        {/* Mobile header spacing */}
        <div className="h-16 lg:hidden" />
        <main className="p-3 pb-8 md:p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
