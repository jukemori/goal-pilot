import { Settings } from 'lucide-react'
import { SettingsForm } from '@/components/organisms/settings/settings-form'

export default async function SettingsPage() {
  // Fetch user data server-side
  const [profileRes, preferencesRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/user/profile`, {
      cache: 'no-store',
      headers: {
        cookie: (await import('next/headers')).cookies().toString(),
      },
    }),
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/user/preferences`, {
      cache: 'no-store',
      headers: {
        cookie: (await import('next/headers')).cookies().toString(),
      },
    }),
  ])

  const profileData = profileRes.ok ? await profileRes.json() : null
  const preferencesData = preferencesRes.ok ? await preferencesRes.json() : null

  const initialProfile = {
    name: profileData?.data?.name || '',
    email: profileData?.data?.email || '',
  }

  const initialPreferences = {
    push_notifications: preferencesData?.data?.push_notifications ?? true,
    email_notifications: preferencesData?.data?.email_notifications ?? false,
    daily_reminders: preferencesData?.data?.daily_reminders ?? true,
    weekly_reports: preferencesData?.data?.weekly_reports ?? true,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="from-primary/10 to-primary/5 absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r" />
        <div className="p-4 md:p-8">
          <div className="mb-2 flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <Settings className="text-primary h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-lg text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Settings Form */}
      <SettingsForm
        initialProfile={initialProfile}
        initialPreferences={initialPreferences}
      />
    </div>
  )
}
