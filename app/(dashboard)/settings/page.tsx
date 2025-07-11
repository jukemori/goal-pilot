'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2, Settings } from 'lucide-react'
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
} from "@/components/ui/alert-dialog"

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  // Profile state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  
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
        const [profileRes, prefsRes] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/user/preferences')
        ])

        // Handle profile data
        if (profileRes.ok) {
          const { data } = await profileRes.json()
          setName(data.name || '')
          setEmail(data.email || '')
        }

        // Handle preferences data
        if (prefsRes.ok) {
          const { data } = await prefsRes.json()
          setPushNotifications(data.push_notifications ?? true)
          setEmailNotifications(data.email_notifications ?? false)
          setDailyReminders(data.daily_reminders ?? true)
          setWeeklyReports(data.weekly_reports ?? true)
        }
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
        body: JSON.stringify({ name, email })
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error || 'Failed to update profile')
      }

      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
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
          weekly_reports: weeklyReports
        })
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error || 'Failed to update preferences')
      }

      toast.success('Notification preferences updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update preferences')
    } finally {
      setSaving(false)
    }
  }


  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const res = await fetch('/api/user/delete', {
        method: 'DELETE'
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error || 'Failed to delete account')
      }

      toast.success('Account deleted successfully')
      router.push('/login')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete account')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl -z-10" />
        <div className="p-4 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-gray-600 text-lg">Manage your account and learning preferences</p>
        </div>
      </div>

      {/* Settings Content */}
      <div className="space-y-8">
          {/* Profile Section */}
          <Card id="profile" className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-800">
                Profile Information
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
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
                ) : 'Save Profile'}
              </Button>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card id="notifications" className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-800">
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
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
                ) : 'Save Notifications'}
              </Button>
            </CardContent>
          </Card>

          {/* Delete Account */}
          <Card className="border-red-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-600">
                Delete Account
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Once you delete your account, there is no going back. Please be certain.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : 'Delete Account'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and remove all of your data from our servers.
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