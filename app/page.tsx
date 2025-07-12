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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
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
  CheckCircle2,
  Clock,
  LineChart,
  Rocket,
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
              Your AI Goal
              <span className="text-primary block">Achievement</span>
              <span className="text-gray-900">Assistant</span>
            </h1>
            <p className="mx-auto mb-8 max-w-4xl text-xl leading-relaxed text-gray-600">
              Transform any goal into a step-by-step roadmap. Get AI-generated
              learning paths, automatic task scheduling, and real-time progress
              tracking—all in one powerful platform.
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

      {/* Key Features Preview */}
      <section className="border-t border-gray-100 bg-gradient-to-b from-white to-gray-50 py-16">
        <div className="mx-auto max-w-7xl p-3 md:p-4 lg:p-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
              <Rocket className="text-primary mb-3 h-8 w-8" />
              <div className="text-lg font-semibold text-gray-900">
                AI Roadmap Generation
              </div>
              <div className="mt-1 text-sm text-gray-600">
                Custom learning paths in seconds
              </div>
            </div>
            <div className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
              <Calendar className="text-primary mb-3 h-8 w-8" />
              <div className="text-lg font-semibold text-gray-900">
                Smart Calendar
              </div>
              <div className="mt-1 text-sm text-gray-600">
                Tasks that fit your schedule
              </div>
            </div>
            <div className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
              <LineChart className="text-primary mb-3 h-8 w-8" />
              <div className="text-lg font-semibold text-gray-900">
                Progress Analytics
              </div>
              <div className="mt-1 text-sm text-gray-600">
                Visual insights & milestones
              </div>
            </div>
            <div className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
              <CheckCircle2 className="text-primary mb-3 h-8 w-8" />
              <div className="text-lg font-semibold text-gray-900">
                Task Management
              </div>
              <div className="mt-1 text-sm text-gray-600">
                Track daily achievements
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl p-3 md:p-4 lg:p-8">
          <div className="mb-16 text-center">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              <Sparkles className="mr-1 h-3 w-3" />
              Powered by AI
            </Badge>
            <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              Built for Real
              <span className="text-primary"> Achievement</span>
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              Every feature is designed to help you make consistent progress
              towards your goals, no matter how busy life gets.
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
                  Tell us your goal and current level. Our AI instantly
                  generates a complete roadmap with phases, milestones, and
                  daily tasks tailored to your specific needs.
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
                  Set your available hours and days. Goal Pilot automatically
                  schedules tasks around your life, ensuring you never feel
                  overwhelmed while making steady progress.
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
                  Watch your progress unfold with visual dashboards. Track
                  completion rates, streaks, and milestone achievements that
                  keep you motivated every step of the way.
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
      <section className="bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="mx-auto max-w-7xl p-3 md:p-4 lg:p-8">
          <div className="mb-16 text-center">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              <Clock className="mr-1 h-3 w-3" />
              Get started in minutes
            </Badge>
            <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              From Goal to Achievement
              <span className="text-primary"> in 4 Steps</span>
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              Our streamlined process makes it easy to start and stay on track
            </p>
          </div>

          <div className="relative mx-auto max-w-5xl">
            {/* Timeline line for desktop */}
            <div className="from-primary/20 via-primary/40 to-primary/20 absolute top-0 left-1/2 hidden h-full w-0.5 -translate-x-1/2 bg-gradient-to-b md:block" />

            <div className="space-y-12">
              {[
                {
                  step: '1',
                  title: 'Choose Your Goal',
                  description:
                    'Select from our curated templates or create a custom goal. Tell us your current level and what you want to achieve.',
                  icon: Target,
                  features: [
                    '12+ goal templates',
                    'Custom goal creation',
                    'Skill level assessment',
                  ],
                },
                {
                  step: '2',
                  title: 'Set Your Availability',
                  description:
                    'Define when and how much time you can dedicate. Choose your preferred days and daily commitment.',
                  icon: Calendar,
                  features: [
                    'Flexible scheduling',
                    'Time commitment options',
                    'Real-life adaptation',
                  ],
                },
                {
                  step: '3',
                  title: 'Get AI-Generated Roadmap',
                  description:
                    'Receive a complete learning path with phases, milestones, and daily tasks tailored to your inputs.',
                  icon: Brain,
                  features: [
                    'Structured phases',
                    'Clear milestones',
                    'Daily task breakdown',
                  ],
                },
                {
                  step: '4',
                  title: 'Track & Achieve',
                  description:
                    'Complete daily tasks, track progress, and celebrate milestones as you work towards your goal.',
                  icon: CheckCircle2,
                  features: [
                    'Progress tracking',
                    'Milestone celebrations',
                    'Adaptive adjustments',
                  ],
                },
              ].map((item, index) => {
                const Icon = item.icon
                const isLeft = index % 2 === 0

                return (
                  <div key={index} className="relative">
                    {/* Mobile layout */}
                    <div className="md:hidden">
                      <Card className="group hover:border-primary/30 border-2 shadow-sm transition-all hover:shadow-lg">
                        <CardHeader>
                          <div className="flex items-center gap-4">
                            <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white">
                              {item.step}
                            </div>
                            <div>
                              <CardTitle className="text-xl font-bold text-gray-900">
                                {item.title}
                              </CardTitle>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="mb-4 text-gray-600">
                            {item.description}
                          </p>
                          <div className="space-y-2">
                            {item.features.map((feature, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 text-sm text-gray-500"
                              >
                                <CheckCircle2 className="text-primary h-4 w-4" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Desktop layout */}
                    <div
                      className={`hidden md:grid md:grid-cols-2 md:gap-8 ${isLeft ? '' : 'md:direction-rtl'}`}
                    >
                      <div
                        className={`${isLeft ? 'text-right' : 'text-left md:col-start-2'}`}
                      >
                        <Card className="group hover:border-primary/30 inline-block border-2 shadow-sm transition-all hover:shadow-lg">
                          <CardHeader>
                            <div
                              className={`flex items-center gap-4 ${isLeft ? 'flex-row-reverse' : ''}`}
                            >
                              <Icon className="text-primary h-8 w-8" />
                              <div
                                className={isLeft ? 'text-right' : 'text-left'}
                              >
                                <CardTitle className="text-xl font-bold text-gray-900">
                                  {item.title}
                                </CardTitle>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="mb-4 text-gray-600">
                              {item.description}
                            </p>
                            <div className="space-y-2">
                              {item.features.map((feature, idx) => (
                                <div
                                  key={idx}
                                  className={`flex items-center gap-2 text-sm text-gray-500 ${isLeft ? 'flex-row-reverse' : ''}`}
                                >
                                  <CheckCircle2 className="text-primary h-4 w-4" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Center circle */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg ring-4 ring-white">
                          <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white">
                            {item.step}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="mx-auto max-w-4xl p-3 md:p-4 lg:p-8">
          <div className="mb-12 text-center">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              <Award className="mr-1 h-3 w-3" />
              Everything you need to know
            </Badge>
            <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Get answers to common questions about Goal Pilot
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem
              value="item-1"
              className="mb-4 rounded-lg border bg-white px-6 shadow-sm"
            >
              <AccordionTrigger className="py-6 text-left text-lg font-semibold hover:no-underline">
                <span className="flex items-center gap-3">
                  <Brain className="text-primary h-5 w-5 flex-shrink-0" />
                  How does AI roadmap generation work?
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-gray-600">
                Our AI analyzes three key inputs: your specific goal, your
                current skill level, and your available time commitment. It then
                generates a complete learning roadmap with structured phases,
                clear milestones, and daily actionable tasks. The AI draws from
                successful learning patterns to create a path that's both
                challenging and achievable.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-2"
              className="mb-4 rounded-lg border bg-white px-6 shadow-sm"
            >
              <AccordionTrigger className="py-6 text-left text-lg font-semibold hover:no-underline">
                <span className="flex items-center gap-3">
                  <Calendar className="text-primary h-5 w-5 flex-shrink-0" />
                  Can I customize my learning schedule?
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-gray-600">
                Absolutely! Goal Pilot is built around your life. You can set
                your available days (weekdays, weekends, or specific days),
                daily time commitment (15 minutes to 2+ hours), and preferred
                learning pace. The AI will automatically adjust your roadmap and
                redistribute tasks to match your schedule.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-3"
              className="mb-4 rounded-lg border bg-white px-6 shadow-sm"
            >
              <AccordionTrigger className="py-6 text-left text-lg font-semibold hover:no-underline">
                <span className="flex items-center gap-3">
                  <Target className="text-primary h-5 w-5 flex-shrink-0" />
                  What types of goals can I create?
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-gray-600">
                Goal Pilot supports virtually any learning goal. Popular
                categories include programming (web development, data science,
                mobile apps), languages (conversational fluency, business
                proficiency), fitness (marathon training, strength building),
                business skills (marketing, leadership), and creative pursuits
                (music, writing, art). Use our 12+ templates or create
                completely custom goals.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-4"
              className="mb-4 rounded-lg border bg-white px-6 shadow-sm"
            >
              <AccordionTrigger className="py-6 text-left text-lg font-semibold hover:no-underline">
                <span className="flex items-center gap-3">
                  <LineChart className="text-primary h-5 w-5 flex-shrink-0" />
                  How does progress tracking work?
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-gray-600">
                Track your journey with comprehensive analytics. Mark tasks
                complete to update your progress percentage, build streaks for
                consistency, and unlock milestone achievements. Visual
                dashboards show your progress over time, completion rates, and
                upcoming tasks. Everything syncs with your calendar view for a
                complete picture of your learning journey.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-5"
              className="mb-4 rounded-lg border bg-white px-6 shadow-sm"
            >
              <AccordionTrigger className="py-6 text-left text-lg font-semibold hover:no-underline">
                <span className="flex items-center gap-3">
                  <Users className="text-primary h-5 w-5 flex-shrink-0" />
                  Is Goal Pilot suitable for beginners?
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-gray-600">
                Yes! Goal Pilot is designed for all skill levels. When you
                create a goal, you'll specify your current level (complete
                beginner, some experience, or advanced). The AI adjusts the
                difficulty, pacing, and terminology accordingly. Beginner paths
                include extra foundational content and more gradual progression.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-6"
              className="mb-4 rounded-lg border bg-white px-6 shadow-sm"
            >
              <AccordionTrigger className="py-6 text-left text-lg font-semibold hover:no-underline">
                <span className="flex items-center gap-3">
                  <Zap className="text-primary h-5 w-5 flex-shrink-0" />
                  Can I modify my roadmap after it's created?
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-gray-600">
                Your roadmap is fully flexible. Add custom tasks, adjust phase
                timelines, mark tasks as optional, or regenerate entire
                sections. If you fall behind or get ahead of schedule, the AI
                can rebalance your remaining tasks. You maintain complete
                control while benefiting from intelligent suggestions.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="from-primary/5 to-primary/10 relative overflow-hidden border-t border-gray-200 bg-gradient-to-br via-white py-20">
        <div className="bg-primary/5 absolute -top-20 -right-20 h-80 w-80 rounded-full blur-3xl" />
        <div className="bg-primary/5 absolute -bottom-20 -left-20 h-80 w-80 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl p-3 md:p-4 lg:p-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="text-primary border-primary/20 mb-6 bg-white/80 backdrop-blur-sm">
              <Rocket className="mr-1 h-3 w-3" />
              Start your journey today
            </Badge>
            <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              Your Goals Are Waiting
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
              Join thousands who've transformed their ambitions into
              achievements with AI-powered planning and daily accountability.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button
                  size="lg"
                  className="group bg-primary hover:bg-primary/90 px-8 py-6 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                >
                  <Sparkles className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Create Your First Goal
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="hover:border-primary hover:bg-primary/5 border-2 border-gray-300 bg-white/80 px-8 py-6 text-lg font-semibold text-gray-700 backdrop-blur-sm transition-all"
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Sign In
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>AI-powered</span>
              </div>
            </div>
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
