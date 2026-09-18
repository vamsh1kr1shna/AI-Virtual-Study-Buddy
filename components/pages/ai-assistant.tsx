  "use client"
  import { API_BASE_URL } from "@/lib/api"
  import { useAuth } from "@/components/auth/auth-context"
  import { useState, useRef, useEffect, type Dispatch, type SetStateAction } from "react"
  import ReactMarkdown from "react-markdown"
  import remarkGfm from "remark-gfm"
  import rehypeRaw from "rehype-raw"
  import { motion, AnimatePresence } from "framer-motion"
  import { Send, Sparkles, User, Bot, Lightbulb, BookOpen, Calendar, Brain } from "lucide-react"
  import { Card, CardContent } from "@/components/ui/card"
  import { Button } from "@/components/ui/button"

  export interface ChatMessage {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
  }

  const suggestedPrompts = [
    { icon: Lightbulb, text: "Help me create a study plan for my physics exam" },
    { icon: BookOpen, text: "Explain quantum mechanics in simple terms" },
    { icon: Calendar, text: "How should I prioritize my tasks this week?" },
    { icon: Brain, text: "Give me memory techniques for studying history" },
  ]

  export const initialMessages: ChatMessage[] = [
    {
    id: "1",
    role: "assistant",
    content: "Hello! I'm your AI Study Buddy. I'm here to help you learn more effectively, create study plans, explain difficult concepts, and boost your productivity. What would you like to work on today?",
    timestamp: new Date(),
  },
]

interface AIAssistantPageProps {
  messages: ChatMessage[]
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>
}

export function AIAssistantPage({ messages, setMessages }: AIAssistantPageProps) {
  const { user } = useAuth()
  const handlePromptClick = (prompt: string) => {
  setInput(prompt)
}
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])
  useEffect(() => {
  const loadChatHistory = async () => {
    if (!user?.id) return

    try {
      const response = await fetch(
        `${API_BASE_URL}/chat-history/${user.id}`
      )

      const data = await response.json()

      const history: ChatMessage[] = data.messages.map((msg: any) => ({
        id: msg.id.toString(),
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at),
      }))

      setMessages(history)
    } catch (error) {
      console.error("Failed to load chat history:", error)
    }
  }

  loadChatHistory()
}, [user, setMessages])
  const simulateResponse = async (userMessage: string) => {
    setIsTyping(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const responses: Record<string, string> = {
      default: `Great question! Based on your study patterns and goals, here's my suggestion:\n\n1. **Break it down**: Divide your topic into smaller, manageable chunks\n2. **Active recall**: Test yourself regularly instead of passive reading\n3. **Spaced repetition**: Review material at increasing intervals\n4. **Focus sessions**: Use the Pomodoro technique for concentrated study\n\nWould you like me to create a personalized study schedule based on these principles?`,
      physics: `For your physics exam preparation, I recommend:\n\n📚 **Week 1-2**: Core concepts review\n- Newton's laws and applications\n- Energy and momentum\n- Wave mechanics basics\n\n📝 **Week 3**: Practice problems\n- Work through past exam papers\n- Focus on calculation-heavy questions\n\n🎯 **Week 4**: Final review\n- Key formulas and their applications\n- Common problem-solving patterns\n\nShall I add these to your study planner?`,
      quantum: `Let me explain quantum mechanics in simple terms:\n\n🌟 **The Big Idea**: At tiny scales (atoms and smaller), things don't behave like everyday objects.\n\n**Key Concepts:**\n\n1. **Wave-Particle Duality**: Light and matter can act like both waves and particles - like how water can be calm ripples or splashing drops.\n\n2. **Uncertainty Principle**: You can't know everything about a particle at once. It's like trying to photograph a hummingbird - the clearer you see its position, the blurrier its motion becomes.\n\n3. **Superposition**: Particles can be in multiple states at once until measured - like a coin spinning in the air being both heads and tails until it lands.\n\nWant me to dive deeper into any of these concepts?`,
      prioritize: `Based on your current tasks and deadlines, here's how I'd prioritize your week:\n\n🔴 **High Priority (Do First)**:\n- Physics Lab Report (Due May 28)\n- Math Assignment 5 (Due May 29)\n\n🟡 **Medium Priority**:\n- Chemistry study session\n- History chapter review\n\n🟢 **Can Wait**:\n- Literature essay research\n- Flashcard organization\n\n**Suggested Daily Focus:**\n- Mon-Tue: Physics & Math\n- Wed-Thu: Chemistry\n- Fri: Catch up & review\n\nWant me to block these in your study planner?`,
      memory: `Here are powerful memory techniques for studying history:\n\n🧠 **1. Memory Palace**\nImagine walking through your home. Place historical events in different rooms. WWII starts in the kitchen, Cold War in the living room, etc.\n\n📅 **2. Timeline Visualization**\nCreate a mental timeline as a road. Important dates are landmarks you pass.\n\n🔗 **3. Chain Method**\nLink events with absurd stories. "The Renaissance PAINTER accidentally started the REFORMATION by spilling paint on church documents."\n\n🎵 **4. Mnemonics & Songs**\nTurn dates into phone numbers or create rhymes.\n\n✍️ **5. Teach It Back**\nExplain events to an imaginary student - this forces deep understanding.\n\nWant me to help you apply any of these to your current history topics?`,
    }

    let response = responses.default
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes("physics") || lowerMessage.includes("exam")) {
      response = responses.physics
    } else if (lowerMessage.includes("quantum")) {
      response = responses.quantum
    } else if (lowerMessage.includes("prioritize") || lowerMessage.includes("tasks") || lowerMessage.includes("week")) {
      response = responses.prioritize
    } else if (lowerMessage.includes("memory") || lowerMessage.includes("history")) {
      response = responses.memory
    }

    setIsTyping(false)
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      },
    ])
  }

