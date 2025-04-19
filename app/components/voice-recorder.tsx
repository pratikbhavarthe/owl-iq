"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "./ui/button"
import { Mic, Square } from "lucide-react"
import { cn } from "@/lib/utils"

interface VoiceRecorderProps {
  isListening: boolean
  setIsListening: (isListening: boolean) => void
  onTranscript: (transcript: string) => void
  language: string
  disabled?: boolean
}

export function VoiceRecorder({
  isListening,
  setIsListening,
  onTranscript,
  language,
  disabled = false,
}: VoiceRecorderProps) {
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setError("Speech recognition is not supported in this browser.")
      return
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognitionRef.current = recognition
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = language

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("")

      if (event.results[0].isFinal) {
        onTranscript(transcript)
        setIsListening(false)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error)

      let message = `Error: ${event.error}`
      if (event.error === "not-allowed") {
        message =
          "Microphone access was denied. Please allow mic permissions in your browser settings."
      }

      setError(message)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    return () => {
      recognition.abort()
    }
  }, [language, onTranscript, setIsListening])

  // Update language dynamically
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language
    }
  }, [language])

  // Request mic permission before starting
  const ensureMicPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      return true
    } catch (err) {
      console.error("Microphone permission denied:", err)
      setError("Microphone access is required to record voice.")
      return false
    }
  }

  const toggleListening = async () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      const hasPermission = await ensureMicPermission()
      if (!hasPermission) return

      setError(null)

      try {
        recognitionRef.current?.start()
        setIsListening(true)
      } catch (err) {
        console.error("Failed to start speech recognition:", err)
        setError("Failed to start speech recognition.")
        setIsListening(false)
      }
    }
  }

  return (
    <Button
      type="button"
      data-variant="outline"
      data-size="icon"
      className={cn(
        "relative",
        isListening && "bg-red-500/20 text-red-500 border-red-500/50",
        error && "bg-red-500/10 text-red-400 border-red-500/30"
      )}
      onClick={toggleListening}
      disabled={disabled || !!error}
      title={error || "Record voice input"}
    >
      {isListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      {isListening && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </span>
      )}
    </Button>
  )
}
