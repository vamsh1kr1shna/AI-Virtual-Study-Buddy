"use client"
import { useAuth } from "@/components/auth/auth-context"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Flame,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Sparkles,
  BookOpen,
  Brain,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { fetchJson } from "@/lib/api"

const upcomingTasks = [
  { title: "Physics Assignment", subject: "Physics", due: "Today, 5:00 PM", priority: "high" },
  { title: "Literature Essay", subject: "English", due: "Tomorrow", priority: "medium" },
  { title: "Math Practice", subject: "Calculus", due: "In 2 days", priority: "low" },
]

const subjects = [
  { name: "Mathematics", progress: 78, color: "bg-primary" },
  { name: "Physics", progress: 65, color: "bg-accent" },
  { name: "Literature", progress: 92, color: "bg-chart-3" },
  { name: "Chemistry", progress: 54, color: "bg-chart-4" },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function DashboardPage() {
  const { user } = useAuth()

  const [tasks, setTasks] = useState<any[]>([])
  const [studySessions, setStudySessions] = useState<any[]>([])

  useEffect(() => {
    if (!user?.id) return

    const loadDashboardData = async () => {
      try {
        const [tasksData, sessionsData] = await Promise.all([
          fetchJson<{ tasks?: any[] }>(`/tasks/${user.id}`),
          fetchJson<{ sessions?: any[] }>(`/study-sessions/${user.id}`),
        ])

        setTasks(tasksData?.tasks || [])
        setStudySessions(sessionsData?.sessions || [])
      } catch (error) {
        const storedTasks = JSON.parse(window.localStorage.getItem("study_buddy_tasks") || "[]")
        const storedSessions = JSON.parse(window.localStorage.getItem("study_buddy_sessions") || "[]")
        setTasks(storedTasks.filter((task: any) => task.user_id === user.id || !task.user_id))
        setStudySessions(storedSessions.filter((session: any) => session.user_id === user.id || !session.user_id))
        console.error("Failed to load dashboard data:", error)
      }
    }

    loadDashboardData()
  }, [user])

  const durationToMinutes = (duration: unknown) => {
  if (typeof duration === "number" && Number.isFinite(duration)) {
    return duration * 60
  }

  if (typeof duration !== "string") return 0

  const value = parseFloat(duration)
  if (!Number.isFinite(value)) return 0

  const normalized = duration.toLowerCase()

  if (normalized.includes("minute") || normalized.includes("min")) {
    return value
  }

  return value * 60
}

const totalTasks = tasks.length

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length

  const totalStudyMinutes = studySessions.reduce((total, session) => {
    const duration = durationToMinutes(session.duration)
    return total + duration
  }, 0)

  const totalStudyHours = totalStudyMinutes / 60

  const productivity =
    totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0

  const stats = [
    {
      label: "Study Sessions",
      value: studySessions.length.toString(),
      unit: "sessions",
      icon: Flame,
      color: "from-orange-500 to-red-500",
      change: "All time",
    },
    {
      label: "Total Hours",
      value: totalStudyHours.toFixed(1),
      unit: "hrs",
      icon: Clock,
      color: "from-primary to-accent",
      change: "All time",
    },
    {
      label: "Productivity",
      value: productivity.toString(),
      unit: "%",
      icon: Target,
      color: "from-accent to-emerald-500",
      change: "Tasks completed",
    },
    {
      label: "Tasks Done",
      value: completedTasks.toString(),
      unit: `/${totalTasks}`,
      icon: TrendingUp,
      color: "from-blue-500 to-primary",
      change: "All tasks",
    },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-6"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="relative overflow-hidden">
        <Card className="glass-card border-glass-border overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <CardContent className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-medium">AI Insight</span>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Welcome back, {user?.name || "Student"}!
                </h1>

                <p className="text-muted-foreground max-w-lg">
                  Keep building your study momentum. Your dashboard now
                  reflects your actual study activity and task progress.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
              >
                <Brain className="w-4 h-4" />
                Start Study Session
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card border-glass-border hover:border-primary/30 transition-colors group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>

                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-foreground">
                        {stat.value}
                      </span>

                      <span className="text-sm text-muted-foreground">
                        {stat.unit}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {stat.change}
                    </p>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} group-hover:scale-110 transition-transform`}
                  >
                    <stat.icon className="w-5 h-5 text-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="glass-card border-glass-border">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-foreground">
                Your Study Activity
              </h2>

              <p className="text-sm text-muted-foreground mt-2">
                You have completed {completedTasks} out of {totalTasks} tasks
                and completed {studySessions.length} study sessions.
              </p>

              <div className="mt-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">
                    Task Progress
                  </span>

                  <span className="font-medium text-foreground">
                    {productivity}%
                  </span>
                </div>

                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                    style={{ width: `${productivity}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-card border-glass-border h-full">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-foreground">
                Study Summary
              </h2>

              <div className="mt-5 space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Study Sessions
                  </span>

                  <span className="font-semibold text-foreground">
                    {studySessions.length}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Study Hours
                  </span>

                  <span className="font-semibold text-foreground">
                    {totalStudyHours.toFixed(1)} hrs
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Completed Tasks
                  </span>

                  <span className="font-semibold text-foreground">
                    {completedTasks}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Remaining Tasks
                  </span>

                  <span className="font-semibold text-foreground">
                    {totalTasks - completedTasks}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}