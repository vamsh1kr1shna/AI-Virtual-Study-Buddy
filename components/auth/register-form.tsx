"use client"
import { API_BASE_URL } from "@/lib/api"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, Lock, User, Loader2, AlertCircle, CheckCircle } from "lucide-react"

export function RegisterForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)

    const storedUsers = JSON.parse(window.localStorage.getItem("study_buddy_users") || "[]")
    const existingUser = storedUsers.find(
      (storedUser: any) => storedUser.email.toLowerCase() === email.toLowerCase()
    )

    if (existingUser) {
      setError("An account with this email already exists.")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
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
        const fallbackUser = { id: `local-${Date.now()}`, name, email, password }
        const nextUsers = [...storedUsers, fallbackUser]
        window.localStorage.setItem("study_buddy_users", JSON.stringify(nextUsers))
        setSuccess(true)
        setTimeout(() => router.push("/login"), 2000)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err) {
      const fallbackUser = { id: `local-${Date.now()}`, name, email, password }
      const nextUsers = [...storedUsers, fallbackUser]
      window.localStorage.setItem("study_buddy_users", JSON.stringify(nextUsers))
      setSuccess(true)
      setTimeout(() => router.push("/login"), 2000)
      console.error("Register error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center space-y-4"
      >
        <div className="flex justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-8 h-8 text-primary-foreground" />
          </motion.div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Account Created!</h2>
          <p className="text-muted-foreground mt-2">Redirecting to login...</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md space-y-5"
    >
      {/* Name Input */}
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-foreground">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-2.5 bg-card/50 backdrop-blur-sm border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 disabled:opacity-50"
          />
        </div>
      </div>

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

      {/* Confirm Password Input */}
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </motion.button>

      {/* Login Link */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <a
          href="/login"
          className="text-primary font-medium hover:text-accent transition-colors"
        >
          Log in here
        </a>
      </p>
    </motion.form>
  )
}
