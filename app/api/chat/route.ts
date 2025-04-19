import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    console.log("Received messages:", messages);
    
    // Validate that messages array exists and contains at least one message
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required and must not be empty" },
        { status: 400 }
      );
    }
    
    // Get the last user message from the messages array
    const lastUserMessage = messages.filter(msg => msg.role === "user").pop();
    
    if (!lastUserMessage || !lastUserMessage.content) {
      return NextResponse.json(
        { error: "No valid user message found" },
        { status: 400 }
      );
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
    });
    
    const response = completion.choices[0].message;
    console.log("OpenAI response:", response);
    
    // Return in the format expected by the Vercel AI SDK
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error generating AI response:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response" },
      { status: 500 }
    );
  }
}