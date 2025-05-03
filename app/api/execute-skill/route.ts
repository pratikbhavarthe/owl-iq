import { NextResponse } from "next/server"
import { executeSkill } from "@/lib/robot-skills"

export async function POST(req: Request) {
  try {
    const { skillId, parameters } = await req.json()

    if (!skillId) {
      return NextResponse.json({ success: false, message: "Skill ID is required" }, { status: 400 })
    }

    // Execute the skill
    const result = await executeSkill(skillId, parameters || {})

    return NextResponse.json({
      success: true,
      result,
      message: `Successfully executed skill: ${skillId}`,
    })
  } catch (error) {
    console.error("Error executing skill:", error)

    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while executing the skill",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
`````````````````````````````````````````