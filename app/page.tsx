import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, Target, Calendar, Brain } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 lg:px-8 pt-20 pb-32 bg-gradient-to-b from-white to-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Turn Your Goals Into
              <span className="text-primary"> Daily Actions</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Goal Pilot uses AI to create personalized roadmaps and schedules that adapt to your life. 
              Stop dreaming, start achieving with daily actionable tasks.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/register">
                <Button size="lg" className="px-8">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to achieve your goals
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              From planning to execution, we've got you covered
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-7xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <Feature
                icon={<Brain className="h-6 w-6" />}
                title="AI-Powered Planning"
                description="Get personalized roadmaps tailored to your skill level and schedule"
              />
              <Feature
                icon={<Calendar className="h-6 w-6" />}
                title="Smart Scheduling"
                description="Daily tasks that fit your available time and energy levels"
              />
              <Feature
                icon={<Target className="h-6 w-6" />}
                title="Progress Tracking"
                description="Visual insights to keep you motivated and on track"
              />
              <Feature
                icon={<CheckCircle className="h-6 w-6" />}
                title="Adaptive Learning"
                description="Plans that evolve based on your progress and feedback"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How Goal Pilot Works
            </h2>
          </div>
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="space-y-8">
              <Step
                number="1"
                title="Define Your Goal"
                description="Tell us what you want to achieve and your current skill level"
              />
              <Step
                number="2"
                title="Set Your Schedule"
                description="Choose how much time you can commit daily and which days work best"
              />
              <Step
                number="3"
                title="Get Your Roadmap"
                description="Receive an AI-generated plan with milestones and daily tasks"
              />
              <Step
                number="4"
                title="Take Daily Action"
                description="Complete tasks, track progress, and watch your goals become reality"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to achieve your goals?
          </h2>
          <p className="mt-6 text-lg leading-8 text-primary/20 max-w-2xl mx-auto">
            Join thousands who are turning their dreams into daily actions with Goal Pilot
          </p>
          <div className="mt-10">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="px-8">
                Start Your Journey
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="relative">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold leading-8 text-gray-900">
        {title}
      </h3>
      <p className="mt-2 text-base leading-7 text-gray-600">{description}</p>
    </div>
  )
}

function Step({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white font-semibold">
        {number}
      </div>
      <div>
        <h3 className="text-lg font-semibold leading-8 text-gray-900">{title}</h3>
        <p className="mt-2 text-base leading-7 text-gray-600">{description}</p>
      </div>
    </div>
  )
}