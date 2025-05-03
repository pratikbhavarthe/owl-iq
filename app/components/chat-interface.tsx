"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Loader2, Send, BotIcon as Robot, AlertCircle } from "lucide-react"
import { ChatMessage } from "../components/chat-message"
import { useChat } from "@ai-sdk/react"
import { cn } from "@/lib/utils"

export type Message = {
  id: string
  role: "user" | "assistant" | "system" | "data"
  content: string
  createdAt?: Date
}

export function ChatInterface() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentAgent, setCurrentAgent] = useState<"chat" | "task">("chat")

  const { messages, input, handleInputChange, handleSubmit, status, error, isLoading } = useChat({
    api: "/api/chat",
    onResponse: (response: Response) => {
      // Check response headers to see which agent was used
      const agentType = response.headers.get("x-agent-type") as "chat" | "task" | null
      if (agentType) {
        setCurrentAgent(agentType)
      }

      // Scroll to bottom on new message
      setTimeout(() => scrollToBottom(), 100)
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex flex-col h-[calc(100vh-150px)]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Owl Assistant</h2>
        <Badge
          variant="outline"
          className={cn(
            "transition-colors",
            currentAgent === "chat"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
          )}
        >
          {currentAgent === "chat" ? "Chat Agent" : "Task Agent"}
        </Badge>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col border-gray-200 dark:border-gray-800">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-500">
              <Robot className="h-12 w-12 mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Welcome to OwlIQ</h3>
              <p className="max-w-md">
                I can help with robotics tasks and answer your questions. Try asking me to perform a task or explain how
                something works.
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isTaskMessage={message.role === "assistant" && currentAgent === "task"}
                />
              ))}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          {error && (
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error.message}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder={
                currentAgent === "chat" ? "Ask me anything about robotics..." : "Tell me what task to perform..."
              }
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
