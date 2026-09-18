"use client"
import { API_BASE_URL } from "@/lib/api"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-context"
import { motion } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  BookOpen,
  Sparkles,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AddStudySessionDialog } from "@/components/pages/add-study-session-dialog"
import { fetchJson } from "@/lib/api"
import {
  addDays,
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
} from "date-fns"

interface StudySession {
  id: string
  subject: string
  topic: string
  time: string
  duration: string
  color: string
}


export function StudyPlannerPage() {
  const { user } = useAuth()
  if (!user) return null

  const userId = user.id
  const [tasks, setTasks] = useState<any[]>([])

  useEffect(() => {
    if (!userId) return

    async function loadTasks() {
      try {
        const data = await fetchJson<{ tasks?: any[] }>(`/tasks/${userId}`)
        setTasks(data?.tasks || [])
      } catch (err) {
        const storedTasks = JSON.parse(window.localStorage.getItem("study_buddy_tasks") || "[]")
        setTasks(storedTasks.filter((task: any) => task.user_id === userId || !task.user_id))
        console.error("Failed to load tasks:", err)
      }
    }

    loadTasks()
  }, [userId])

  const [weeklySchedule, setWeeklySchedule] =
    useState<Record<string, StudySession[]>>({})
    const [studySessions, setStudySessions] = useState<any[]>([])
    const aiSuggestions: string[] = []

const incompleteTasks = tasks.filter(
  (task) => task.status !== "completed"
)

const highPriorityTasks = incompleteTasks.filter(
  (task) => task.priority === "high"
)

if (tasks.length === 0) {
  aiSuggestions.push(
    "You don't have any tasks yet. Add tasks to get personalized study suggestions."
  )
} else {
  if (highPriorityTasks.length > 0) {
    aiSuggestions.push(
      `You have ${highPriorityTasks.length} high-priority task${highPriorityTasks.length > 1 ? "s" : ""}. Consider focusing on "${highPriorityTasks[0].title}" first.`
    )
  }

  if (incompleteTasks.length > 0) {
    aiSuggestions.push(
      `You currently have ${incompleteTasks.length} incomplete task${incompleteTasks.length > 1 ? "s" : ""}. Try completing one before starting another.`
    )
  }

  if (studySessions.length === 0) {
    aiSuggestions.push(
      "You don't have any study sessions scheduled. Consider adding a session to your planner."
    )
  } else {
    aiSuggestions.push(
      `You have ${studySessions.length} study session${studySessions.length > 1 ? "s" : ""} scheduled. Keep up the consistency!`
    )
  }
}

  const [dialogOpen, setDialogOpen] =
    useState(false)

  const [currentDate, setCurrentDate] =
    useState(new Date())

  const [selectedDate, setSelectedDate] =
    useState(new Date())
useEffect(() => {
  async function loadSessions() {
    try {
      const data = await fetchJson<{ sessions?: any[] }>(`/study-sessions/${user?.id}`)
      const sessions = data?.sessions || []
      setStudySessions(sessions)

      const grouped: Record<string, StudySession[]> = {}

      sessions.forEach((session: any) => {
        if (!grouped[session.session_date]) {
          grouped[session.session_date] = []
        }

        grouped[session.session_date].push({
          id: session.id,
          subject: session.subject,
          topic: session.topic,
          time: session.session_time,
          duration: session.duration,
          color: "bg-primary",
        })
      })

      setWeeklySchedule(grouped)
    } catch (err) {
      const storedSessions = JSON.parse(window.localStorage.getItem("study_buddy_sessions") || "[]")
      const filtered = storedSessions.filter((session: any) => session.user_id === user?.id || !session.user_id)
      setStudySessions(filtered)

      const grouped: Record<string, StudySession[]> = {}
      filtered.forEach((session: any) => {
        if (!grouped[session.session_date]) grouped[session.session_date] = []
        grouped[session.session_date].push({
          id: session.id,
          subject: session.subject,
          topic: session.topic,
          time: session.session_time,
          duration: session.duration,
          color: "bg-primary",
        })
      })
      setWeeklySchedule(grouped)
      console.error(err)
    }
  }

  loadSessions()
}, [user])
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentDate((prev) => addDays(prev, direction === "next" ? 7 : -7))
  }

  const getSessionsForDate = (date: Date): StudySession[] => {
    const dateKey = format(date, "yyyy-MM-dd")
    return weeklySchedule[dateKey] || []
  }
