'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [name, setName] = useState('John Doe')
  const [email, setEmail] = useState('john@example.com')
  const [notifications, setNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [dailyReminders, setDailyReminders] = useState(true)
  const [weeklyReports, setWeeklyReports] = useState(true)
  const [timeZone, setTimeZone] = useState('America/New_York')
  const [startOfWeek, setStartOfWeek] = useState('sunday')

  const handleSaveProfile = () => {
    // TODO: Implement profile update
    toast.success('Profile updated successfully')
  }

  const handleSaveNotifications = () => {
    // TODO: Implement notification preferences update
    toast.success('Notification preferences updated')
  }

  const handleSaveCalendar = () => {
    // TODO: Implement calendar preferences update
    toast.success('Calendar preferences updated')
  }

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion with confirmation
    toast.error('Account deletion not implemented yet')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and preferences</p>
      </div>

      {/* Settings Content */}
      <div className="space-y-8">
          {/* Profile Section */}
          <Card id="profile">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
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

              <Button onClick={handleSaveProfile}>Save Profile</Button>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card id="notifications">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
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
                  checked={notifications}
                  onCheckedChange={setNotifications}
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

              <Button onClick={handleSaveNotifications}>Save Notifications</Button>
            </CardContent>
          </Card>

          {/* Calendar Section */}
          <Card id="calendar">
            <CardHeader>
              <CardTitle>Calendar Preferences</CardTitle>
              <CardDescription>
                Customize your calendar view and scheduling preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Time Zone</Label>
                <Select value={timeZone} onValueChange={setTimeZone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (UTC-5)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (UTC-6)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (UTC-7)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (UTC-8)</SelectItem>
                    <SelectItem value="Europe/London">London (UTC+0)</SelectItem>
                    <SelectItem value="Europe/Paris">Paris (UTC+1)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo (UTC+9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-of-week">Start of Week</Label>
                <Select value={startOfWeek} onValueChange={setStartOfWeek}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select start of week" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunday">Sunday</SelectItem>
                    <SelectItem value="monday">Monday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveCalendar}>Save Calendar Settings</Button>
            </CardContent>
          </Card>

          {/* Delete Account */}
          <Card className="border-red-200">
            <CardContent className="p-6">
              <h4 className="font-medium text-red-600 mb-2">Delete Account</h4>
              <p className="text-sm text-gray-600 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
    </div>
  )
}