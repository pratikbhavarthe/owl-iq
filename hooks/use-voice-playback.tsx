"use client"

import { useState, useRef, useCallback } from "react"

interface UseVoicePlaybackReturn {
  playVoice: (text: string, language: string) => Promise<void>
  isPlaying: boolean
  stopPlayback: () => void
}

export function useVoicePlayback(): UseVoicePlaybackReturn {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsPlaying(false)
  }, [])

  const playVoice = useCallback(
    async (text: string, language: string) => {
      try {
        // Stop any current playback
        stopPlayback()

        // Start new playback
        setIsPlaying(true)

        // Get voice based on language
        const voice = getVoiceForLanguage(language)

        // Call the TTS API
        const response = await fetch("/api/text-to-speech", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            voice,
          }),
        })

        if (!response.ok) {
          throw new Error(`TTS API error: ${response.status}`)
        }

        // Get audio data as blob
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)

        // Play the audio
        const audio = new Audio(audioUrl)
        audioRef.current = audio

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          setIsPlaying(false)
          audioRef.current = null
        }

        audio.onerror = (error) => {
          console.error("Audio playback error:", error)
          URL.revokeObjectURL(audioUrl)
          setIsPlaying(false)
          audioRef.current = null
        }

        await audio.play()
      } catch (error) {
        console.error("Error playing voice:", error)
        setIsPlaying(false)
      }
    },
    [stopPlayback],
  )

  return { playVoice, isPlaying, stopPlayback }
}

// Helper function to map language codes to OpenAI voices
function getVoiceForLanguage(language: string): string {
  // OpenAI voices: alloy, echo, fable, onyx, nova, shimmer
  switch (language.split("-")[0]) {
    case "hi": // Hindi
      return "nova"
    case "mr": // Marathi
      return "shimmer"
    case "gu": // Gujarati
      return "fable"
    default: // English and others
      return "nova"
  }
}