``
  return (
<>
  <AddStudySessionDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
  />

  <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Study Planner</h1>
          <p className="text-muted-foreground">Organize your study schedule with AI assistance</p>
        </div>
        <Button
  onClick={() => setDialogOpen(true)}
  className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25"
>
          <Plus className="w-4 h-4 mr-2" />
          Add Study Session
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-3 space-y-4">
          {/* Week Navigation */}
          <Card className="glass-card border-glass-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigateWeek("prev")}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold text-foreground">
                  {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
                </h2>
                <button
                  onClick={() => navigateWeek("next")}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Week Days */}
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                  const sessions = getSessionsForDate(day)
                  const isSelected = isSameDay(day, selectedDate)
                  const today = isToday(day)

                  return (
                    <motion.button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-3 rounded-xl text-center transition-all ${
                        isSelected
                          ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
                          : today
                          ? "bg-secondary border-2 border-primary/50"
                          : "bg-secondary/50 hover:bg-secondary"
                      }`}
                    >
                      <p className="text-xs font-medium opacity-70">{format(day, "EEE")}</p>
                      <p className="text-lg font-bold">{format(day, "d")}</p>
                      {sessions.length > 0 && (
                        <div className="flex justify-center gap-0.5 mt-1">
                          {sessions.slice(0, 3).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected ? "bg-primary-foreground" : "bg-primary"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Day Schedule */}
          <Card className="glass-card border-glass-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Clock className="w-5 h-5 text-primary" />
                Schedule for {format(selectedDate, "EEEE, MMMM d")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getSessionsForDate(selectedDate).length > 0 ? (
                <div className="space-y-3">
                  {getSessionsForDate(selectedDate).map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group cursor-pointer"
                    >
                      <div className={`w-1.5 h-14 rounded-full ${session.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{session.subject}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{session.topic}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">{session.time}</p>
                        <p className="text-sm text-muted-foreground">{session.duration}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No study sessions scheduled for this day</p>
                  <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Session
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Upcoming Deadlines */}
          <Card className="glass-card border-glass-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-foreground text-base">
                <AlertCircle className="w-4 h-4 text-destructive" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks
  .filter((task) => task.due_date)
  .sort(
    (a, b) =>
      new Date(a.due_date).getTime() -
      new Date(b.due_date).getTime()
  )
  .slice(0, 3)
  .map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                >
                  <div
                    className={`w-2 h-8 rounded-full ${
                      task.priority === "high"
                        ? "bg-destructive"
                        : task.priority === "medium"
                        ? "bg-chart-4"
                        : "bg-accent"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.due_date}</p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card className="glass-card border-glass-border overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            <CardHeader className="pb-2 relative">
              <CardTitle className="flex items-center gap-2 text-foreground text-base">
                <Sparkles className="w-4 h-4 text-primary" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 relative">
              {aiSuggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="p-3 rounded-lg bg-secondary/50 text-sm text-muted-foreground"
                >
                  {suggestion}
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Subject Cards */}
          <Card className="glass-card border-glass-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground text-base">Subjects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { name: "Mathematics", color: "bg-primary", hours: "8h/week" },
                { name: "Physics", color: "bg-accent", hours: "6h/week" },
                { name: "Literature", color: "bg-chart-3", hours: "4h/week" },
                { name: "Chemistry", color: "bg-chart-4", hours: "5h/week" },
              ].map((subject) => (
                <div
                  key={subject.name}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <div className={`w-3 h-3 rounded-full ${subject.color}`} />
                  <span className="flex-1 text-sm text-foreground">{subject.name}</span>
                  <span className="text-xs text-muted-foreground">{subject.hours}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
</>

  )
}

function Calendar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}
