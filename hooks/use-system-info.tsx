"use client"

import { useState } from "react"

interface SystemInfo {
  conversationalQueries: number
  functionCalls: number
  lastModelUsed: string | null
}

export function useSystemInfo() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    conversationalQueries: 0,
    functionCalls: 0,
    lastModelUsed: null,
  })

  const updateSystemInfo = (modelUsed: string) => {
    setSystemInfo((prev) => ({
      ...prev,
      lastModelUsed: modelUsed,
      conversationalQueries:
        modelUsed === "conversational" ? prev.conversationalQueries + 1 : prev.conversationalQueries,
      functionCalls: modelUsed === "function-calling" ? prev.functionCalls + 1 : prev.functionCalls,
    }))
  }

  return {
    systemInfo,
    updateSystemInfo,
  }
}
