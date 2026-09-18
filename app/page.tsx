"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DashboardPage } from "@/components/pages/dashboard"
import { StudyPlannerPage } from "@/components/pages/study-planner"
import { TasksPage } from "@/components/pages/tasks"
import { AnalyticsPage } from "@/components/pages/analytics"
import { AIAssistantPage, initialMessages, type ChatMessage } from "@/components/pages/ai-assistant"
import { SettingsPage } from "@/components/pages/settings"

export default function Home() {
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [assistantMessages, setAssistantMessages] = useState<ChatMessage[]>(initialMessages)

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage />
      case "planner":
        return <StudyPlannerPage />
      case "tasks":
        return <TasksPage />
      case "analytics":
        return <AnalyticsPage />
      case "assistant":
        return <AIAssistantPage messages={assistantMessages} setMessages={setAssistantMessages} />
      case "settings":
        return <SettingsPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 lg:ml-0 overflow-y-auto">
        <div className="min-h-screen pt-14 lg:pt-0">
          {renderPage()}
        </div>
      </main>
    </div>
  )
}
