"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Calendar,
  Timer,
  CheckSquare,
  BarChart3,
  MessageSquare,
  Settings,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-context"
interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "planner", label: "Study Planner", icon: Calendar },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "assistant", label: "AI Assistant", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: Settings },
]

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const { user, logout } = useAuth()

  useEffect(() => {
    const updateMobileState = () => setIsMobile(window.innerWidth < 1024)
    updateMobileState()
    window.addEventListener("resize", updateMobileState)
    return () => window.removeEventListener("resize", updateMobileState)
  }, [])

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-card/80 backdrop-blur-sm border border-border lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 80 : 260,
          x: isMobile ? (isMobileOpen ? 0 : -280) : 0,
        }}
        className={cn(
          "fixed top-0 left-0 h-full z-50 flex flex-col",
          "bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border",
          "lg:relative lg:translate-x-0",
          !isMobileOpen && "lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent blur-lg opacity-50" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <h1 className="text-lg font-bold text-foreground whitespace-nowrap">Study Buddy</h1>
                <p className="text-xs text-muted-foreground whitespace-nowrap">AI-Powered Learning</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="ml-auto p-1 rounded-lg hover:bg-sidebar-accent lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex ml-auto p-1 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            <motion.div animate={{ rotate: isCollapsed ? 0 : 180 }}>
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentPage === item.id
            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id)
                  setIsMobileOpen(false)
                }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  "hover:bg-sidebar-accent",
                  isActive && "bg-gradient-to-r from-primary/20 to-accent/10 text-primary"
                )}
              >
                <div className={cn(
                  "relative flex items-center justify-center",
                  isActive && "text-primary"
                )}>
                  <item.icon className="w-5 h-5" />
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 rounded-lg bg-primary/20 blur-md"
                    />
                  )}
                </div>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && !isCollapsed && (
                  <motion.div
                    layoutId="activeBar"
                    className="ml-auto w-1.5 h-5 rounded-full bg-gradient-to-b from-primary to-accent"
                  />
                )}
              </motion.button>
            )
          })}
        </nav>

        {/* User Profile */}
<div className="p-3 border-t border-sidebar-border space-y-2">
  <div
    className={cn(
      "flex items-center gap-3 p-2 rounded-xl",
      "bg-sidebar-accent/50 hover:bg-sidebar-accent transition-colors"
    )}
  >
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground">
      {user?.name?.charAt(0).toUpperCase() || "S"}
    </div>

    <AnimatePresence>
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
          className="overflow-hidden"
        >
          <p className="text-sm font-medium whitespace-nowrap">
            {user?.name || "Student"}
          </p>
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            {user?.email || "Free Plan"}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>

  <button
    onClick={logout}
    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
  >
    <LogOut className="w-4 h-4" />
    {!isCollapsed && <span>Logout</span>}
  </button>
</div>
      </motion.aside>
    </>
  )
}
