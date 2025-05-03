import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { determineAgentType } from "@/lib/agent-utils"
import { validateTaskParameters } from "@/lib/task-validator"

export const maxDuration = 30 // Allows streaming up to 30 seconds

const CHAT_AGENT_PROMPT = `You are OwlIQ's conversational AI assistant for robotics. 
You help users understand robotics concepts and answer general questions.
You are friendly, helpful, and knowledgeable about robotics.
If a user asks about performing a specific task with a robot, inform them that you'll switch to the Task Agent mode.`

const TASK_AGENT_PROMPT = `You are OwlIQ's task execution AI for robotics.
You help users plan and execute robotics tasks by breaking them down into skills and validating parameters.
You focus on practical execution rather than general conversation.
Always validate parameters before executing tasks.

Available Robot Skills:
... (keep your skills list here unchanged)
`

interface ApiMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json() as { messages: ApiMessage[] }

    const agentType = determineAgentType(messages)
    const systemPrompt = agentType === "chat" ? CHAT_AGENT_PROMPT : TASK_AGENT_PROMPT
    const lastUserMessage = messages[messages.length - 1]?.content || ""

    // Run validation if it's a task message
    if (agentType === "task" && needsValidation(lastUserMessage)) {
      const result = await validateTaskParameters(lastUserMessage)
      if (!result.valid) {
        const validationText = formatValidationResponse(result)
        const fallback = await streamText({
          model: openai("gpt-4o"),
          messages: [{ role: "assistant", content: validationText }],
        })
        return fallback.toDataStreamResponse({ headers: { "x-agent-type": agentType } })
      }
    }

    const result = await streamText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages,
    })

    return result.toDataStreamResponse({ headers: { "x-agent-type": agentType } })

  } catch (err) {
    console.error("Error in /api/chat:", err)
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// Helpers

function needsValidation(message: string): boolean {
  const triggers = [
    "move", "drill", "pick", "place", "gripper", "open", "close",
    "joint", "pose", "position", "translate", "trajectory", "save",
    "check", "test", "tour", "delay"
  ]
  return triggers.some(trigger => message.toLowerCase().includes(trigger))
}

function formatValidationResponse(result: { valid: boolean; issues: string[] }): string {
  if (result.valid) return "All parameters validated successfully. Proceeding with task execution."

  return `I need some additional information before executing the task:\n\n${
    result.issues.map((i, idx) => `${idx + 1}. ${i}`).join("\n")
  }\n\nPlease provide the missing details.`
}
