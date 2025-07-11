'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const supabase = createClient()
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError) {
        // Handle specific auth errors with user-friendly messages
        switch (authError.message) {
          case 'Invalid login credentials':
            setError('Invalid email or password. Please check your credentials and try again.')
            break
          case 'Email not confirmed':
            setError('Please check your email and click the confirmation link before signing in.')
            break
          case 'Too many requests':
            setError('Too many login attempts. Please wait a few minutes before trying again.')
            break
          default:
            setError(authError.message || 'An error occurred during sign in. Please try again.')
        }
        return
      }

      if (data?.user) {
        setIsSuccess(true)
        toast.success('Welcome back! Redirecting to your dashboard...')
        
        // Small delay to show success state
        setTimeout(() => {
          router.push(redirectTo)
          router.refresh()
        }, 1000)
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
        <p className="text-gray-600">Continue your learning journey</p>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
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
                <AlertDescription>Successfully signed in! Redirecting...</AlertDescription>
              </Alert>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="border-gray-200 focus:border-primary focus:ring-primary/20"
                disabled={isLoading || isSuccess}
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="border-gray-200 focus:border-primary focus:ring-primary/20 pr-12"
                  disabled={isLoading || isSuccess}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
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
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 shadow-sm"
              disabled={isLoading || isSuccess || !email || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Success!
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link 
                  href="/register" 
                  className="text-primary hover:underline font-medium"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* Demo Account Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="font-medium text-blue-900 mb-2">Demo Account</h3>
            <p className="text-sm text-blue-800 mb-3">
              Try Goal Pilot with our demo account
            </p>
            <div className="space-y-1 text-xs text-blue-700">
              <p><strong>Email:</strong> demo@goalPilot.com</p>
              <p><strong>Password:</strong> demo123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}