"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface SkillExecutionProps {
  skillId: string
  skillName: string
  parameters: Record<string, any>
  onComplete: (success: boolean, result: any) => void
}

export function SkillExecution({ skillId, skillName, parameters, onComplete }: SkillExecutionProps) {
  const [executionState, setExecutionState] = useState<"idle" | "executing" | "success" | "error">("idle")
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const executeSkill = async () => {
    setExecutionState("executing")
    setError(null)

    try {
      const response = await fetch("/api/execute-skill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skillId,
          parameters,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to execute skill")
      }

      setResult(data.result)
      setExecutionState("success")
      onComplete(true, data.result)
    } catch (err) {
      setError((err as Error).message)
      setExecutionState("error")
      onComplete(false, null)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Execute Skill: {skillName}</CardTitle>
          <Badge
            variant={
              executionState === "idle"
                ? "outline"
                : executionState === "executing"
                  ? "secondary"
                  : executionState === "success"
                    ? "default"
                    : "destructive"
            }
          >
            {executionState === "idle" && "Ready"}
            {executionState === "executing" && "Executing..."}
            {executionState === "success" && "Success"}
            {executionState === "error" && "Error"}
          </Badge>
        </div>
        <CardDescription>Skill ID: {skillId}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-md">
          <h3 className="font-medium mb-2">Parameters:</h3>
          <pre className="text-xs overflow-auto p-2 bg-background rounded">{JSON.stringify(parameters, null, 2)}</pre>
        </div>

        {executionState === "success" && (
          <div className="p-4 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-100 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Execution Successful</span>
            </div>
            <div className="mt-2">
              <h4 className="text-sm font-medium mb-1">Result:</h4>
              <pre className="text-xs overflow-auto p-2 bg-background rounded">
                {typeof result === "object" ? JSON.stringify(result, null, 2) : result}
              </pre>
            </div>
          </div>
        )}

        {executionState === "error" && (
          <div className="p-4 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-100 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Execution Failed</span>
            </div>
            <p className="text-sm">{error}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button
          onClick={executeSkill}
          disabled={executionState === "executing"}
          className={cn(executionState === "success" && "bg-green-600 hover:bg-green-700")}
        >
          {executionState === "idle" && "Execute Skill"}
          {executionState === "executing" && (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Executing...
            </>
          )}
          {executionState === "success" && (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Executed
            </>
          )}
          {executionState === "error" && "Retry Execution"}
        </Button>
      </CardFooter>
    </Card>
  )
}
