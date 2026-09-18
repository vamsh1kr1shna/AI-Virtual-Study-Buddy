"use client"
import { API_BASE_URL } from "@/lib/api"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect } from "react"
import { useAuth } from "@/components/auth/auth-context"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Plus, MoreHorizontal, Calendar, Clock, Tag, CheckCircle2, Circle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { fetchJson } from "@/lib/api"

interface Task {
  id: string
  title: string
  description?: string
  subject: string
  dueDate?: string
  priority: "low" | "medium" | "high"
  estimatedTime?: string
  status?: string
}

interface Column {
  id: string
  title: string
  tasks: Task[]
  color: string
}

const initialColumns: Column[] = [
  {
    id: "todo",
    title: "To Do",
    color: "bg-muted-foreground",
    tasks: [
      { id: "1", title: "Read Chapter 7", description: "Physics textbook", subject: "Physics", dueDate: "May 28", priority: "high", estimatedTime: "2h" },
      { id: "2", title: "Practice Problems Set 4", subject: "Mathematics", dueDate: "May 29", priority: "medium", estimatedTime: "1.5h" },
      { id: "3", title: "Research Essay Topic", subject: "Literature", priority: "low", estimatedTime: "1h" },
    ],
  },
  {
    id: "inProgress",
    title: "In Progress",
    color: "bg-primary",
    tasks: [
      { id: "4", title: "Lab Report Draft", description: "Chemistry experiment analysis", subject: "Chemistry", dueDate: "May 30", priority: "high", estimatedTime: "3h" },
      { id: "5", title: "Study Flashcards", subject: "History", priority: "medium", estimatedTime: "45m" },
    ],
  },
  {
    id: "review",
    title: "Review",
    color: "bg-chart-4",
    tasks: [
      { id: "6", title: "Math Assignment 3", subject: "Mathematics", priority: "medium" },
    ],
  },
  {
    id: "completed",
    title: "Completed",
    color: "bg-accent",
    tasks: [
      { id: "7", title: "Chapter 5 Notes", subject: "Physics", priority: "low" },
      { id: "8", title: "Quiz Preparation", subject: "Chemistry", priority: "high" },
      { id: "9", title: "Essay Outline", subject: "Literature", priority: "medium" },
    ],
  },
]

function TaskCard({ task, isDragging = false }: { task: Task; isDragging?: boolean }) {
  const priorityColors = {
    low: "bg-accent/20 text-accent",
    medium: "bg-chart-4/20 text-chart-4",
    high: "bg-destructive/20 text-destructive",
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-4 rounded-xl bg-secondary/80 border border-border hover:border-primary/30 transition-all cursor-grab active:cursor-grabbing ${
        isDragging ? "shadow-lg shadow-primary/10 scale-105" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-foreground text-sm">{task.title}</h4>
        <button className="p-1 rounded hover:bg-muted transition-colors">
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground mb-3">{task.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
          <Tag className="w-3 h-3" />
          {task.subject}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-xs ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
        {task.dueDate && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {task.dueDate}
          </span>
        )}
        {task.estimatedTime && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {task.estimatedTime}
          </span>
        )}
      </div>
    </motion.div>
  )
}

function SortableTask({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} isDragging={isDragging} />
    </div>
  )
}
function DroppableColumn({
  id,
  children,
}: {
  id: string
  children: React.ReactNode
}) {
  const { setNodeRef } = useDroppable({
    id,
  })

  return (
    <div ref={setNodeRef}>
      {children}
    </div>
  )
}
export function TasksPage() {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: "todo",
      title: "To Do",
      color: "bg-muted-foreground",
      tasks: [],
    },
    {
      id: "inProgress",
      title: "In Progress",
      color: "bg-primary",
      tasks: [],
    },
    {
      id: "review",
      title: "Review",
      color: "bg-chart-4",
      tasks: [],
    },
    {
      id: "completed",
      title: "Completed",
      color: "bg-accent",
      tasks: [],
    },
  ])
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const { user } = useAuth()
  useEffect(() => {
  if (!user) return

  const loadTasks = async () => {
    try {
      const data = await fetchJson<{ tasks?: any[] }>(`/tasks/${user.id}`)
      const tasks = (data?.tasks || []).map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        subject: task.subject,
        dueDate: task.due_date,
        priority: task.priority,
        estimatedTime: task.estimated_time,
        status: task.status,
      }))

      setColumns([
        {
          id: "todo",
          title: "To Do",
          color: "bg-muted-foreground",
          tasks: tasks.filter((t: any) => t.status === "todo"),
        },
        {
          id: "inProgress",
          title: "In Progress",
          color: "bg-primary",
          tasks: tasks.filter((t: any) => t.status === "inProgress"),
        },
        {
          id: "review",
          title: "Review",
          color: "bg-chart-4",
          tasks: tasks.filter((t: any) => t.status === "review"),
        },
        {
          id: "completed",
          title: "Completed",
          color: "bg-accent",
          tasks: tasks.filter((t: any) => t.status === "completed"),
        },
      ])
    } catch (err) {
      console.error("Error loading tasks:", err)
    }
  }

  loadTasks()
}, [user])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const findColumnByTaskId = (taskId: string): Column | undefined => {
    return columns.find((col) => col.tasks.some((task) => task.id === taskId))
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const column = findColumnByTaskId(active.id as string)
    if (column) {
      const task = column.tasks.find((t) => t.id === active.id)
      if (task) setActiveTask(task)
    }
  }