const handleSend = async () => {
  if (!input.trim()) return

  const userInput = input

  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    role: "user",
    content: userInput,
    timestamp: new Date(),
  }

  setMessages((prev) => [...prev, userMessage])
  setInput("")

  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
      message: userInput,
      user_id: user?.id
      }),
    })

    const data = await response.json()

    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: data.reply,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, aiMessage])
  } catch (error) {
    console.error(error)

    const errorMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "Failed to connect to AI backend.",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, errorMessage])
  }
}

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 h-[calc(100vh-2rem)] flex flex-col"
    >
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          AI Study Assistant
        </h1>
        <p className="text-muted-foreground">Your personal tutor powered by AI</p>
      </div>

      {/* Chat Container */}
      <Card className="glass-card border-glass-border flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-primary to-accent"
                      : "bg-secondary"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <Bot className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-tr-sm"
                      : "bg-secondary rounded-tl-sm"
                  }`}
                >
                  <div className="text-sm leading-6 space-y-3">
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeRaw]}
  components={{
    h1: ({ children }) => (
      <h1 className="text-lg font-bold text-foreground mt-2 mb-3">
        {children}
      </h1>
    ),

    h2: ({ children }) => (
      <h2 className="text-base font-bold text-foreground mt-4 mb-2">
        {children}
      </h2>
    ),

    h3: ({ children }) => (
      <h3 className="text-sm font-semibold text-primary mt-4 mb-2">
        {children}
      </h3>
    ),

    p: ({ children }) => (
      <p className="leading-6 mb-3">
        {children}
      </p>
    ),

    ul: ({ children }) => (
      <ul className="list-disc pl-5 space-y-1 mb-3">
        {children}
      </ul>
    ),

    ol: ({ children }) => (
      <ol className="list-decimal pl-5 space-y-1 mb-3">
        {children}
      </ol>
    ),

    li: ({ children }) => (
      <li className="leading-6">
        {children}
      </li>
    ),

    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">
        {children}
      </strong>
    ),

    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-primary pl-4 italic my-3">
        {children}
      </blockquote>
    ),

    hr: () => (
      <hr className="border-border my-4" />
    ),

    table: ({ children }) => (
      <div className="w-full overflow-x-auto my-4 rounded-lg border border-border">
        <table className="w-full text-sm border-collapse">
          {children}
        </table>
      </div>
    ),

    thead: ({ children }) => (
      <thead className="bg-muted">
        {children}
      </thead>
    ),

    tbody: ({ children }) => (
      <tbody>
        {children}
      </tbody>
    ),

    tr: ({ children }) => (
      <tr className="border-b border-border">
        {children}
      </tr>
    ),

    th: ({ children }) => (
      <th className="px-4 py-3 text-left font-semibold text-foreground border-r border-border last:border-r-0">
        {children}
      </th>
    ),

    td: ({ children }) => (
      <td className="px-4 py-3 align-top border-r border-border last:border-r-0">
        {children}
      </td>
    ),

    br: () => <br />,
  }}
>
  {message.content}
</ReactMarkdown>
</div>
                  <div
                    className={`text-xs mt-2 ${
                      message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-secondary p-4 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Suggested Prompts */}
        {messages.length <= 1 && (
          <div className="px-4 pb-4">
            <p className="text-sm text-muted-foreground mb-2">Suggested prompts:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestedPrompts.map((prompt, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handlePromptClick(prompt.text)}
                  className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50 hover:bg-secondary text-left transition-colors text-sm"
                >
                  <prompt.icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-foreground line-clamp-1">{prompt.text}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask me anything about studying..."
              className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 rounded-xl shadow-lg shadow-primary/25 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            AI responses are for educational purposes. Always verify information with reliable sources.
          </p>
        </div>
      </Card>
    </motion.div>
  )
}
