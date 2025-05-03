import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { CheckCircle, AlertTriangle, Info } from "lucide-react"

interface TaskValidationProps {
  message: string
}

export function TaskValidation({ message }: TaskValidationProps) {
  // Parse the message to extract validation information
  const isSuccess =
    message.toLowerCase().includes("success") ||
    (message.toLowerCase().includes("valid") && !message.toLowerCase().includes("invalid"))

  const isMissingParams = message.toLowerCase().includes("missing") || message.toLowerCase().includes("required")

  const hasSafetyIssues = message.toLowerCase().includes("safety") || message.toLowerCase().includes("dangerous")

  const hasLogicIssues = message.toLowerCase().includes("logic") || message.toLowerCase().includes("sequence")

  // Extract parameter issues
  const parameterIssues = extractIssues(message, ["missing", "required", "parameter"])

  // Extract safety issues
  const safetyIssues = extractIssues(message, ["safety", "dangerous", "caution"])

  // Extract logic issues
  const logicIssues = extractIssues(message, ["logic", "sequence", "order"])

  if (isSuccess) {
    return (
      <Alert className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-100 border-green-200 dark:border-green-800 mb-0">
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Validation Successful</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-3">
      <Alert className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-100 border-blue-200 dark:border-blue-800 mb-0">
        <Info className="h-4 w-4" />
        <AlertTitle>Task Validation</AlertTitle>
        <AlertDescription>
          {!isMissingParams && !hasSafetyIssues && !hasLogicIssues
            ? message
            : "The following issues were found with your task:"}
        </AlertDescription>
      </Alert>

      {isMissingParams && parameterIssues.length > 0 && (
        <Alert variant="destructive" className="mb-0">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Missing Parameters</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 mt-2">
              {parameterIssues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {hasSafetyIssues && safetyIssues.length > 0 && (
        <Alert variant="destructive" className="mb-0">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Safety Issues</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 mt-2">
              {safetyIssues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {hasLogicIssues && logicIssues.length > 0 && (
        <Alert variant="destructive" className="mb-0">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Logical Issues</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 mt-2">
              {logicIssues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Helper function to extract issues from the message
function extractIssues(message: string, keywords: string[]): string[] {
  const lines = message.split(/\n|\./).filter((line) => line.trim().length > 0)

  return lines
    .filter((line) => {
      const lowerLine = line.toLowerCase()
      return keywords.some((keyword) => lowerLine.includes(keyword))
    })
    .map((line) => line.trim())
}
