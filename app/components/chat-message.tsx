import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { cn } from "@/lib/utils"
import type { Message } from "../components/chat-interface"
import { BotIcon as Robot, User, Wrench } from "lucide-react"
import { TaskValidation } from "../components/task-validation"

interface ChatMessageProps {
  message: Message
  isTaskMessage?: boolean
}

export function ChatMessage({ message, isTaskMessage = false }: ChatMessageProps) {
  const isUser = message.role === "user"

  // Check if the message contains task validation data
  const hasTaskValidation =
    isTaskMessage &&
    (message.content.includes("parameter") ||
      message.content.includes("validation") ||
      message.content.includes("missing"))

  return (
    <div className={cn("flex gap-3 mb-4 text-sm", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className={cn("text-primary-foreground", isTaskMessage ? "bg-green-600" : "bg-primary")}>
            {isTaskMessage ? <Wrench className="h-4 w-4" /> : <Robot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "rounded-lg px-4 py-2 max-w-[80%]",
          isUser
            ? "bg-primary text-primary-foreground"
            : isTaskMessage
              ? "bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100"
              : "bg-muted",
        )}
      >
        {hasTaskValidation ? <TaskValidation message={message.content} /> : message.content}
      </div>

      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
