'use client'
import { logger } from '@/lib/utils/logger'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { Alert, AlertDescription } from '@/components/atoms/alert'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  // Listen for PASSWORD_RECOVERY auth event from email link
  useEffect(() => {
    const supabase = createClient()

    // Check current session first
    const checkInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session && session.user) {
        setIsValidSession(true)
      }
      setCheckingSession(false)
    }

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        setIsValidSession(true)
        setCheckingSession(false)
      } else if (event === 'SIGNED_IN' && session) {
        setIsValidSession(true)
        setCheckingSession(false)
      } else if (!session) {
        setIsValidSession(false)
        setError(
          'Invalid or expired reset link. Please request a new password reset.',
        )
        setCheckingSession(false)
      }
    })

    checkInitialSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        setError(
          updateError.message || 'Failed to update password. Please try again.',
        )
        return
      }

      setIsSuccess(true)
      toast.success('Password updated successfully!')

      // Redirect to dashboard after success
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
      logger.error('Password reset error', { error: err })
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    )
  }

  if (!isValidSession) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Invalid Reset Link
          </h1>
          <p className="text-gray-600">This link is invalid or has expired</p>
        </div>

        <Card className="border-red-200 shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-600">
              Reset Link Expired
            </CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired. Please request
              a new one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <Link href="/forgot-password">
              <Button className="w-full">Request New Reset Link</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
        <p className="text-gray-600">Enter your new secure password</p>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="space-y-1">
          <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <Lock className="text-primary h-6 w-6" />
          </div>
          <CardTitle className="text-center text-xl">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Choose a strong password for your account
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {isSuccess && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Password updated successfully! Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            )}

            {/* New Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="focus:border-primary focus:ring-primary/20 border-gray-200 pr-16"
                  disabled={isLoading || isSuccess}
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 transform p-0 hover:bg-gray-50"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isSuccess}
                >
                  {showPassword ? (
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

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="focus:border-primary focus:ring-primary/20 border-gray-200 pr-16"
                  disabled={isLoading || isSuccess}
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 transform p-0 hover:bg-gray-50"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading || isSuccess}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="mt-6 flex flex-col space-y-6">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 w-full shadow-sm"
              disabled={isLoading || isSuccess || !password || !confirmPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating password...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Password Updated!
                </>
              ) : (
                'Update Password'
              )}
            </Button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-primary inline-flex items-center gap-2 text-sm font-medium hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
