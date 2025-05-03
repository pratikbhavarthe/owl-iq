// Types for the dual-agent system

export type AgentType = "chat" | "task"

export interface AgentMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  agentType: AgentType
  timestamp: number
}

export interface AgentState {
  messages: AgentMessage[]
  isProcessing: boolean
  error: Error | null
}

export interface TaskParameter {
  name: string
  value: string
  required: boolean
  type: "string" | "number" | "boolean"
  description?: string
}

export interface RobotSkill {
  id: string
  name: string
  description: string
  parameters: TaskParameter[]
  execute: (params: Record<string, any>) => Promise<any>
}

export interface TaskPlan {
  id: string
  description: string
  skills: {
    skillId: string
    parameters: Record<string, string>
  }[]
  status: "pending" | "validating" | "executing" | "completed" | "failed"
  validationResult?: {
    valid: boolean
    issues: string[]
  }
}

export interface ValidationResult {
  valid: boolean
  missingParameters: string[]
  safetyIssues: string[]
  logicIssues: string[]
}

// Validator types
export interface ParameterValidation {
  parameterName: string
  isValid: boolean
  errorMessage?: string
}

export interface SkillValidation {
  skillId: string
  isValid: boolean
  parameterValidations: ParameterValidation[]
  errorMessage?: string
}

export interface PlanValidation {
  isValid: boolean
  skillValidations: SkillValidation[]
  logicValidation: {
    isValid: boolean
    issues: string[]
  }
  safetyValidation: {
    isValid: boolean
    warnings: string[]
  }
}