const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event
  console.log("ACTIVE:", active.id)
  console.log("OVER:", over?.id)
  setActiveTask(null)

  if (!over) return

  const activeColumn = findColumnByTaskId(active.id as string)

  const overColumn = columns.find(
    (col) =>
      col.id === over.id ||
      col.tasks.some((task) => task.id === over.id)
  )

  if (!activeColumn || !overColumn) return

  if (activeColumn.id !== overColumn.id) {
    const movedTask = activeColumn.tasks.find(
      (task) => task.id === active.id
    )

    if (!movedTask) return

    fetch(`${API_BASE_URL}/tasks/${movedTask.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: overColumn.id,
      }),
    }).catch(console.error)

    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === activeColumn.id) {
          return {
            ...col,
            tasks: col.tasks.filter(
              (task) => task.id !== active.id
            ),
          }
        }

        if (col.id === overColumn.id) {
          return {
            ...col,
            tasks: [...col.tasks, movedTask],
          }
        }

        return col
      })
    )
  }
}

  const createTask = async () => {
  if (!newTaskTitle.trim() || !user) return

  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user.id,
        title: newTaskTitle,
        description: "",
        subject: "General",
        status: "todo",
        priority: "medium",
        due_date: "",
        estimated_time: "",
      }),
    })

    const result = await response.json()
console.log(result)

setShowTaskForm(false)
setNewTaskTitle("")

const reloadTasks = async () => {
  const data = await fetchJson<{ tasks?: any[] }>(`/tasks/${user.id}`)
  const tasks = (data?.tasks || []).map((task: any) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    subject: task.subject,
    dueDate: task.due_date,
    priority: task.priority,
    estimatedTime: task.estimated_time,
    status: task.status,
  }))

  setColumns([
    {
      id: "todo",
      title: "To Do",
      color: "bg-muted-foreground",
      tasks: tasks.filter((t: any) => t.status === "todo"),
    },
    {
      id: "inProgress",
      title: "In Progress",
      color: "bg-primary",
      tasks: tasks.filter((t: any) => t.status === "inProgress"),
    },
    {
      id: "review",
      title: "Review",
      color: "bg-chart-4",
      tasks: tasks.filter((t: any) => t.status === "review"),
    },
    {
      id: "completed",
      title: "Completed",
      color: "bg-accent",
      tasks: tasks.filter((t: any) => t.status === "completed"),
    },
  ])
}

reloadTasks()
  } catch (error) {
    console.error("Task creation failed:", error)
  }
}
  const totalTasks = columns.reduce((acc, col) => acc + col.tasks.length, 0)
  const completedTasks = columns.find((col) => col.id === "completed")?.tasks.length || 0
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6 min-h-screen"
    >
      {/* Header */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <div>
    <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
    <p className="text-muted-foreground">Manage your study tasks with drag and drop</p>
  </div>

  <div className="flex flex-col gap-3">
    <Button
      onClick={() => setShowTaskForm(!showTaskForm)}
      className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25"
    >
      <Plus className="w-4 h-4 mr-2" />
      Add Task
    </Button>

    {showTaskForm && (
      <div className="flex gap-2">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Task title"
          className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground"
        />

        <Button onClick={createTask}>
          Save
        </Button>
      </div>
    )}
  </div>
</div>

      {/* Progress Overview */}
      <Card className="glass-card border-glass-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-accent" />
                <span className="font-medium text-foreground">{completedTasks} completed</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">{totalTasks - completedTasks} remaining</span>
              </div>
            </div>
            <span className="text-sm font-medium text-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map((column) => (
               <DroppableColumn key={column.id} id={column.id}>
                <Card className="glass-card border-glass-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${column.color}`} />
                    <span className="text-foreground text-sm font-medium">{column.title}</span>
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground">
                      {column.tasks.length}
                    </span>
                  </div>
                  <button className="p-1 rounded hover:bg-secondary transition-colors">
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[calc(100vh-20rem)] overflow-y-auto">
                <SortableContext
                  items={column.tasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <AnimatePresence>
                    {column.tasks.map((task) => (
                      <SortableTask key={task.id} task={task} />
                    ))}
                  </AnimatePresence>
                </SortableContext>

                {column.tasks.length === 0 && (
                  <div className="p-4 rounded-xl border-2 border-dashed border-border text-center text-muted-foreground text-sm">
                    Drop tasks here
                  </div>
                )}
              </CardContent>
            </Card>
            </DroppableColumn>
          ))}
        </div>

        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} isDragging />}
        </DragOverlay>
      </DndContext>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "High Priority", count: columns.flatMap((c) => c.tasks).filter((t) => t.priority === "high").length, icon: AlertCircle, color: "text-destructive" },
          { label: "Due Today", count: 2, icon: Calendar, color: "text-chart-4" },
          { label: "In Progress", count: columns.find((c) => c.id === "inProgress")?.tasks.length || 0, icon: Clock, color: "text-primary" },
          { label: "Completed Today", count: 3, icon: CheckCircle2, color: "text-accent" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card className="glass-card border-glass-border">
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.count}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
