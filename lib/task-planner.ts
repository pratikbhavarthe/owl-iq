import type { TaskPlan, ValidationResult } from "./models"

// Function to parse a natural language command into a structured task plan
export async function parseCommand(command: string): Promise<TaskPlan> {
  // In a real implementation, this would use AI to parse the command
  // For this prototype, we'll use a simple rule-based approach

  const taskId = `task_${Date.now()}`
  const skills: any[] = []

  // Check for drilling tasks
  if (command.toLowerCase().includes("drill") && command.toLowerCase().includes("hole")) {
    // Extract target object
    const targetMatch = command.match(/in\s+([a-z\s]+)(?:\s+using|\s+with|$)/i)
    const targetObject = targetMatch ? targetMatch[1].trim() : "unknown"

    // Extract drill bit
    const drillMatch = command.match(/drill\s+bit\s+(\d+)/i)
    const drillBit = drillMatch ? drillMatch[1] : "1"

    // Plan: First move to the object
    skills.push({
      skillId: "move_to_pose",
      parameters: {
        robot_to_use: "1",
        pose_name: `pre_${targetObject.replace(/\s+/g, "_")}`,
      },
    })

    // Then perform the drilling operation
    skills.push({
      skillId: "drill_hole",
      parameters: {
        robot_to_use: "1",
        target_object: targetObject,
        drill_bit: drillBit,
        depth: "0.05", // Default depth
      },
    })

    // Finally move back to home position
    skills.push({
      skillId: "move_to_pose",
      parameters: {
        robot_to_use: "1",
        pose_name: "home",
      },
    })
  }

  return {
    id: taskId,
    description: command,
    skills,
    status: "pending",
  }
}

// Function to validate a task plan
export async function validateTaskPlan(plan: TaskPlan): Promise<ValidationResult> {
  const missingParameters: string[] = []
  const safetyIssues: string[] = []
  const logicIssues: string[] = []

  // Check each skill in the plan
  plan.skills.forEach((skill, index) => {
    // Check for required parameters based on skill type
    if (skill.skillId === "drill_hole") {
      if (!skill.parameters.target_object) {
        missingParameters.push(`Skill #${index + 1} (Drill Hole): Missing target object`)
      }
      if (!skill.parameters.drill_bit) {
        missingParameters.push(`Skill #${index + 1} (Drill Hole): Missing drill bit specification`)
      }

      // Safety checks for drilling
      const depth = Number.parseFloat(skill.parameters.depth || "0")
      if (depth > 0.1) {
        safetyIssues.push(`Skill #${index + 1} (Drill Hole): Drill depth of ${depth}m may be too deep`)
      }
    }

    if (skill.skillId === "move_to_pose") {
      if (!skill.parameters.pose_name) {
        missingParameters.push(`Skill #${index + 1} (Move to Pose): Missing pose name`)
      }
    }

    // Check for robot specification in all skills
    if (!skill.parameters.robot_to_use) {
      missingParameters.push(`Skill #${index + 1}: Missing robot specification`)
    }
  })

  // Logic checks for the overall plan
  if (plan.skills.length === 0) {
    logicIssues.push("Plan contains no skills")
  }

  // Check for logical sequence of operations
  // For example, for drilling, we should first move to the object, then drill, then move back
  if (plan.skills.length > 0 && plan.skills.some((s) => s.skillId === "drill_hole")) {
    const firstSkill = plan.skills[0]
    const lastSkill = plan.skills[plan.skills.length - 1]

    if (firstSkill.skillId !== "move_to_pose") {
      logicIssues.push("Plan should start with moving to the target position")
    }

    if (lastSkill.skillId !== "move_to_pose" || lastSkill.parameters.pose_name !== "home") {
      logicIssues.push("Plan should end with moving back to home position")
    }
  }

  return {
    valid: missingParameters.length === 0 && safetyIssues.length === 0 && logicIssues.length === 0,
    missingParameters,
    safetyIssues,
    logicIssues,
  }
}

// Function to execute a validated task plan
export async function executeTaskPlan(plan: TaskPlan): Promise<{ success: boolean; message: string }> {
  // In a real implementation, this would execute the skills on the robot
  // For this prototype, we'll just simulate execution

  console.log(`Executing task plan: ${plan.description}`)

  // Simulate execution of each skill
  for (const skill of plan.skills) {
    console.log(`Executing skill: ${skill.skillId} with parameters:`, skill.parameters)

    // Simulate execution time
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  return {
    success: true,
    message: `Successfully executed task: ${plan.description}`,
  }
}
