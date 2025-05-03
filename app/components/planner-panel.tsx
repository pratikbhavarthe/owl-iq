"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { ArrowRight, ChevronRight, BotIcon as Robot, Wrench, Cog } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlannerPanelProps {
  taskDescription: string
  onPlanComplete: (plan: any) => void
}

export function PlannerPanel({ taskDescription, onPlanComplete }: PlannerPanelProps) {
  const [planningState, setPlanningState] = useState<"idle" | "planning" | "complete">("idle")

  const [plan, setPlan] = useState<any>(null)

  const generatePlan = async () => {
    setPlanningState("planning")

    // Simulate planning process
    setTimeout(() => {
      // Generate a plan based on the task description
      const newPlan = generateTaskPlan(taskDescription)

      setPlan(newPlan)
      setPlanningState("complete")
      onPlanComplete(newPlan)
    }, 2000)
  }

  // Function to generate a task plan based on the description
  const generateTaskPlan = (description: string) => {
    const skills = []

    // Check for drilling tasks
    if (description.toLowerCase().includes("drill") && description.toLowerCase().includes("hole")) {
      // Extract target object
      const targetMatch = description.match(/in\s+([a-z\s]+)(?:\s+using|\s+with|$)/i)
      const targetObject = targetMatch ? targetMatch[1].trim() : "yellow cuboid"

      // Extract drill bit
      const drillMatch = description.match(/drill\s+bit\s+(\d+)/i)
      const drillBit = drillMatch ? drillMatch[1] : "1"

      // Plan: First move to the object
      skills.push({
        id: "move_to_pose",
        name: "Move to Pre-Drill Position",
        icon: Robot,
        parameters: {
          robot_to_use: "1",
          pose_name: `pre_${targetObject.replace(/\s+/g, "_")}`,
        },
      })

      // Then control the gripper to hold the drill
      skills.push({
        id: "control_gripper",
        name: "Grip Drill Tool",
        icon: Wrench,
        parameters: {
          robot_to_use: "1",
          switch: "true",
          model: "robotiq",
        },
      })

      // Then perform the drilling operation
      skills.push({
        id: "drill_hole",
        name: "Drill Hole",
        icon: Cog,
        parameters: {
          robot_to_use: "1",
          target_object: targetObject,
          drill_bit: drillBit,
          depth: "0.05", // Default depth
        },
      })

      // Release the drill
      skills.push({
        id: "control_gripper",
        name: "Release Drill Tool",
        icon: Wrench,
        parameters: {
          robot_to_use: "1",
          switch: "false",
          model: "robotiq",
        },
      })

      // Finally move back to home position
      skills.push({
        id: "move_to_pose",
        name: "Return to Home Position",
        icon: Robot,
        parameters: {
          robot_to_use: "1",
          pose_name: "home",
        },
      })
    }

    return {
      id: `task_${Date.now()}`,
      description,
      skills,
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Task Planner</CardTitle>
          <Badge
            variant={planningState === "idle" ? "outline" : planningState === "planning" ? "secondary" : "success"}
          >
            {planningState === "idle" && "Ready"}
            {planningState === "planning" && "Planning..."}
            {planningState === "complete" && "Plan Generated"}
          </Badge>
        </div>
        <CardDescription>Breaks down tasks into a sequence of robot skills</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-md">
          <h3 className="font-medium mb-2">Task Description:</h3>
          <p className="text-sm">{taskDescription}</p>
        </div>

        {planningState === "complete" && plan && (
          <div className="space-y-4">
            <h3 className="font-medium">Generated Plan:</h3>

            <div className="space-y-2">
              {plan.skills.map((skill: any, index: number) => (
                <div key={index} className="p-3 border rounded-md bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="h-6 w-6 p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <skill.icon className="h-4 w-4 text-primary" />
                      <span className="font-medium">{skill.name}</span>
                    </div>
                  </div>

                  <div className="pl-8 text-sm space-y-1">
                    {Object.entries(skill.parameters).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-center gap-2">
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{key}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={generatePlan}
            disabled={planningState === "planning"}
            className={cn(planningState === "complete" && "bg-green-600 hover:bg-green-700")}
          >
            {planningState === "idle" && "Generate Plan"}
            {planningState === "planning" && "Planning..."}
            {planningState === "complete" && "Plan Generated"}
            {planningState !== "planning" && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
