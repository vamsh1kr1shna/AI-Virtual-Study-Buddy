"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  User,
  Bell,
  Palette,
  Shield,
  Clock,
  Volume2,
  Moon,
  Sun,
  Globe,
  Save,
  ChevronRight,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const settingsSections = [
  {
    id: "profile",
    title: "Profile",
    icon: User,
    description: "Manage your account details",
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: Bell,
    description: "Configure alerts and reminders",
  },
  {
    id: "appearance",
    title: "Appearance",
    icon: Palette,
    description: "Customize how the app looks",
  },
  {
    id: "study",
    title: "Study Preferences",
    icon: Clock,
    description: "Set your study habits",
  },
  {
    id: "sound",
    title: "Sound",
    icon: Volume2,
    description: "Audio settings",
  },
  {
    id: "privacy",
    title: "Privacy & Security",
    icon: Shield,
    description: "Manage your data",
  },
]

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [activeSection, setActiveSection] = useState("profile")
  const [selectedAccent, setSelectedAccent] = useState("#38bdf8")
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    emailReminders: true,
    soundEffects: true,
    focusMode: false,
    autoStartBreaks: true,
    showStreak: true,
    weeklyReport: true,
    pomodoroLength: 25,
    shortBreakLength: 5,
    longBreakLength: 15,
    dailyGoal: 4,
  })

  useEffect(() => {
    setSettings((prev) => ({ ...prev, darkMode: theme === "dark" }))
  }, [theme])

  useEffect(() => {
    document.documentElement.style.setProperty("--primary", selectedAccent)
    document.documentElement.style.setProperty("--accent", selectedAccent)
    document.documentElement.style.setProperty("--ring", selectedAccent)
    document.documentElement.style.setProperty("--chart-1", selectedAccent)
    document.documentElement.style.setProperty("--chart-2", selectedAccent)
  }, [selectedAccent])

  const updateSetting = (key: keyof typeof settings, value: boolean | number) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleThemeToggle = (checked: boolean) => {
    updateSetting("darkMode", checked)
    setTheme(checked ? "dark" : "light")
  }

  const applyAccentColor = (color: string) => {
    setSelectedAccent(color)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Customize your Study Buddy experience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <Card className="glass-card border-glass-border lg:col-span-1">
          <CardContent className="p-3">
            <nav className="space-y-1">
              {settingsSections.map((section) => (
                <motion.button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  whileHover={{ x: 4 }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                    activeSection === section.id
                      ? "bg-gradient-to-r from-primary/20 to-accent/10 text-primary"
                      : "hover:bg-secondary"
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{section.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{section.description}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${activeSection === section.id ? "rotate-90" : ""}`} />
                </motion.button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Profile Section */}
          {activeSection === "profile" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <Card className="glass-card border-glass-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground">
                      S
                    </div>
                    <div>
                      <Button variant="outline" size="sm">Change Avatar</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Display Name</Label>
                      <input
                        id="name"
                        type="text"
                        defaultValue="Student"
                        className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <input
                        id="email"
                        type="email"
                        defaultValue="student@example.com"
                        className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school">School / Institution</Label>
                    <input
                      id="school"
                      type="text"
                      defaultValue="University"
                      className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Notifications Section */}
          {activeSection === "notifications" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <Card className="glass-card border-glass-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { key: "notifications", label: "Push Notifications", description: "Receive alerts for tasks and reminders" },
                    { key: "emailReminders", label: "Email Reminders", description: "Get daily study summaries via email" },
                    { key: "weeklyReport", label: "Weekly Reports", description: "Receive weekly progress reports" },
                    { key: "showStreak", label: "Streak Notifications", description: "Get notified about your study streak" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Switch
                        checked={settings[item.key as keyof typeof settings] as boolean}
                        onCheckedChange={(checked) => updateSetting(item.key as keyof typeof settings, checked)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Appearance Section */}
          {activeSection === "appearance" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <Card className="glass-card border-glass-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Theme & Display</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {settings.darkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-chart-4" />}
                      <div>
                        <p className="font-medium text-foreground">Dark Mode</p>
                        <p className="text-sm text-muted-foreground">Toggle dark/light theme</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.darkMode}
                      onCheckedChange={handleThemeToggle}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Accent Color</Label>
                    <div className="flex gap-3">
                      {['#38bdf8', '#34d399', '#a78bfa', '#f472b6', '#fbbf24'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          aria-label={`Set accent color ${color}`}
                          className={`w-8 h-8 rounded-full ring-2 transition-all ${selectedAccent === color ? 'ring-foreground scale-110' : 'ring-transparent hover:ring-foreground/30'}`}
                          style={{ backgroundColor: color }}
                          onClick={() => applyAccentColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">Language</p>
                        <p className="text-sm text-muted-foreground">Select your preferred language</p>
                      </div>
                    </div>
                    <select className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Study Preferences Section */}
          {activeSection === "study" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <Card className="glass-card border-glass-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Pomodoro Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Focus Duration (min)</Label>
                      <input
                        type="number"
                        value={settings.pomodoroLength}
                        onChange={(e) => updateSetting("pomodoroLength", parseInt(e.target.value))}
                        className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Short Break (min)</Label>
                      <input
                        type="number"
                        value={settings.shortBreakLength}
                        onChange={(e) => updateSetting("shortBreakLength", parseInt(e.target.value))}
                        className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Long Break (min)</Label>
                      <input
                        type="number"
                        value={settings.longBreakLength}
                        onChange={(e) => updateSetting("longBreakLength", parseInt(e.target.value))}
                        className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Daily Session Goal</Label>
                    <input
                      type="number"
                      value={settings.dailyGoal}
                      onChange={(e) => updateSetting("dailyGoal", parseInt(e.target.value))}
                      className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Auto-start Breaks</p>
                      <p className="text-sm text-muted-foreground">Automatically start break timer</p>
                    </div>
                    <Switch
                      checked={settings.autoStartBreaks}
                      onCheckedChange={(checked) => updateSetting("autoStartBreaks", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Focus Mode</p>
                      <p className="text-sm text-muted-foreground">Hide distracting elements during study</p>
                    </div>
                    <Switch
                      checked={settings.focusMode}
                      onCheckedChange={(checked) => updateSetting("focusMode", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Sound Section */}
          {activeSection === "sound" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <Card className="glass-card border-glass-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Sound Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Sound Effects</p>
                      <p className="text-sm text-muted-foreground">Play sounds for timer and notifications</p>
                    </div>
                    <Switch
                      checked={settings.soundEffects}
                      onCheckedChange={(checked) => updateSetting("soundEffects", checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Timer Sound</Label>
                    <select className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary">
                      <option>Gentle Bell</option>
                      <option>Digital Beep</option>
                      <option>Nature Chime</option>
                      <option>None</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Background Sound</Label>
                    <select className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary">
                      <option>None</option>
                      <option>White Noise</option>
                      <option>Rain</option>
                      <option>Coffee Shop</option>
                      <option>Forest</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Privacy Section */}
          {activeSection === "privacy" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <Card className="glass-card border-glass-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Privacy & Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    Export My Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Clear Study History
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
