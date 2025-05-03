import { z } from "zod"

// Define the parameter schema for validation
export const ParameterSchema = z.record(z.string())

// Define the skill schema
export const SkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  parameters: ParameterSchema,
})

// Define the task schema
export const TaskSchema = z.object({
  id: z.string(),
  description: z.string(),
  skills: z.array(SkillSchema),
})

// Helper function to determine which agent should handle the request
export function determineAgentType(messages: any[]): "chat" | "task" {
  // Get the last user message
  const lastUserMessage = messages[messages.length - 1].content.toLowerCase()

  // Keywords that suggest this is a task request
  const taskKeywords = [
    "move",
    "robot",
    "drill",
    "pick",
    "place",
    "gripper",
    "open",
    "close",                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
    "execute",
    "run",
    "perform",
    "do",
    "make",
    "create",
    "build",
    "assemble",
    "joint",
    "pose",
    "position",
    "translate",
    "trajectory",
    "save",
    "check",
    "test",
    "tour",
    "delay",
    "get",
    "control",
    "teach",
    "hand",
    "zone",
  ]

  // Check if any task keywords are present
  const containsTaskKeyword = taskKeywords.some((keyword) => lastUserMessage.includes(keyword))

  // Check for explicit task requests
  const isExplicitTaskRequest =
    lastUserMessage.includes("can you") ||
    lastUserMessage.includes("please") ||
    lastUserMessage.includes("i want") ||
    lastUserMessage.includes("i need") ||
    lastUserMessage.includes("could you") ||
    lastUserMessage.includes("make the robot") ||
    lastUserMessage.includes("move the robot")

  return containsTaskKeyword && isExplicitTaskRequest ? "task" : "chat"
}

// Validator function to check if all required parameters are present
export function validateParameters(
  skillId: string,
  parameters: Record<string, string>,
  requiredParams: string[],
): { valid: boolean; missingParams: string[] } {
  const missingParams = requiredParams.filter((param) => !parameters[param] || parameters[param].trim() === "")

  return {
    valid: missingParams.length === 0,
    missingParams,
  }
}

// Function to break down a task into skills
export function planTask(taskDescription: string): { skills: { id: string; parameters: Record<string, string> }[] } {
  // This is a simplified version - in a real implementation,
  // this would use AI to break down the task

  // Example: "Drill a hole in yellow cuboid using drill bit 1"
  const skills = []

  // Check if it's a drilling task
  if (taskDescription.toLowerCase().includes("drill") && taskDescription.toLowerCase().includes("hole")) {
    // Extract target object
    const targetMatch = taskDescription.match(/in\s+([a-z\s]+)\s+using/i)
    const targetObject = targetMatch ? targetMatch[1].trim() : "unknown"

    // Extract drill bit
    const drillMatch = taskDescription.match(/drill\s+bit\s+(\d+)/i)
    const drillBit = drillMatch ? drillMatch[1] : "1"

    // Plan: First move to the object
    skills.push({
      id: "move_to_pose",
      parameters: {
        robot_to_use: "1",
        pose_name: "pre_" + targetObject.replace(/\s+/g, "_"),
      },
    })

    // Then perform the drilling operation
    skills.push({
      id: "drill_hole",
      parameters: {
        robot_to_use: "1",
        target_object: targetObject,
        drill_bit: drillBit,
        depth: "0.05", // Default depth
      },
    })

    // Finally move back to home position
    skills.push({
      id: "move_to_pose",
      parameters: {
        robot_to_use: "1",
        pose_name: "home",
      },
    })
  }

  return { skills }
}
