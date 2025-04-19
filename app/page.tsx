import { Chat } from "./components/chat";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24 bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="z-10 max-w-5xl w-full flex flex-col items-center justify-center">
        <div className="flex items-center mb-8">
          <div className="mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-10 h-10 text-amber-400"
            >
              <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
              <path d="M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" />
              <path d="M19 11h2m-1 -1v2" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">OwlIQ</h1>
        </div>
        <p className="text-lg text-gray-300 mb-12 text-center max-w-2xl">
          Multimodal AI assistant with specialized models for conversation and function execution
        </p>
        <div className="w-full max-w-4xl bg-gray-800/50 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
          <Chat />
        </div>
      </div>
    </main>
  )
}
