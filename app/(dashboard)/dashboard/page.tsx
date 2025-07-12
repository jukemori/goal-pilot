import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Plus,
  Target,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
  BookOpen,
  Zap,
  Star,
  ArrowRight,
} from "lucide-react";
import { StatsCard } from "@/components/molecules/stats-card";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get user's goals
  const { data: goals } = await supabase
    .from("goals")
    .select("*, roadmaps(id)")
    .order("created_at", { ascending: false })
    .limit(3);

  // Get today's tasks
  const today = new Date().toISOString().split("T")[0];
  const { data: todayTasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("scheduled_date", today);

  const completedTasks =
    todayTasks?.filter((task) => task.completed).length || 0;
  const totalTasks = todayTasks?.length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl -z-10" />
        <div className="p-4 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Track your progress and manage your learning journey
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-2 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Goals"
          value={goals?.filter((g) => g.status === "active").length || 0}
          icon={<Target className="h-4 w-4 md:h-5 md:w-5" />}
          color="blue"
        />
        <StatsCard
          title="Today's Tasks"
          value={totalTasks}
          icon={<Clock className="h-4 w-4 md:h-5 md:w-5" />}
          color="purple"
        />
        <StatsCard
          title="Completed Today"
          value={completedTasks}
          icon={<CheckCircle className="h-4 w-4 md:h-5 md:w-5" />}
          color="green"
        />
        <StatsCard
          title="Progress Rate"
          value={
            totalTasks > 0
              ? `${Math.round((completedTasks / totalTasks) * 100)}%`
              : "0%"
          }
          icon={<TrendingUp className="h-4 w-4 md:h-5 md:w-5" />}
          color="orange"
        />
      </div>

      {/* Recent Goals */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
              </div>
              Recent Goals
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Your latest goals and their progress
            </CardDescription>
          </div>
          <Link href="/goals/new" className="self-start sm:self-auto">
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {goals && goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map((goal) => (
                <Link
                  key={goal.id}
                  href={`/goals/${goal.id}`}
                  className="block group"
                >
                  <div className="p-4 border rounded-xl hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 hover:border-primary/20 transition-all duration-300 hover:shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors truncate">
                            {goal.title}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="text-xs flex-shrink-0"
                          >
                            {goal.status}
                          </Badge>
                        </div>
                        <div className="flex flex-col gap-1 text-sm text-gray-600 sm:flex-row sm:items-center sm:gap-3">
                          <div className="flex items-center gap-1 min-w-0">
                            <Star className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                              {goal.current_level}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span className="whitespace-nowrap">
                              {goal.daily_time_commitment} min/day
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          {goal.roadmaps.length > 0 ? (
                            <>
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <span className="text-sm text-primary font-medium">
                                Ready
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                              <span className="text-sm text-orange-600 font-medium">
                                Generating...
                              </span>
                            </>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              <div className="pt-2">
                <Link href="/goals">
                  <Button variant="outline" className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View All Goals
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="relative">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-primary/5 rounded-full -z-10"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No goals yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start your learning journey by creating your first goal. Set
                your target and let AI generate a personalized roadmap.
              </p>
              <Link href="/goals/new">
                <Button className="bg-primary hover:bg-primary/90 shadow-md">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Goal
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Tasks */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            Today's Tasks
          </CardTitle>
          <CardDescription className="text-gray-600 mt-1">
            Tasks scheduled for{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todayTasks && todayTasks.length > 0 ? (
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "group flex items-center gap-3 p-4 border rounded-xl transition-all duration-300 hover:shadow-md",
                    task.completed
                      ? "bg-gradient-to-r from-green-50 to-green-100 border-green-200 opacity-75"
                      : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:border-blue-200",
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      task.completed
                        ? "bg-primary border-primary"
                        : "border-gray-300 group-hover:border-blue-500",
                    )}
                  >
                    {task.completed && (
                      <CheckCircle className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={cn(
                        "font-medium text-gray-900",
                        task.completed && "line-through text-gray-600",
                      )}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="h-3 w-3" />
                        {task.estimated_duration} min
                      </div>
                      {task.priority && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            task.priority <= 2 && "border-red-200 text-red-600",
                            task.priority === 3 &&
                              "border-orange-200 text-orange-600",
                            task.priority >= 4 &&
                              "border-green-200 text-green-600",
                          )}
                        >
                          {task.priority <= 2
                            ? "High"
                            : task.priority === 3
                              ? "Medium"
                              : "Low"}{" "}
                          Priority
                        </Badge>
                      )}
                    </div>
                  </div>
                  {task.completed && (
                    <div className="flex items-center gap-1 text-sm text-primary font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Done
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-2">
                <Link href="/dashboard?tab=progress#tasks-section">
                  <Button variant="outline" className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    View All Tasks
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="relative">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-blue-50 rounded-full -z-10"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No tasks for today
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                You're all caught up! Tasks will appear here when you generate
                them from your learning phases.
              </p>
              <Link href="/goals">
                <Button variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Explore Your Goals
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
