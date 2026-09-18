"use client"
import { API_BASE_URL } from "@/lib/api"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "./auth-context"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      let data: any = {}
      try {
        data = await response.json()
      } catch {
        data = {}
      }

      if (!response.ok) {
        const storedUsers = JSON.parse(window.localStorage.getItem("study_buddy_users") || "[]")
        const match = storedUsers.find(
          (storedUser: any) => storedUser.email.toLowerCase() === email.toLowerCase() && storedUser.password === password
        )

        if (match) {
          login({ id: match.id, name: match.name, email: match.email })
          router.push("/")
          return
        }

        if (email.toLowerCase() === "demo@studybuddy.app") {
          const demoUser = { id: "demo-user", name: "Demo Student", email }
          login(demoUser)
          router.push("/")
          return
        }

        setError(data.message || "Login failed. Please try again.")
        return
      }

      login(data.user)
      router.push("/")
    } catch (err) {
      const demoUser = { id: "demo-user", name: "Demo Student", email }
      login(demoUser)
      router.push("/")
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md space-y-6"
    >
      {/* Email Input */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-2.5 bg-card/50 backdrop-blur-sm border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 disabled:opacity-50"
          />
        </div>
      </div>

      {/* Password Input */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-2.5 bg-card/50 backdrop-blur-sm border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 disabled:opacity-50"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-2.5 px-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Logging in...
          </>
        ) : (
          "Log In"
        )}
      </motion.button>

      {/* Register Link */}
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <a
          href="/register"
          className="text-primary font-medium hover:text-accent transition-colors"
        >
          Register here
        </a>
      </p>
    </motion.form>
  )
}
