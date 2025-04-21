"use client"

import type React from "react"

import { useChat } from "ai/react"
import { useState, useRef, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ScrollArea } from "./ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { ChatMessage } from "./chat-message"
import { SystemMessage } from "./system-message"
import { VoiceRecorder } from "./voice-recorder"
import { cn } from "@/lib/utils"
import { Sparkles, Send, Bot, ActivityIcon as Function, Info, Mic, Volume2, VolumeX } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { useVoicePlayback } from "@/hooks/use-voice-playback"

export function Chat() {
  const [activeTab, setActiveTab] = useState<"chat" | "system">("chat")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isListening, setIsListening] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("en-US")
  const [audioEnabled, setAudioEnabled] = useState(true)
  const { playVoice, isPlaying, stopPlayback } = useVoicePlayback()
  
  // Local state for input handling
  const [inputValue, setInputValue] = useState("")
  const [chatMessages, setChatMessages] = useState<Array<{id: string, role: "user" | "assistant" | "system", content: string}>>([])
  const [loading, setLoading] = useState(false)

  // Initialize with system message
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([
        {
          id: "system-welcome",
          role: "system",
          content:
            "Welcome to OwlIQ! I'm a multimodal AI assistant that can handle both conversational queries and function-based tasks. I can also respond by voice in multiple languages. Try asking me a question or requesting me to perform a task.",
        },
      ])
    }
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  // Submit handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!inputValue.trim() || loading) return
    
    // Create user message
    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: inputValue,
    }
    
    // Add to messages
    setChatMessages(prev => [...prev, userMessage])
    
    // Clear input
    setInputValue("")
    
    // Set loading state
    setLoading(true)
    
    try {
      // Call API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...chatMessages, userMessage],
        }),
      })
      
      const data = await response.json()
      console.log("API response:", data)
      
      // Add AI response to messages
      if (data && data.role === "assistant") {
        setChatMessages(prev => [...prev, data])
        
        // Play voice if enabled
        if (audioEnabled) {
          await playVoice(data.content, selectedLanguage)
        }
      }
    } catch (error) {
      console.error("Error calling API:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVoiceInput = (transcript: string) => {
    setInputValue(transcript)
    if (transcript.trim()) {
      const fakeEvent = {
        preventDefault: () => {},
      } as React.FormEvent<HTMLFormElement>
      
      handleSubmit(fakeEvent)
    }
  }

  const toggleAudio = () => {
    if (isPlaying) {
      stopPlayback()
    }
    setAudioEnabled(!audioEnabled)
  }

  const languages = [
    { value: "en-US", label: "English" },
    { value: "hi-IN", label: "Hindi" },
    { value: "mr-IN", label: "Marathi" },
    { value: "gu-IN", label: "Gujarati" },
  ]

  // Function to test API directly
  async function testApiDirectly() {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: "Hello, this is a test message",
            },
          ],
        }),
      });
      
      const data = await response.json();
      console.log("Direct API response:", data);
      
      // Add test message and response to chat
      setChatMessages(prev => [
        ...prev,
        { id: "test-message", role: "user", content: "Hello, this is a test message" },
        { ...data, id: data.id || Date.now().toString() }
      ]);
      
      return data;
    } catch (error) {
      console.error("Direct API call failed:", error);
      return null;
    }
  }

  return (
    <div className="flex flex-col h-[80vh]">
      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as "chat" | "system")} className="w-full">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
          <TabsList className="bg-gray-700/50">
            <TabsTrigger value="chat" className="data-[state=active]:bg-gray-600">
              <Bot className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-gray-600">
              <Info className="w-4 h-4 mr-2" />
              System Info
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => testApiDirectly()} 
              className="bg-amber-600 hover:bg-amber-700 text-xs"
              size="sm"
            >
              Test API
            </Button>
            <span className="text-xs text-gray-400">Powered by</span>
            <Sparkles className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-medium">Orangewood Labs</span>
          </div>
        </div>

        <TabsContent value="chat" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800/70 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <Button
                className={cn(
                  "outline h-8 w-8 rounded-full",
                  audioEnabled ? "bg-amber-600/20 text-amber-400 hover:bg-amber-600/30" : "bg-gray-700",
                )}
                onClick={toggleAudio}
              >
                {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <span className="text-sm text-gray-300">{audioEnabled ? "Voice Output: On" : "Voice Output: Off"}</span>
            </div>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-[140px] h-8 bg-gray-700/50 border-gray-600">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 mb-4">
              {chatMessages.map((message) => {
                // Determine if this is a function-calling or conversational message
                const isFunctionMessage =
                  message.content.includes("Function called:") || message.content.includes("Executing function:")

                if (message.role === "system") {
                  return <SystemMessage key={message.id} message={message.content} />
                }

                return (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    icon={isFunctionMessage ? <Function className="h-5 w-5" /> : undefined}
                    className={cn(
                      isFunctionMessage && message.role === "assistant" && "bg-amber-950/20 border-amber-800/30",
                    )}
                    onPlayVoice={audioEnabled ? () => playVoice(message.content, selectedLanguage) : undefined}
                  />
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-gray-700">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Ask a question or request a task..."
                className="flex-1 bg-gray-700/50 border-gray-600 focus-visible:ring-amber-500"
                disabled={loading || isListening}
              />
              <VoiceRecorder
                isListening={isListening}
                setIsListening={setIsListening}
                onTranscript={handleVoiceInput}
                language={selectedLanguage}
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !inputValue.trim() || isListening}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="system" className="flex-1 p-4 data-[state=inactive]:hidden">
          <div className="space-y-6">
            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-700">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Bot className="w-5 h-5 mr-2 text-amber-400" />
                Dual-Agent Architecture
              </h3>
              <p className="text-gray-300 mb-4">OwlIQ uses two specialized AI models that work together seamlessly:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 p-3 rounded-md border border-gray-700">
                  <h4 className="font-medium mb-1 text-amber-400">Conversational Model</h4>
                  <p className="text-sm text-gray-300">
                    Handles natural language interactions, questions, and discussions.
                  </p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-md border border-gray-700">
                  <h4 className="font-medium mb-1 text-amber-400">Function-Calling Model</h4>
                  <p className="text-sm text-gray-300">Executes tasks, actions, and retrieves real-time data.</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-700">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Mic className="w-5 h-5 mr-2 text-amber-400" />
                Voice Assistant Capabilities
              </h3>
              <p className="text-gray-300 mb-4">OwlIQ includes advanced voice interaction features:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 p-3 rounded-md border border-gray-700">
                  <h4 className="font-medium mb-1 text-amber-400">Multilingual Voice Input</h4>
                  <p className="text-sm text-gray-300">
                    Speak in multiple languages including English, Hindi, Marathi, and Gujarati.
                  </p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-md border border-gray-700">
                  <h4 className="font-medium mb-1 text-amber-400">Natural Voice Output</h4>
                  <p className="text-sm text-gray-300">
                    High-quality text-to-speech in multiple languages with natural intonation.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-700">
              <h3 className="text-lg font-medium mb-2">How It Works</h3>
              <ol className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="bg-amber-800/30 text-amber-400 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                    1
                  </span>
                  <span>Your message (text or voice) is analyzed to determine intent</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-amber-800/30 text-amber-400 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                    2
                  </span>
                  <span>The system routes to the appropriate model (conversation or function)</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-amber-800/30 text-amber-400 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                    3
                  </span>
                  <span>Response is generated as text and converted to speech in your selected language</span>
                </li>
              </ol>
            </div>

            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-700">
              <h3 className="text-lg font-medium mb-2">Example Voice Commands</h3>
              <div className="space-y-2">
                <div className="bg-gray-800/50 p-2 rounded border border-gray-700 text-sm">
                  "मौसम की जानकारी दें" (Hindi: Tell me the weather information)
                </div>
                <div className="bg-gray-800/50 p-2 rounded border border-gray-700 text-sm">
                  "उद्या सकाळी ९ वाजता मीटिंग सेट करा" (Marathi: Set a meeting for tomorrow at 9 AM)
                </div>
                <div className="bg-gray-800/50 p-2 rounded border border-gray-700 text-sm">
                  "મને રોબોટિક્સ વિશે માહિતી આપો" (Gujarati: Give me information about robotics)
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}