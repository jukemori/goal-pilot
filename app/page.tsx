import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Target,
  Calendar,
  Brain,
  Sparkles,
  ArrowRight,
  Users,
  TrendingUp,
  Star,
  Zap,
  BookOpen,
  Award,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl p-3 md:p-4 lg:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary rounded-lg p-2">
                <Target className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Goal Pilot
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-primary hover:bg-primary/90">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl p-3 md:p-4 lg:p-8">
          <div className="mx-auto max-w-5xl text-center">
            <Badge
              variant="secondary"
              className="mb-6 bg-gray-100 text-gray-700"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              AI-Powered Goal Achievement
            </Badge>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 md:text-7xl">
              Turn Your
              <span className="text-primary block">Dreams Into</span>
              <span className="text-gray-900">Daily Actions</span>
            </h1>
            <p className="mx-auto mb-8 max-w-4xl text-xl leading-relaxed text-gray-600">
              Stop procrastinating. Start achieving. Goal Pilot uses AI to
              create personalized learning roadmaps, schedule your tasks, and
              track your progress—all adapted to your real life.
            </p>
            <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 px-8 py-4 text-lg"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Learning Today
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg"
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Built for learners</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>AI-powered</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>Goal achievement</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-gray-100 bg-white py-16">
        <div className="mx-auto max-w-7xl p-3 md:p-4 lg:p-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-primary mb-2 text-3xl font-bold md:text-4xl">
                12
              </div>
              <div className="text-gray-600">Goal Templates</div>
            </div>
            <div className="text-center">
              <div className="text-primary mb-2 text-3xl font-bold md:text-4xl">
                AI
              </div>
              <div className="text-gray-600">Powered Planning</div>
            </div>
            <div className="text-center">
              <div className="text-primary mb-2 text-3xl font-bold md:text-4xl">
                Smart
              </div>
              <div className="text-gray-600">Scheduling</div>
            </div>
            <div className="text-center">
              <div className="text-primary mb-2 text-3xl font-bold md:text-4xl">
                Daily
              </div>
              <div className="text-gray-600">Progress Tracking</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl p-3 md:p-4 lg:p-8">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              Everything you need to
              <span className="text-primary"> succeed</span>
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              From intelligent planning to progress tracking, Goal Pilot
              provides all the tools you need to turn your ambitions into
              achievements.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border shadow-sm transition-shadow duration-200 hover:shadow-md">
              <CardHeader className="pb-4">
                <div className="mb-4 w-fit rounded-lg bg-gray-50 p-3">
                  <Brain className="text-primary h-8 w-8" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  AI-Powered Planning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-gray-600">
                  Get personalized learning roadmaps that adapt to your skill
                  level, time availability, and learning style. Our AI creates
                  the perfect path for you.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border shadow-sm transition-shadow duration-200 hover:shadow-md">
              <CardHeader className="pb-4">
                <div className="mb-4 w-fit rounded-lg bg-gray-50 p-3">
                  <Calendar className="text-primary h-8 w-8" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Smart Scheduling
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-gray-600">
                  Daily tasks that fit perfectly into your life. Our intelligent
                  scheduling considers your energy levels, availability, and
                  personal preferences.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border shadow-sm transition-shadow duration-200 hover:shadow-md">
              <CardHeader className="pb-4">
                <div className="mb-4 w-fit rounded-lg bg-gray-50 p-3">
                  <TrendingUp className="text-primary h-8 w-8" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Progress Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-gray-600">
                  Beautiful insights and analytics keep you motivated. See your
                  progress in real-time and celebrate every milestone you
                  achieve.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border shadow-sm transition-shadow duration-200 hover:shadow-md">
              <CardHeader className="pb-4">
                <div className="mb-4 w-fit rounded-lg bg-gray-50 p-3">
                  <Zap className="text-primary h-8 w-8" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Adaptive Learning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-gray-600">
                  Your roadmap evolves as you learn. Our AI adjusts difficulty,
                  pacing, and focus areas based on your progress and feedback.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border shadow-sm transition-shadow duration-200 hover:shadow-md">
              <CardHeader className="pb-4">
                <div className="mb-4 w-fit rounded-lg bg-gray-50 p-3">
                  <BookOpen className="text-primary h-8 w-8" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Ready-to-Use Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-gray-600">
                  Get started quickly with our curated collection of learning
                  templates for programming, languages, fitness, business
                  skills, and more.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border shadow-sm transition-shadow duration-200 hover:shadow-md">
              <CardHeader className="pb-4">
                <div className="mb-4 w-fit rounded-lg bg-gray-50 p-3">
                  <Users className="text-primary h-8 w-8" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Personal Achievement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-gray-600">
                  Stay motivated with personal progress tracking, milestone
                  celebrations, and a clear view of your learning journey from
                  start to finish.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl p-3 md:p-4 lg:p-8">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              How Goal Pilot Works
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              Transform your goals into reality with our simple 4-step process
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
            {[
              {
                step: '1',
                title: 'Define Your Goal',
                description:
                  'Tell us what you want to achieve and your current skill level. Choose from templates or create custom goals.',
                color: 'bg-blue-500',
              },
              {
                step: '2',
                title: 'Set Your Schedule',
                description:
                  'Choose your available time and preferred learning days. Our AI adapts to your real-life constraints.',
                color: 'bg-green-500',
              },
              {
                step: '3',
                title: 'Get Your Roadmap',
                description:
                  'Receive a personalized learning plan with milestones, tasks, and timelines created by AI.',
                color: 'bg-purple-500',
              },
              {
                step: '4',
                title: 'Take Daily Action',
                description:
                  'Follow your daily tasks, track progress, and watch as you consistently move toward your goals.',
                color: 'bg-orange-500',
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="border shadow-sm transition-shadow duration-200 hover:shadow-md"
              >
                <CardHeader className="pb-4">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white">
                      {item.step}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {item.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed text-gray-600">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl p-3 md:p-4 lg:p-8">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about Goal Pilot
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
            {[
              {
                question: 'How does AI roadmap generation work?',
                answer:
                  'Our AI analyzes your goal, current skill level, and time availability to create a personalized learning path with specific milestones and daily tasks.',
              },
              {
                question: 'Can I customize my learning schedule?',
                answer:
                  'Yes! You can set your available days, daily time commitment, and preferred learning pace. The AI adapts your roadmap accordingly.',
              },
              {
                question: 'What types of goals can I create?',
                answer:
                  'Goal Pilot supports learning goals across programming, languages, fitness, business skills, creative pursuits, and academic subjects. You can use our templates or create custom goals.',
              },
              {
                question: 'How does progress tracking work?',
                answer:
                  'Track daily task completion, milestone achievements, and overall progress with visual dashboards and calendar integration.',
              },
              {
                question: 'Is Goal Pilot suitable for beginners?',
                answer:
                  'Absolutely! Our templates include beginner-friendly paths, and the AI adjusts difficulty based on your current level and progress.',
              },
              {
                question: "Can I modify my roadmap after it's created?",
                answer:
                  'Yes, roadmaps are adaptive. You can adjust timelines, add custom tasks, and the AI will help rebalance your learning path as needed.',
              },
            ].map((faq, index) => (
              <Card key={index} className="border shadow-sm">
                <CardContent className="p-6">
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">
                    {faq.question}
                  </h3>
                  <p className="leading-relaxed text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-gray-200 bg-white py-20">
        <div className="mx-auto max-w-7xl p-3 md:p-4 lg:p-8">
          <div className="text-center">
            <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              Ready to achieve your goals?
            </h2>
            <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600">
              Turn your dreams into daily actions. Start your journey today with
              AI-powered goal achievement.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 px-8 py-4 text-lg font-semibold text-white"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Free Today
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-300 px-8 py-4 text-lg font-semibold text-gray-700 hover:bg-gray-100"
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              No credit card required • Get started in minutes
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl p-3 md:p-4 lg:p-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="bg-primary rounded p-1">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">Goal Pilot</span>
              </div>
              <p className="text-sm text-gray-600">
                Turn your goals into daily actions with AI-powered learning.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-gray-900">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="#" className="hover:text-primary">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Templates
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-gray-900">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="#" className="hover:text-primary">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-gray-900">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="#" className="hover:text-primary">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2024 Goal Pilot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
