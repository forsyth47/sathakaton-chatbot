// components/message-bubble.tsx
"use client";

import { motion } from "framer-motion";
import { User, Bot } from "lucide-react";

interface MessageBubbleProps {
  content: string;
  role: "user" | "assistant" | "system" | "data";
  isLatest: boolean;
}

export default function MessageBubble({ content, role }: MessageBubbleProps) {
  const isUser = role === "user";
  console.log("MessageBubbleContent: ", content)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div className={`flex ${isUser ? "flex-row-reverse" : "flex-row"} items-start max-w-[80%]`}>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
          }`}
        >
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>
        <div
          className={`mx-2 p-3 rounded-lg ${
            isUser
              ? "bg-blue-500 text-white rounded-br-none"
              : "bg-gray-200 dark:bg-gray-700 rounded-bl-none"
          }`}
        >
          <p>{content}</p>
        </div>
      </div>
    </motion.div>
  );
}