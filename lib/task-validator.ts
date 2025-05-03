import { z } from "zod"

// Define parameter schemas for different skills
const moveToPositionParams = z.object({
  robot_to_use: z.string().min(1, "Robot ID is required"),
  pose_name: z.string().min(1, "Pose name is required"),
  use_moveit: z.string().optional(),
})

const drillHoleParams = z.object({
  robot_to_use: z.string().min(1, "Robot ID is required"),
  target_object: z.string().min(1, "Target object is required"),
  drill_bit: z.string().min(1, "Drill bit specification is required"),
  depth: z.string().optional(),
})

const controlGripperParams = z.object({
  robot_to_use: z.string().min(1, "Robot ID is required"),
  switch: z.string().min(1, "Gripper state (open/close) is required"),
  model: z.string().optional(),
  span: z.string().optional(),
})

// Map skill IDs to their parameter schemas
const skillParamSchemas: Record<string, z.ZodObject<any>> = {
  move_to_pose: moveToPositionParams,
  drill_hole: drillHoleParams,
  control_gripper: controlGripperParams,
}

// Function to validate parameters for a specific skill
export function validateSkillParameters(
  skillId: string,
  parameters: Record<string, string>,
): { valid: boolean; errors: string[] } {
  const schema = skillParamSchemas[skillId]

  if (!schema) {
    return {
      valid: false,
      errors: [`Unknown skill: ${skillId}`],
    }
  }

  try {
    schema.parse(parameters)
    return { valid: true, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map((err) => err.message),
      }
    }

    return {
      valid: false,
      errors: ["Unknown validation error"],
    }
  }
}

// Function to validate task parameters from natural language
export async function validateTaskParameters(message: string): Promise<{ valid: boolean; issues: string[] }> {
  // In a real implementation, this would use AI to validate parameters
  // For this prototype, we'll use a simple rule-based approach

  const issues: string[] = []

  // Check for drilling tasks
  if (message.toLowerCase().includes("drill") && message.toLowerCase().includes("hole")) {
    // Check if target object is specified
    if (!message.toLowerCase().includes("in") || !message.match(/in\s+([a-z\s]+)/i)) {
      issues.push("Missing target object for drilling. Please specify what to drill into.")
    }

    // Check if drill bit is specified
    if (!message.toLowerCase().includes("drill bit") || !message.match(/drill\s+bit\s+(\d+)/i)) {
      issues.push("Missing drill bit specification. Please specify which drill bit to use.")
    }
  }

  // Check for movement tasks
  if (message.toLowerCase().includes("move") && !message.match(/move\s+to\s+([a-z\s]+)/i)) {
    issues.push("Missing destination for movement. Please specify where to move.")
  }

  // Check for gripper control tasks
  if (
    message.toLowerCase().includes("gripper") ||
    message.toLowerCase().includes("open") ||
    message.toLowerCase().includes("close")
  ) {
    if (!message.toLowerCase().includes("open") && !message.toLowerCase().includes("close")) {
      issues.push("Missing gripper action. Please specify whether to open or close the gripper.")
    }
  }

  // Check for robot specification
  if (
    (message.toLowerCase().includes("robot") ||
      message.toLowerCase().includes("move") ||
      message.toLowerCase().includes("drill")) &&
    !message.match(/robot\s+(\d+)/i)
  ) {
    // This is not a critical issue as we can default to robot 1
    // issues.push("Robot number not specified. Defaulting to robot 1.");
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}

// Function to check safety constraints for a skill
export function checkSkillSafety(
  skillId: string,
  parameters: Record<string, string>,
): { safe: boolean; warnings: string[] } {
  const warnings: string[] = []

  if (skillId === "drill_hole") {
    // Check drill depth
    const depth = Number.parseFloat(parameters.depth || "0.05")
    if (depth > 0.1) {
      warnings.push(`Drill depth of ${depth}m may be too deep and could damage the object`)
    }

    // Check drill bit compatibility
    const drillBit = parameters.drill_bit
    const targetObject = parameters.target_object
    if (drillBit === "1" && targetObject?.includes("metal")) {
      warnings.push(`Drill bit 1 is not suitable for drilling into metal objects`)
    }
  }

  if (skillId === "move_to_pose") {
    // Check for potentially dangerous poses
    const poseName = parameters.pose_name?.toLowerCase()
    if (poseName?.includes("high") || poseName?.includes("extended")) {
      warnings.push(`Moving to position "${parameters.pose_name}" may extend the robot arm to its limits`)
    }
  }

  return {
    safe: warnings.length === 0,
    warnings,
  }
}

// Function to check logical constraints for a sequence of skills
export function checkLogicalConstraints(skills: Array<{ skillId: string; parameters: Record<string, string> }>): {
  valid: boolean
  issues: string[]
} {
  const issues: string[] = []

  // Check if the plan is empty
  if (skills.length === 0) {
    return { valid: false, issues: ["Plan contains no skills"] }
  }

  // Check for logical sequence in drilling operations
  const hasDrilling = skills.some((skill) => skill.skillId === "drill_hole")
  if (hasDrilling) {
    // Check if we move to position before drilling
    const firstSkill = skills[0]
    if (firstSkill.skillId !== "move_to_pose") {
      issues.push("Should move to position before drilling")
    }

    // Check if we move back to a safe position after drilling
    const lastSkill = skills[skills.length - 1]
    if (lastSkill.skillId !== "move_to_pose") {
      issues.push("Should move to a safe position after drilling")
    }

    // Check for gripper control before drilling
    const hasGripperControl = skills.some((skill) => skill.skillId === "control_gripper")
    if (!hasGripperControl) {
      issues.push("Should control gripper before drilling (to hold the drill bit)")
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}

// Main function to validate a complete task plan
export function validateTaskPlan(skills: Array<{ skillId: string; parameters: Record<string, string> }>): {
  valid: boolean
  parameterIssues: string[]
  safetyIssues: string[]
  logicalIssues: string[]
} {
  const parameterIssues: string[] = []
  const safetyIssues: string[] = []

  // Validate parameters and safety for each skill
  skills.forEach((skill, index) => {
    // Validate parameters
    const paramValidation = validateSkillParameters(skill.skillId, skill.parameters)
    if (!paramValidation.valid) {
      paramValidation.errors.forEach((error) => {
        parameterIssues.push(`Skill #${index + 1} (${skill.skillId}): ${error}`)
      })
    }

    // Check safety
    const safetyCheck = checkSkillSafety(skill.skillId, skill.parameters)
    if (!safetyCheck.safe) {
      safetyCheck.warnings.forEach((warning) => {
        safetyIssues.push(`Skill #${index + 1} (${skill.skillId}): ${warning}`)
      })
    }
  })

  // Check logical constraints
  const logicalCheck = checkLogicalConstraints(skills)

  return {
    valid: parameterIssues.length === 0 && safetyIssues.length === 0 && logicalCheck.valid,
    parameterIssues,
    safetyIssues,
    logicalIssues: logicalCheck.issues,
  }
}
