import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, ArrowLeft } from 'lucide-react'

export default function ConfirmPage() {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="text-center">
        <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <Mail className="text-primary h-6 w-6" />
        </div>
        <CardTitle className="text-2xl">Check Your Email</CardTitle>
        <CardDescription>
          We've sent you a confirmation link to complete your registration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-gray-600">
          Click the link in the email to confirm your account and start using
          Goal Pilot.
        </p>
        <p className="text-xs text-gray-500">
          Didn't receive the email? Check your spam folder or try registering
          again.
        </p>
      </CardContent>
      <CardContent className="pt-0">
        <Link href="/login">
          <Button variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
