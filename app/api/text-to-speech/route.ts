import OpenAI from "openai"
import { NextResponse } from "next/server"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { text, voice = "nova" } = await req.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Limit text length to avoid very long audio files
    const limitedText = text.length > 4000 ? text.substring(0, 4000) + "..." : text

    // Create speech with OpenAI
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice,
      input: limitedText,
      speed: 1.0,
    })

    // Get the audio data as an ArrayBuffer
    const buffer = await mp3.arrayBuffer()

    // Return the audio as a response with appropriate headers
    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Text-to-speech error:", error)
    return NextResponse.json({ error: "Failed to generate speech" }, { status: 500 })
  }
}
