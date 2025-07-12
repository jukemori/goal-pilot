import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto max-w-7xl p-3 md:p-4 lg:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-lg">
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
      <section className="relative py-16 md:py-20 bg-white">
        <div className="mx-auto max-w-7xl p-3 md:p-4 lg:p-8">
          <div className="text-center max-w-5xl mx-auto">
            <Badge
              variant="secondary"
              className="bg-gray-100 text-gray-700 mb-6"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered Goal Achievement
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
              Turn Your
              <span className="text-primary block">Dreams Into</span>
              <span className="text-gray-900">Daily Actions</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed">
              Stop procrastinating. Start achieving. Goal Pilot uses AI to
              create personalized learning roadmaps, schedule your tasks, and
              track your progress—all adapted to your real life.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/register">
                <Button
                  size="lg"
                  className="px-8 py-4 text-lg bg-primary hover:bg-primary/90"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Start Learning Today
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg"
                >
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-8 text-gray-500 text-sm">
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
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="mx-auto max-w-7xl p-3 md:p-4 lg:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                12
              </div>
              <div className="text-gray-600">Goal Templates</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                AI
              </div>
              <div className="text-gray-600">Powered Planning</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                Smart
              </div>
              <div className="text-gray-600">Scheduling</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                Daily
              </div>
              <div className="text-gray-600">Progress Tracking</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl p-3 md:p-4 lg:p-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything you need to
              <span className="text-primary"> succeed</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From intelligent planning to progress tracking, Goal Pilot
              provides all the tools you need to turn your ambitions into
              achievements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="p-3 bg-gray-50 rounded-lg w-fit mb-4">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  AI-Powered Planning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Get personalized learning roadmaps that adapt to your skill
                  level, time availability, and learning style. Our AI creates
                  the perfect path for you.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="p-3 bg-gray-50 rounded-lg w-fit mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Smart Scheduling
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Daily tasks that fit perfectly into your life. Our intelligent
                  scheduling considers your energy levels, availability, and
                  personal preferences.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="p-3 bg-gray-50 rounded-lg w-fit mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Progress Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Beautiful insights and analytics keep you motivated. See your
                  progress in real-time and celebrate every milestone you
                  achieve.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="p-3 bg-gray-50 rounded-lg w-fit mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Adaptive Learning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Your roadmap evolves as you learn. Our AI adjusts difficulty,
                  pacing, and focus areas based on your progress and feedback.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="p-3 bg-gray-50 rounded-lg w-fit mb-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Ready-to-Use Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Get started quickly with our curated collection of learning templates
                  for programming, languages, fitness, business skills, and more.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="p-3 bg-gray-50 rounded-lg w-fit mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Personal Achievement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Stay motivated with personal progress tracking, milestone celebrations,
                  and a clear view of your learning journey from start to finish.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl p-3 md:p-4 lg:p-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How Goal Pilot Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your goals into reality with our simple 4-step process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "1",
                title: "Define Your Goal",
                description:
                  "Tell us what you want to achieve and your current skill level. Choose from templates or create custom goals.",
                color: "bg-blue-500",
              },
              {
                step: "2",
                title: "Set Your Schedule",
                description:
                  "Choose your available time and preferred learning days. Our AI adapts to your real-life constraints.",
                color: "bg-green-500",
              },
              {
                step: "3",
                title: "Get Your Roadmap",
                description:
                  "Receive a personalized learning plan with milestones, tasks, and timelines created by AI.",
                color: "bg-purple-500",
              },
              {
                step: "4",
                title: "Take Daily Action",
                description:
                  "Follow your daily tasks, track progress, and watch as you consistently move toward your goals.",
                color: "bg-orange-500",
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="border shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold text-lg">
                      {item.step}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {item.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl p-3 md:p-4 lg:p-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about Goal Pilot
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                question: "How does AI roadmap generation work?",
                answer:
                  "Our AI analyzes your goal, current skill level, and time availability to create a personalized learning path with specific milestones and daily tasks.",
              },
              {
                question: "Can I customize my learning schedule?",
                answer:
                  "Yes! You can set your available days, daily time commitment, and preferred learning pace. The AI adapts your roadmap accordingly.",
              },
              {
                question: "What types of goals can I create?",
                answer:
                  "Goal Pilot supports learning goals across programming, languages, fitness, business skills, creative pursuits, and academic subjects. You can use our templates or create custom goals.",
              },
              {
                question: "How does progress tracking work?",
                answer:
                  "Track daily task completion, milestone achievements, and overall progress with visual dashboards and calendar integration.",
              },
              {
                question: "Is Goal Pilot suitable for beginners?",
                answer:
                  "Absolutely! Our templates include beginner-friendly paths, and the AI adjusts difficulty based on your current level and progress.",
              },
              {
                question: "Can I modify my roadmap after it's created?",
                answer:
                  "Yes, roadmaps are adaptive. You can adjust timelines, add custom tasks, and the AI will help rebalance your learning path as needed.",
              },
            ].map((faq, index) => (
              <Card key={index} className="border shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="mx-auto max-w-7xl p-3 md:p-4 lg:p-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Ready to achieve your goals?
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto text-gray-600">
              Turn your dreams into daily actions. Start your journey today with
              AI-powered goal achievement.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="px-8 py-4 text-lg bg-primary hover:bg-primary/90 text-white font-semibold"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Start Free Today
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-lg border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold"
                >
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="text-sm mt-6 text-gray-500">
              No credit card required • Get started in minutes
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="mx-auto max-w-7xl p-3 md:p-4 lg:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1 bg-primary rounded">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">Goal Pilot</span>
              </div>
              <p className="text-gray-600 text-sm">
                Turn your goals into daily actions with AI-powered learning.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Product</h4>
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
              <h4 className="font-semibold mb-4 text-gray-900">Company</h4>
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
              <h4 className="font-semibold mb-4 text-gray-900">Support</h4>
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
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2024 Goal Pilot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
