"use client"

import type { Message } from "ai"
import { cn } from "@/lib/utils"
import { Bot, User, Volume2 } from "lucide-react"
import type { ReactNode } from "react"
import { Card } from "./ui/card"
import { Avatar } from "./ui/avatar"
import { Button } from "./ui/button"

interface ChatMessageProps {
  message: Message
  className?: string
  icon?: ReactNode
  onPlayVoice?: () => void
}

export function ChatMessage({ message, className, icon, onPlayVoice }: ChatMessageProps) {
  return (
    <Card
      className={cn(
        "flex items-start p-4 gap-3",
        message.role === "user" ? "bg-gray-400/30" : "bg-gray-800/50",
        className,
      )}
    >
      <Avatar className={cn("h-8 w-8 rounded-md", message.role === "user" ? "bg-orange-600" : "bg-pink-900/50")}>
        {icon || (message.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />)}
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-medium">{message.role === "user" ? "You" : "OwlIQ"}</div>
          {message.role === "assistant" && onPlayVoice && (
            <Button
              className="ghost h-6 w-6 rounded-full hover:bg-amber-600/20 hover:text-orange-400"
              onClick={onPlayVoice}
            >
              <Volume2 className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="text-sm whitespace-pre-wrap break-words">{message.content}</div>
      </div>
    </Card>
  )
}