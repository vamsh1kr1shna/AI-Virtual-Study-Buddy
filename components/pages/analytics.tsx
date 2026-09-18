"use client"
import { API_BASE_URL } from "@/lib/api"
import { useEffect, useState } from "react"

import { useAuth } from "@/components/auth/auth-context"

import { motion } from "framer-motion"

import {

  BarChart,

  Bar,

  XAxis,

  YAxis,

  CartesianGrid,

  Tooltip,

  ResponsiveContainer,

  LineChart,

  Line,

  PieChart,

  Pie,

  Cell,

  AreaChart,

  Area,

} from "recharts"

import { TrendingUp, TrendingDown, Clock, Target, Brain, Flame, BookOpen, BarChart3 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"





const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number | string; name: string }>; label?: string }) => {

  if (active && payload && payload.length) {

    return (

      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">

        <p className="text-sm font-medium text-foreground mb-1">{label}</p>

        {payload.map((entry, index) => (

          <p key={index} className="text-sm text-muted-foreground">

            {entry.name}: <span className="text-foreground font-medium">{entry.value}</span>

          </p>

        ))}

      </div>

    )

  }

  return null

}



export function AnalyticsPage() {

  const { user } = useAuth()

  const [weeklyHoursData, setWeeklyHoursData] = useState([

  { day: "Mon", hours: 0 },

  { day: "Tue", hours: 0 },

  { day: "Wed", hours: 0 },

  { day: "Thu", hours: 0 },

  { day: "Fri", hours: 0 },

  { day: "Sat", hours: 0 },

  { day: "Sun", hours: 0 },

])



const [analytics, setAnalytics] = useState({

  totalTasks: 0,

  completedTasks: 0,

  inProgressTasks: 0,

  completionRate: 0,

})

const [subjectProgressData, setSubjectProgressData] = useState<any[]>([])

const [productivityTrendData, setProductivityTrendData] = useState<any[]>([])
const [focusConsistencyData, setFocusConsistencyData] = useState<any[]>([])

useEffect(() => {
  let cancelled = false

  async function loadAnalytics() {
    if (!user?.id) {
      setWeeklyHoursData([
        { day: "Mon", hours: 0 },
        { day: "Tue", hours: 0 },
        { day: "Wed", hours: 0 },
        { day: "Thu", hours: 0 },
        { day: "Fri", hours: 0 },
        { day: "Sat", hours: 0 },
        { day: "Sun", hours: 0 },
      ])
      setSubjectProgressData([])
      setProductivityTrendData([])
      setFocusConsistencyData([])
      setAnalytics({
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        completionRate: 0,
      })
      return
    }

    try {
      const [sessionsResponse, tasksResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/study-sessions/${user.id}`),
        fetch(`${API_BASE_URL}/tasks/${user.id}`),
      ])

      if (!sessionsResponse.ok) {
        throw new Error(`Study sessions request failed: ${sessionsResponse.status}`)
      }

      if (!tasksResponse.ok) {
        throw new Error(`Tasks request failed: ${tasksResponse.status}`)
      }

      const sessionsData = await sessionsResponse.json()
      const tasksData = await tasksResponse.json()

      if (cancelled) return

      const sessions = Array.isArray(sessionsData.sessions)
        ? sessionsData.sessions
        : []
      const tasks = Array.isArray(tasksData.tasks) ? tasksData.tasks : []

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const dayOfWeek = today.getDay()
      const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1

      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - daysSinceMonday)

      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 7)

      const currentWeekSessions = sessions.filter((session: any) => {
        const sessionDate = new Date(`${session.session_date}T00:00:00`)
        return (
          !Number.isNaN(sessionDate.getTime()) &&
          sessionDate >= weekStart &&
          sessionDate < weekEnd
        )
      })

      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

      const weeklyData = days.map((day, index) => {
        const targetDate = new Date(weekStart)
        targetDate.setDate(weekStart.getDate() + index)

        const totalMinutes = currentWeekSessions
          .filter((session: any) => {
            const sessionDate = new Date(`${session.session_date}T00:00:00`)
            return (
              !Number.isNaN(sessionDate.getTime()) &&
              sessionDate.getFullYear() === targetDate.getFullYear() &&
              sessionDate.getMonth() === targetDate.getMonth() &&
              sessionDate.getDate() === targetDate.getDate()
            )
          })
          .reduce((total: number, session: any) => {
            return total + (parseFloat(session.duration) || 0)
          }, 0)

        return {
          day,
          hours: Math.round((totalMinutes / 60) * 10) / 10,
        }
      })

      setWeeklyHoursData(weeklyData)

      const subjectTotals: Record<string, number> = {}

      currentWeekSessions.forEach((session: any) => {
        const subject = session.subject?.trim() || "Other"
        const duration = parseFloat(session.duration) || 0
        subjectTotals[subject] = (subjectTotals[subject] || 0) + duration
      })

      const totalSubjectMinutes = Object.values(subjectTotals).reduce(
        (sum, value) => sum + value,
        0
      )

      const chartColors = [
        "#6366f1",
        "#22c55e",
        "#f59e0b",
        "#ef4444",
        "#06b6d4",
        "#a855f7",
      ]

      setSubjectProgressData(
        Object.entries(subjectTotals).map(([subject, minutes], index) => ({
          subject,
          value:
            totalSubjectMinutes > 0
              ? Math.round((minutes / totalSubjectMinutes) * 100)
              : 0,
          color: chartColors[index % chartColors.length],
        }))
      )

      // Focus/break events are not stored by the current backend.
      // This metric therefore represents study-time consistency, not focus time.
      const maxDailyMinutes = Math.max(
        ...weeklyData.map((day) => day.hours * 60),
        0
      )

      setFocusConsistencyData(
        weeklyData.map((day) => ({
          day: day.day,
          consistency:
            maxDailyMinutes > 0
              ? Math.round(((day.hours * 60) / maxDailyMinutes) * 100)
              : 0,
        }))
      )

      const totalTasks = tasks.length
      const completedTasks = tasks.filter(
        (task: any) => task.status === "completed"
      ).length
      const inProgressTasks = tasks.filter(
        (task: any) => task.status === "inProgress"
      ).length

      const completionRate =
        totalTasks > 0
          ? Math.round((completedTasks / totalTasks) * 100)
          : 0

      setAnalytics({
        totalTasks,
        completedTasks,
        inProgressTasks,
        completionRate,
      })

      // No historical task snapshots exist in the current backend,
      // so show only the real current completion rate.
      setProductivityTrendData([
        {
          week: "Current",
          score: completionRate,
        },
      ])
    } catch (error) {
      if (!cancelled) {
        console.error("Failed to load analytics:", error)
      }
    }
  }

  loadAnalytics()

  return () => {
    cancelled = true
  }
}, [user?.id])

const stats = [

  {

    label: "Total Tasks",

    value: analytics.totalTasks,

    change: "",

    trend: "up",

    icon: Target,

  },

  {

    label: "Completed",

    value: analytics.completedTasks,

    change: "",

    trend: "up",

    icon: Flame,

  },

  {

    label: "In Progress",

    value: analytics.inProgressTasks,

    change: "",

    trend: "up",

    icon: Clock,

  },

  {

    label: "Completion %",

    value: `${analytics.completionRate}%`,

    change: "",

    trend: "up",

    icon: Brain,

  },

]

  return (

    <motion.div

      initial={{ opacity: 0 }}

      animate={{ opacity: 1 }}

      className="p-6 space-y-6"

    >

      {/* Header */}

      <div>

        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>

        <p className="text-muted-foreground">Track your study progress and productivity trends</p>

      </div>



      {/* Stats Overview */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {stats.map((stat, index) => (

          <motion.div

            key={stat.label}

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ delay: index * 0.1 }}

          >

            <Card className="glass-card border-glass-border">

              <CardContent className="p-4">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-sm text-muted-foreground">{stat.label}</p>

                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>

                    <div className="flex items-center gap-1 mt-1">

                      {stat.trend === "up" ? (

                        <TrendingUp className="w-3 h-3 text-accent" />

                      ) : (

                        <TrendingDown className="w-3 h-3 text-destructive" />

                      )}

                      <span className={`text-xs ${stat.trend === "up" ? "text-accent" : "text-destructive"}`}>

                        {stat.change}

                      </span>

                    </div>

                  </div>

                  <div className="p-2 rounded-lg bg-primary/10">

                    <stat.icon className="w-5 h-5 text-primary" />

                  </div>

                </div>

              </CardContent>

            </Card>

          </motion.div>

        ))}

      </div>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Weekly Study Hours */}

        <motion.div

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ delay: 0.2 }}

        >

          <Card className="glass-card border-glass-border">

            <CardHeader className="pb-2">

              <CardTitle className="flex items-center gap-2 text-foreground">

                <BarChart3 className="w-5 h-5 text-primary" />

                Weekly Study Hours

              </CardTitle>

            </CardHeader>

            <CardContent>

              <div className="h-[280px]">

                <ResponsiveContainer width="100%" height="100%">

                  <BarChart data={weeklyHoursData}>

                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />

                    <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />

                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />

                    <Tooltip content={<CustomTooltip />} />

                    <Bar

                      dataKey="hours"

                      name="Hours"

                      fill="url(#barGradient)"

                      radius={[4, 4, 0, 0]}

                    />

                    <defs>

                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">

                        <stop offset="0%" stopColor="#38bdf8" />

                        <stop offset="100%" stopColor="#34d399" />

                      </linearGradient>

                    </defs>

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </CardContent>

          </Card>

        </motion.div>



        {/* Subject Distribution */}

        <motion.div

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ delay: 0.3 }}

        >

          <Card className="glass-card border-glass-border">

            <CardHeader className="pb-2">

              <CardTitle className="flex items-center gap-2 text-foreground">

                <BookOpen className="w-5 h-5 text-primary" />

                Subject Distribution

              </CardTitle>

            </CardHeader>

            <CardContent>

              <div className="h-[280px] flex items-center justify-center">

                <ResponsiveContainer width="100%" height="100%">

                  <PieChart>

                    <Pie

                      data={subjectProgressData}

                      cx="50%"

                      cy="50%"

                      innerRadius={60}

                      outerRadius={100}

                      paddingAngle={5}

                      dataKey="value"

                    >

                      {subjectProgressData.map((entry, index) => (

                        <Cell key={`cell-${index}`} fill={entry.color} />

                      ))}

                    </Pie>

                    <Tooltip content={<CustomTooltip />} />

                  </PieChart>

                </ResponsiveContainer>

              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">

                {subjectProgressData.map((subject) => (
  <div key={subject.subject} className="flex items-center gap-2">
    <div
      className="w-3 h-3 rounded-full"
      style={{ backgroundColor: subject.color }}
    />
    <span className="text-sm text-muted-foreground">
      {subject.subject}
    </span>
    <span className="text-sm font-medium text-foreground ml-auto">
      {subject.value}%
    </span>
  </div>
))}

              </div>

            </CardContent>

          </Card>

        </motion.div>



        {/* Productivity Trend */}

        <motion.div

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ delay: 0.4 }}

        >

          <Card className="glass-card border-glass-border">

            <CardHeader className="pb-2">

              <CardTitle className="flex items-center gap-2 text-foreground">

                <TrendingUp className="w-5 h-5 text-accent" />

                Productivity Trend

              </CardTitle>

            </CardHeader>

            <CardContent>

              <div className="h-[280px]">

                <ResponsiveContainer width="100%" height="100%">

                  <AreaChart data={productivityTrendData}>

                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />

                    <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} />

                    <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={[0, 100]} />

                    <Tooltip content={<CustomTooltip />} />

                    <defs>

                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">

                        <stop offset="0%" stopColor="#34d399" stopOpacity={0.4} />

                        <stop offset="100%" stopColor="#34d399" stopOpacity={0} />

                      </linearGradient>

                    </defs>

                    <Area

                      type="monotone"

                      dataKey="score"

                      name="Score"

                      stroke="#34d399"

                      strokeWidth={2}

                      fill="url(#areaGradient)"

                    />

                  </AreaChart>

                </ResponsiveContainer>

              </div>

            </CardContent>

          </Card>

        </motion.div>



        {/* Study Consistency */}

        <motion.div

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ delay: 0.5 }}

        >

          <Card className="glass-card border-glass-border">

            <CardHeader className="pb-2">

              <CardTitle className="flex items-center gap-2 text-foreground">

                <Brain className="w-5 h-5 text-primary" />

                Study Consistency

              </CardTitle>

            </CardHeader>

            <CardContent>

              <div className="h-[280px]">

                <ResponsiveContainer width="100%" height="100%">

                  <LineChart data={focusConsistencyData}>

                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />

                    <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />

                    <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={[0, 100]} />

                    <Tooltip content={<CustomTooltip />} />

                    <Line

                      type="monotone"

                      dataKey="consistency"

                      name="Focus %"

                      stroke="#38bdf8"

                      strokeWidth={2}

                      dot={{ fill: "#38bdf8", r: 4 }}

                      activeDot={{ r: 6 }}

                    />

                    <Line

                      type="monotone"

                      dataKey="consistency"

                      name="Break %"

                      stroke="#f472b6"

                      strokeWidth={2}

                      dot={{ fill: "#f472b6", r: 4 }}

                      activeDot={{ r: 6 }}

                    />

                  </LineChart>

                </ResponsiveContainer>

              </div>

            </CardContent>

          </Card>

        </motion.div>

      </div>



      {/* Monthly Goals */}

      <motion.div

        initial={{ opacity: 0, y: 20 }}

        animate={{ opacity: 1, y: 0 }}

        transition={{ delay: 0.6 }}

      >

        <Card className="glass-card border-glass-border">

          <CardHeader className="pb-2">

            <CardTitle className="flex items-center gap-2 text-foreground">

              <Target className="w-5 h-5 text-chart-4" />

              Task Completion Summary

            </CardTitle>

          </CardHeader>

          <CardContent>

            <div className="h-[200px]">

              <ResponsiveContainer width="100%" height="100%">

                <BarChart
                  data={[
                    { status: "Completed", count: analytics.completedTasks },
                    { status: "In Progress", count: analytics.inProgressTasks },
                    {
                      status: "Other",
                      count:
                        analytics.totalTasks -
                        analytics.completedTasks -
                        analytics.inProgressTasks,
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="status" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Tasks" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>

              </ResponsiveContainer>

            </div>

          </CardContent>

        </Card>

      </motion.div>

    </motion.div>

  )

}