import { NextResponse } from "next/server"
import { parseCommand, validateTaskPlan, executeTaskPlan } from "@/lib/task-planner"
import { validateTaskPlan as validateTask } from "@/lib/task-validator"

export async function POST(req: Request) {
  try {
    const { command } = await req.json()

    // Parse the natural language command into a task plan
    const taskPlan = await parseCommand(command)

    // Validate the task plan
    const validationResult = await validateTaskPlan(taskPlan)

    // If validation failed, return the validation errors
    if (!validationResult.valid) {
      return NextResponse.json({
        success: false,
        taskPlan,
        validationResult,
        message: "Task validation failed. Please correct the issues and try again.",
      })
    }

    // If validation passed, update the task plan status
    taskPlan.status = "validating"

    // Perform additional validation using the task validator
    const detailedValidation = validateTask(taskPlan.skills)

    // If detailed validation failed, return the validation errors
    if (!detailedValidation.valid) {
      return NextResponse.json({
        success: false,
        taskPlan,
        validationResult: detailedValidation,
        message: "Detailed task validation failed. Please correct the issues and try again.",
      })
    }

    // If validation passed, update the task plan status
    taskPlan.status = "executing"

    // Execute the task plan
    const executionResult = await executeTaskPlan(taskPlan)

    // Update the task plan status based on execution result
    taskPlan.status = executionResult.success ? "completed" : "failed"

    // Return the execution result
    return NextResponse.json({
      success: executionResult.success,
      taskPlan,
      message: executionResult.message,
    })
  } catch (error) {
    console.error("Error processing task:", error)

    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while processing the task",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
