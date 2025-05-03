"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ValidatorPanel } from "@/components/validator-panel"
import { PlannerPanel } from "@/components/planner-panel"
import { BotIcon as Robot, CheckCircle, AlertTriangle } from "lucide-react"

export default function TaskPlannerPage() {
  const [taskDescription, setTaskDescription] = useState("")
  const [activeTab, setActiveTab] = useState("planner")
  const [taskPlan, setTaskPlan] = useState<any>(null)
  const [isValid, setIsValid] = useState(false)
  const [executionState, setExecutionState] = useState<"idle" | "executing" | "success" | "error">("idle")

  const handlePlanComplete = (plan: any) => {
    setTaskPlan(plan)
    setActiveTab("validator")
  }

  const handleValidationComplete = (valid: boolean) => {
    setIsValid(valid)
  }

  const executeTask = () => {
    setExecutionState("executing")

    // Simulate task execution
    setTimeout(() => {
      // For demo purposes, always succeed
      setExecutionState("success")
    }, 3000)
  }

  return (
    <main className="container mx-auto p-4 py-8">
      <div className="flex flex-col items-center justify-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">OwlIQ Task Planner</h1>
        <p className="text-gray-500 mt-2">Plan, validate, and execute robotics tasks</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Task Description</CardTitle>
            <CardDescription>Describe the task you want the robot to perform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Drill a hole in yellow cuboid using drill bit 1"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
              />
              <Button
                onClick={() => {
                  if (taskDescription) {
                    setTaskPlan(null)
                    setIsValid(false)
                    setExecutionState("idle")
                    setActiveTab("planner")
                  }
                }}
                disabled={!taskDescription}
              >
                Process Task
              </Button>
            </div>
          </CardContent>
        </Card>

        {taskDescription && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="planner">Task Planner</TabsTrigger>
              <TabsTrigger value="validator" disabled={!taskPlan}>
                Task Validator
              </TabsTrigger>
            </TabsList>

            <TabsContent value="planner">
              <PlannerPanel taskDescription={taskDescription} onPlanComplete={handlePlanComplete} />
            </TabsContent>

            <TabsContent value="validator">
              <ValidatorPanel taskDescription={taskDescription} onValidationComplete={handleValidationComplete} />
            </TabsContent>
          </Tabs>
        )}

        {isValid && (
          <Card>
            <CardHeader>
              <CardTitle>Task Execution</CardTitle>
              <CardDescription>Execute the validated task plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Robot className="h-5 w-5 text-primary" />
                  <span>Ready to execute task: {taskDescription}</span>
                </div>

                <Button
                  onClick={executeTask}
                  disabled={executionState === "executing" || executionState === "success"}
                  className={executionState === "success" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {executionState === "idle" && "Execute Task"}
                  {executionState === "executing" && "Executing..."}
                  {executionState === "success" && (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Task Completed
                    </>
                  )}
                  {executionState === "error" && (
                    <>
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Execution Failed
                    </>
                  )}
                </Button>
              </div>

              {executionState === "success" && (
                <div className="mt-4 p-4 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Task executed successfully</span>
                  </div>
                  <p className="text-sm">
                    All skills in the task plan were executed without errors. The robot has completed the task:{" "}
                    {taskDescription}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
