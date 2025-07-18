'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { Switch } from '@/components/atoms/switch'
import { Separator } from '@/components/atoms/separator'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2, Settings, Eye, EyeOff, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/atoms/alert-dialog'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Profile state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  // Notification preferences state
  const [pushNotifications, setPushNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [dailyReminders, setDailyReminders] = useState(true)
  const [weeklyReports, setWeeklyReports] = useState(true)

  // Fetch user data and preferences on mount
  useEffect(() => {
    async function fetchUserData() {
      try {
        // Fetch both profile and preferences in parallel for better performance
        const [profilePromise, prefsPromise] = [
          fetch('/api/user/profile', { cache: 'default' }),
          fetch('/api/user/preferences', {
            cache: 'default',
          }),
        ]

        // Handle profile data as soon as it loads
        profilePromise
          .then(async (profileRes) => {
            if (profileRes.ok) {
              const { data } = await profileRes.json()
              setName(data.name || '')
              setEmail(data.email || '')
            }
          })
          .catch((error) => {
            console.error('Error fetching profile:', error)
          })

        // Handle preferences data as soon as it loads
        prefsPromise
          .then(async (prefsRes) => {
            if (prefsRes.ok) {
              const { data } = await prefsRes.json()
              setPushNotifications(data.push_notifications ?? true)
              setEmailNotifications(data.email_notifications ?? false)
              setDailyReminders(data.daily_reminders ?? true)
              setWeeklyReports(data.weekly_reports ?? true)
            }
          })
          .catch((error) => {
            console.error('Error fetching preferences:', error)
          })

        // Wait for both to complete before removing main loading state
        await Promise.allSettled([profilePromise, prefsPromise])
      } catch (error) {
        console.error('Error fetching user data:', error)
        toast.error('Failed to load user data')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error || 'Failed to update profile')
      }

      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update profile',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          push_notifications: pushNotifications,
          email_notifications: emailNotifications,
          daily_reminders: dailyReminders,
          weekly_reports: weeklyReports,
        }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error || 'Failed to update preferences')
      }

      toast.success('Notification preferences updated')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update preferences',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setChangingPassword(true)

    try {
      // Validation
      if (newPassword.length < 6) {
        toast.error('New password must be at least 6 characters long')
        return
      }

      if (newPassword !== confirmPassword) {
        toast.error('New passwords do not match')
        return
      }

      const supabase = createClient()

      // First verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: email,
        password: currentPassword,
      })

      if (verifyError) {
        toast.error('Current password is incorrect')
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        toast.error(updateError.message || 'Failed to update password')
        return
      }

      // Clear form
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      toast.success('Password updated successfully')
    } catch (error) {
      toast.error('Failed to update password. Please try again.')
      console.error('Password change error:', error)
    } finally {
      setChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const res = await fetch('/api/user/delete', {
        method: 'DELETE',
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error || 'Failed to delete account')
      }

      toast.success('Account deleted successfully')
      router.push('/login')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete account',
      )
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    )
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
            Manage your account and learning preferences
          </p>
        </div>
      </div>

      {/* Settings Content */}
      <div className="space-y-8">
        {/* Profile Section */}
        <Card id="profile" className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-800">Profile Information</CardTitle>
            <CardDescription className="mt-1 text-gray-600">
              Update your personal information and account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card id="security" className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Lock className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription className="mt-1 text-gray-600">
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="pr-16"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 transform p-0 hover:bg-gray-50"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="pr-16"
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 transform p-0 hover:bg-gray-50"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Must be at least 6 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmNewPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="pr-16"
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 transform p-0 hover:bg-gray-50"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={
                changingPassword ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
            >
              {changingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card id="notifications" className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-800">
              Notification Preferences
            </CardTitle>
            <CardDescription className="mt-1 text-gray-600">
              Choose how you want to be notified about your goals and tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications-toggle">Push Notifications</Label>
                <p className="text-sm text-gray-500">
                  Receive notifications in your browser
                </p>
              </div>
              <Switch
                id="notifications-toggle"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-gray-500">
                  Receive important updates via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="daily-reminders">Daily Reminders</Label>
                <p className="text-sm text-gray-500">
                  Get reminded about your daily tasks
                </p>
              </div>
              <Switch
                id="daily-reminders"
                checked={dailyReminders}
                onCheckedChange={setDailyReminders}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-reports">Weekly Progress Reports</Label>
                <p className="text-sm text-gray-500">
                  Receive weekly summaries of your progress
                </p>
              </div>
              <Switch
                id="weekly-reports"
                checked={weeklyReports}
                onCheckedChange={setWeeklyReports}
              />
            </div>

            <Button onClick={handleSaveNotifications} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Notifications'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Delete Account */}
        <Card className="border-red-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600">Delete Account</CardTitle>
            <CardDescription className="mt-1 text-gray-600">
              Once you delete your account, there is no going back. Please be
              certain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleting}>
                  {deleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Account'
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove all of your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
