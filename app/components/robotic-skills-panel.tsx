"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Separator } from "../components/ui/separator"
import { Badge } from "../components/ui/badge"
import { BotIcon as Robot, Wrench, Cog, AlertTriangle, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function RobotSkillsPanel() {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [validationStatus, setValidationStatus] = useState<"idle" | "validating" | "success" | "error">("idle")
  const [validationMessage, setValidationMessage] = useState<string>("")
  const [parameters, setParameters] = useState<Record<string, string>>({})

  const handleSkillSelect = (skillId: string) => {
    setSelectedSkill(skillId)
    setValidationStatus("idle")
    setValidationMessage("")
    setParameters({})
  }

  const handleParameterChange = (key: string, value: string) => {
    setParameters((prev) => ({ ...prev, [key]: value }))
  }

  const validateParameters = () => {
    setValidationStatus("validating")

    // Simulate validation process
    setTimeout(() => {
      const hasError = Math.random() > 0.7 // Randomly show error for demo purposes

      if (hasError) {
        setValidationStatus("error")
        setValidationMessage("Missing required parameter: target_position")
      } else {
        setValidationStatus("success")
        setValidationMessage("All parameters validated successfully")
      }
    }, 1500)
  }

  const executeSkill = () => {
    // This would trigger the actual execution
    console.log("Executing skill with parameters:", parameters)
    // Reset after execution
    setTimeout(() => {
      setSelectedSkill(null)
      setValidationStatus("idle")
      setParameters({})
    }, 2000)
  }

  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-800 overflow-y-auto p-4">
        <h3 className="font-medium mb-4">Available Skills</h3>

        <div className="space-y-2">
          {skills.map((skill) => (
            <Button
              key={skill.id}
              variant={selectedSkill === skill.id ? "default" : "ghost"}
              className="w-full justify-start text-left"
              onClick={() => handleSkillSelect(skill.id)}
            >
              <skill.icon className="mr-2 h-4 w-4" />
              {skill.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {selectedSkill ? (
          <SkillDetail
            skill={skills.find((s) => s.id === selectedSkill)!}
            parameters={parameters}
            onParameterChange={handleParameterChange}
            validationStatus={validationStatus}
            validationMessage={validationMessage}
            onValidate={validateParameters}
            onExecute={executeSkill}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-500">
            <Robot className="h-12 w-12 mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Select a Skill</h3>
            <p>Choose a robot skill from the list to configure and execute</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface SkillDetailProps {
  skill: Skill
  parameters: Record<string, string>
  onParameterChange: (key: string, value: string) => void
  validationStatus: "idle" | "validating" | "success" | "error"
  validationMessage: string
  onValidate: () => void
  onExecute: () => void
}

function SkillDetail({
  skill,
  parameters,
  onParameterChange,
  validationStatus,
  validationMessage,
  onValidate,
  onExecute,
}: SkillDetailProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <skill.icon className="h-5 w-5" />
          <h2 className="text-xl font-bold">{skill.name}</h2>
        </div>
        <Badge variant="outline">{skill.category}</Badge>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">{skill.description}</p>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-medium">Parameters</h3>

        {skill.parameters.map((param) => (
          <div key={param.name} className="space-y-2">
            <Label htmlFor={param.name}>
              {param.label}
              {param.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={param.name}
              placeholder={param.placeholder}
              value={parameters[param.name] || ""}
              onChange={(e: { target: { value: string } }) => onParameterChange(param.name, e.target.value)}
            />
            {param.description && <p className="text-xs text-gray-500 dark:text-gray-400">{param.description}</p>}
          </div>
        ))}
      </div>

      {validationStatus !== "idle" && (
        <div
          className={cn(
            "p-3 rounded-md text-sm",
            validationStatus === "validating" && "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
            validationStatus === "error" && "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
            validationStatus === "success" && "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300",
          )}
        >
          <div className="flex items-center gap-2">
            {validationStatus === "validating" && <Cog className="h-4 w-4 animate-spin" />}
            {validationStatus === "error" && <AlertTriangle className="h-4 w-4" />}
            {validationStatus === "success" && <Check className="h-4 w-4" />}
            <span>{validationMessage || "Validating parameters..."}</span>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={onValidate} disabled={validationStatus === "validating"}>
          Validate Parameters
        </Button>
        <Button onClick={onExecute} disabled={validationStatus !== "success"}>
          Execute Skill
        </Button>
      </div>
    </div>
  )
}

interface Skill {
  id: string
  name: string
  description: string
  category: string
  icon: React.ComponentType<{ className?: string }>
  parameters: {
    name: string
    label: string
    placeholder: string
    description?: string
    required: boolean
  }[]
}

const skills: Skill[] = [
  {
    id: "move_to_pose",
    name: "Move to Pose",
    description: "Move the robot to a specific pose or position",
    category: "Movement",
    icon: Robot,
    parameters: [
      {
        name: "robot_to_use",
        label: "Robot ID",
        placeholder: "1",
        description: "The robot number to use",
        required: true,
      },
      {
        name: "pose_name",
        label: "Pose Name",
        placeholder: "home",
        description: "The name of the zone/pose to move to",
        required: true,
      },
      {
        name: "use_moveit",
        label: "Use MoveIt",
        placeholder: "true/false",
        description: "Whether to use MoveIt for motion planning",
        required: false,
      },
    ],
  },
  {
    id: "control_gripper",
    name: "Control Gripper",
    description: "Open or close the robot gripper",
    category: "Manipulation",
    icon: Wrench,
    parameters: [
      {
        name: "robot_to_use",
        label: "Robot ID",
        placeholder: "1",
        description: "The robot number to use",
        required: true,
      },
      {
        name: "switch",
        label: "Gripper State",
        placeholder: "true/false",
        description: "True to close, False to open",
        required: true,
      },
      {
        name: "model",
        label: "Gripper Model",
        placeholder: "robotiq",
        description: "The model of the gripper",
        required: false,
      },
    ],
  },
  {
    id: "drill_hole",
    name: "Drill Hole",
    description: "Drill a hole in a specified object",
    category: "Task",
    icon: Cog,
    parameters: [
      {
        name: "robot_to_use",
        label: "Robot ID",
        placeholder: "1",
        description: "The robot number to use",
        required: true,
      },
      {
        name: "target_object",
        label: "Target Object",
        placeholder: "yellow cuboid",
        description: "The object to drill into",
        required: true,
      },
      {
        name: "drill_bit",
        label: "Drill Bit",
        placeholder: "1",
        description: "The drill bit to use",
        required: true,
      },
      {
        name: "depth",
        label: "Drill Depth",
        placeholder: "0.05",
        description: "Depth of the hole in meters",
        required: false,
      },
    ],
  },
]
