import { ChatInterface } from "./components/chat-interface"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex flex-col items-center justify-center w-full bg-gradient-to-b from-gray-900 to-gray-800 text-white py-8">
        <h1 className="text-4xl font-bold tracking-tight">Owl Assistant</h1>
        <p className="text-gray-300 mt-2">Multimodal AI for Robotics</p>
      </div>

      <div className="flex-1 container mx-auto p-4">
        <ChatInterface />
      </div>
    </main>
  )
}
