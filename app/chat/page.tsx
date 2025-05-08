"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, LogOut, Menu, X } from "lucide-react"
import { useRouter } from "next/navigation"
import MessageBubble from "@/components/message-bubble"
import VoiceButton from "@/components/voice-button"
import { Bot } from "lucide-react"

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  type TextContentPart = {
    type: "text";
    text: string;
  };
  
  type MessageContent = string | TextContentPart[];

  // Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
    } else {
      setUser(JSON.parse(storedUser))
    }
  }, [router])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleVoiceInput = (transcript: string) => {
    setInput(transcript);
    if (inputRef.current) {
      inputRef.current.value = transcript;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;
  
    const userMessage = input;
    setInput("");
    setIsSubmitting(true);
  
    // Optimistically add user message
    setMessages((prev) => [...prev, { role: "user" as const, content: userMessage }]);
  
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, { role: "user", content: userMessage }] }),
      });
  
      const data = await res.json();
  
      if (data.message?.content) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant" as const, content: data.message.content },
        ]);
      } else {
        throw new Error("No valid response from server");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to get response from AI.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  console.log("Messages:", messages)
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden mr-2 p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ziny.AI</h1>
          </div>

          <div className="flex items-center">
            <div className="hidden md:flex items-center mr-4">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-20"
              onClick={() => setIsSidebarOpen(false)}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-gray-800 z-30 shadow-xl"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
                <button onClick={() => setIsSidebarOpen(false)}>
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="p-4">
                <div className="flex items-center p-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <LogOut size={18} className="mr-2" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Chat Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot size={32} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome to Ziny.AI!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  Start a conversation with our AI assistant in collaboration with Gemini. Ask questions, get creative responses,
                  or just chat!
                </p>
              </motion.div>
            </div>
          ) : (
            messages.map((message, index) => {
              let content = "";
              if (typeof message.content === "string") {
                content = message.content;
              } else if (Array.isArray(message.content)) {
                const parts = message.content as Array<{ type?: string; text?: string }>;
                content = parts
                  .filter(part => part?.type === "text")
                  .map(part => part.text ?? "")
                  .join(" ");
              }
              console.log("ReponseContent: ", content);
              console.log("ReponseRole: ", message.role);
              return (
                <MessageBubble
                  key={index}
                  content={content}
                  role={message.role}
                  isLatest={index === messages.length - 1}
                />
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <form onSubmit={handleFormSubmit} className="flex items-center space-x-2">
            <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={isSubmitting}
            />
            {isSubmitting && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-pulse flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full" style={{ animationDelay: "200ms" }}></div>
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full" style={{ animationDelay: "400ms" }}></div>
                </div>
              </div>
            )}
            </div>

            <VoiceButton onTranscript={handleVoiceInput} />

            <motion.button
              type="submit"
              disabled={isSubmitting || !input.trim()}
              className={`p-3 rounded-full ${
                !input.trim()
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
              whileHover={input.trim() ? { scale: 1.1 } : {}}
              whileTap={input.trim() ? { scale: 0.9 } : {}}
            >
              <Send size={20} />
            </motion.button>
          </form>
        </div>
      </main>
    </div>
  )
}
