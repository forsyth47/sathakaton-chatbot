"use client"

import { motion } from "framer-motion"
import { User, Bot } from "lucide-react"
import { useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"

interface MessageBubbleProps {
  content: string
  role: "user" | "assistant"
  isLatest: boolean
}

export default function MessageBubble({ content, role, isLatest }: MessageBubbleProps) {
  const bubbleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isLatest && bubbleRef.current) {
      bubbleRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [isLatest, content])

  const isUser = role === "user"

  return (
    <motion.div
      ref={bubbleRef}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div className={`flex ${isUser ? "flex-row-reverse" : "flex-row"} max-w-[80%] items-end`}>
        <div className={`flex-shrink-0 ${isUser ? "ml-2" : "mr-2"} mb-1`}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isUser ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
            }`}
          >
            {isUser ? <User size={16} /> : <Bot size={16} />}
          </div>
        </div>

        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-blue-500 text-white rounded-br-none"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{content}</p>
          ) : (
            <div className="prose dark:prose-invert prose-sm max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
