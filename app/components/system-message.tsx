import { Card } from "./ui/card"
import { InfoIcon } from "lucide-react"

interface SystemMessageProps {
  message: string
}

export function SystemMessage({ message }: SystemMessageProps) {
  return (
    <Card className="bg-gray-700/20 border-gray-700/50 p-3 text-sm flex items-start gap-2">
      <InfoIcon className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
      <div className="text-gray-300">{message}</div>
    </Card>
  )
}