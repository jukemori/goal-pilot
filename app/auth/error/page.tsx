import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-destructive">
            Authentication Error
          </CardTitle>
          <CardDescription>
            There was a problem confirming your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>This could happen if:</p>
            <ul className="mt-2 space-y-1 text-left">
              <li>• The confirmation link has expired</li>
              <li>• The link has already been used</li>
              <li>• The link is invalid or corrupted</li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button asChild>
              <Link href="/register">
                Try Signing Up Again
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/login">
                Go to Login
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}