import Link from 'next/link'
import { Button } from '@/components/atoms/button'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="mb-4 text-6xl font-bold text-gray-900">404</h1>
          <h2 className="mb-2 text-2xl font-semibold text-gray-700">
            Page not found
          </h2>
          <p className="mx-auto max-w-md text-gray-600">
            Sorry, we couldn't find the page you're looking for. It might have
            been moved or deleted.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Go to dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
